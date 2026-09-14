import { adminExists, findAdmin, getSession, setSession, clearSession, sameOrigin, verifyPassword } from "../_lib/auth.js";

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const session = getSession(req);
      if (session) return res.status(200).json({ success: true, authenticated: true, setupRequired: false, admin: { username: session.username } });
      const setupRequired = !(await adminExists());
      return res.status(200).json({ success: true, authenticated: false, setupRequired });
    }
    if (req.method !== "POST") {
      res.setHeader("Allow", "GET, POST");
      return res.status(405).json({ success: false, message: "Method not allowed" });
    }
    if (!sameOrigin(req)) return res.status(403).json({ success: false, message: "Forbidden" });
    if (req.body?.logout === true) {
      clearSession(res);
      return res.status(200).json({ success: true, authenticated: false });
    }
    if (!(await adminExists())) return res.status(503).json({ success: false, message: "Admin account is not configured" });
    const username = String(req.body?.username || "").trim().toLowerCase();
    const password = String(req.body?.password || "");
    if (!username || !password) return res.status(401).json({ success: false, message: "Invalid credentials" });
    const admin = await findAdmin(username);
    if (!admin || !verifyPassword(password, admin.passwordHash)) return res.status(401).json({ success: false, message: "Invalid credentials" });
    setSession(res, admin);
    return res.status(200).json({ success: true, authenticated: true, admin: { username: admin.username } });
  } catch (error) {
    console.error("Admin authentication failed", error);
    return res.status(503).json({ success: false, message: "Authentication service unavailable" });
  }
}
