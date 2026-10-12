import assert from "node:assert/strict";
import { createHomepageRenderHandler } from "../api/_lib/homepage-renderer.js";

const response = {
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

const handler = createHomepageRenderHandler({
  // Exercise the built React SSR bundle without requiring a database or credentials.
  getPublishedReviews: async () => { throw new Error("simulated database failure"); },
  logger: { error() {} },
});

await handler({ method: "GET" }, response);

assert.equal(response.code, 200, "the built homepage handler should return HTTP 200");
assert.equal(response.headers["Content-Type"], "text/html; charset=utf-8");
assert.match(response.body, /data-ssr="true"/, "the response should activate client hydration");
assert.doesNotMatch(response.body, /opacity:0/, "SSR carousel content must not start visually hidden");
assert.match(response.body, /<title>/, "the HTML template should retain the page title");
assert.match(response.body, /<\/title>/, "the HTML template should close the page title");
assert.match(response.body, /rel="canonical"/, "the HTML template should retain canonical metadata");
assert.match(response.body, /Where Beauty Meets Luxury/, "the homepage should render into the initial HTML");
assert.match(response.body, /Shauna Haberlin/, "the reviewed static snapshot should remain the fallback");
assert.doesNotMatch(response.body, /data-initial-reviews=/, "fallback HTML should not claim a database review set");

console.log("Homepage SSR smoke test passed against the built HTML template and server bundle.");
