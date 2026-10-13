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


const GOOGLE_REVIEW_PARENT_PATTERN = /^accounts\/[A-Za-z0-9_-]+\/locations\/[A-Za-z0-9_-]+$/;

export function isGoogleReviewsSyncConfigured(env = process.env) {
  return Boolean(
    env.GOOGLE_BUSINESS_PROFILE_CLIENT_ID &&
    env.GOOGLE_BUSINESS_PROFILE_CLIENT_SECRET &&
    env.GOOGLE_BUSINESS_PROFILE_REFRESH_TOKEN &&
    typeof env.GOOGLE_BUSINESS_PROFILE_PARENT === "string" &&
    GOOGLE_REVIEW_PARENT_PATTERN.test(env.GOOGLE_BUSINESS_PROFILE_PARENT)
  );
}

function requiredGoogleConfig(env) {
  if (!isGoogleReviewsSyncConfigured(env)) throw new Error("Google Business Profile sync is not configured");
  return {
    clientId: env.GOOGLE_BUSINESS_PROFILE_CLIENT_ID,
    clientSecret: env.GOOGLE_BUSINESS_PROFILE_CLIENT_SECRET,
    refreshToken: env.GOOGLE_BUSINESS_PROFILE_REFRESH_TOKEN,
    parent: env.GOOGLE_BUSINESS_PROFILE_PARENT,
  };
}

function apiReviewId(review) {
  if (typeof review?.reviewId === "string" && review.reviewId.trim()) return review.reviewId.trim();
  if (typeof review?.name === "string") {
    const match = review.name.match(/\/reviews\/([^/]+)$/);
    if (match) return decodeURIComponent(match[1]);
  }
  return "";
}

/** Fetch and validate every page before callers mutate local data. Never logs credentials or provider response bodies. */
export async function fetchAllGoogleReviews({ env = process.env, fetchImpl = globalThis.fetch } = {}) {
  const config = requiredGoogleConfig(env);
  if (typeof fetchImpl !== "function") throw new Error("Fetch is unavailable");
  const tokenResponse = await fetchImpl("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      refresh_token: config.refreshToken,
      grant_type: "refresh_token",
    }),
    signal: AbortSignal.timeout(10000),
  });
  if (!tokenResponse.ok) throw new Error("Google authorization failed");
  const tokenData = await tokenResponse.json();
  if (typeof tokenData?.access_token !== "string" || !tokenData.access_token) {
    throw new Error("Google authorization returned no access token");
  }

  const normalized = [];
  const seenIds = new Set();
  const seenPageTokens = new Set();
  let pageToken = "";
  let expectedTotal = null;
  for (let page = 0; page < 200; page += 1) {
    const params = new URLSearchParams({ pageSize: "50", orderBy: "updateTime desc" });
    if (pageToken) params.set("pageToken", pageToken);
    const response = await fetchImpl(
      `https://mybusiness.googleapis.com/v4/${config.parent}/reviews?${params.toString()}`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
        signal: AbortSignal.timeout(10000),
      }
    );
    if (!response.ok) throw new Error("Google review retrieval failed");
    const payload = await response.json();
    if (!payload || !Array.isArray(payload.reviews)) throw new Error("Google returned an invalid review page");
    if (payload.totalReviewCount !== undefined) {
      if (!Number.isInteger(payload.totalReviewCount) || payload.totalReviewCount < 0) {
        throw new Error("Google returned an invalid review count");
      }
      if (expectedTotal === null) expectedTotal = payload.totalReviewCount;
      else if (expectedTotal !== payload.totalReviewCount) throw new Error("Google review count changed during pagination");
    }
    for (const item of payload.reviews) {
      const review = normalizeGoogleReview({ ...item, reviewId: apiReviewId(item) });
      if (seenIds.has(review.googleReviewId)) throw new Error("Google returned a duplicate review");
      seenIds.add(review.googleReviewId);
      normalized.push(review);
    }
    const next = payload.nextPageToken;
    if (!next) {
      if (expectedTotal !== null && normalized.length !== expectedTotal) {
        throw new Error("Google review pagination was incomplete");
      }
      return { reviews: normalized, totalReviewCount: expectedTotal ?? normalized.length };
    }
    if (typeof next !== "string" || seenPageTokens.has(next)) throw new Error("Google returned an invalid page token");
    seenPageTokens.add(next);
    pageToken = next;
  }
  throw new Error("Google review pagination exceeded the safety limit");
}
