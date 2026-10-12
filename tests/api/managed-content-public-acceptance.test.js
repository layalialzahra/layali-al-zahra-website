import test from "node:test";
import assert from "node:assert/strict";
import { ObjectId } from "mongodb";
import { createManagedContentHandler } from "../../api/_lib/managed-content-routes.js";

const PUBLIC_FIELDS = {
  service: ["_id", "title", "slug", "description", "imageUrl", "imageAlt", "subservices", "category", "sortOrder"],
  offer: ["_id", "title", "slug", "description", "priceLabel", "badgeText", "imageUrl", "imageAlt", "validityType", "validFrom", "validUntil", "validityLabel", "bookingUrl", "sortOrder"],
  package: ["_id", "title", "slug", "description", "priceLabel", "category", "imageUrl", "imageAlt", "includedItems", "bookingUrl", "sortOrder"],
  faq: ["_id", "pageKey", "question", "answer", "sortOrder"],
};
const ID = () => new ObjectId();

function response() {
  return {
    code: 200, headers: {}, body: null,
    status(code) { this.code = code; return this; },
    json(body) { this.body = body; return this; },
    setHeader(name, value) { this.headers[name] = value; },
  };
}

function fakeDatabase(initial = {}, failures = {}) {
  const collections = {};
  for (const [name, rows] of Object.entries(initial)) {
    collections[name] = rows.map((row) => ({ ...row }));
  }
  return {
    collection(name) {
      if (failures.index) return { createIndex: async () => { throw new Error("private index connection detail"); } };
      return {
        async createIndex() {},
        find(filter = {}) {
          return {
            sort() { return this; },
            async toArray() {
              if (failures.read) throw new Error("private database read detail");
              return (collections[name] || []).filter((row) =>
                Object.entries(filter).every(([key, value]) => row[key] === value));
            },
          };
        },
      };
    },
  };
}

async function read(type, db, query = {}, options = {}) {
  const handler = createManagedContentHandler(type, {
    getDb: options.getDb || (async () => db),
  });
  const res = response();
  await handler({ method: "GET", query, headers: {} }, res);
  return res;
}

test("all public CMS endpoints return an empty items array for empty collections", async () => {
  const db = fakeDatabase({ services: [], offers: [], packages: [], faqs: [] });
  for (const type of Object.keys(PUBLIC_FIELDS)) {
    const res = await read(type, db, type === "faq" ? { pageKey: "services" } : {});
    assert.equal(res.code, 200, type);
    assert.deepEqual(res.body, { success: true, items: [] }, type);
  }
});

test("public CMS endpoints exclude drafts and top-level non-allowlisted fields", async () => {
  const secret = {
    status: "published", internalNotes: "private", seoTitle: "admin SEO",
    metaDescription: "internal description", createdAt: new Date(), updatedAt: new Date(),
    apiKey: "must-not-leak",
  };
  const db = fakeDatabase({
    services: [
      { _id: ID(), title: "Visible service", slug: "visible-service", status: "published", sortOrder: 1,
        subservices: [{ id: "cut", name: "Cut", price: "AED 50", description: "Cutting", bookingUrl: "https://example.com/book", adminNote: "private nested value", internalCost: 99 }], ...secret },
      { ...secret, _id: ID(), title: "Draft service", slug: "draft-service", status: "draft", sortOrder: 0 },
    ],
    offers: [
      { _id: ID(), title: "Visible offer", slug: "visible-offer", status: "published", sortOrder: 1, priceLabel: "AED 99", ...secret },
      { ...secret, _id: ID(), title: "Draft offer", slug: "draft-offer", status: "draft", sortOrder: 0 },
    ],
    packages: [
      { _id: ID(), title: "Visible package", slug: "visible-package", status: "published", sortOrder: 1, priceLabel: "AED 199", includedItems: ["Wash"], ...secret },
      { ...secret, _id: ID(), title: "Draft package", slug: "draft-package", status: "draft", sortOrder: 0 },
    ],
    faqs: [
      { _id: ID(), pageKey: "services", question: "Visible question", answer: "Visible answer", status: "published", sortOrder: 1, ...secret },
      { ...secret, _id: ID(), pageKey: "services", question: "Draft question", answer: "Draft answer", status: "draft", sortOrder: 0 },
      { ...secret, _id: ID(), pageKey: "offers", question: "Other page", answer: "Not for services", status: "published", sortOrder: 0 },
    ],
  });

  for (const type of Object.keys(PUBLIC_FIELDS)) {
    const res = await read(type, db, type === "faq" ? { pageKey: "services" } : {});
    assert.equal(res.code, 200, type);
    assert.equal(res.body.items.length, 1, type);
    const item = res.body.items[0];
    assert.ok(Object.keys(item).every((key) => PUBLIC_FIELDS[type].includes(key)), type);
    for (const field of ["status", "seoTitle", "metaDescription", "createdAt", "updatedAt", "internalNotes", "apiKey"]) {
      assert.equal(Object.hasOwn(item, field), false, `${type} leaked ${field}`);
    }
    assert.doesNotMatch(JSON.stringify(item), /must-not-leak|private nested value|internalCost|admin SEO|private/);
  }

  const services = await read("service", db);
  assert.deepEqual(Object.keys(services.body.items[0].subservices[0]).sort(),
    ["bookingUrl", "description", "id", "name", "price"].sort());
});

test("public CMS endpoints return a generic 503 when database connection, indexing or reads fail", async () => {
  const scenarios = [
    { label: "connection", options: { getDb: async () => { throw new Error("private database connection detail"); } } },
    { label: "index", db: fakeDatabase({}, { index: true }) },
    { label: "read", db: fakeDatabase({ services: [], offers: [], packages: [], faqs: [] }, { read: true }) },
  ];
  for (const scenario of scenarios) {
    for (const type of Object.keys(PUBLIC_FIELDS)) {
      const db = scenario.db || fakeDatabase();
      const res = await read(type, db, type === "faq" ? { pageKey: "services" } : {}, scenario.options || {});
      assert.equal(res.code, 503, `${scenario.label}/${type}`);
      assert.deepEqual(res.body, { success: false, message: "Managed content service unavailable" }, `${scenario.label}/${type}`);
      assert.doesNotMatch(JSON.stringify(res.body), /private|database|connection detail/i);
    }
  }
});
