import test from "node:test";
import assert from "node:assert/strict";
import { createHomepageRenderHandler } from "../../api/_lib/homepage-renderer.js";

function response() {
  return {
    code: 200, headers: {}, body: null,
    status(code) { this.code = code; return this; },
    setHeader(name, value) { this.headers[name] = value; },
    send(body) { this.body = body; return this; },
  };
}

test("SSR homepage inserts published review markup and safely encodes hydration data", async () => {
  const res = response();
  const handler = createHomepageRenderHandler({
    readTemplate: async () => '<!doctype html><html><body><div id="root"></div></body></html>',
    getPublishedReviews: async () => [
      { title: "Published reviewer", initials: "PR", description: '<script>alert("x")</script>', rating: 5, isPublished: true },
      { title: "Private reviewer", initials: "XR", description: "must be filtered", isPublished: false },
    ],
    getSuppressedReviewIds: async () => [],
    renderPage: async (pathname, reviews) => {
      assert.equal(pathname, "/");
      assert.deepEqual(reviews.map((review) => review.title), ["Published reviewer"]);
      return "<main><p>Published review rendered</p></main>";
    },
    logger: { error() {} },
  });

  await handler({ method: "GET" }, res);
  assert.equal(res.code, 200);
  assert.equal(res.headers["Content-Type"], "text/html; charset=utf-8");
  assert.equal(res.headers["Cache-Control"], "no-store");
  assert.match(res.body, /data-ssr="true"/);
  assert.match(res.body, /Published review rendered/);
  assert.doesNotMatch(res.body, /<script>alert/);
  assert.doesNotMatch(res.body, /Private reviewer/);
});

test("SSR falls back to the static app shell if review lookup or rendering fails", async () => {
  const template = '<!doctype html><html><body><div id="root"></div></body></html>';
  const res = response();
  const handler = createHomepageRenderHandler({
    readTemplate: async () => template,
    getPublishedReviews: async () => { throw new Error("database unavailable"); },
    renderPage: async () => { throw new Error("SSR bundle unavailable"); },
    logger: { error() {} },
  });

  await handler({ method: "GET" }, res);
  assert.equal(res.code, 200);
  assert.equal(res.body, template);
  assert.equal(res.headers["Cache-Control"], "no-store");
});

test("SSR homepage rejects state-changing methods", async () => {
  const res = response();
  const handler = createHomepageRenderHandler({ readTemplate: async () => "" });
  await handler({ method: "POST" }, res);
  assert.equal(res.code, 405);
  assert.equal(res.headers.Allow, "GET, HEAD");
});


test("suppressed local reviews are excluded from server-rendered homepage content", async () => {
  const res = response();
  let renderedReviews = [];
  const handler = createHomepageRenderHandler({
    readTemplate: async () => '<!doctype html><html><body><div id="root"></div></body></html>',
    getPublishedReviews: async () => [
      { googleReviewId: "suppressed", title: "Suppressed reviewer", initials: "SR", description: "deleted review", rating: 5, isPublished: true },
      { googleReviewId: "visible", title: "Visible reviewer", initials: "VR", description: "approved review", rating: 5, isPublished: true },
    ],
    getSuppressedReviewIds: async () => ["suppressed"],
    renderPage: async (_pathname, reviews) => {
      renderedReviews = reviews;
      return "<main>Homepage</main>";
    },
    logger: { error() {} },
  });

  await handler({ method: "GET" }, res);
  assert.equal(res.code, 200);
  assert.deepEqual(renderedReviews.map((review) => review.title), ["Visible reviewer"]);
});
