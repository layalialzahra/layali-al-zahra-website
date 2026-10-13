import { createManagedContentHandler } from "./_lib/managed-content-routes.js";
import { requireAdmin, sameOrigin } from "./_lib/auth.js";
import { getDb } from "./_lib/mongodb.js";
import { migrateManagedContent, buildManagedContentRecords } from "../scripts/migrate-managed-content.js";
import { createLegacyImportHandler } from "./_lib/import-legacy-content.js";
import { createHomepageRenderHandler } from "./_lib/homepage-renderer.js";
import {
  createGoogleReviewsAdminHandler,
  createGoogleReviewsPublicHandler,
  createGoogleReviewsSyncHandler,
} from "./_lib/google-reviews-routes.js";

function fail(res, status, message) {
  return res.status(status).json({ success: false, message });
}

function routeSegments(req) {
  const value = req.query?.path;
  if (Array.isArray(value)) return value.map((part) => String(part)).filter(Boolean);
  if (typeof value === "string" && value) return value.split("/").filter(Boolean);

  const pathname = String(req.url || "").split("?")[0];
  const apiIndex = pathname.indexOf("/api/");
  return apiIndex >= 0
    ? pathname.slice(apiIndex + 5).split("/").filter(Boolean).map(decodeURIComponent)
    : [];
}

/**
 * Vercel's catch-all function keeps the existing API URLs while allowing
 * related handlers to share one serverless function on the Hobby plan.
 * The business handlers still own validation, authentication and responses.
 */
export function createApiRouterHandler(options = {}) {
  const createManaged = options.createManagedContentHandler || createManagedContentHandler;
  const createReviewsAdmin = options.createGoogleReviewsAdminHandler || createGoogleReviewsAdminHandler;
  const createReviewsPublic = options.createGoogleReviewsPublicHandler || createGoogleReviewsPublicHandler;
  const createHomepage = options.createHomepageRenderHandler || createHomepageRenderHandler;
  const routes = new Map([
    ["services", createManaged("service")],
    ["offers", createManaged("offer")],
    ["packages", createManaged("package")],
    ["faqs", createManaged("faq")],
    ["admin/services", createManaged("service", { admin: true })],
    ["admin/offers", createManaged("offer", { admin: true })],
    ["admin/packages", createManaged("package", { admin: true })],
    ["admin/faqs", createManaged("faq", { admin: true })],
    ["admin/import-legacy-content", createLegacyImportHandler()],
    ["admin/google-reviews", createReviewsAdmin()],
    ["admin/google-reviews-sync", options.createGoogleReviewsSyncHandler ? options.createGoogleReviewsSyncHandler() : createGoogleReviewsSyncHandler()],
    ["published-google-reviews", createReviewsPublic()],
    ["managed-content-status", async (req, res) => {
      res.setHeader("Cache-Control", "no-store, max-age=0");
      if (req.method !== "GET") { res.setHeader("Allow", "GET"); return res.status(405).json({ success: false, enabled: false }); }
      try {
        const setting = await (await getDb()).collection("site_settings").findOne({ _id: "managed_content" }, { projection: { enabled: 1 } });
        return res.status(200).json({ success: true, enabled: setting?.enabled === true });
      } catch {
        return res.status(200).json({ success: true, enabled: false });
      }
    }],
    ["admin/publish-legacy-content", async (req, res) => {
      if (req.method !== "POST") { res.setHeader("Allow", "POST"); return res.status(405).json({ success: false, message: "Method not allowed" }); }
      if (!(await requireAdmin(req, res))) return;
      if (!sameOrigin(req)) return res.status(403).json({ success: false, message: "Forbidden" });
      try {
        const expected = buildManagedContentRecords();
        const migration = await migrateManagedContent({ apply: true });
        const db = await getDb();
        const expectedCounts = Object.fromEntries(Object.entries(expected).map(([key, items]) => [key, items.length]));
        const actualCounts = {};
        for (const [key, collectionName] of Object.entries({ services: "services", offers: "offers", packages: "packages", faqs: "faqs" })) {
          actualCounts[key] = await db.collection(collectionName).countDocuments({ status: "published" });
          if (actualCounts[key] < expectedCounts[key]) return res.status(503).json({ success: false, message: "Import verification failed. Website activation was not changed.", expectedCounts, actualCounts });
        }
        await db.collection("site_settings").updateOne({ _id: "managed_content" }, { $set: { enabled: true, activatedAt: new Date(), activatedBy: "admin-cms", expectedCounts, actualCounts } }, { upsert: true });
        return res.status(200).json({ success: true, message: "Existing content imported, verified and published to the website.", expectedCounts, actualCounts, migration });
      } catch (error) {
        console.error("Legacy content publish failed", error);
        const reason = error instanceof Error ? error.message : "Unknown import error";
        const safeReason = reason.replace(/mongodb(?:\+srv)?:\/\/[^\s]+/gi, "[database connection redacted]").slice(0, 240);
        return res.status(503).json({ success: false, message: `Content import failed: ${safeReason}. Website activation was not changed.` });
      }
    }],
    ["render-home", options.createHomepageRenderHandler ? options.createHomepageRenderHandler() : createHomepage()],
  ]);

  return async function apiRouter(req, res) {
    const route = routeSegments(req).join("/");
    const handler = routes.get(route);
    if (!handler) return fail(res, 404, "API route not found");
    return handler(req, res);
  };
}

export default createApiRouterHandler();
