import { requireAdmin, sameOrigin } from "../_lib/auth.js";
import { getDb } from "../_lib/mongodb.js";
import { migrateManagedContent, buildManagedContentRecords } from "../../scripts/migrate-managed-content.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }
  if (!(await requireAdmin(req, res))) return;
  if (!sameOrigin(req)) return res.status(403).json({ success: false, message: "Forbidden" });

  try {
    const expected = buildManagedContentRecords();
    const result = await migrateManagedContent({ apply: true });
    const db = await getDb();
    const expectedCounts = Object.fromEntries(Object.entries(expected).map(([key, items]) => [key, items.length]));
    const actualCounts = {};
    for (const [key, collectionName] of Object.entries({ services: "services", offers: "offers", packages: "packages", faqs: "faqs" })) {
      actualCounts[key] = await db.collection(collectionName).countDocuments({ status: "published" });
      if (actualCounts[key] < expectedCounts[key]) {
        return res.status(503).json({ success: false, message: "Import verification failed. Website activation was not changed.", expectedCounts, actualCounts });
      }
    }
    await db.collection("site_settings").updateOne(
      { _id: "managed_content" },
      { $set: { enabled: true, activatedAt: new Date(), activatedBy: "admin-cms", expectedCounts, actualCounts } },
      { upsert: true }
    );
    return res.status(200).json({ success: true, message: "Existing content imported, verified and published to the website.", expectedCounts, actualCounts, migration: result });
  } catch (error) {
    console.error("Legacy content publish failed", error);
    return res.status(503).json({ success: false, message: "Content could not be imported and verified. Website activation was not changed." });
  }
}
