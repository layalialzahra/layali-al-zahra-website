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
