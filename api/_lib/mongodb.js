import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME || "layalialzahra";

if (!uri) throw new Error("MONGODB_URI is not configured");

let cached = globalThis.__layaliMongo;
if (!cached) cached = globalThis.__layaliMongo = { client: null, promise: null };

export async function getMongoClient() {
  if (cached.client) return cached.client;
  if (!cached.promise) {
    const client = new MongoClient(uri, { maxPoolSize: 10, serverSelectionTimeoutMS: 5000 });
    cached.promise = client.connect().then((connected) => {
      cached.client = connected;
      return connected;
    });
  }
  return cached.promise;
}

export async function getDb() {
  const client = await getMongoClient();
  return client.db(dbName);
}
