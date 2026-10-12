import test from "node:test";
import assert from "node:assert/strict";
import { createApiRouterHandler } from "../../api/[...path].js";

function response() {
  return {
    code: 200, headers: {}, body: null,
    status(code) { this.code = code; return this; },
    json(body) { this.body = body; return this; },
    setHeader(name, value) { this.headers[name] = value; },
  };
}

function setup() {
  const calls = [];
  const managed = (type, options = {}) => async (_req, res) => {
    calls.push({ kind: "managed", type, admin: options.admin === true });
    return res.status(200).json({ route: type, admin: options.admin === true });
  };
  const reviewsAdmin = () => async (_req, res) => {
    calls.push({ kind: "reviews-admin" });
    return res.status(200).json({ route: "reviews-admin" });
  };
  const reviewsPublic = () => async (_req, res) => {
    calls.push({ kind: "reviews-public" });
    return res.status(200).json({ route: "reviews-public" });
  };
  const health = async (_req, res) => {
    calls.push({ kind: "health" });
    return res.status(200).json({ route: "health" });
  };
  return { calls, handler: createApiRouterHandler({
    createManagedContentHandler: managed,
    createGoogleReviewsAdminHandler: reviewsAdmin,
    createGoogleReviewsPublicHandler: reviewsPublic,
    healthHandler: health,
  }) };
}

test("dispatches each managed content route to the correct public/admin handler", async () => {
  for (const [path, type, admin] of [
    [["services"], "service", false],
    [["offers"], "offer", false],
    [["packages"], "package", false],
    [["faqs"], "faq", false],
    [["admin", "services"], "service", true],
    [["admin", "offers"], "offer", true],
    [["admin", "packages"], "package", true],
    [["admin", "faqs"], "faq", true],
  ]) {
    const { handler, calls } = setup();
    const res = response();
    await handler({ method: "GET", query: { path }, headers: {} }, res);
    assert.equal(res.code, 200, path.join("/"));
    assert.deepEqual(calls, [{ kind: "managed", type, admin }]);
  }
});

test("dispatches review endpoints and legacy database test path", async () => {
  for (const [path, expected] of [
    [["admin", "google-reviews"], "reviews-admin"],
    [["published-google-reviews"], "reviews-public"],
    [["test"], "health"],
  ]) {
    const { handler, calls } = setup();
    const res = response();
    await handler({ method: "GET", query: { path }, headers: {} }, res);
    assert.equal(res.code, 200);
    assert.deepEqual(calls, [{ kind: expected }]);
  }
});

test("unknown API routes return 404 without invoking a handler", async () => {
  const { handler, calls } = setup();
  const res = response();
  await handler({ method: "GET", query: { path: ["not-real"] }, headers: {} }, res);
  assert.equal(res.code, 404);
  assert.equal(res.body.success, false);
  assert.deepEqual(calls, []);
});
