import test from "node:test";
import assert from "node:assert/strict";
import { createGoogleReviewsAdminHandler, createGoogleReviewsSyncHandler } from "../../api/_lib/google-reviews-routes.js";

function response() {
  return {
    code: 200, headers: {}, body: null,
    status(code) { this.code = code; return this; },
    json(body) { this.body = body; return this; },
    setHeader(name, value) { this.headers[name] = value; },
  };
}
function matches(doc, filter) {
  return Object.entries(filter).every(([key, value]) => {
    if (key === "$or") return value.some((part) => matches(doc, part));
    if (value && value.$in) return value.$in.some((item) => String(item) === String(doc[key]));
    if (value && value.$nin) return !value.$nin.some((item) => String(item) === String(doc[key]));
    return String(doc[key]) === String(value);
  });
}
function database(initialReviews = [], initialSuppressions = []) {
  const store = {
    google_reviews: structuredClone(initialReviews),
    google_review_suppressions: structuredClone(initialSuppressions),
  };
  const db = { collection(name) {
    const docs = store[name];
    return {
      createIndex: async () => "ok",
      find: (filter = {}) => {
        let rows = docs.filter((doc) => matches(doc, filter));
        return {
          sort() { return this; },
          skip(n) { rows = rows.slice(n); return this; },
          limit(n) { rows = rows.slice(0, n); return this; },
          toArray: async () => rows,
        };
      },
      countDocuments: async (filter = {}) => docs.filter((doc) => matches(doc, filter)).length,
      updateMany: async (filter, update) => {
        let matchedCount = 0;
        for (const doc of docs.filter((item) => matches(item, filter))) {
          Object.assign(doc, update.$set);
          matchedCount += 1;
        }
        return { matchedCount };
      },
      bulkWrite: async (operations) => {
        let upsertedCount = 0;
        let modifiedCount = 0;
        for (const operation of operations) {
          const { filter, update } = operation.updateOne;
          const existing = docs.find((item) => matches(item, filter));
          if (existing) {
            if (update.$set) Object.assign(existing, update.$set);
            modifiedCount += 1;
          } else if (operation.updateOne.upsert) {
            docs.push({ _id: "cccccccccccccccccccccccc", ...filter, ...update.$setOnInsert, ...update.$set });
            upsertedCount += 1;
          }
        }
        return { upsertedCount, modifiedCount, matchedCount: modifiedCount };
      },
      deleteMany: async (filter) => {
        const keep = docs.filter((doc) => !matches(doc, filter));
        const deletedCount = docs.length - keep.length;
        docs.splice(0, docs.length, ...keep);
        return { deletedCount };
      },
    };
  } };
  return { db, store };
}

const env = {
  GOOGLE_BUSINESS_PROFILE_CLIENT_ID: "test-client",
  GOOGLE_BUSINESS_PROFILE_CLIENT_SECRET: "test-secret",
  GOOGLE_BUSINESS_PROFILE_REFRESH_TOKEN: "test-refresh",
  GOOGLE_BUSINESS_PROFILE_PARENT: "accounts/123/locations/456",
};
const auth = {
  requireAdmin: () => ({ username: "admin" }),
  sameOrigin: () => true,
};
function provider(reviews) {
  return async (url) => {
    if (String(url).includes("oauth2.googleapis.com")) {
      return { ok: true, json: async () => ({ access_token: "test-access-token" }) };
    }
    return { ok: true, json: async () => ({ reviews, totalReviewCount: reviews.length }) };
  };
}

test("moderation lifecycle: import drafts, publish explicitly, preserve order, delete locally and never reimport suppression", async () => {
  const keptId = "aaaaaaaaaaaaaaaaaaaaaaaa";
  const deletedId = "bbbbbbbbbbbbbbbbbbbbbbbb";
  const kept = {
    _id: keptId, googleReviewId: "google-keep", authorName: "Keep",
    rating: 4, reviewText: "Keep this local record", isPublished: true,
    sortOrder: 17, createdAt: new Date("2026-01-01T00:00:00.000Z"),
  };
  const fixture = database([kept, {
    _id: deletedId, googleReviewId: "google-delete", authorName: "Remove",
    rating: 3, reviewText: "Remove only the local copy", isPublished: true, sortOrder: 2,
  }]);
  const admin = createGoogleReviewsAdminHandler({ ...auth, getDb: async () => fixture.db });
  const sync = createGoogleReviewsSyncHandler({
    ...auth, env, getDb: async () => fixture.db,
    fetchImpl: provider([
      { reviewId: "google-keep", reviewer: { displayName: "Keep updated" }, starRating: "FIVE", comment: "Updated from Google" },
      { reviewId: "google-delete", reviewer: { displayName: "Remove" }, starRating: "THREE", comment: "Should stay suppressed" },
      { reviewId: "google-new", reviewer: { displayName: "New" }, starRating: "FIVE", comment: "New import is a draft" },
    ]),
  });

  const deleteResponse = response();
  await admin({ method: "DELETE", headers: {}, query: {}, body: { ids: [deletedId] } }, deleteResponse);
  assert.equal(deleteResponse.code, 200);
  assert.equal(deleteResponse.body.deleted, 1);
  assert.deepEqual(fixture.store.google_reviews.map((item) => item.googleReviewId), ["google-keep"]);
  assert.deepEqual(fixture.store.google_review_suppressions.map((item) => item.googleReviewId), ["google-delete"]);

  const syncResponse = response();
  await sync({ method: "POST", headers: {}, body: {} }, syncResponse);
  assert.equal(syncResponse.code, 200);
  assert.equal(syncResponse.body.fetched, 3);
  assert.equal(syncResponse.body.inserted, 1);
  assert.equal(syncResponse.body.suppressed, 1);
  assert.deepEqual(fixture.store.google_reviews.map((item) => item.googleReviewId).sort(), ["google-keep", "google-new"]);
  const keptAfterSync = fixture.store.google_reviews.find((item) => item.googleReviewId === "google-keep");
  const newReview = fixture.store.google_reviews.find((item) => item.googleReviewId === "google-new");
  assert.equal(keptAfterSync.isPublished, true);
  assert.equal(keptAfterSync.sortOrder, 17);
  assert.equal(newReview.isPublished, false);
  assert.equal(newReview.sortOrder, 0);

  const publishResponse = response();
  await admin({ method: "PUT", headers: {}, query: {}, body: { ids: [newReview._id], action: "publish" } }, publishResponse);
  assert.equal(publishResponse.code, 200);
  assert.equal(fixture.store.google_reviews.find((item) => item.googleReviewId === "google-new").isPublished, true);

  const secondSyncResponse = response();
  await sync({ method: "POST", headers: {}, body: {} }, secondSyncResponse);
  assert.equal(secondSyncResponse.code, 200);
  assert.equal(fixture.store.google_reviews.find((item) => item.googleReviewId === "google-delete"), undefined);
  assert.equal(fixture.store.google_review_suppressions.some((item) => item.googleReviewId === "google-delete"), true);
  assert.equal(fixture.store.google_reviews.find((item) => item.googleReviewId === "google-new").isPublished, true);
  assert.equal(fixture.store.google_reviews.find((item) => item.googleReviewId === "google-keep").sortOrder, 17);
});
