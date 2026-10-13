import test from "node:test";
import assert from "node:assert/strict";
import { createGoogleReviewsSyncHandler } from "../../api/_lib/google-reviews-routes.js";

function response() {
  return { code: 200, headers: {}, body: null,
    status(code) { this.code = code; return this; },
    json(body) { this.body = body; return this; },
    setHeader(name, value) { this.headers[name] = value; },
  };
}
function matches(doc, filter) {
  return Object.entries(filter).every(([key, value]) => {
    if (value && value.$in) return value.$in.some((item) => String(item) === String(doc[key]));
    if (value && value.$nin) return !value.$nin.some((item) => String(item) === String(doc[key]));
    return String(doc[key]) === String(value);
  });
}
function database(initialReviews = [], initialSuppressions = []) {
  const store = { google_reviews: [...initialReviews], google_review_suppressions: [...initialSuppressions] };
  const db = { collection(name) {
    const docs = store[name];
    return {
      createIndex: async () => "ok",
      find: (filter) => ({ toArray: async () => docs.filter((item) => matches(item, filter)) }),
      bulkWrite: async (operations) => {
        let upsertedCount = 0, modifiedCount = 0;
        for (const operation of operations) {
          const { filter, update } = operation.updateOne;
          const existing = docs.find((item) => matches(item, filter));
          if (existing) { Object.assign(existing, update.$set); modifiedCount++; }
          else { docs.push({ ...update.$set }); upsertedCount++; }
        }
        return { upsertedCount, modifiedCount };
      },
    };
  }};
  return { db, store };
}
const env = {
  GOOGLE_BUSINESS_PROFILE_CLIENT_ID: "test-client",
  GOOGLE_BUSINESS_PROFILE_CLIENT_SECRET: "test-secret",
  GOOGLE_BUSINESS_PROFILE_REFRESH_TOKEN: "test-refresh",
  GOOGLE_BUSINESS_PROFILE_PARENT: "accounts/123/locations/456",
};
const auth = { requireAdmin: () => ({ username: "admin" }), sameOrigin: () => true };
function fetchPages(reviews, total = reviews.length) {
  return async (url) => {
    if (String(url).includes("oauth2.googleapis.com")) return { ok: true, json: async () => ({ access_token: "temporary-token" }) };
    return { ok: true, json: async () => ({ reviews, totalReviewCount: total }) };
  };
}

test("sync preserves local publish/order choices, skips suppressed IDs and inserts new reviews unpublished", async () => {
  const existing = { _id: "existing", googleReviewId: "g-1", authorName: "Old", rating: 4, reviewText: "Old text", isPublished: true, sortOrder: 9, createdAt: new Date("2026-01-01T00:00:00Z") };
  const db = database([existing], [{ googleReviewId: "g-2" }]);
  const handler = createGoogleReviewsSyncHandler({
    ...auth, env, getDb: async () => db.db, now: () => new Date("2026-10-12T00:00:00Z"),
    fetchImpl: fetchPages([
      { reviewId: "g-1", reviewer: { displayName: "Updated" }, starRating: "FIVE", comment: "Updated text" },
      { reviewId: "g-2", reviewer: { displayName: "Suppressed" }, starRating: "FOUR", comment: "Do not restore" },
      { reviewId: "g-3", reviewer: { displayName: "New" }, starRating: "FIVE", comment: "New review" },
    ]),
  });
  const res = response();
  await handler({ method: "POST", headers: {}, body: {} }, res);
  assert.equal(res.code, 200);
  assert.deepEqual({ fetched: res.body.fetched, inserted: res.body.inserted, updated: res.body.updated, suppressed: res.body.suppressed }, { fetched: 3, inserted: 1, updated: 1, suppressed: 1 });
  assert.equal(db.store.google_reviews.length, 2);
  assert.equal(db.store.google_reviews[0].authorName, "Updated");
  assert.equal(db.store.google_reviews[0].isPublished, true);
  assert.equal(db.store.google_reviews[0].sortOrder, 9);
  const added = db.store.google_reviews.find((item) => item.googleReviewId === "g-3");
  assert.equal(added.isPublished, false);
  assert.equal(added.sortOrder, 0);
});

