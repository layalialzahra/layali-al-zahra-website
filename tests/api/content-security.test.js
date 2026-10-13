import test from "node:test";
import assert from "node:assert/strict";

process.env.MONGODB_URI ||= "mongodb://127.0.0.1:27017/layali-test";
const { sanitizeBody, serializeContent } = await import("../../api/_lib/content.js");

test("rich content sanitizer removes executable markup and unsafe URL schemes", () => {
  const result = sanitizeBody('<p>Safe <strong>text</strong></p><script>alert(1)</script><img src="x" onerror="alert(2)"><svg onload="alert(3)"><a xlink:href="javascript:alert(4)">bad</a></svg><a href="javascript:alert(5)">unsafe</a>');
  assert.match(result, /<p>Safe <strong>text<\/strong><\/p>/);
  assert.doesNotMatch(result, /<script|onerror|onload|javascript:|xlink:href/i);
});

test("public content serialization uses an allowlist and sanitizes legacy stored HTML", () => {
  const doc = {
    _id: "content-id", type: "blog", title: "Example", slug: "example", status: "draft",
    body: '<p>Visible</p><img src=x onerror=alert(1)>', passwordHash: "never-expose",
    secret: "never-expose", createdAt: new Date("2026-01-01T00:00:00Z"),
  };
  const publicItem = serializeContent(doc, { publicOnly: true });
  assert.equal(publicItem._id, "content-id");
  assert.equal(publicItem.body.includes("onerror"), false);
  assert.equal("status" in publicItem, false);
  assert.equal("passwordHash" in publicItem, false);
  assert.equal("secret" in publicItem, false);
  assert.equal("createdAt" in publicItem, false);
  const adminItem = serializeContent(doc);
  assert.equal(adminItem.status, "draft");
  assert.equal(adminItem.passwordHash, undefined);
});
