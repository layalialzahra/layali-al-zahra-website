import test from "node:test";
import assert from "node:assert/strict";
import { validateOfferInput, validatePackageInput, validateFaqInput, serializeManagedItem } from "../../api/_lib/managed-content.js";

test("recurring offer labels remain text, not dates", () => {
  const item = validateOfferInput({ title: "Monday Mani + Pedi", validityType: "recurring", validityLabel: "Every Monday", priceLabel: "AED 105" });
  assert.equal(item.validityLabel, "Every Monday");
  assert.equal(item.validFrom, null);
  assert.equal(item.validUntil, null);
});

test("package price labels stay as strings", () => {
  assert.equal(validatePackageInput({ title: "Signature", priceLabel: "From" }).priceLabel, "From");
});

test("FAQ rejects unsupported page keys", () => {
  assert.throws(() => validateFaqInput({ pageKey: "home", question: "Q", answer: "A" }), /page key/i);
});

test("serialization removes unknown fields and normalizes timestamps", () => {
  const item = serializeManagedItem("service", { _id: "abc", title: "Hair Cuts", status: "published", privateNote: "x", createdAt: new Date("2026-01-01T00:00:00.000Z") });
  assert.equal(item.title, "Hair Cuts");
  assert.equal("privateNote" in item, false);
});
