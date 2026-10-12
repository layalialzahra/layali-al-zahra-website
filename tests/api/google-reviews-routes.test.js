import test from "node:test";
import assert from "node:assert/strict";
import { createGoogleReviewsAdminHandler, createGoogleReviewsPublicHandler } from "../../api/_lib/google-reviews-routes.js";

function response() { return { code: 200, headers: {}, body: null, status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; }, setHeader(name, value) { this.headers[name] = value; } }; }
function matches(doc, filter) { return Object.entries(filter).every(([key, value]) => { if (key === "$or") return value.some((part) => matches(doc, part)); if (value && value.$in) return value.$in.some((item) => String(item) === String(doc[key])); if (value && value.$nin) return !value.$nin.some((item) => String(item) === String(doc[key])); return String(doc[key]) === String(value); }); }
function database(initial = []) {
  const store = { google_reviews: [...initial], google_review_suppressions: [] };
  const db = { collection(name) { const docs = store[name]; return {
    createIndex: async () => "ok", findOne: async (filter) => docs.find((doc) => matches(doc, filter)) || null,
    find: (filter) => { let rows = docs.filter((doc) => matches(doc, filter)); const cursor = { sort() { return this; }, skip(n) { rows = rows.slice(n); return this; }, limit(n) { rows = rows.slice(0, n); return this; }, toArray: async () => rows }; return cursor; },
    countDocuments: async (filter) => docs.filter((doc) => matches(doc, filter)).length,
    updateMany: async (filter, update) => { let matchedCount = 0; for (const doc of docs.filter((item) => matches(item, filter))) { Object.assign(doc, update.$set); matchedCount++; } return { matchedCount }; },
    bulkWrite: async (ops) => { for (const op of ops) { const { filter, update } = op.updateOne; const found = docs.find((doc) => matches(doc, filter)); if (found) Object.assign(found, update.$set); else docs.push({ ...filter, ...update.$set, ...update.$setOnInsert }); } return { upsertedCount: 0, matchedCount: ops.length }; },
    deleteMany: async (filter) => { const before = docs.length; const keep = docs.filter((doc) => !matches(doc, filter)); docs.splice(0, docs.length, ...keep); return { deletedCount: before - docs.length }; },
  }; } };
  return { db, store };
}
const adminOptions = (db) => ({ getDb: async () => db, requireAdmin: () => ({ username: "admin" }), sameOrigin: () => true });

test("unauthenticated review management stops before database access", async () => {
  const handler = createGoogleReviewsAdminHandler({ requireAdmin: (_req, res) => { res.status(401).json({ success: false }); return null; }, sameOrigin: () => true, getDb: () => { throw new Error("database must not be reached"); } });
  const res = response();
  await handler({ method: "GET", query: {}, headers: {} }, res);
  assert.equal(res.code, 401);
});

test("publish is explicit and local deletion creates suppression before removal", async () => {
  const review = { _id: "aaaaaaaaaaaaaaaaaaaaaaaa", googleReviewId: "g-1", authorName: "A", rating: 5, reviewText: "Great", isPublished: false, sortOrder: 0 };
  const store = database([review]);
  const admin = createGoogleReviewsAdminHandler(adminOptions(store.db));
  const publishRes = response();
  await admin({ method: "PUT", query: {}, headers: {}, body: { ids: [review._id], action: "publish" } }, publishRes);
  assert.equal(publishRes.code, 200);
  assert.equal(store.store.google_reviews[0].isPublished, true);
  const deleteRes = response();
  await admin({ method: "DELETE", query: {}, headers: {}, body: { ids: [review._id] } }, deleteRes);
  assert.equal(deleteRes.code, 200);
  assert.equal(store.store.google_reviews.length, 0);
  assert.equal(store.store.google_review_suppressions[0].googleReviewId, "g-1");
});

test("public reviews exclude drafts and suppressed source IDs", async () => {
  const store = database([
    { _id: "1", googleReviewId: "g-1", authorName: "A", rating: 5, reviewText: "Public", isPublished: true, sortOrder: 0 },
    { _id: "2", googleReviewId: "g-2", authorName: "B", rating: 4, reviewText: "Draft", isPublished: false, sortOrder: 1 },
  ]);
  store.store.google_review_suppressions.push({ googleReviewId: "g-1" });
  const handler = createGoogleReviewsPublicHandler({ getDb: async () => store.db });
  const res = response();
  await handler({ method: "GET", query: {}, headers: {} }, res);
  assert.equal(res.code, 200);
  assert.equal(res.body.items.length, 0);
});

test("cross-origin review writes are rejected before database access", async () => {
  const handler = createGoogleReviewsAdminHandler({ requireAdmin: () => ({ username: "admin" }), sameOrigin: () => false, getDb: () => { throw new Error("database must not be reached"); } });
  const res = response();
  await handler({ method: "PUT", query: {}, headers: {}, body: { ids: ["aaaaaaaaaaaaaaaaaaaaaaaa"], action: "publish" } }, res);
  assert.equal(res.code, 403);
});

test("invalid review IDs return a validation error without mutation", async () => {
  const review = { _id: "aaaaaaaaaaaaaaaaaaaaaaaa", googleReviewId: "g-1", isPublished: false, sortOrder: 0 };
  const store = database([review]);
  const handler = createGoogleReviewsAdminHandler(adminOptions(store.db));
  const res = response();
  await handler({ method: "PUT", query: {}, headers: {}, body: { ids: ["not-an-id"], action: "publish" } }, res);
  assert.equal(res.code, 400);
  assert.equal(store.store.google_reviews[0].isPublished, false);
});
