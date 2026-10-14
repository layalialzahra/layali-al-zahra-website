import { ObjectId } from "mongodb";

const ADMIN_METHODS = ["GET", "POST", "PUT", "DELETE"];
const MAX_REVIEW_TEXT = 5000;
function fail(res, status, message) { return res.status(status).json({ success: false, message }); }
function objectId(value) { return ObjectId.isValid(String(value || "")) ? new ObjectId(String(value)) : null; }
async function getDb(override) { return override ? override() : (await import("./mongodb.js")).getDb(); }
async function getAuth(options) {
  if (options.requireAdmin && options.sameOrigin) return { requireAdmin: options.requireAdmin, sameOrigin: options.sameOrigin };
  const auth = await import("./auth.js");
  return { requireAdmin: options.requireAdmin || auth.requireAdmin, sameOrigin: options.sameOrigin || auth.sameOrigin };
}
function normalizeReview(input, { partial = false } = {}) {
  const output = {};
  if (!partial || Object.hasOwn(input || {}, "authorName")) {
    const name = typeof input?.authorName === "string" ? input.authorName.trim() : "";
    if (!name || name.length > 200) throw new Error("Reviewer name is required (maximum 200 characters)");
    output.authorName = name;
  }
  if (!partial || Object.hasOwn(input || {}, "rating")) {
    const rating = Number(input?.rating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) throw new Error("Rating must be between 1 and 5");
    output.rating = rating;
  }
  if (!partial || Object.hasOwn(input || {}, "reviewText")) {
    const reviewText = typeof input?.reviewText === "string" ? input.reviewText.trim() : "";
    if (!reviewText || reviewText.length > MAX_REVIEW_TEXT) throw new Error("Review text is required (maximum 5000 characters)");
    output.reviewText = reviewText;
  }
  if (!partial || Object.hasOwn(input || {}, "sourceCreatedAt")) {
    const date = typeof input?.sourceCreatedAt === "string" ? input.sourceCreatedAt.trim() : "";
    const parsed = /^\d{4}-\d{2}-\d{2}$/.test(date) ? new Date(date + "T00:00:00.000Z") : null;
    if (!parsed || Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) throw new Error("A valid review date is required");
    output.sourceCreatedAt = date;
  }
  if (!partial || Object.hasOwn(input || {}, "sortOrder")) {
    const order = Number(input?.sortOrder ?? 0);
    if (!Number.isInteger(order) || order < 0 || order > 1000000) throw new Error("Display order must be a whole number between 0 and 1000000");
    output.sortOrder = order;
  }
  if (!partial || Object.hasOwn(input || {}, "isPublished")) {
    if (input?.isPublished !== undefined && typeof input.isPublished !== "boolean") throw new Error("Publication status must be true or false");
    output.isPublished = input?.isPublished === true;
  }
  return output;
}
function serializeReview(review, publicOnly = false) {
  if (!review) return null;
  const output = {
    authorName: review.authorName,
    rating: review.rating,
    reviewText: review.reviewText,
    sourceCreatedAt: review.sourceCreatedAt,
    sortOrder: review.sortOrder ?? 0,
  };
  if (!publicOnly) Object.assign(output, { _id: String(review._id), isPublished: review.isPublished === true });
  return output;
}
function parseId(value) {
  const id = objectId(value);
  if (!id) throw new Error("Review ID is invalid");
  return id;
}