test("failed or incomplete provider retrieval does not mutate local reviews", async () => {
  const existing = { _id: "existing", googleReviewId: "g-1", authorName: "Existing", reviewText: "Keep me", isPublished: true, sortOrder: 3 };
  const db = database([existing]);
  const handler = createGoogleReviewsSyncHandler({
    ...auth, env, getDb: async () => db.db,
    fetchImpl: fetchPages([{ reviewId: "g-2", starRating: "FIVE", comment: "Incomplete" }], 2),
  });
  const res = response();
  await handler({ method: "POST", headers: {}, body: {} }, res);
  assert.equal(res.code, 502);
  assert.equal(db.store.google_reviews.length, 1);
  assert.equal(db.store.google_reviews[0].reviewText, "Keep me");
});

test("sync refuses unauthenticated requests before calling Google", async () => {
  let called = false;
  const handler = createGoogleReviewsSyncHandler({
    requireAdmin: (_req, res) => { res.status(401).json({ success: false }); return null; },
    sameOrigin: () => true, env, fetchImpl: async () => { called = true; throw new Error("should not call"); },
    getDb: async () => { throw new Error("should not connect"); },
  });
  const res = response();
  await handler({ method: "POST", headers: {}, body: {} }, res);
  assert.equal(res.code, 401);
  assert.equal(called, false);
});

test("provider errors, request timeouts and incomplete responses preserve the entire local and published review set", async (t) => {
  const scenarios = [
    {
      name: "provider returns an unsuccessful review response",
      fetchImpl: async (url) => {
        if (String(url).includes("oauth2.googleapis.com")) return { ok: true, json: async () => ({ access_token: "temporary-token" }) };
        return { ok: false, status: 503, json: async () => ({ error: "upstream unavailable" }) };
      },
    },
    {
      name: "provider request times out",
      fetchImpl: async (url) => {
        if (String(url).includes("oauth2.googleapis.com")) return { ok: true, json: async () => ({ access_token: "temporary-token" }) };
        const error = new Error("simulated timeout");
        error.name = "TimeoutError";
        throw error;
      },
    },
    {
      name: "provider returns an incomplete final page",
      fetchImpl: async (url) => {
        if (String(url).includes("oauth2.googleapis.com")) return { ok: true, json: async () => ({ access_token: "temporary-token" }) };
        return { ok: true, json: async () => ({
          totalReviewCount: 2,
          reviews: [{ reviewId: "g-incomplete", reviewer: { displayName: "Partial" }, starRating: "FIVE", comment: "Must not be imported" }],
        }) };
      },
    },
    {
      name: "provider returns a malformed page shape",
      fetchImpl: async (url) => {
        if (String(url).includes("oauth2.googleapis.com")) return { ok: true, json: async () => ({ access_token: "temporary-token" }) };
        return { ok: true, json: async () => ({ totalReviewCount: 2, reviews: null }) };
      },
    },
  ];

  for (const scenario of scenarios) {
    await t.test(scenario.name, async () => {
      const initial = [
        { _id: "published-1", googleReviewId: "g-published", authorName: "Published", rating: 5, reviewText: "Last known good published review", isPublished: true, sortOrder: 4, createdAt: new Date("2026-01-01T00:00:00.000Z") },
        { _id: "draft-1", googleReviewId: "g-draft", authorName: "Draft", rating: 3, reviewText: "Last known good draft", isPublished: false, sortOrder: 8, createdAt: new Date("2026-02-01T00:00:00.000Z") },
      ];
      const db = database(initial);
      const before = structuredClone(db.store.google_reviews);
      let reviewBulkWrites = 0;
      const originalCollection = db.db.collection.bind(db.db);
      db.db.collection = (name) => {
        const collection = originalCollection(name);
        if (name === "google_reviews") {
          const originalBulkWrite = collection.bulkWrite;
          collection.bulkWrite = async (...args) => {
            reviewBulkWrites += 1;
            return originalBulkWrite(...args);
          };
        }
        return collection;
      };

      const handler = createGoogleReviewsSyncHandler({
        ...auth, env, getDb: async () => db.db, fetchImpl: scenario.fetchImpl,
      });
      const res = response();
      await handler({ method: "POST", headers: {}, body: {} }, res);

      assert.equal(res.code, 502, "failed source retrieval must fail the sync");
      assert.equal(reviewBulkWrites, 0, "review writes must not start before all source pages validate");
      assert.deepEqual(db.store.google_reviews, before, "all local records and moderation fields must remain unchanged");
      assert.deepEqual(
        db.store.google_reviews.filter((review) => review.isPublished === true),
        before.filter((review) => review.isPublished === true),
        "the last known-good published review set must remain unchanged",
      );
      assert.equal(db.store.google_reviews.some((review) => review.googleReviewId.startsWith("g-incomplete")), false);
    });
  }
});
