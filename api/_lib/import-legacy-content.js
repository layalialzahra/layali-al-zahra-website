import { requireAdmin, sameOrigin } from "./auth.js";
import { migrateManagedContent } from "../../scripts/migrate-managed-content.js";

function fail(res, status, message) {
  return res.status(status).json({ success: false, message });
}

export function createLegacyImportHandler({
  requireAdminFn = requireAdmin,
  sameOriginFn = sameOrigin,
  migrateFn = migrateManagedContent,
  env = process.env,
} = {}) {
  return async function handler(req, res) {
    if (!(await requireAdminFn(req, res))) return;
    if (req.method !== "POST") {
      res.setHeader("Allow", "POST");
      return fail(res, 405, "Method not allowed");
    }
    if (!sameOriginFn(req)) return fail(res, 403, "Forbidden");
    if (req.body?.confirm !== true) return fail(res, 400, "Explicit import confirmation is required.");

    // Use the same live database configuration as the rest of the CMS.
    const uri = env.MONGODB_URI;
    const dbName = env.MONGODB_DB_NAME || "layalialzahra";
    if (!uri) return fail(res, 503, "The CMS database is not configured.");

    try {
      const result = await migrateFn({ apply: true, uri, dbName });
      return res.status(200).json({
        success: true,
        message: "Existing website content imported into the live CMS database. Existing CMS edits were preserved.",
        expectedCounts: result.counts,
        results: result.results,
      });
    } catch (error) {
      const reason = error instanceof Error ? error.message : "Unknown import error";
      const safeReason = reason
        .replace(/mongodb(?:\\+srv)?:\\/\\/[^\\s]+/gi, "[database connection redacted]")
        .replace(/(password|secret|token|api[_-]?key)\\s*[:=]\\s*[^\\s,;]+/gi, "$1=[redacted]")
        .slice(0, 240);
      console.error("Legacy managed-content import failed", error?.name || "Error", safeReason);
      return fail(res, 503, `Legacy content import failed: ${safeReason}`);
    }
  };
}

export default createLegacyImportHandler();
