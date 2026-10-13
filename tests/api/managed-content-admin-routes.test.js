import test from "node:test";
import assert from "node:assert/strict";
import { createManagedContentHandler } from "../../api/_lib/managed-content-routes.js";

function response() { return { code: 200, body: null, status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; }, setHeader() {} }; }
function matches(doc, filter) { return Object.entries(filter).every(([key, value]) => String(doc[key]) === String(value)); }
function database(initial = []) {
  const docs = [...initial];
  const collection = {
    createIndex: async () => "ok",
    findOne: async (filter) => docs.find((doc) => matches(doc, filter)) || null,
    insertOne: async (doc) => { doc._id = "aaaaaaaaaaaaaaaaaaaaaaaa"; docs.push(doc); return { insertedId: doc._id }; },
    find: (filter) => { const items = docs.filter((doc) => matches(doc, filter)); return { sort() { return { skip(offset) { return { limit(limit) { return { toArray: async () => items.slice(offset, offset + limit) }; } }; } }; } }; },
    countDocuments: async (filter) => docs.filter((doc) => matches(doc, filter)).length,
    findOneAndUpdate: async (filter, update) => { const doc = docs.find((item) => matches(item, filter)); Object.assign(doc, update.$set); return doc; },
    deleteOne: async (filter) => { const index = docs.findIndex((doc) => matches(doc, filter)); if (index >= 0) docs.splice(index, 1); return { deletedCount: index >= 0 ? 1 : 0 }; },
  };
  return { db: { collection: () => collection }, docs };
}

test("admin create persists validated managed content", async () => {
  const store = database();
  const handler = createManagedContentHandler("service", { admin: true, requireAdmin: () => ({ username: "admin" }), sameOrigin: () => true, getDb: async () => store.db });
  const res = response();
  await handler({ method: "POST", query: {}, headers: {}, body: { title: "Hair Cuts", subservices: [{ name: "Blunt Bob", price: "AED 99.75" }] } }, res);
  assert.equal(res.code, 201);
  assert.equal(res.body.item.title, "Hair Cuts");
  assert.equal(store.docs[0].subservices[0].price, "AED 99.75");
});

test("admin partial update preserves fields not supplied", async () => {
  const store = database([{ _id: "aaaaaaaaaaaaaaaaaaaaaaaa", title: "Hair Cuts", slug: "hair-cuts", description: "Original", status: "published", sortOrder: 1, subservices: [] }]);
  const handler = createManagedContentHandler("service", { admin: true, requireAdmin: () => ({ username: "admin" }), sameOrigin: () => true, getDb: async () => store.db });
  const res = response();
  await handler({ method: "PUT", query: { id: "aaaaaaaaaaaaaaaaaaaaaaaa" }, headers: {}, body: { description: "Updated" } }, res);
  assert.equal(res.code, 200);
  assert.equal(res.body.item.title, "Hair Cuts");
  assert.equal(res.body.item.description, "Updated");
});

test("admin list supports pagination and total count", async () => {
  const store = database([{ _id: "1", title: "A", slug: "a", status: "draft", sortOrder: 1 }, { _id: "2", title: "B", slug: "b", status: "published", sortOrder: 2 }]);
  const handler = createManagedContentHandler("service", { admin: true, requireAdmin: () => ({ username: "admin" }), sameOrigin: () => true, getDb: async () => store.db });
  const res = response();
  await handler({ method: "GET", query: { page: "1", limit: "1" }, headers: {} }, res);
  assert.equal(res.code, 200);
  assert.equal(res.body.items.length, 1);
  assert.equal(res.body.total, 2);
  assert.equal(res.body.pages, 2);
});

test("duplicate service slugs return a conflict", async () => {
  const store = database([{ _id: "1", title: "Hair Cuts", slug: "hair-cuts", status: "published" }]);
  const handler = createManagedContentHandler("service", { admin: true, requireAdmin: () => ({ username: "admin" }), sameOrigin: () => true, getDb: async () => store.db });
  const res = response();
  await handler({ method: "POST", query: {}, headers: {}, body: { title: "Hair Cuts" } }, res);
  assert.equal(res.code, 409);
  assert.equal(store.docs.length, 1);
});

test("admin delete removes the local record", async () => {
  const store = database([{ _id: "aaaaaaaaaaaaaaaaaaaaaaaa", title: "Hair Cuts", slug: "hair-cuts", status: "draft" }]);
  const handler = createManagedContentHandler("service", { admin: true, requireAdmin: () => ({ username: "admin" }), sameOrigin: () => true, getDb: async () => store.db });
  const res = response();
  await handler({ method: "DELETE", query: { id: "aaaaaaaaaaaaaaaaaaaaaaaa" }, headers: {} }, res);
  assert.equal(res.code, 200);
  assert.equal(store.docs.length, 0);
});
