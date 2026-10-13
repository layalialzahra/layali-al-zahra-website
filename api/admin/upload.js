import { put } from "@vercel/blob";
import { requireAdmin, sameOrigin } from "../_lib/auth.js";
import { isAllowedImagePayload } from "../_lib/image-upload.js";

export const MAX_FILE_SIZE = 4 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

function sendError(res, status, message) {
  return res.status(status).json({ success: false, message });
}

function isSafePublicUrl(value) {
  if (typeof value !== "string" || !value) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && Boolean(url.hostname) && !url.username && !url.password;
  } catch {
    return false;
  }
}

export function createUploadHandler({
  authenticate = requireAdmin,
  checkSameOrigin = sameOrigin,
  storeBlob = put,
  logger = console,
} = {}) {
  return async function uploadHandler(req, res) {
    if (!(await authenticate(req, res))) return;
    if (req.method !== "POST") {
      res.setHeader("Allow", "POST");
      return sendError(res, 405, "Method not allowed");
    }
    if (!checkSameOrigin(req)) return sendError(res, 403, "Forbidden");

    try {
      const contentType = String(req.headers["content-type"] || "").split(";")[0].trim().toLowerCase();
      if (!ALLOWED_TYPES.has(contentType)) {
        return sendError(res, 400, "Only JPG, PNG, WebP and GIF images are supported.");
      }

      const declaredLength = req.headers["content-length"];
      if (declaredLength !== undefined) {
        const lengthText = String(declaredLength);
        if (!/^\d+$/.test(lengthText)) return sendError(res, 400, "Invalid content length.");
        if (Number(lengthText) > MAX_FILE_SIZE) return sendError(res, 413, "Image must be 4 MB or smaller.");
      }

      const chunks = [];
      let total = 0;
      for await (const chunk of req) {
        if (!Buffer.isBuffer(chunk) && !(chunk instanceof Uint8Array)) {
          return sendError(res, 400, "Invalid image data.");
        }
        total += chunk.length;
        if (total > MAX_FILE_SIZE) return sendError(res, 413, "Image must be 4 MB or smaller.");
        chunks.push(Buffer.from(chunk));
      }
      if (!total) return sendError(res, 400, "No image was uploaded.");

      const buffer = Buffer.concat(chunks, total);
      if (!isAllowedImagePayload(contentType, buffer)) {
        return sendError(res, 400, "The uploaded file does not match a supported image format.");
      }

      const extension = contentType === "image/jpeg" ? "jpg" : contentType.split("/")[1];
      const pathname = `layali-al-zahra/content/${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}.${extension}`;
      const blob = await storeBlob(pathname, buffer, {
        access: "public",
        addRandomSuffix: false,
        contentType,
        cacheControlMaxAge: 2592000,
      });

      if (!blob || !isSafePublicUrl(blob.url)) {
        return sendError(res, 503, "Image upload is unavailable. Please check the connected media storage.");
      }

      return res.status(201).json({
        success: true,
        url: blob.url,
        pathname: typeof blob.pathname === "string" && blob.pathname ? blob.pathname : pathname,
        contentType,
      });
    } catch {
      // Do not return or log provider error objects, which may contain internal configuration.
      logger.error("Admin image upload failed");
      return sendError(res, 503, "Image upload is unavailable. Please check the connected media storage.");
    }
  };
}

export default createUploadHandler();
