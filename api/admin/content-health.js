import { requireAdmin, sameOrigin } from "../_lib/auth.js";

function result(ok, extra = {}) {
  return { ok, ...extra };
}

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }
  if (!sameOrigin(req)) return res.status(403).json({ success: false, message: "Forbidden" });

  const checks = {};
  try {
    const { getDb } = await import("../_lib/mongodb.js");
    const { serializeContent } = await import("../_lib/content.js");

    const db = await getDb();
    checks.database = result(true, { name: db.databaseName });

    const collections = await db.listCollections({ name: "content" }, { nameOnly: true }).toArray();
    checks.collection = result(collections.length > 0, { exists: collections.length > 0 });
    if (!checks.collection.ok) {
      return res.status(503).json({ success: false, message: "Content collection is unavailable", checks });
    }

    const collection = db.collection("content");
    const sample = await collection.findOne({}, { projection: { _id: 1, type: 1, title: 1, slug: 1, status: 1, publishDate: 1, createdAt: 1, updatedAt: 1 } });
    checks.query = result(true, { hasDocument: Boolean(sample) });

    if (sample) {
      const serialized = serializeContent(sample);
      checks.serialization = result(Boolean(serialized?._id), { idType: typeof serialized._id });
    } else {
      checks.serialization = result(true, { skipped: "content collection is empty" });
    }

    const indexes = await collection.listIndexes().toArray();
    checks.indexes = result(true, { count: indexes.length, names: indexes.map((index) => index.name).filter(Boolean) });

    const healthy = Object.values(checks).every((check) => check.ok);
    return res.status(healthy ? 200 : 503).json({ success: healthy, checks });
  } catch (error) {
    console.error("Admin content health check failed", error);
    return res.status(503).json({
      success: false,
      message: "Content service health check failed",
      checks,
    });
  }
}
