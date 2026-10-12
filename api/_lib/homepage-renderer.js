import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const ROOT_MARKER = '<div id="root"></div>';

export function escapeAttribute(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/'/g, "&#39;");
}

function initialsFor(name) {
  const parts = String(name || "").trim().split(/\s+/).filter(Boolean).slice(0, 2);
  return parts.map((part) => Array.from(part)[0] || "").join("").toUpperCase() || "G";
}

async function loadPublishedHomeReviews() {
  const [{ getDb }, { serializeGoogleReview }] = await Promise.all([
    import("./mongodb.js"),
    import("./google-reviews.js"),
  ]);
  const db = await getDb();
  const suppressionRows = await db.collection("google_review_suppressions")
    .find({}, { projection: { googleReviewId: 1, _id: 0 } })
    .toArray();
  const suppressedIds = suppressionRows
    .map((row) => row.googleReviewId)
    .filter((id) => typeof id === "string" && id);
  const records = await db.collection("google_reviews")
    .find({ isPublished: true, googleReviewId: { $nin: suppressedIds } })
    .sort({ sortOrder: 1, sourceCreatedAt: -1, _id: 1 })
    .limit(12)
    .toArray();

  return records.map((record) => {
    const review = serializeGoogleReview(record, { publicOnly: true }) || {};
    const title = typeof review.authorName === "string" && review.authorName.trim()
      ? review.authorName.trim()
      : "Google customer";
    return {
      googleReviewId: typeof record.googleReviewId === "string" ? record.googleReviewId : "",
      title,
      initials: initialsFor(title),
      description: typeof review.reviewText === "string" ? review.reviewText : "",
      rating: Number.isInteger(review.rating) ? review.rating : null,
      isPublished: true,
    };
  });
}

export function createHomepageRenderHandler(options = {}) {
  const readTemplate = options.readTemplate || (() => readFile(resolve(process.cwd(), "dist/index.html"), "utf8"));
  const getPublishedReviews = options.getPublishedReviews || (async () => {
    if (process.env.MANAGED_HOME_REVIEWS_ENABLED !== "true") return undefined;
    return loadPublishedHomeReviews();
  });
  const getSuppressedReviewIds = options.getSuppressedReviewIds || (async () => []);
  const renderPage = options.renderPage || (async (pathname, reviews) => {
    const bundleUrl = pathToFileURL(resolve(process.cwd(), "server-dist/entry-server.js")).href;
    const serverEntry = await import(bundleUrl);
    return serverEntry.render(pathname, reviews);
  });
  const logger = options.logger || console;

  return async function homepageRenderHandler(req, res) {
    if (req.method !== "GET" && req.method !== "HEAD") {
      res.setHeader("Allow", "GET, HEAD");
      return res.status(405).send("Method not allowed");
    }

    let template;
    try {
      template = await readTemplate();
    } catch {
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.setHeader("Cache-Control", "no-store");
      return res.status(500).send("Homepage unavailable");
    }

    if (typeof template !== "string" || !template.includes(ROOT_MARKER)) {
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.setHeader("Cache-Control", "no-store");
      return res.status(500).send("Homepage template invalid");
    }

    let reviews;
    try {
      const loaded = await getPublishedReviews();
      if (Array.isArray(loaded)) {
        const suppressedIds = new Set(await getSuppressedReviewIds());
        reviews = loaded
          .filter((review) => review && review.isPublished === true && !suppressedIds.has(review.googleReviewId))
          .map(({ googleReviewId, ...review }) => review);
      }
    } catch (error) {
      logger.error?.("Homepage published-review lookup failed", error?.name || "Error");
      reviews = undefined;
    }

    try {
      const markup = await renderPage("/", reviews);
      const initialReviewsAttribute = Array.isArray(reviews)
        ? ` data-initial-reviews="${escapeAttribute(JSON.stringify(reviews))}"`
        : "";
      const root = `<div id="root" data-ssr="true"${initialReviewsAttribute}>${markup}</div>`;
      const html = template.replace(ROOT_MARKER, root);
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.setHeader("Cache-Control", "no-store");
      return res.status(200).send(req.method === "HEAD" ? "" : html);
    } catch (error) {
      logger.error?.("Homepage server rendering failed", error?.name || "Error");
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.setHeader("Cache-Control", "no-store");
      return res.status(200).send(req.method === "HEAD" ? "" : template);
    }
  };
}
