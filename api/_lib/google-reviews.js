const STAR_RATINGS = {
  ONE: 1,
  TWO: 2,
  THREE: 3,
  FOUR: 4,
  FIVE: 5,
  STAR_RATING_UNSPECIFIED: null,
};
const ADMIN_FIELDS = [
  "_id", "googleReviewId", "authorName", "rating", "reviewText",
  "sourceCreatedAt", "sourceUpdatedAt", "isPublished", "sortOrder",
  "syncedAt", "createdAt", "updatedAt",
];
const PUBLIC_FIELDS = ["authorName", "rating", "reviewText", "sourceCreatedAt", "sortOrder"];

function optionalTimestamp(value, fieldName) {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string" || Number.isNaN(Date.parse(value))) throw new Error(`Invalid ${fieldName} timestamp`);
  return new Date(value).toISOString();
}

export function normalizeGoogleReview(apiReview) {
  if (!apiReview || typeof apiReview !== "object" || Array.isArray(apiReview)) throw new Error("Invalid Google review");
  const googleReviewId = typeof apiReview.reviewId === "string" ? apiReview.reviewId.trim() : "";
  if (!googleReviewId) throw new Error("Google reviewId is required");
  if (googleReviewId.length > 200) throw new Error("Google reviewId is invalid");

  const reviewer = apiReview.reviewer && typeof apiReview.reviewer === "object" ? apiReview.reviewer : {};
  const authorName = reviewer.isAnonymous === true
    ? null
    : (typeof reviewer.displayName === "string" && reviewer.displayName.trim() ? reviewer.displayName.trim().slice(0, 200) : null);
  const rating = Object.hasOwn(STAR_RATINGS, apiReview.starRating) ? STAR_RATINGS[apiReview.starRating] : null;
  if (apiReview.comment !== undefined && apiReview.comment !== null && typeof apiReview.comment !== "string") {
    throw new Error("Invalid Google review comment");
  }

  return {
    googleReviewId,
    authorName,
    rating,
    reviewText: typeof apiReview.comment === "string" ? apiReview.comment : "",
    sourceCreatedAt: optionalTimestamp(apiReview.createTime, "createTime"),
    sourceUpdatedAt: optionalTimestamp(apiReview.updateTime, "updateTime"),
  };
}

export function mergeSyncedReview(existing, incoming, now = new Date()) {
  if (!incoming || typeof incoming.googleReviewId !== "string" || !incoming.googleReviewId) {
    throw new Error("A normalized Google reviewId is required");
  }
  return {
    ...incoming,
    isPublished: existing?.isPublished === true,
    sortOrder: Number.isFinite(existing?.sortOrder) ? existing.sortOrder : 0,
    createdAt: existing?.createdAt || now,
    updatedAt: now,
    syncedAt: now,
  };
}

export function filterSuppressedReviews(reviews, suppressedIds) {
  const suppressed = suppressedIds instanceof Set ? suppressedIds : new Set(suppressedIds || []);
  return (Array.isArray(reviews) ? reviews : []).filter((review) => !suppressed.has(review.googleReviewId));
}

export function serializeGoogleReview(review, { publicOnly = false } = {}) {
  if (!review || typeof review !== "object") return null;
  const output = {};
  for (const field of (publicOnly ? PUBLIC_FIELDS : ADMIN_FIELDS)) {
    if (!Object.hasOwn(review, field)) continue;
    const value = review[field];
    output[field] = value instanceof Date ? value.toISOString() : value;
  }
  if (output._id !== undefined) output._id = String(output._id);
  return output;
}
