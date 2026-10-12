import { ObjectId } from "mongodb";
import {
  serializeGoogleReview,
  mergeSyncedReview,
  filterSuppressedReviews,
  fetchAllGoogleReviews,
  isGoogleReviewsSyncConfigured,
} from "./google-reviews.js";

const ADMIN_METHODS = ["GET", "PUT", "DELETE"];
function fail(res, status, message) { return res.status(status).json({ success: false, message }); }
function objectId(value) { return ObjectId.isValid(String(value || "")) ? new ObjectId(String(value)) : null; }
function pageNumber(value, fallback) { return Math.max(1, Number.parseInt(String(value || fallback), 10) || fallback); }
function pageLimit(value) { return Math.min(100, Math.max(1, pageNumber(value, 20))); }
function escapeRegex(value) { return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
async function getDb(override) { return override ? override() : (await import("./mongodb.js")).getDb(); }
async function getAuth(options) {
  if (options.requireAdmin && options.sameOrigin) return { requireAdmin: options.requireAdmin, sameOrigin: options.sameOrigin };
  const auth = await import("./auth.js");
  return { requireAdmin: options.requireAdmin || auth.requireAdmin, sameOrigin: options.sameOrigin || auth.sameOrigin };
}
async function ensureIndexes(reviews, suppressions) {
  await reviews.createIndex({ googleReviewId: 1 }, { unique: true, name: "google_review_id_unique" });
  await reviews.createIndex({ isPublished: 1, sortOrder: 1, sourceCreatedAt: -1 }, { name: "google_review_display_order" });
  await suppressions.createIndex({ googleReviewId: 1 }, { unique: true, name: "google_review_suppression_id_unique" });
}
async function suppressedIds(collection) {
  const rows = await collection.find({}, { projection: { googleReviewId: 1 } }).toArray();
  return rows.map((row) => row.googleReviewId);
}
function parseIds(body) {
  if (!Array.isArray(body?.ids) || body.ids.length < 1 || body.ids.length > 100) throw new Error("Select between 1 and 100 reviews");
  const unique = [...new Set(body.ids.map((id) => String(id)))];
  const ids = unique.map(objectId);
  if (ids.some((id) => !id)) throw new Error("One or more review IDs are invalid");
  return ids;
}

export function createGoogleReviewsAdminHandler(options = {}) {
  return async function handler(req, res) {
    const method = String(req.method || "GET").toUpperCase();
    const auth = await getAuth(options);
    if (!auth.requireAdmin(req, res)) return;
    if (!ADMIN_METHODS.includes(method)) {
      res.setHeader("Allow", ADMIN_METHODS.join(", "));
      return fail(res, 405, "Method not allowed");
    }
    if (method !== "GET" && !auth.sameOrigin(req)) return fail(res, 403, "Forbidden");

    try {
      const db = await getDb(options.getDb);
      const reviews = db.collection("google_reviews");
      const suppressions = db.collection("google_review_suppressions");
      await ensureIndexes(reviews, suppressions);

      if (method === "GET") {
        const filter = { googleReviewId: { $nin: await suppressedIds(suppressions) } };
        if (req.query?.rating !== undefined && req.query.rating !== "") {
          const rating = Number(req.query.rating);
          if (!Number.isInteger(rating) || rating < 1 || rating > 5) return fail(res, 400, "Rating must be between 1 and 5");
          filter.rating = rating;
        }
        if (req.query?.isPublished === "true") filter.isPublished = true;
        if (req.query?.isPublished === "false") filter.isPublished = false;
        const search = req.query?.search ? String(req.query.search).trim().slice(0, 100) : "";
        if (search) {
          const pattern = new RegExp(escapeRegex(search), "i");
          filter.$or = [{ authorName: { $regex: pattern } }, { reviewText: { $regex: pattern } }];
        }
        const page = pageNumber(req.query?.page, 1);
        const limit = pageLimit(req.query?.limit);
        const [items, total] = await Promise.all([
          reviews.find(filter).sort({ sortOrder: 1, sourceCreatedAt: -1, _id: 1 }).skip((page - 1) * limit).limit(limit).toArray(),
          reviews.countDocuments(filter),
        ]);
        return res.status(200).json({
          success: true,
          items: items.map((item) => serializeGoogleReview(item)),
          page, limit, total, pages: Math.ceil(total / limit),
          syncAvailable: isGoogleReviewsSyncConfigured(),
          syncMessage: isGoogleReviewsSyncConfigured()
            ? "Google credentials are configured. Sync will verify access before importing reviews."
            : "Google Business Profile API credentials are not configured. Sync is disabled.",
        });
      }

      const ids = parseIds(req.body);
      const selected = await reviews.find({ _id: { $in: ids } }).toArray();
      if (selected.length !== ids.length) return fail(res, 404, "One or more reviews were not found");
      const blocked = new Set(await suppressedIds(suppressions));
      if (selected.some((review) => blocked.has(review.googleReviewId))) return fail(res, 409, "A selected review is suppressed");

      if (method === "PUT") {
        const action = req.body?.action;
        if (!["publish", "unpublish"].includes(action)) return fail(res, 400, "Action must be publish or unpublish");
        const result = await reviews.updateMany(
          { _id: { $in: ids }, googleReviewId: { $nin: [...blocked] } },
          { $set: { isPublished: action === "publish", updatedAt: new Date() } },
        );
        return res.status(200).json({ success: true, updated: result.matchedCount || 0 });
      }

      const now = new Date();
      await suppressions.bulkWrite(selected.map((review) => ({
        updateOne: {
          filter: { googleReviewId: review.googleReviewId },
          update: { $setOnInsert: { googleReviewId: review.googleReviewId, suppressedAt: now } },
          upsert: true,
        },
      })), { ordered: true });
      const result = await reviews.deleteMany({ _id: { $in: ids } });
      return res.status(200).json({ success: true, deleted: result.deletedCount || 0 });
    } catch (error) {
      if (error instanceof Error && /select between|invalid|rating|action must/i.test(error.message)) return fail(res, 400, error.message);
      return fail(res, 503, "Google review management service unavailable");
    }
  };
}


export function createGoogleReviewsSyncHandler(options = {}) {
  return async function syncHandler(req, res) {
    if (String(req.method || "GET").toUpperCase() !== "POST") {
      res.setHeader("Allow", "POST");
      return fail(res, 405, "Method not allowed");
    }
    const auth = await getAuth(options);
    if (!auth.requireAdmin(req, res)) return;
    if (!auth.sameOrigin(req)) return fail(res, 403, "Forbidden");

    const env = options.env || process.env;
    if (!isGoogleReviewsSyncConfigured(env)) {
      return fail(res, 503, "Google Business Profile API credentials are not configured. Existing local reviews were not changed.");
    }

    try {
      const db = await getDb(options.getDb);
      const reviews = db.collection("google_reviews");
      const suppressions = db.collection("google_review_suppressions");
      await ensureIndexes(reviews, suppressions);

      // Complete provider pagination and validation before any local review write.
      const source = await fetchAllGoogleReviews({ env, fetchImpl: options.fetchImpl || globalThis.fetch });
      const suppressed = await suppressedIds(suppressions);
      const importable = filterSuppressedReviews(source.reviews, suppressed);
      const existingRows = importable.length
        ? await reviews.find({ googleReviewId: { $in: importable.map((item) => item.googleReviewId) } }).toArray()
        : [];
      const existingBySourceId = new Map(existingRows.map((item) => [item.googleReviewId, item]));
      const now = options.now ? options.now() : new Date();
      const operations = importable.map((incoming) => ({
        updateOne: {
          filter: { googleReviewId: incoming.googleReviewId },
          update: { $set: mergeSyncedReview(existingBySourceId.get(incoming.googleReviewId), incoming, now) },
          upsert: true,
        },
      }));
      const result = operations.length ? await reviews.bulkWrite(operations, { ordered: true }) : {};
      return res.status(200).json({
        success: true,
        message: "Google reviews synced successfully.",
        fetched: source.reviews.length,
        inserted: result.upsertedCount || 0,
        updated: result.modifiedCount || 0,
        suppressed: source.reviews.length - importable.length,
        totalReviewCount: source.totalReviewCount,
      });
    } catch (error) {
      // Do not log provider response bodies, OAuth material or request headers.
      console.error("Google review sync failed", error instanceof Error ? error.message : "Unknown error");
      return fail(res, 502, "Google review sync failed. The previous local review set was retained if the provider request failed.");
    }
  };
}

export function createGoogleReviewsPublicHandler(options = {}) {
  return async function handler(req, res) {
    res.setHeader("Cache-Control", "no-store, max-age=0");
    if (String(req.method || "GET").toUpperCase() !== "GET") {
      res.setHeader("Allow", "GET");
      return fail(res, 405, "Method not allowed");
    }
    try {
      const db = await getDb(options.getDb);
      const reviews = db.collection("google_reviews");
      const suppressions = db.collection("google_review_suppressions");
      await ensureIndexes(reviews, suppressions);
      const items = await reviews.find({
        isPublished: true,
        googleReviewId: { $nin: await suppressedIds(suppressions) },
      }).sort({ sortOrder: 1, sourceCreatedAt: -1, _id: 1 }).toArray();
      return res.status(200).json({ success: true, items: items.map((item) => serializeGoogleReview(item, { publicOnly: true })) });
    } catch {
      return fail(res, 503, "Published reviews are temporarily unavailable");
    }
  };
}
