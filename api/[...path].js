import { createManagedContentHandler } from "./_lib/managed-content-routes.js";
import {
  createGoogleReviewsAdminHandler,
  createGoogleReviewsPublicHandler,
} from "./_lib/google-reviews-routes.js";

function fail(res, status, message) {
  return res.status(status).json({ success: false, message });
}

function createDatabaseTestHandler() {
  return async function databaseTestHandler(req, res) {
    if (String(req.method || "GET").toUpperCase() !== "GET") {
      res.setHeader("Allow", "GET");
      return fail(res, 405, "Method not allowed");
    }
    try {
      const { getDb } = await import("./_lib/mongodb.js");
      const db = await getDb();
      const collections = await db.listCollections({}, { nameOnly: true }).toArray();
      return res.status(200).json({
        success: true,
        message: "MongoDB connected successfully",
        collections: collections.map(({ name }) => name),
      });
    } catch (error) {
      console.error("MongoDB test endpoint failed", error);
      return res.status(503).json({ success: false, message: "Database connection unavailable" });
    }
  };
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
  const routes = new Map([
    ["services", createManaged("service")],
    ["offers", createManaged("offer")],
    ["packages", createManaged("package")],
    ["faqs", createManaged("faq")],
    ["admin/services", createManaged("service", { admin: true })],
    ["admin/offers", createManaged("offer", { admin: true })],
    ["admin/packages", createManaged("package", { admin: true })],
    ["admin/faqs", createManaged("faq", { admin: true })],
    ["admin/google-reviews", createReviewsAdmin()],
    ["published-google-reviews", createReviewsPublic()],
    ["test", options.healthHandler || createDatabaseTestHandler()],
  ]);

  return async function apiRouter(req, res) {
    const route = routeSegments(req).join("/");
    const handler = routes.get(route);
    if (!handler) return fail(res, 404, "API route not found");
    return handler(req, res);
  };
}

export default createApiRouterHandler();
