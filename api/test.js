// api/test.js
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

export default async function handler(req, res) {
  try {
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db("layalialzahra");
    const collections = await db.listCollections().toArray();

    res.status(200).json({
      success: true,
      message: "MongoDB connected successfully!",
      collections: collections.map(c => c.name),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}
