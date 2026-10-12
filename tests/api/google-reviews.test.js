import test from "node:test";
import assert from "node:assert/strict";
import { normalizeGoogleReview, mergeSyncedReview, filterSuppressedReviews, serializeGoogleReview, fetchAllGoogleReviews, isGoogleReviewsSyncConfigured } from "../../api/_lib/google-reviews.js";

test("maps documented Google review fields without inventing values", () => {
  const review = normalizeGoogleReview({ reviewId: "g-1", reviewer: { displayName: "A. Reviewer", isAnonymous: false }, starRating: "FIVE", comment: "Excellent service", createTime: "2026-09-01T10:00:00Z", updateTime: "2026-09-02T10:00:00Z" });
  assert.deepEqual(review, { googleReviewId: "g-1", authorName: "A. Reviewer", rating: 5, reviewText: "Excellent service", sourceCreatedAt: "2026-09-01T10:00:00.000Z", sourceUpdatedAt: "2026-09-02T10:00:00.000Z" });
});

test("anonymous and missing optional fields remain absent rather than fabricated", () => {
  const review = normalizeGoogleReview({ reviewId: "g-2", reviewer: { isAnonymous: true }, starRating: "STAR_RATING_UNSPECIFIED" });
  assert.equal(review.authorName, null);
  assert.equal(review.rating, null);
  assert.equal(review.reviewText, "");
  assert.equal(review.sourceCreatedAt, null);
});

test("rejects a review without a stable source ID or with an invalid timestamp", () => {
  assert.throws(() => normalizeGoogleReview({ comment: "No ID" }), /reviewId/i);
  assert.throws(() => normalizeGoogleReview({ reviewId: "g-3", createTime: "not-a-date" }), /timestamp/i);
});

test("sync merge preserves local publication and ordering", () => {
  const merged = mergeSyncedReview({ isPublished: true, sortOrder: 7, createdAt: "original" }, { googleReviewId: "g-1", authorName: "New name", rating: 4, reviewText: "Edited" }, new Date("2026-10-12T00:00:00Z"));
  assert.equal(merged.isPublished, true);
  assert.equal(merged.sortOrder, 7);
  assert.equal(merged.authorName, "New name");
  assert.equal(merged.createdAt, "original");
});

test("suppressed source IDs are excluded and public serialization omits local metadata", () => {
  const records = [{ googleReviewId: "g-1", authorName: "A", rating: 5, reviewText: "Good", isPublished: true, sortOrder: 1, syncedAt: new Date(), accessToken: "secret" }];
  assert.equal(filterSuppressedReviews(records, new Set(["g-1"])).length, 0);
  const publicReview = serializeGoogleReview(records[0], { publicOnly: true });
  assert.equal(publicReview.reviewText, "Good");
  assert.equal("googleReviewId" in publicReview, false);
  assert.equal("accessToken" in publicReview, false);
});


const syncEnv = {
  GOOGLE_BUSINESS_PROFILE_CLIENT_ID: "test-client",
  GOOGLE_BUSINESS_PROFILE_CLIENT_SECRET: "test-secret",
  GOOGLE_BUSINESS_PROFILE_REFRESH_TOKEN: "test-refresh",
  GOOGLE_BUSINESS_PROFILE_PARENT: "accounts/123/locations/456",
};

test("sync configuration requires OAuth credentials and a valid account/location resource", () => {
  assert.equal(isGoogleReviewsSyncConfigured(syncEnv), true);
  assert.equal(isGoogleReviewsSyncConfigured({ ...syncEnv, GOOGLE_BUSINESS_PROFILE_PARENT: "https://attacker.example" }), false);
  assert.equal(isGoogleReviewsSyncConfigured({ ...syncEnv, GOOGLE_BUSINESS_PROFILE_REFRESH_TOKEN: "" }), false);
});

test("fetches every review page and derives IDs from the documented resource name when needed", async () => {
  const calls = [];
  const fetchImpl = async (url) => {
    calls.push(String(url));
    if (String(url).includes("oauth2.googleapis.com")) {
      return { ok: true, json: async () => ({ access_token: "short-lived-test-token" }) };
    }
    if (String(url).includes("pageToken=next")) {
      return { ok: true, json: async () => ({
        totalReviewCount: 2,
        reviews: [{ name: "accounts/123/locations/456/reviews/g-2", reviewer: { displayName: "B" }, starRating: "FOUR", comment: "Good" }],
      }) };
    }
    return { ok: true, json: async () => ({
      totalReviewCount: 2,
      nextPageToken: "next",
      reviews: [{ name: "accounts/123/locations/456/reviews/g-1", reviewer: { displayName: "A" }, starRating: "FIVE", comment: "Great" }],
    }) };
  };
  const result = await fetchAllGoogleReviews({ env: syncEnv, fetchImpl });
  assert.equal(result.totalReviewCount, 2);
  assert.deepEqual(result.reviews.map((item) => item.googleReviewId), ["g-1", "g-2"]);
  assert.equal(calls.length, 3);
  assert.ok(calls[1].startsWith("https://mybusiness.googleapis.com/v4/accounts/123/locations/456/reviews?"));
});

test("rejects incomplete pagination before returning any review set", async () => {
  let apiCalls = 0;
  const fetchImpl = async (url) => {
    if (String(url).includes("oauth2.googleapis.com")) return { ok: true, json: async () => ({ access_token: "token" }) };
    apiCalls++;
    return { ok: true, json: async () => ({
      totalReviewCount: 2,
      reviews: [{ reviewId: "g-1", starRating: "FIVE" }],
    }) };
  };
  await assert.rejects(fetchAllGoogleReviews({ env: syncEnv, fetchImpl }), /pagination was incomplete/i);
  assert.equal(apiCalls, 1);
});
