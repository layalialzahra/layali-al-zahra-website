import test from "node:test";
import assert from "node:assert/strict";
import { createApiRouterHandler } from "../../api/[...path].js";

function response() {
  return {
    code: 200, headers: {}, body: null,
    status(code) { this.code = code; return this; },
    json(body) { this.body = body; return this; },
    setHeader(name, value) { this.headers[name] = value; },
    send(body) { this.body = body; return this; },
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
  const reviewsSync = () => async (_req, res) => {
    calls.push({ kind: "reviews-sync" });
    return res.status(200).json({ route: "reviews-sync" });
  };
  const health = async (_req, res) => {
    calls.push({ kind: "health" });
    return res.status(200).json({ route: "health" });
  };
  return { calls, handler: createApiRouterHandler({
    createManagedContentHandler: managed,
    createGoogleReviewsAdminHandler: reviewsAdmin,
    createGoogleReviewsPublicHandler: reviewsPublic,
    createGoogleReviewsSyncHandler: reviewsSync,
    createHomepageRenderHandler: () => async (_req, res) => { calls.push({ kind: "homepage" }); return res.status(200).send("SSR home"); },
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

test("dispatches review endpoints", async () => {
  for (const [path, expected] of [
    [["admin", "google-reviews"], "reviews-admin"],
    [["admin", "google-reviews-sync"], "reviews-sync"],
    [["published-google-reviews"], "reviews-public"],
  ]) {
    const { handler, calls } = setup();
    const res = response();
    await handler({ method: "GET", query: { path }, headers: {} }, res);
    assert.equal(res.code, 200);
    assert.deepEqual(calls, [{ kind: expected }]);
  }
});

test("unknown and legacy diagnostic routes return 404 without invoking a handler", async () => {
  for (const path of [["not-real"], ["test"]]) {
    const { handler, calls } = setup();
    const res = response();
    await handler({ method: "GET", query: { path }, headers: {} }, res);
    assert.equal(res.code, 404);
    assert.equal(res.body.success, false);
    assert.deepEqual(calls, []);
  }
});


test("dispatches the SSR homepage through the existing catch-all function", async () => {
  const { handler, calls } = setup();
  const res = response();
  await handler({ method: "GET", query: { path: ["render-home"] }, headers: {} }, res);
  assert.equal(res.code, 200);
  assert.equal(res.body, "SSR home");
  assert.deepEqual(calls, [{ kind: "homepage" }]);
});


test("dispatches the homepage route to a server-rendered HTML handler", async () => {
  const calls = [];
  const homepage = () => async (req, res) => {
    calls.push(req.url);
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.status(200).send('<!doctype html><div id="root" data-ssr="true">Rendered homepage</div>');
  };
  const handler = createApiRouterHandler({
    createManagedContentHandler: () => async (_req, res) => res.status(200).json({}),
    createGoogleReviewsAdminHandler: () => async (_req, res) => res.status(200).json({}),
    createGoogleReviewsPublicHandler: () => async (_req, res) => res.status(200).json({}),
    createGoogleReviewsSyncHandler: () => async (_req, res) => res.status(200).json({}),
    createHomepageRenderHandler: homepage,
  });
  const res = response();
  res.send = function (body) { this.body = body; return this; };

  await handler({ method: "GET", query: { path: ["render-home"] }, url: "/api/homepage", headers: {} }, res);

  assert.equal(res.code, 200);
  assert.match(res.headers["Content-Type"], /text\/html/);
  assert.match(res.body, /data-ssr="true"/);
  assert.deepEqual(calls, ["/api/homepage"]);
});
