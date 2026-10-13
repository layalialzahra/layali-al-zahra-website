import test from "node:test";
import assert from "node:assert/strict";
import { ObjectId } from "mongodb";
import { createManualReviewsAdminHandler, createGoogleReviewsPublicHandler } from "../../api/_lib/google-reviews-routes.js";

function response() {
  return { code: 200, headers: {}, body: null, status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; }, setHeader(name, value) { this.headers[name] = value; } };
}
function matches(doc, filter) {
  return Object.entries(filter || {}).every(([key, value]) => {
    if (key === "$or") return value.some((part) => matches(doc, part));
    const actual = doc[key];
    if (value && typeof value === "object" && !(value instanceof ObjectId)) {
      if (Object.hasOwn(value, "$ne")) return String(actual) !== String(value.$ne);
      if (Object.hasOwn(value, "$regex")) return new RegExp(value.$regex, value.$options || "").test(String(actual || ""));
      if (Object.hasOwn(value, "$in")) return value.$in.some((item) => String(item) === String(actual));
    }
    return String(actual) === String(value);
  });
}
function database(initial = []) {
  const store = { reviews: initial.map((item) => ({ ...item })) };
  const db = { collection(name) {
    const docs = store[name];
    return {
      find: (filter) => {
        let rows = docs.filter((doc) => matches(doc, filter));
        const cursor = { sort() { rows.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0) || String(b.sourceCreatedAt).localeCompare(String(a.sourceCreatedAt))); return this; }, limit(n) { rows = rows.slice(0, n); return this; }, toArray: async () => rows };
        return cursor;
      },
      findOne: async (filter) => docs.find((doc) => matches(doc, filter)) || null,
      insertOne: async (record) => { const _id = new ObjectId(); docs.push({ ...record, _id }); return { insertedId: _id }; },
      updateOne: async (filter, update) => { const found = docs.find((doc) => matches(doc, filter)); if (!found) return { matchedCount: 0 }; Object.assign(found, update.$set); return { matchedCount: 1 }; },
      deleteOne: async (filter) => { const index = docs.findIndex((doc) => matches(doc, filter)); if (index < 0) return { deletedCount: 0 }; docs.splice(index, 1); return { deletedCount: 1 }; },
    };
  } };
  return { db, store };
}
const adminOptions = (db) => ({ getDb: async () => db, requireAdmin: () => ({ username: "admin" }), sameOrigin: () => true });
const sample = (overrides = {}) => ({
  _id: new ObjectId("aaaaaaaaaaaaaaaaaaaaaaaa"),
  authorName: "Client",
  rating: 5,
  reviewText: "Excellent service",
  sourceCreatedAt: "2026-10-10",
  sortOrder: 0,
  isPublished: false,
  ...overrides,
});
const validBody = (overrides = {}) => ({
  authorName: "Client",
  rating: 5,
  reviewText: "Excellent service",
  sourceCreatedAt: "2026-10-10",
  sortOrder: 0,
  isPublished: false,
  ...overrides,
});

test("manual review CRUD supports add, edit, publication and deletion", async () => {
  const store = database();
  const admin = createManualReviewsAdminHandler(adminOptions(store.db));
  const createRes = response();
  await admin({ method: "POST", query: {}, headers: {}, body: validBody() }, createRes);
  assert.equal(createRes.code, 201);
  const id = createRes.body.item._id;
  assert.equal(store.store.reviews[0].isPublished, false);

  const editRes = response();
  await admin({ method: "PUT", query: { id }, headers: {}, body: validBody({ authorName: "Updated client", rating: 4, sortOrder: 2 }) }, editRes);
  assert.equal(editRes.code, 200);
  assert.equal(store.store.reviews[0].authorName, "Updated client");
  assert.equal(store.store.reviews[0].sortOrder, 2);

  const publishRes = response();
  await admin({ method: "PUT", query: { id }, headers: {}, body: { action: "publish" } }, publishRes);
  assert.equal(publishRes.code, 200);
  assert.equal(store.store.reviews[0].isPublished, true);

  const unpublishRes = response();
  await admin({ method: "PUT", query: { id }, headers: {}, body: { action: "unpublish" } }, unpublishRes);
  assert.equal(unpublishRes.code, 200);
  assert.equal(store.store.reviews[0].isPublished, false);

  const deleteRes = response();
  await admin({ method: "DELETE", query: { id }, headers: {} }, deleteRes);
  assert.equal(deleteRes.code, 200);
  assert.equal(store.store.reviews.length, 0);
});

test("invalid ratings and dates are rejected without inserting records", async () => {
  const store = database();
  const admin = createManualReviewsAdminHandler(adminOptions(store.db));
  for (const body of [validBody({ rating: 6 }), validBody({ sourceCreatedAt: "2026-02-30" })]) {
    const res = response();
    await admin({ method: "POST", query: {}, headers: {}, body }, res);
    assert.equal(res.code, 400);
  }
  assert.equal(store.store.reviews.length, 0);
});

test("unauthenticated and cross-origin writes stop before database access", async () => {
  const unauthenticated = createManualReviewsAdminHandler({
    requireAdmin: (_req, res) => { res.status(401).json({ success: false }); return null; },
    sameOrigin: () => true,
    getDb: () => { throw new Error("database must not be reached"); },
  });
  const unauthorizedRes = response();
  await unauthenticated({ method: "GET", query: {}, headers: {} }, unauthorizedRes);
  assert.equal(unauthorizedRes.code, 401);

  const crossOrigin = createManualReviewsAdminHandler({
    requireAdmin: () => ({ username: "admin" }),
    sameOrigin: () => false,
    getDb: () => { throw new Error("database must not be reached"); },
  });
  const crossOriginRes = response();
  await crossOrigin({ method: "POST", query: {}, headers: {}, body: validBody() }, crossOriginRes);
  assert.equal(crossOriginRes.code, 403);
});

test("public reviews include only published manual reviews in display order", async () => {
  const store = database([
    sample({ _id: new ObjectId("aaaaaaaaaaaaaaaaaaaaaaaa"), authorName: "Published first", isPublished: true, sortOrder: 0 }),
    sample({ _id: new ObjectId("bbbbbbbbbbbbbbbbbbbbbbbb"), authorName: "Draft", isPublished: false, sortOrder: 1 }),
    sample({ _id: new ObjectId("cccccccccccccccccccccccc"), authorName: "Published second", isPublished: true, sortOrder: 2 }),
  ]);
  const handler = createGoogleReviewsPublicHandler({ getDb: async () => store.db });
  const res = response();
  await handler({ method: "GET", query: {}, headers: {} }, res);
  assert.equal(res.code, 200);
  assert.deepEqual(res.body.items.map((item) => item.authorName), ["Published first", "Published second"]);
  assert.equal(res.body.items[0].isPublished, undefined);
});
