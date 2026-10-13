import { requireAdmin, sameOrigin } from "../_lib/auth.js";
import { migrateManagedContent } from "../../scripts/migrate-managed-content.js";

function fail(res, status, message) {
  return res.status(status).json({ success: false, message });
}

export default async function handler(req, res) {
  if (!(await requireAdmin(req, res))) return;
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return fail(res, 405, "Method not allowed");
  }
  if (!sameOrigin(req)) return fail(res, 403, "Forbidden");
  if (req.body?.confirm !== true) return fail(res, 400, "Explicit import confirmation is required.");

  // This endpoint must never fall back to the production database defaults.
  // Enable it only with a dedicated, isolated staging connection and database.
  const uri = process.env.MANAGED_CONTENT_IMPORT_MONGODB_URI;
  const dbName = process.env.MANAGED_CONTENT_IMPORT_DB_NAME;
  if (process.env.MANAGED_CONTENT_IMPORT_ENABLED !== "true" || !uri || !dbName || dbName === "layalialzahra") {
    return fail(res, 503, "Legacy import is disabled until an isolated staging database is configured.");
  }

  try {
    const result = await migrateManagedContent({ apply: true, uri, dbName });
    return res.status(200).json({
      success: true,
      message: "Legacy content imported into the configured staging database. Existing CMS edits were preserved.",
      expectedCounts: result.counts,
      results: result.results,
    });
  } catch (error) {
    console.error("Legacy managed-content import failed", error?.name || "Error");
    return fail(res, 503, "Legacy content could not be imported. Check the staging configuration and server logs.");
  }
}
