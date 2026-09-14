import { getDb } from "../_lib/mongodb.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }
  try {
    const db = await getDb();
    await db.command({ ping: 1 });
    return res.status(200).json({ success: true, database: db.databaseName, message: "MongoDB connection is healthy" });
  } catch (error) {
    console.error("MongoDB health check failed", error);
    return res.status(503).json({ success: false, message: "Database connection unavailable" });
  }
}
