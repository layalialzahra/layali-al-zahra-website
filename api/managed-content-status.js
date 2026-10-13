import { getDb } from "./_lib/mongodb.js";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store, max-age=0");
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ success: false, enabled: false });
  }
  try {
    const setting = await (await getDb()).collection("site_settings").findOne({ _id: "managed_content" }, { projection: { enabled: 1 } });
    return res.status(200).json({ success: true, enabled: setting?.enabled === true });
  } catch {
    return res.status(200).json({ success: true, enabled: false });
  }
}