export function createManualReviewsAdminHandler(options = {}) {
  return async function handler(req, res) {
    const method = String(req.method || "GET").toUpperCase();
    const auth = await getAuth(options);
    if (!(await auth.requireAdmin(req, res))) return;
    if (!ADMIN_METHODS.includes(method)) {
      res.setHeader("Allow", ADMIN_METHODS.join(", "));
      return fail(res, 405, "Method not allowed");
    }
    if (method !== "GET" && !auth.sameOrigin(req)) return fail(res, 403, "Forbidden");
    try {
      const db = await getDb(options.getDb);
      const reviews = db.collection("reviews");
      if (method === "GET") {
        const filter = {};
        if (req.query?.isPublished === "true") filter.isPublished = true;
        if (req.query?.isPublished === "false") filter.isPublished = { $ne: true };
        if (req.query?.rating !== undefined && req.query.rating !== "") {
          const rating = Number(req.query.rating);
          if (!Number.isInteger(rating) || rating < 1 || rating > 5) return fail(res, 400, "Rating must be between 1 and 5");
          filter.rating = rating;
        }
        const search = typeof req.query?.search === "string" ? req.query.search.trim().slice(0, 100) : "";
        if (search) {
          const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          filter.$or = [{ authorName: { $regex: escaped, $options: "i" } }, { reviewText: { $regex: escaped, $options: "i" } }];
        }
        const items = await reviews.find(filter).sort({ sortOrder: 1, sourceCreatedAt: -1, _id: 1 }).limit(100).toArray();
        return res.status(200).json({ success: true, items: items.map((item) => serializeReview(item)) });
      }
      if (method === "POST") {
        const input = normalizeReview(req.body || {});
        const now = new Date();
        const record = { ...input, isPublished: input.isPublished === true, createdAt: now, updatedAt: now };
        const result = await reviews.insertOne(record);
        return res.status(201).json({ success: true, item: serializeReview({ ...record, _id: result.insertedId }) });
      }
      const id = parseId(req.query?.id);
      const existing = await reviews.findOne({ _id: id });
      if (!existing) return fail(res, 404, "Review not found");
      if (method === "PUT") {
        if (req.body?.action === "publish" || req.body?.action === "unpublish") {
          const isPublished = req.body.action === "publish";
          await reviews.updateOne({ _id: id }, { $set: { isPublished, updatedAt: new Date() } });
          return res.status(200).json({ success: true, isPublished });
        }
        const input = normalizeReview(req.body || {}, { partial: true });
        if (Object.keys(input).length === 0) return fail(res, 400, "No review changes supplied");
        await reviews.updateOne({ _id: id }, { $set: { ...input, updatedAt: new Date() } });
        return res.status(200).json({ success: true, item: serializeReview({ ...existing, ...input }) });
      }
      await reviews.deleteOne({ _id: id });
      return res.status(200).json({ success: true, deleted: 1 });
    } catch (error) {
      if (error instanceof Error && /required|maximum|rating|date|order|status|review id|no review changes/i.test(error.message)) return fail(res, 400, error.message);
      return fail(res, 503, "Review management service unavailable");
    }
  };
}

export function createImportHomepageReviewsHandler(options = {}) {
  return async function handler(req, res) {
    const auth = await getAuth(options);
    if (!(await auth.requireAdmin(req, res))) return;
    if (String(req.method || "GET").toUpperCase() !== "POST") {
      res.setHeader("Allow", "POST");
      return fail(res, 405, "Method not allowed");
    }
    if (!auth.sameOrigin(req)) return fail(res, 403, "Forbidden");
    try {
      const { legacyHomepageReviews } = await import("../../src/data/legacy-reviews.js");
      const db = await getDb(options.getDb);
      const reviews = db.collection("reviews");
      let inserted = 0;
      let skipped = 0;
      for (const [index, source] of legacyHomepageReviews.entries()) {
        const authorName = String(source.title || "").trim();
        const reviewText = String(source.description || "").trim();
        if (!authorName || !reviewText) { skipped += 1; continue; }
        const existing = await reviews.findOne({ authorName, reviewText }, { projection: { _id: 1 } });
        if (existing) { skipped += 1; continue; }
        const now = new Date();
        await reviews.insertOne({
          authorName, reviewText, rating: 5, sourceCreatedAt: null,
          isPublished: true, sortOrder: index, createdAt: now, updatedAt: now,
          source: "legacy-homepage",
        });
        inserted += 1;
      }
      return res.status(200).json({ success: true, inserted, skipped, total: legacyHomepageReviews.length });
    } catch {
      return fail(res, 503, "Existing homepage reviews could not be imported.");
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
      const items = await db.collection("reviews")
        .find({ isPublished: true })
        .sort({ sortOrder: 1, sourceCreatedAt: -1, _id: 1 })
        .limit(12)
        .toArray();
      return res.status(200).json({ success: true, items: items.map((item) => serializeReview(item, true)) });
    } catch {
      return fail(res, 503, "Published reviews are temporarily unavailable");
    }
  };
}
