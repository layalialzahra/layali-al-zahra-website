import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { CONTENT_TYPES, sanitizeBody, serializeContent, validateContentInput } from "../../api/_lib/content.js";

const source = async (path) => readFile(new URL(path, import.meta.url), "utf8");

test("legacy editorial types remain exactly Blog, Beauty Tips and News", () => {
  assert.deepEqual([...CONTENT_TYPES].sort(), ["blog", "news", "tip"]);
  for (const type of ["blog", "tip", "news"]) assert.equal(validateContentInput({ type, title: "Regression item" }).type, type);
  for (const type of ["service", "offer", "package", "faq", "review"]) assert.throws(() => validateContentInput({ type, title: "Not editorial content" }), /Invalid content type/);
});

test("partial edits preserve omitted content fields and only validate submitted values", () => {
  const patch = validateContentInput({ title: "Updated headline", excerpt: "Updated excerpt" }, true);
  assert.deepEqual(patch, { title: "Updated headline", excerpt: "Updated excerpt" });
  for (const field of ["body", "featuredImage", "status", "publishDate"]) assert.equal(Object.hasOwn(patch, field), false);
});

test("scheduling values are validated and retain an explicit publish date", () => {
  const publishDate = "2027-01-15T12:30:00.000Z";
  const scheduled = validateContentInput({ type: "blog", title: "Scheduled item", status: "scheduled", publishDate });
  assert.equal(scheduled.status, "scheduled");
  assert.equal(scheduled.publishDate.toISOString(), publishDate);
  assert.throws(() => validateContentInput({ type: "blog", title: "Bad status", status: "queued" }), /Invalid content status/);
  assert.throws(() => validateContentInput({ type: "blog", title: "Bad date", publishDate: "not-a-date" }), /Invalid publish date/);
});

test("editorial body sanitization removes script payloads and unsafe link schemes", () => {
  const cleaned = sanitizeBody('<p>Safe text</p><script>alert("x")</script><a href="javascript:alert(1)">unsafe</a>');
  assert.match(cleaned, /Safe text/);
  assert.doesNotMatch(cleaned, /<script|javascript:/i);
});

test("public serialization keeps article fields but excludes workflow and admin metadata", () => {
  const item = serializeContent({
    _id: "abc123", type: "blog", title: "Public article", slug: "public-article", body: "<p>Article body</p>",
    status: "draft", createdAt: new Date("2026-10-01T00:00:00Z"), updatedAt: new Date("2026-10-02T00:00:00Z"),
    internalNotes: "private", adminToken: "private",
  }, { publicOnly: true });
  assert.equal(item.title, "Public article");
  assert.equal(item.body, "<p>Article body</p>");
  for (const field of ["status", "createdAt", "updatedAt", "internalNotes", "adminToken"]) assert.equal(Object.hasOwn(item, field), false);
});

test("legacy admin/public routes retain publication gates and stable public URLs", async () => {
  const [adminApi, publicApi, app, listing, tips, detail, adminEditor] = await Promise.all([
    source("../../api/admin/content.js"), source("../../api/content.js"), source("../../src/App.tsx"),
    source("../../src/components/ContentListingPage.tsx"), source("../../src/components/TipsPage.tsx"),
    source("../../src/components/ContentDetailPage.tsx"), source("../../src/components/AdminContentManager.tsx"),
  ]);
  assert.ok(adminApi.includes('data.status === "scheduled" && (!data.publishDate || data.publishDate <= now)'));
  assert.ok(adminApi.includes('if (data.status === "draft") data.publishDate = null'));
  assert.ok(adminApi.includes("findOneAndUpdate({ _id: id }, { $set: data }"));
  assert.ok(publicApi.includes('status: "published"'));
  assert.ok(publicApi.includes('status: "scheduled", publishDate: { $lte: now }'));
  assert.ok(publicApi.includes('serializeContent(item, { publicOnly: true })'));
  for (const route of ["/beauty-tips", "/blog", "/news"]) assert.ok(app.includes("path === '" + route + "'"));
  for (const route of ["/beauty-tips/", "/blog/", "/news/"]) assert.ok(app.includes("path.startsWith('" + route + "')"));
  assert.ok(listing.includes("item.slug"));
  assert.ok(tips.includes("/api/content?type=tip"));
  assert.ok(tips.includes("/beauty-tips/"));
  assert.ok(detail.includes("/api/content?type=") && detail.includes("&slug="));
  assert.ok(detail.includes("'beauty-tips'"));
  assert.ok(adminEditor.includes("/api/admin/upload"));
  assert.ok(adminEditor.includes("status:'scheduled'"));
});

test("image upload regression suite remains part of the repository test command", async () => {
  const [packageJson, uploadTests] = await Promise.all([source("../../package.json"), source("./image-upload.test.js")]);
  assert.ok(packageJson.includes('"test": "node --test tests && vitest run"'));
  assert.ok(uploadTests.includes("accepts supported image signatures"));
  assert.ok(uploadTests.includes("enforces the 4 MiB limit"));
  assert.ok(uploadTests.includes("storage failures and stream failures"));
});
