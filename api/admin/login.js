import { getDb } from "../../_lib/mongodb.js";
import { adminExists, findAdmin, setSession, sameOrigin, verifyPassword } from "../_lib/auth.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }
  if (!sameOrigin(req)) return res.status(403).json({ success: false, message: "Forbidden" });
  try {
    if (!(await adminExists())) {
      return res.status(503).json({ success: false, message: "Admin account is not configured" });
    }
    const username = String(req.body?.username || "").trim().toLowerCase();
    const password = String(req.body?.password || "");
    if (!username || !password) return res.status(401).json({ success: false, message: "Invalid credentials" });
    const admin = await findAdmin(username);
    const valid = admin ? verifyPassword(password, admin.passwordHash) : false;
    if (!valid) return res.status(401).json({ success: false, message: "Invalid credentials" });
    setSession(res, admin);
    return res.status(200).json({ success: true, admin: { username: admin.username } });
  } catch (error) {
    console.error("Admin login failed", error);
    return res.status(503).json({ success: false, message: "Authentication service unavailable" });
  }
}
