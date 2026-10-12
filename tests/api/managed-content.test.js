import test from "node:test";
import assert from "node:assert/strict";
import { normalizeManagedSlug, validateServiceInput } from "../../api/_lib/managed-content.js";

test("normalizes managed slugs consistently", () => {
  assert.equal(normalizeManagedSlug("  Hair & Beauty / Spa  "), "hair-beauty-spa");
});

test("preserves service display prices", () => {
  const item = validateServiceInput({ title: "Hair Cuts", subservices: [{ name: "Blunt Bob Hair Cut", price: "AED 99.75" }] });
  assert.equal(item.slug, "hair-cuts");
  assert.equal(item.subservices[0].price, "AED 99.75");
});
