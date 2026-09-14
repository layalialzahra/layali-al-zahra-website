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
    let getDb;
    let serializeContent;
    try {
      ({ getDb } = await import("../_lib/mongodb.js"));
      checks.mongodbModule = result(true);
      ({ serializeContent } = await import("../_lib/content.js"));
      checks.contentModule = result(true);
    } catch (error) {
      console.error("Content health module import failed", error);
      checks.moduleImport = result(false, { error: error?.name || "ModuleImportError" });
      return res.status(503).json({ success: false, message: "Content service health check failed", checks });
    }

    try {
      const db = await getDb();
      checks.database = result(true, { name: db.databaseName });

      const collections = await db.listCollections({ name: "content" }, { nameOnly: true }).toArray();
      const collectionExists = collections.length > 0;
      checks.collection = result(true, { exists: collectionExists, emptyIsHealthy: true });

      const collection = db.collection("content");
      const sample = await collection.findOne({}, { projection: { _id: 1, type: 1, title: 1, slug: 1, status: 1, publishDate: 1, createdAt: 1, updatedAt: 1 } });
      checks.query = result(true, { hasDocument: Boolean(sample) });

      if (sample) {
        const serialized = serializeContent(sample);
        checks.serialization = result(Boolean(serialized?._id), { idType: typeof serialized._id });
      } else {
        checks.serialization = result(true, { skipped: "content collection is empty or not created yet" });
      }

      if (collectionExists) {
        const indexes = await collection.listIndexes().toArray();
        checks.indexes = result(true, { count: indexes.length, names: indexes.map((index) => index.name).filter(Boolean) });

        // Safe authenticated metadata only: enough to diagnose slug/type/status
        // mismatches without exposing article bodies, images or SEO content.
        const [count, metadata] = await Promise.all([
          collection.countDocuments(),
          collection.find({}, { projection: { _id: 1, type: 1, title: 1, slug: 1, status: 1, publishDate: 1 } }).sort({ updatedAt: -1 }).limit(20).toArray(),
        ]);
        checks.contentSummary = result(true, {
          count,
          items: metadata.map((item) => ({
            id: String(item._id),
            type: item.type,
            title: item.title,
            slug: item.slug,
            status: item.status,
            publishDate: item.publishDate?.toISOString?.() || item.publishDate || null,
          })),
        });
      } else {
        checks.indexes = result(true, { skipped: "content collection has not been created yet" });
        checks.contentSummary = result(true, { count: 0, items: [] });
      }
    } catch (error) {
      console.error("Admin content health database checks failed", error);
      checks.databaseOperation = result(false, { error: error?.name || "DatabaseError" });
    }

    const healthy = Object.values(checks).every((check) => check.ok);
    return res.status(healthy ? 200 : 503).json({ success: healthy, checks });
  } catch (error) {
    console.error("Admin content health check failed", error);
    return res.status(503).json({ success: false, message: "Content service health check failed", checks });
  }
}
