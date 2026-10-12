import test from "node:test";
import assert from "node:assert/strict";
import { buildManagedContentRecords, migrateManagedContent } from "../../scripts/migrate-managed-content.js";

test("legacy snapshots preserve source counts and display values", () => {
  const records = buildManagedContentRecords();
  assert.equal(records.services.length, 15);
  assert.equal(records.offers.length, 5);
  assert.equal(records.packages.length, 23);
  assert.deepEqual(records.faqs.map((faq) => faq.pageKey), [...Array(5).fill("services"), ...Array(4).fill("offers"), ...Array(4).fill("packages")]);
  assert.equal(records.services[0].subservices[0].price, "AED 99.75");
  assert.equal(records.offers[0].validityLabel, "Every Monday");
  assert.equal(records.offers[3].validityLabel, "Midday Special");
  assert.equal(records.packages[0].priceLabel, "AED 187.95");
});

test("dry-run reports counts without connecting to MongoDB", async () => {
  const result = await migrateManagedContent({ apply: false, clientFactory: () => { throw new Error("must not connect"); } });
  assert.equal(result.applied, false);
  assert.deepEqual(result.counts, { services: 15, offers: 5, packages: 23, faqs: 13 });
});
