import test from "node:test";
import assert from "node:assert/strict";
import { createLegacyImportHandler } from "../../api/_lib/import-legacy-content.js";

function response() {
  return { code: 200, headers: {}, body: null, status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; }, setHeader(name, value) { this.headers[name] = value; } };
}
const req = (overrides = {}) => ({ method: "POST", body: { confirm: true }, headers: {}, ...overrides });
const admin = () => ({ id: "admin" });

test("legacy import rejects unauthenticated requests before migration", async () => {
  let called = false;
  const handler = createLegacyImportHandler({ requireAdminFn: () => null, sameOriginFn: () => true, migrateFn: () => { called = true; } });
  const res = response();
  await handler(req(), res);
  assert.equal(called, false);
});

test("legacy import rejects cross-origin requests before migration", async () => {
  let called = false;
  const handler = createLegacyImportHandler({ requireAdminFn: admin, sameOriginFn: () => false, migrateFn: () => { called = true; } });
  const res = response();
  await handler(req(), res);
  assert.equal(res.code, 403);
  assert.equal(called, false);
});

test("legacy import uses the live CMS database configuration", async () => {
  let called = false;
  const handler = createLegacyImportHandler({ requireAdminFn: admin, sameOriginFn: () => true, migrateFn: () => { called = true; }, env: {} });
  const res = response();
  await handler(req(), res);
  assert.equal(res.code, 503);
  assert.equal(called, false);
});

test("legacy import uses the configured live database name", async () => {
  let called = false;
  const handler = createLegacyImportHandler({
    requireAdminFn: admin, sameOriginFn: () => true, migrateFn: async () => { called = true; return { counts: { services: 15, offers: 5, packages: 23, faqs: 13 }, results: {} }; },
    env: { MONGODB_URI: "mongodb://live", MONGODB_DB_NAME: "layalialzahra" },
  });
  const res = response();
  await handler(req(), res);
  assert.equal(res.code, 200);
  assert.equal(called, true);
});

test("legacy import requires explicit confirmation", async () => {
  let called = false;
  const handler = createLegacyImportHandler({ requireAdminFn: admin, sameOriginFn: () => true, migrateFn: () => { called = true; }, env: {} });
  const res = response();
  await handler(req({ body: {} }), res);
  assert.equal(res.code, 400);
  assert.equal(called, false);
});

test("legacy import reports inserted record counts", async () => {
  const calls = [];
  const handler = createLegacyImportHandler({
    requireAdminFn: admin, sameOriginFn: () => true,
    migrateFn: async (args) => { calls.push(args); return { counts: { services: 15, offers: 5, packages: 23, faqs: 13 }, results: { services: { inserted: 15 } } }; },
    env: { MONGODB_URI: "mongodb://live", MONGODB_DB_NAME: "layalialzahra" },
  });
  const res = response();
  await handler(req(), res);
  assert.equal(res.code, 200);
  assert.deepEqual(calls, [{ apply: true, uri: "mongodb://live", dbName: "layalialzahra" }]);
  assert.equal(res.body.expectedCounts.faqs, 13);
  assert.match(res.body.message, /Existing CMS edits were preserved/);
});
