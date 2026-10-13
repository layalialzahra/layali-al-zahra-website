import assert from "node:assert/strict";
import { createHomepageRenderHandler } from "../api/_lib/homepage-renderer.js";

function makeResponse() {
  return {
    code: 200,
    headers: {},
    body: "",
    status(code) {
      this.code = code;
      return this;
    },
    setHeader(name, value) {
      this.headers[name] = value;
    },
    send(body) {
      this.body = body;
      return this;
    },
  };
}

async function request(handler, pathname) {
  const res = makeResponse();
  await handler({ method: "GET", url: pathname }, res);
  return res;
}

const fallbackHandler = createHomepageRenderHandler({
  // Exercise the built React SSR bundle without requiring a database or credentials.
  getPublishedReviews: async () => { throw new Error("simulated database failure"); },
  logger: { error() {} },
});

for (const pathname of ["/", "/home"]) {
  const response = await request(fallbackHandler, pathname);
  assert.equal(response.code, 200, `${pathname} should return HTTP 200 on successful SSR`);
  assert.equal(response.headers["Content-Type"], "text/html; charset=utf-8");
  assert.match(response.body, /data-ssr="true"/, "the response should activate client hydration");
  assert.doesNotMatch(response.body, /opacity:0/, "SSR carousel content must not start visually hidden");
  assert.match(response.body, /<title>Layali Al Zahra Beauty Lounge \| Luxury Ladies Salon in Dubai<\/title>/);
  assert.equal((response.body.match(/rel="canonical"/g) || []).length, 1, "exactly one canonical link should remain");
  assert.match(response.body, /href="https:\/\/www\.layalialzahra\.com\/"[^>]*rel="canonical"|rel="canonical"[^>]*href="https:\/\/www\.layalialzahra\.com\/" /);
  assert.match(response.body, /Where Beauty Meets Luxury/, "the homepage should render into initial HTML");
  assert.doesNotMatch(response.body, /Shauna Haberlin/, "a failed managed-review lookup must not restore the legacy hardcoded review snapshot");
  assert.match(response.body, /data-initial-reviews="\\[\\]"/, "failed review lookup should hydrate with an empty published-review set");
}

const managedHandler = createHomepageRenderHandler({
  getPublishedReviews: async () => [
    { googleReviewId: "first", title: "First Published Reviewer", initials: "FP", description: "First approved review", rating: 5, isPublished: true },
    { googleReviewId: "hidden", title: "Suppressed Reviewer", initials: "SR", description: "Must never be rendered", rating: 5, isPublished: true },
    { googleReviewId: "private", title: "Unpublished Reviewer", initials: "UR", description: "Private review text", rating: 5, isPublished: false },
    { googleReviewId: "second", title: "Second Published Reviewer", initials: "SP", description: "Second approved review", rating: 4, isPublished: true },
    { googleReviewId: "third", title: "Third Published Reviewer", initials: "TP", description: "Third approved review", rating: 3, isPublished: true },
  ],
  getSuppressedReviewIds: async () => ["hidden"],
  logger: { error() {} },
});

for (const pathname of ["/", "/home"]) {
  const response = await request(managedHandler, pathname);
  assert.equal(response.code, 200);
  assert.match(response.body, /data-initial-reviews=/);
  assert.match(response.body, /First Published Reviewer/);
  assert.match(response.body, /Second Published Reviewer/);
  assert.match(response.body, /Third Published Reviewer/);
  assert.doesNotMatch(response.body, /Suppressed Reviewer|Must never be rendered/);
  assert.doesNotMatch(response.body, /Unpublished Reviewer|Private review text/);
  assert.ok(response.body.indexOf("First Published Reviewer") < response.body.indexOf("Second Published Reviewer"));
  assert.ok(response.body.indexOf("Second Published Reviewer") < response.body.indexOf("Third Published Reviewer"));
  assert.equal((response.body.match(/rel="canonical"/g) || []).length, 1);
}

console.log("Homepage SSR smoke passed for / and /home: initial HTML, hydration marker, canonical metadata, fail-closed review lookup, publication/order and suppression.");
