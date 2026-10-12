import test from "node:test";
import assert from "node:assert/strict";
import { validateServiceInput, validateOfferInput, serializeManagedItem } from "../../api/_lib/managed-content.js";

test("partial service updates do not add defaults or erase omitted fields", () => {
  assert.deepEqual(validateServiceInput({ description: "Updated" }, true), { description: "Updated" });
});

test("rejects unsafe image URLs and non-finite sort order", () => {
  assert.throws(() => validateServiceInput({ title: "Hair", imageUrl: "javascript:alert(1)" }), /HTTPS|invalid/i);
  assert.throws(() => validateServiceInput({ title: "Hair", sortOrder: "not-a-number" }), /finite number/i);
});

test("descriptive offer labels are not treated as expiry dates", () => {
  const item = validateOfferInput({ title: "Midday Massage", priceLabel: "AED 178.50", validityType: "label", validityLabel: "Midday Special" });
  assert.equal(item.validityLabel, "Midday Special");
  assert.equal(item.validUntil, undefined);
});

test("date ranges reject an end date before the start date", () => {
  assert.throws(() => validateOfferInput({ title: "Offer", priceLabel: "AED 99", validityType: "date-range", validFrom: "2026-12-31", validUntil: "2026-12-01" }), /must not be after/i);
});

test("public serializer omits publication and admin metadata", () => {
  const item = serializeManagedItem("service", { _id: "abc", title: "Hair", status: "published", seoTitle: "Private SEO", createdAt: new Date() }, { publicOnly: true });
  assert.equal(item.title, "Hair");
  assert.equal("status" in item, false);
  assert.equal("seoTitle" in item, false);
  assert.equal("createdAt" in item, false);
});
