import test from "node:test";
import assert from "node:assert/strict";
import { createManagedContentHandler } from "../../api/_lib/managed-content-routes.js";

function response() {
  return { code: 200, headers: {}, body: null, status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; }, setHeader(name, value) { this.headers[name] = value; } };
}

test("admin writes stop when there is no authenticated session", async () => {
  const handler = createManagedContentHandler("service", { admin: true, requireAdmin: (_req, res) => { res.status(401).json({ success: false }); return null; }, sameOrigin: () => true, getDb: () => { throw new Error("database must not be reached"); } });
  const res = response();
  await handler({ method: "POST", headers: {}, body: { title: "Hair" }, query: {} }, res);
  assert.equal(res.code, 401);
});

test("cross-origin admin writes are rejected before database access", async () => {
  let databaseReached = false;
  const handler = createManagedContentHandler("service", { admin: true, requireAdmin: () => ({ username: "admin" }), sameOrigin: () => false, getDb: () => { databaseReached = true; return {}; } });
  const res = response();
  await handler({ method: "POST", headers: { origin: "https://evil.example" }, body: { title: "Hair" }, query: {} }, res);
  assert.equal(res.code, 403);
  assert.equal(databaseReached, false);
});

test("unsupported admin methods return 405 with allowed methods", async () => {
  const handler = createManagedContentHandler("service", { admin: true, requireAdmin: () => ({ username: "admin" }), sameOrigin: () => true });
  const res = response();
  await handler({ method: "PATCH", headers: {}, query: {} }, res);
  assert.equal(res.code, 405);
  assert.match(res.headers.Allow, /GET/);
});
