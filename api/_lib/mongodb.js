import { MongoClient } from "mongodb";

const dbName = process.env.MONGODB_DB_NAME || "layalialzahra";

let cached = globalThis.__layaliMongo;
if (!cached) cached = globalThis.__layaliMongo = { client: null, promise: null };

export async function getMongoClient() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not configured");
  if (cached.client) return cached.client;
  if (!cached.promise) {
    const client = new MongoClient(uri, { maxPoolSize: 10, serverSelectionTimeoutMS: 5000 });
    cached.promise = client.connect().then((connected) => {
      cached.client = connected;
      return connected;
    }).catch((error) => {
      cached.promise = null;
      throw error;
    });
  }
  return cached.promise;
}

export async function getDb() {
  const client = await getMongoClient();
  return client.db(dbName);
}
