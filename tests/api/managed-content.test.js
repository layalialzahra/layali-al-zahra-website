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


test("rejects null and blank service sort orders instead of silently converting them to zero", () => {
  assert.throws(
    () => validateServiceInput({ title: "Hair Cuts", sortOrder: null }),
    /sort order/i,
  );
  assert.throws(
    () => validateServiceInput({ title: "Hair Cuts", sortOrder: "" }),
    /sort order/i,
  );
});

test("accepts finite numeric service ordering values", () => {
  assert.equal(validateServiceInput({ title: "Hair Cuts", sortOrder: 2.5 }).sortOrder, 2.5);
  assert.throws(
    () => validateServiceInput({ title: "Hair Cuts", sortOrder: Number.POSITIVE_INFINITY }),
    /sort order/i,
  );
});
