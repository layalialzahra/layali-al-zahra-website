import crypto from "node:crypto";
import { getDb } from "../../_lib/mongodb.js";
import { adminExists, hashPassword, setSession, sameOrigin } from "../_lib/auth.js";

function timingSafeToken(value, expected) {
  const a = Buffer.from(String(value)); const b = Buffer.from(String(expected));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
export default async function handler(req, res) {
  if (req.method !== "POST") { res.setHeader("Allow", "POST"); return res.status(405).json({ success: false, message: "Method not allowed" }); }
  if (!sameOrigin(req)) return res.status(403).json({ success: false, message: "Forbidden" });
  try {
    if (await adminExists()) return res.status(409).json({ success: false, message: "Admin account already exists" });
    const setupToken = process.env.ADMIN_SETUP_TOKEN;
    const providedToken = String(req.body?.setupToken || "");
    if (!setupToken || setupToken.length < 32 || !timingSafeToken(providedToken, setupToken)) return res.status(403).json({ success: false, message: "Invalid setup authorization" });
    const username = String(req.body?.username || "").trim().toLowerCase();
    const password = String(req.body?.password || "");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(username)) return res.status(400).json({ success: false, message: "Enter a valid admin email" });
    if (password.length < 12) return res.status(400).json({ success: false, message: "Password must be at least 12 characters" });
    const db = await getDb(); const now = new Date();
    const result = await db.collection("admins").insertOne({ username, passwordHash: hashPassword(password), role: "admin", createdAt: now, updatedAt: now });
    const admin = { _id: result.insertedId, username }; setSession(res, admin);
    return res.status(201).json({ success: true, admin: { username } });
  } catch (error) {
    console.error("Admin setup failed", error);
    return res.status(503).json({ success: false, message: "Admin setup unavailable" });
  }
}
