import { getDb } from "./_lib/mongodb.js";
import { ensureContentIndexes, serializeContent } from "./_lib/content.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }
  try {
    const db = await getDb();
    const collection = db.collection("content");
    ensureContentIndexes().catch((error) => console.error("Content index initialization failed", error));
    const type = req.query?.type ? String(req.query.type).trim().toLowerCase() : null;
    const category = req.query?.category ? String(req.query.category).trim() : null;
    const slug = req.query?.slug ? String(req.query.slug).trim().toLowerCase() : null;
    const page = Math.max(1, Number.parseInt(String(req.query?.page || "1"), 10) || 1);
    const limit = Math.min(24, Math.max(1, Number.parseInt(String(req.query?.limit || "12"), 10) || 12));

    if (slug) {
      // Detail reads deliberately fetch the published record first, then apply
      // the publication-date rule in JavaScript. This remains correct if an
      // older/migrated record contains publishDate as a string instead of a BSON Date.
      const detailFilter = { status: "published", slug };
      if (type) detailFilter.type = type;
      const item = await collection.findOne(detailFilter);
      if (!item) return res.status(404).json({ success: false, message: "Content not found" });
      if (item.publishDate) {
        const publishDate = item.publishDate instanceof Date ? item.publishDate : new Date(item.publishDate);
        if (Number.isNaN(publishDate.getTime()) || publishDate > new Date()) {
          return res.status(404).json({ success: false, message: "Content not found" });
        }
      }
      return res.status(200).json({ success: true, item: serializeContent(item) });
    }

    const filter = { status: "published", $or: [{ publishDate: null }, { publishDate: { $lte: new Date() } }] };
    if (type) filter.type = type;
    if (category) filter.category = category;
    const [items, total] = await Promise.all([
      collection.find(filter).sort({ publishDate: -1, createdAt: -1 }).skip((page - 1) * limit).limit(limit).toArray(),
      collection.countDocuments(filter),
    ]);
    return res.status(200).json({ success: true, items: items.map(serializeContent), page, limit, total, pages: Math.ceil(total / limit) });
  } catch (error) {
    console.error("Public content API failed", error);
    return res.status(503).json({ success: false, message: "Content service unavailable" });
  }
}
