import { put } from "@vercel/blob";
import { requireAdmin, sameOrigin } from "../_lib/auth.js";

const MAX_FILE_SIZE = 4 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

function sendError(res, status, message) { return res.status(status).json({ success: false, message }); }

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;
  if (req.method !== "POST") { res.setHeader("Allow", "POST"); return sendError(res, 405, "Method not allowed"); }
  if (!sameOrigin(req)) return sendError(res, 403, "Forbidden");

  try {
    const contentType = String(req.headers["content-type"] || "").split(";")[0].toLowerCase();
    if (!ALLOWED_TYPES.has(contentType)) return sendError(res, 400, "Only JPG, PNG, WebP and GIF images are supported.");

    const chunks = [];
    let total = 0;
    for await (const chunk of req) {
      total += chunk.length;
      if (total > MAX_FILE_SIZE) return sendError(res, 413, "Image must be 4 MB or smaller.");
      chunks.push(chunk);
    }
    if (!total) return sendError(res, 400, "No image was uploaded.");

    const extension = contentType === "image/jpeg" ? "jpg" : contentType.split("/")[1];
    const pathname = `layali-al-zahra/content/${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}.${extension}`;
    const blob = await put(pathname, Buffer.concat(chunks), { access: "public", addRandomSuffix: false, contentType, cacheControlMaxAge: 2592000 });
    return res.status(201).json({ success: true, url: blob.url, pathname: blob.pathname, contentType: blob.contentType });
  } catch (error) {
    console.error("Admin image upload failed", error);
    return sendError(res, 503, "Image upload is unavailable. Please check the connected media storage.");
  }
}
