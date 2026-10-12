import test from "node:test";
import assert from "node:assert/strict";

process.env.MONGODB_URI ||= "mongodb://127.0.0.1:27017/layali-test";
const { sameOrigin, getSession } = await import("../../api/_lib/auth.js");

test("rejects state-changing requests without an Origin header", () => {
  assert.equal(sameOrigin({ method: "POST", headers: { host: "example.com" } }), false);
  assert.equal(sameOrigin({ method: "PUT", headers: { host: "example.com" } }), false);
  assert.equal(sameOrigin({ method: "DELETE", headers: { host: "example.com" } }), false);
});

test("allows safe methods without Origin and accepts only the matching origin for writes", () => {
  assert.equal(sameOrigin({ method: "GET", headers: { host: "example.com" } }), true);
  assert.equal(sameOrigin({ method: "POST", headers: { host: "example.com", origin: "https://example.com", "x-forwarded-proto": "https" } }), true);
  assert.equal(sameOrigin({ method: "POST", headers: { host: "example.com", origin: "https://attacker.example", "x-forwarded-proto": "https" } }), false);
});

test("malformed cookie encoding does not throw during session lookup", () => {
  assert.equal(getSession({ headers: { cookie: "layali_admin_session=%E0%A4%A" } }), null);
});
