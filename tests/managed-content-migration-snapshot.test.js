import test from "node:test";
import assert from "node:assert/strict";

process.env.MONGODB_URI ||= "mongodb://127.0.0.1:27017/layali-migration-test";

const [
  { buildManagedContentRecords, migrateManagedContent },
  { normalizeManagedSlug },
  { legacyServicesData },
  { legacyOffersData },
  { legacyPackagesData },
  { legacyFaqs },
] = await Promise.all([
  import("../scripts/migrate-managed-content.js"),
  import("../api/_lib/managed-content.js"),
  import("../src/data/legacy-services.js"),
  import("../src/data/legacy-offers.js"),
  import("../src/data/legacy-packages.js"),
  import("../src/data/legacy-faqs.js")
]);

const BOOKING_URL = "https://store.zylu.co/business/layali-al-zahra-beauty-salon-llc/services";
const records = buildManagedContentRecords();

test("migration dry-run describes exactly the 56 expected source records without applying changes", async () => {
  const result = await migrateManagedContent({ apply: false });
  assert.equal(result.applied, false);
  assert.deepEqual(result.counts, { services: 15, offers: 5, packages: 23, faqs: 13 });
  assert.deepEqual({
    services: records.services.length,
    offers: records.offers.length,
    packages: records.packages.length,
    faqs: records.faqs.length,
  }, result.counts);
});

test("all 15 service records preserve source titles, images, categories, order and subservice labels/prices", () => {
  assert.equal(legacyServicesData.length, 15);
  assert.deepEqual(records.services.map((actual, sortOrder) => ({
    slug: actual.slug,
    title: actual.title,
    description: actual.description,
    imageUrl: actual.imageUrl,
    imageAlt: actual.imageAlt,
    category: actual.category,
    sortOrder: actual.sortOrder,
    status: actual.status,
    subservices: actual.subservices,
  })), legacyServicesData.map((source, sortOrder) => ({
    slug: source.id,
    title: source.title,
    description: "",
    imageUrl: source.image,
    imageAlt: source.title,
    category: source.category || "",
    sortOrder,
    status: "published",
    subservices: source.subservices.map((item, index) => ({
      id: `${normalizeManagedSlug(item.name)}-${index + 1}`,
      name: item.name,
      price: item.price,
    })),
  })));
});

test("all 5 offer records preserve exact source labels, prices, descriptions, images and order", () => {
  assert.equal(legacyOffersData.length, 5);
  assert.deepEqual(records.offers.map((actual) => ({
    slug: actual.slug,
    title: actual.title,
    description: actual.description,
    priceLabel: actual.priceLabel,
    imageUrl: actual.imageUrl,
    imageAlt: actual.imageAlt,
    validityType: actual.validityType,
    validityLabel: actual.validityLabel,
    bookingUrl: actual.bookingUrl,
    sortOrder: actual.sortOrder,
    status: actual.status,
  })), legacyOffersData.map((source, sortOrder) => {
    const validityLabel = String(source.validUntil || "");
    return {
      slug: normalizeManagedSlug(source.title),
      title: source.title,
      description: source.description,
      priceLabel: source.badge,
      imageUrl: source.image,
      imageAlt: source.title,
      validityType: validityLabel.startsWith("Every ") ? "recurring" : "label",
      validityLabel,
      bookingUrl: BOOKING_URL,
      sortOrder,
      status: "published",
    };
  }));
  assert.deepEqual(records.offers.map((item) => item.validityLabel), legacyOffersData.map((item) => item.validUntil));
  assert.deepEqual(records.offers.map((item) => item.priceLabel), legacyOffersData.map((item) => item.badge));
});

test("all 23 package records preserve exact source titles, categories, prices, descriptions, images and order", () => {
  assert.equal(legacyPackagesData.length, 23);
  assert.deepEqual(records.packages.map((actual) => ({
    slug: actual.slug,
    title: actual.title,
    description: actual.description,
    priceLabel: actual.priceLabel,
    category: actual.category,
    imageUrl: actual.imageUrl,
    imageAlt: actual.imageAlt,
    bookingUrl: actual.bookingUrl,
    sortOrder: actual.sortOrder,
    status: actual.status,
  })), legacyPackagesData.map((source, sortOrder) => ({
    slug: normalizeManagedSlug(source.title),
    title: source.title,
    description: source.description,
    priceLabel: source.price,
    category: source.category,
    imageUrl: source.image,
    imageAlt: source.title,
    bookingUrl: BOOKING_URL,
    sortOrder,
    status: "published",
  })));
  assert.deepEqual(records.packages.map((item) => item.priceLabel), legacyPackagesData.map((item) => item.price));
});

test("all 13 FAQs preserve exact questions/answers, source page assignments and within-page order", () => {
  const expected = Object.entries(legacyFaqs).flatMap(([pageKey, items]) =>
    items.map((source, sortOrder) => ({
      pageKey,
      question: source.q,
      answer: source.a,
      sortOrder,
      status: "published",
    })),
  );
  assert.equal(expected.length, 13);
  assert.deepEqual(records.faqs.map(({ pageKey, question, answer, sortOrder, status }) => ({
    pageKey, question, answer, sortOrder, status,
  })), expected);
  assert.deepEqual(
    Object.fromEntries(["services", "offers", "packages"].map((key) => [key, records.faqs.filter((item) => item.pageKey === key).length])),
    { services: 5, offers: 4, packages: 4 },
  );
});

test("booking URL matches the existing public page fallback for offers and packages", async () => {
  const { readFile } = await import("node:fs/promises");
  const [offersSource, packagesSource, servicesSource] = await Promise.all([
    readFile(new URL("../src/components/OffersPage.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/components/PackagesPage.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/components/ServicesPage.tsx", import.meta.url), "utf8"),
  ]);
  assert.ok(offersSource.includes(BOOKING_URL));
  assert.ok(packagesSource.includes(BOOKING_URL));
  assert.ok(servicesSource.includes(BOOKING_URL));
  assert.ok(records.offers.every((item) => item.bookingUrl === BOOKING_URL));
  assert.ok(records.packages.every((item) => item.bookingUrl === BOOKING_URL));
});
