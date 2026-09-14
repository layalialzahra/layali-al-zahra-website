import { requireAdmin, sameOrigin } from "../_lib/auth.js";

function sendError(res, status, message) { return res.status(status).json({ success: false, message }); }
function escapeRegex(value) { return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

async function ensureUniqueSlug(collection, type, slug) {
  const base = slug || "content";
  let candidate = base;
  let suffix = 2;
  while (await collection.findOne({ type, slug: candidate }, { projection: { _id: 1 } })) {
    candidate = `${base}-${suffix}`.slice(0, 160);
    suffix += 1;
  }
  return candidate;
}

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;
  if (!["GET", "POST", "PUT", "DELETE"].includes(req.method)) {
    res.setHeader("Allow", "GET, POST, PUT, DELETE");
    return sendError(res, 405, "Method not allowed");
  }
  if (req.method !== "GET" && !sameOrigin(req)) return sendError(res, 403, "Forbidden");

  try {
    const { getDb } = await import("../_lib/mongodb.js");
    const { CONTENT_TYPES, ensureContentIndexes, assertUniqueContentSlug, validateContentInput, serializeContent, toObjectId } = await import("../_lib/content.js");
    const db = await getDb();
    const collection = db.collection("content");
    ensureContentIndexes().catch((error) => console.error("Content index initialization failed", error));

    if (req.method === "GET") {
      const id = req.query?.id;
      if (id) {
        const objectId = toObjectId(id);
        if (!objectId) return sendError(res, 400, "Invalid content id");
        const item = await collection.findOne({ _id: objectId });
        return item ? res.status(200).json({ success: true, item: serializeContent(item) }) : sendError(res, 404, "Content not found");
      }
      const type = req.query?.type ? String(req.query.type).trim().toLowerCase() : null;
      const status = req.query?.status ? String(req.query.status).trim().toLowerCase() : null;
      const category = req.query?.category ? String(req.query.category).trim().slice(0, 100) : null;
      const search = req.query?.search ? String(req.query.search).trim().slice(0, 100) : null;
      if (type && !CONTENT_TYPES.has(type)) return sendError(res, 400, "Invalid content type");
      if (status && !["draft", "published"].includes(status)) return sendError(res, 400, "Invalid content status");
      const page = Math.max(1, Number.parseInt(String(req.query?.page || "1"), 10) || 1);
      const limit = Math.min(50, Math.max(1, Number.parseInt(String(req.query?.limit || "20"), 10) || 20));
      const filter = {};
      if (type) filter.type = type;
      if (status) filter.status = status;
      if (category) filter.category = category;
      if (search) {
        const safeSearch = escapeRegex(search);
        filter.$or = [{ title: { $regex: safeSearch, $options: "i" } }, { excerpt: { $regex: safeSearch, $options: "i" } }];
      }
      const [items, total] = await Promise.all([
        collection.find(filter).sort({ updatedAt: -1 }).skip((page - 1) * limit).limit(limit).toArray(),
        collection.countDocuments(filter),
      ]);
      return res.status(200).json({ success: true, items: items.map(serializeContent), page, limit, total, pages: Math.ceil(total / limit) });
    }

    if (req.method === "POST") {
      const data = validateContentInput(req.body, false);
      const requestedSlug = String(req.body?.slug || "").trim();
      if (!requestedSlug) data.slug = await ensureUniqueSlug(collection, data.type, data.slug);
      else await assertUniqueContentSlug(collection, data.type, data.slug);
      const now = new Date();
      const document = { ...data, status: data.status || "draft", publishDate: data.status === "published" ? (data.publishDate || now) : (data.publishDate || null), createdAt: now, updatedAt: now };
      const result = await collection.insertOne(document);
      return res.status(201).json({ success: true, item: serializeContent({ ...document, _id: result.insertedId }) });
    }

    const id = toObjectId(req.query?.id);
    if (!id) return sendError(res, 400, "A valid content id is required");
    const existing = await collection.findOne({ _id: id });
    if (!existing) return sendError(res, 404, "Content not found");

    if (req.method === "DELETE") {
      await collection.deleteOne({ _id: id });
      return res.status(200).json({ success: true });
    }

    if (req.body?.duplicate === true) {
      const copyInput = validateContentInput({ ...existing, ...req.body, type: existing.type }, false);
      copyInput.title = `${existing.title} (Copy)`.slice(0, 180);
      copyInput.slug = `${existing.slug}-copy-${Date.now().toString(36)}`.slice(0, 160);
      copyInput.status = "draft";
      copyInput.publishDate = null;
      await assertUniqueContentSlug(collection, copyInput.type, copyInput.slug);
      const now = new Date();
      const copyDocument = { ...copyInput, createdAt: now, updatedAt: now };
      const result = await collection.insertOne(copyDocument);
      return res.status(201).json({ success: true, item: serializeContent({ ...copyDocument, _id: result.insertedId }) });
    }

    const data = validateContentInput(req.body, true);
    if (data.slug || data.type) await assertUniqueContentSlug(collection, data.type || existing.type, data.slug || existing.slug, id);
    if (data.status === "published" && !data.publishDate && !existing.publishDate) data.publishDate = new Date();
    if (data.status === "draft") data.publishDate = null;
    data.updatedAt = new Date();
    const updated = await collection.findOneAndUpdate({ _id: id }, { $set: data }, { returnDocument: "after" });
    return res.status(200).json({ success: true, item: serializeContent(updated) });
  } catch (error) {
    if (error?.code === 11000) return sendError(res, 409, "A content item with this type and slug already exists");
    if (["Invalid content type", "Invalid content status", "Invalid publish date", "A valid slug is required"].includes(error?.message) || error?.message?.startsWith("Title is required")) return sendError(res, 400, error.message);
    console.error("Admin content API failed", error);
    return sendError(res, 503, "Content service unavailable");
  }
}
