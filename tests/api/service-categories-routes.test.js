import test from "node:test";
import assert from "node:assert/strict";
import { ObjectId } from "mongodb";
import { createServiceCategoriesHandler } from "../../api/_lib/service-categories-routes.js";

function response() {
  return { code: 200, headers: {}, body: null, status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; }, setHeader(name, value) { this.headers[name] = value; } };
}
function matches(doc, filter = {}) {
  return Object.entries(filter).every(([key, value]) => {
    if (key === "category" && value && value.$regex) return value.$regex.test(String(doc.category || ""));
    if (value && typeof value === "object" && "$type" in value) return typeof doc[key] === "string" && doc[key] !== "";
    return doc[key] === value;
  });
}
function fixture() {
  const docs = { service_categories: [], services: [] };
  const db = { collection(name) {
    const rows = docs[name];
    return {
      async createIndex() {},
      async findOne(filter) { return rows.find((row) => matches(row, filter)) || null; },
      find(filter) { const found = rows.filter((row) => matches(row, filter)); return { sort() { return this; }, async toArray() { return found; } }; },
      async distinct(field, filter) { return [...new Set(rows.filter((row) => matches(row, filter)).map((row) => row[field]))]; },
      async insertOne(item) { const doc = { ...item, _id: new ObjectId() }; rows.push(doc); return { insertedId: doc._id }; },
      async updateMany(filter, update) { let modifiedCount = 0; for (const row of rows) if (matches(row, filter)) { Object.assign(row, update.$set); modifiedCount++; } return { modifiedCount }; },
      async updateOne(filter, update, options = {}) { let row = rows.find((item) => matches(item, filter)); if (!row && options.upsert) { row = { _id: new ObjectId() }; rows.push(row); } if (row) Object.assign(row, update.$set); return { matchedCount: row ? 1 : 0 }; },
      async deleteOne(filter) { const index = rows.findIndex((row) => matches(row, filter)); if (index < 0) return { deletedCount: 0 }; rows.splice(index, 1); return { deletedCount: 1 }; },
      async countDocuments(filter) { return rows.filter((row) => matches(row, filter)).length; },
    };
  } };
  const handler = createServiceCategoriesHandler({ getDb: async () => db, requireAdmin: () => ({ username: "admin" }), sameOrigin: () => true });
  async function call(method, body = {}) { const res = response(); await handler({ method, body, query: {}, headers: {} }, res); return res; }
  return { docs, handler, call };
}

test("service category CRUD creates, renames assigned services, and deletes unused categories", async () => {
  const { docs, call } = fixture();
  const created = await call("POST", { name: "Hair" });
  assert.equal(created.code, 201);
  docs.services.push({ _id: new ObjectId(), title: "Hair Cut", category: "Hair" });
  const renamed = await call("PUT", { oldName: "Hair", name: "Hair Styling" });
  assert.equal(renamed.code, 200);
  assert.equal(docs.services[0].category, "Hair Styling");
  const blocked = await call("DELETE", { oldName: "Hair Styling" });
  assert.equal(blocked.code, 409);
  docs.services[0].category = "";
  const deleted = await call("DELETE", { oldName: "Hair Styling" });
  assert.equal(deleted.code, 200);
});

test("service category API rejects unauthenticated and cross-origin writes before database access", async () => {
  let dbReached = false;
  const unauthenticated = createServiceCategoriesHandler({ getDb: async () => { dbReached = true; throw new Error("should not connect"); }, requireAdmin: (_req, res) => { res.status(401).json({ success: false }); return null; }, sameOrigin: () => true });
  const first = response();
  await unauthenticated({ method: "POST", body: { name: "Hair" }, query: {}, headers: {} }, first);
  assert.equal(first.code, 401);
  const crossOrigin = createServiceCategoriesHandler({ getDb: async () => { dbReached = true; throw new Error("should not connect"); }, requireAdmin: () => ({ username: "admin" }), sameOrigin: () => false });
  const second = response();
  await crossOrigin({ method: "POST", body: { name: "Hair" }, query: {}, headers: { origin: "https://evil.example" } }, second);
  assert.equal(second.code, 403);
  assert.equal(dbReached, false);
});

test("service category names are required and duplicates are rejected", async () => {
  const { call } = fixture();
  assert.equal((await call("POST", { name: " " })).code, 400);
  assert.equal((await call("POST", { name: "Hair" })).code, 201);
  assert.equal((await call("POST", { name: " hair " })).code, 409);
});
