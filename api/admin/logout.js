import { clearSession, sameOrigin } from "../_lib/auth.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }
  if (!sameOrigin(req)) return res.status(403).json({ success: false, message: "Forbidden" });
  clearSession(res);
  return res.status(200).json({ success: true });
}
