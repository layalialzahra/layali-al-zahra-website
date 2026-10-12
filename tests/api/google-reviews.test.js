import test from "node:test";
import assert from "node:assert/strict";
import { normalizeGoogleReview, mergeSyncedReview, filterSuppressedReviews, serializeGoogleReview } from "../../api/_lib/google-reviews.js";

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
