import { getSession } from "../_lib/auth.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }
  const session = getSession(req);
  if (!session) return res.status(401).json({ success: false, authenticated: false });
  return res.status(200).json({ success: true, authenticated: true, admin: { username: session.username } });
}
