import { ObjectId } from "mongodb";
import {
  validateServiceInput, validateOfferInput, validatePackageInput, validateFaqInput,
  serializeManagedItem,
} from "./managed-content.js";

const resources = {
  service: { collection: "services", validate: validateServiceInput, searchable: ["title", "description", "category"], slugs: true },
  offer: { collection: "offers", validate: validateOfferInput, searchable: ["title", "description", "validityLabel"], slugs: true },
  package: { collection: "packages", validate: validatePackageInput, searchable: ["title", "description", "category"], slugs: true },
  faq: { collection: "faqs", validate: validateFaqInput, searchable: ["question", "answer"], slugs: false },
};
const ADMIN_METHODS = ["GET", "POST", "PUT", "DELETE"];
function fail(res, status, message) { return res.status(status).json({ success: false, message }); }
function objectId(value) { return ObjectId.isValid(String(value || "")) ? new ObjectId(String(value)) : null; }
function escapeRegex(value) { return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
function pageNumber(value, fallback) { return Math.max(1, Number.parseInt(String(value || fallback), 10) || fallback); }
function pageLimit(value) { return Math.min(100, Math.max(1, pageNumber(value, 20))); }
function publicSort() { return { sortOrder: 1, createdAt: 1, _id: 1 }; }
async function getDatabase(override) {
  if (override) return override();
  return (await import("./mongodb.js")).getDb();
}
async function getAuthFunctions(requireAdminOverride, sameOriginOverride) {
  if (requireAdminOverride && sameOriginOverride) return { requireAdmin: requireAdminOverride, sameOrigin: sameOriginOverride };
  const auth = await import("./auth.js");
  return { requireAdmin: requireAdminOverride || auth.requireAdmin, sameOrigin: sameOriginOverride || auth.sameOrigin };
}
async function ensureIndexes(collection, config, type) {
  if (config.slugs) await collection.createIndex({ slug: 1 }, { unique: true, name: "slug_unique" });
  else if (type === "faq") await collection.createIndex({ pageKey: 1, question: 1 }, { unique: true, name: "page_question_unique" });
  await collection.createIndex({ status: 1, sortOrder: 1, createdAt: 1 }, { name: "managed_content_order" });
}
function serialize(type, doc, publicOnly) {
  return serializeManagedItem(type, doc, { publicOnly });
}

export function createManagedContentHandler(type, options = {}) {
  const config = resources[type];
  if (!config) throw new Error("Invalid managed content type");
  const admin = options.admin === true;
  return async function handler(req, res) {
    const method = String(req.method || "GET").toUpperCase();
    if (admin) {
      const auth = await getAuthFunctions(options.requireAdmin, options.sameOrigin);
      if (!(await auth.requireAdmin(req, res))) return;
      if (!ADMIN_METHODS.includes(method)) {
        res.setHeader("Allow", ADMIN_METHODS.join(", "));
        return fail(res, 405, "Method not allowed");
      }
      if (method !== "GET" && !auth.sameOrigin(req)) return fail(res, 403, "Forbidden");
    } else {
      res.setHeader("Cache-Control", "no-store, max-age=0");
      if (method !== "GET") {
        res.setHeader("Allow", "GET");
        return fail(res, 405, "Method not allowed");
      }
    }

    try {
      const db = await getDatabase(options.getDb);
      const collection = db.collection(config.collection);
      await ensureIndexes(collection, config, type);

      if (!admin) {
        const filter = { status: "published" };
        if (type === "faq") {
          const pageKey = String(req.query?.pageKey || "").trim().toLowerCase();
          if (!["services", "offers", "packages"].includes(pageKey)) return fail(res, 400, "A valid FAQ page key is required");
          filter.pageKey = pageKey;
        }
        const items = await collection.find(filter).sort(publicSort()).toArray();
        return res.status(200).json({ success: true, items: items.map((item) => serialize(type, item, true)) });
      }

      if (method === "GET") {
        const idValue = req.query?.id;
        if (idValue) {
          const id = objectId(idValue);
          if (!id) return fail(res, 400, "Invalid managed content id");
          const item = await collection.findOne({ _id: id });
          return item ? res.status(200).json({ success: true, item: serialize(type, item, false) }) : fail(res, 404, "Content not found");
        }
        const status = req.query?.status ? String(req.query.status).trim().toLowerCase() : null;
        if (status && !["draft", "published"].includes(status)) return fail(res, 400, "Invalid content status");
        const page = pageNumber(req.query?.page, 1);
        const limit = pageLimit(req.query?.limit);
        const filter = {};
        if (status) filter.status = status;
        if (type === "faq" && req.query?.pageKey) {
          const pageKey = String(req.query.pageKey).trim().toLowerCase();
          if (!["services", "offers", "packages"].includes(pageKey)) return fail(res, 400, "Invalid FAQ page key");
          filter.pageKey = pageKey;
        }
        const search = req.query?.search ? String(req.query.search).trim().slice(0, 100) : "";
        if (search) {
          const pattern = new RegExp(escapeRegex(search), "i");
          filter.$or = config.searchable.map((field) => ({ [field]: { $regex: pattern } }));
        }
        const [items, total] = await Promise.all([
          collection.find(filter).sort({ updatedAt: -1, _id: -1 }).skip((page - 1) * limit).limit(limit).toArray(),
          collection.countDocuments(filter),
        ]);
        return res.status(200).json({ success: true, items: items.map((item) => serialize(type, item, false)), page, limit, total, pages: Math.ceil(total / limit) });
      }

      if (method === "POST") {
        const data = config.validate(req.body, false);
        if (config.slugs) {
          const existing = await collection.findOne({ slug: data.slug }, { projection: { _id: 1 } });
          if (existing) return fail(res, 409, "An item with this slug already exists");
        }
        const now = new Date();
        const document = { ...data, createdAt: now, updatedAt: now };
        const result = await collection.insertOne(document);
        return res.status(201).json({ success: true, item: serialize(type, { ...document, _id: result.insertedId }, false) });
      }

      const id = objectId(req.query?.id);
      if (!id) return fail(res, 400, "A valid managed content id is required");
      const existing = await collection.findOne({ _id: id });
      if (!existing) return fail(res, 404, "Content not found");
      if (method === "DELETE") {
        await collection.deleteOne({ _id: id });
        return res.status(200).json({ success: true });
      }

      const partial = config.validate(req.body, true);
      if (config.slugs && partial.slug && partial.slug !== existing.slug) {
        const duplicate = await collection.findOne({ slug: partial.slug, _id: { $ne: id } }, { projection: { _id: 1 } });
        if (duplicate) return fail(res, 409, "An item with this slug already exists");
      }
      const merged = config.validate({ ...existing, ...partial }, false);
      merged.updatedAt = new Date();
      const updated = await collection.findOneAndUpdate({ _id: id }, { $set: merged }, { returnDocument: "after" });
      return res.status(200).json({ success: true, item: serialize(type, updated, false) });
    } catch (error) {
      if (error?.code === 11000) return fail(res, 409, "An item with this slug already exists");
      if (error instanceof Error && /required|invalid|must be|page key|validity|sort order|subservice|price label|date-range/i.test(error.message)) return fail(res, 400, error.message);
      return fail(res, 503, "Managed content service unavailable");
    }
  };
}
