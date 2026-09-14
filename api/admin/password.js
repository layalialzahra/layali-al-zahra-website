import { adminExists, findAdmin, getSession, setSession, clearSession, sameOrigin, verifyPassword, hashPassword } from "../_lib/auth.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }
  if (!sameOrigin(req)) return res.status(403).json({ success: false, message: "Forbidden" });
  try {
    if (!(await adminExists())) return res.status(503).json({ success: false, message: "Admin account is not configured" });
    const session = getSession(req);
    if (!session) return res.status(401).json({ success: false, message: "Authentication required" });

    const currentPassword = String(req.body?.currentPassword || "");
    const newPassword = String(req.body?.newPassword || "");
    const confirmPassword = String(req.body?.confirmPassword || "");
    if (!currentPassword || !newPassword) return res.status(400).json({ success: false, message: "Current and new passwords are required" });
    if (newPassword.length < 12) return res.status(400).json({ success: false, message: "New password must be at least 12 characters" });
    if (newPassword !== confirmPassword) return res.status(400).json({ success: false, message: "New passwords do not match" });
    if (newPassword === currentPassword) return res.status(400).json({ success: false, message: "New password must be different from the current password" });

    const admin = await findAdmin(session.username);
    if (!admin || !verifyPassword(currentPassword, admin.passwordHash)) return res.status(401).json({ success: false, message: "Current password is incorrect" });

    const db = admin && await import("../_lib/mongodb.js").then(({ getDb }) => getDb());
    await db.collection("admins").updateOne({ _id: admin._id }, { $set: { passwordHash: hashPassword(newPassword), updatedAt: new Date() } });
    clearSession(res);
    return res.status(200).json({ success: true, authenticated: false, message: "Password changed. Please sign in again." });
  } catch (error) {
    console.error("Admin password change failed", error);
    return res.status(503).json({ success: false, message: "Password change unavailable" });
  }
}
