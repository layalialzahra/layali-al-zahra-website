import test from "node:test";
import assert from "node:assert/strict";
import { ObjectId } from "mongodb";
import { validatePackageInput } from "../../api/_lib/managed-content.js";
import { createManagedContentHandler } from "../../api/_lib/managed-content-routes.js";

function response() {
  return {
    code: 200, headers: {}, body: null,
    status(code) { this.code = code; return this; },
    json(body) { this.body = body; return this; },
    setHeader(name, value) { this.headers[name] = value; },
  };
}

function matches(document, filter = {}) {
  return Object.entries(filter).every(([key, value]) => {
    if (key === "$or") return value.some((clause) => Object.entries(clause).some(([field, condition]) =>
      condition.$regex ? condition.$regex.test(String(document[field] || "")) : String(document[field]) === String(condition)));
    if (value && typeof value === "object" && "$ne" in value) return String(document[key]) !== String(value.$ne);
    if (key === "_id") return String(document[key]) === String(value);
    return document[key] === value;
  });
}

function makeCollection(initial = []) {
  const documents = initial.map((item) => ({ ...item }));
  return {
    async createIndex() { return "ok"; },
    async findOne(filter) { return documents.find((item) => matches(item, filter)) || null; },
    async insertOne(document) {
      const stored = { ...document, _id: new ObjectId() };
      documents.push(stored);
      return { insertedId: stored._id };
    },
    async findOneAndUpdate(filter, update) {
      const item = documents.find((document) => matches(document, filter));
      if (!item) return null;
      Object.assign(item, update.$set);
      return item;
    },
    async deleteOne(filter) {
      const index = documents.findIndex((item) => matches(item, filter));
      if (index < 0) return { deletedCount: 0 };
      documents.splice(index, 1);
      return { deletedCount: 1 };
    },
    async countDocuments(filter) { return documents.filter((item) => matches(item, filter)).length; },
    find(filter) {
      let rows = documents.filter((item) => matches(item, filter));
      let offset = 0;
      let limit = Infinity;
      const cursor = {
        sort(spec) {
          rows = [...rows].sort((a, b) => {
            for (const [field, direction] of Object.entries(spec)) {
              const av = a[field] ?? "";
              const bv = b[field] ?? "";
              const cmp = av instanceof Date && bv instanceof Date ? av.getTime() - bv.getTime()
                : typeof av === "number" && typeof bv === "number" ? av - bv
                : String(av).localeCompare(String(bv));
              if (cmp) return cmp * direction;
            }
            return 0;
          });
          return cursor;
        },
        skip(value) { offset = value; return cursor; },
        limit(value) { limit = value; return cursor; },
        async toArray() { return rows.slice(offset, offset + limit); },
      };
      return cursor;
    },
    snapshot() { return documents.map((item) => ({ ...item })); },
  };
}

function fixture({ failDatabase = false } = {}) {
  const collection = makeCollection();
  const db = { collection(name) { assert.equal(name, "packages"); return collection; } };
  const getDb = async () => {
    if (failDatabase) throw new Error("private database connection detail");
    return db;
  };
  const admin = createManagedContentHandler("package", {
    admin: true,
    requireAdmin: () => ({ username: "package-test-admin" }),
    sameOrigin: () => true,
    getDb,
  });
  const publicRead = createManagedContentHandler("package", { getDb });
  async function call(handler, method, { query = {}, body = {}, headers = {} } = {}) {
    const res = response();
    await handler({ method, query, body, headers }, res);
    return res;
  }
  return { collection, admin, publicRead, call };
}

test("package validation preserves legacy categories, display prices, image paths, details and booking URLs", () => {
  const packageItem = validatePackageInput({
    title: "Silk Smooth Half Glow",
    category: "Silk Smooth Waxing Combos",
    priceLabel: "AED 187.95",
    imageUrl: "/silk-smooth-half-glow.webp",
    imageAlt: "Silk Smooth Half Glow waxing package",
    includedItems: ["Half Arms", "Half Legs", "Underarms"],
    bookingUrl: "https://booking.example/packages/half-glow",
    sortOrder: 7,
  });
  assert.equal(packageItem.slug, "silk-smooth-half-glow");
  assert.equal(packageItem.category, "Silk Smooth Waxing Combos");
  assert.equal(packageItem.priceLabel, "AED 187.95");
  assert.equal(packageItem.imageUrl, "/silk-smooth-half-glow.webp");
  assert.equal(packageItem.imageAlt, "Silk Smooth Half Glow waxing package");
  assert.deepEqual(packageItem.includedItems, ["Half Arms", "Half Legs", "Underarms"]);
  assert.equal(packageItem.bookingUrl, "https://booking.example/packages/half-glow");
  assert.equal(packageItem.sortOrder, 7);
  assert.equal(packageItem.status, "draft");
});

test("package validation rejects missing prices, unsafe image/booking URLs, invalid ordering and malformed included items", () => {
  assert.throws(() => validatePackageInput({ title: "Missing Price" }), /price label is required/i);
  assert.throws(() => validatePackageInput({ title: "Bad Image", priceLabel: "AED 99", imageUrl: "javascript:alert(1)" }), /safe HTTPS URL|invalid/i);
  assert.throws(() => validatePackageInput({ title: "Bad Booking", priceLabel: "AED 99", bookingUrl: "http://booking.example" }), /HTTPS/i);
  assert.throws(() => validatePackageInput({ title: "Bad Order", priceLabel: "AED 99", sortOrder: null }), /sort order/i);
  assert.throws(() => validatePackageInput({ title: "Bad Order", priceLabel: "AED 99", sortOrder: "" }), /sort order/i);
  assert.throws(() => validatePackageInput({ title: "Bad Items", priceLabel: "AED 99", includedItems: [""] }), /included item is required/i);
  assert.throws(() => validatePackageInput({ title: "Bad Items", priceLabel: "AED 99", includedItems: "Hair cut" }), /included items must be an array/i);
});

test("package CRUD preserves partial fields, category, order, price and image; public reads are ordered and published-only", async () => {
  const { admin, publicRead, call, collection } = fixture();
  const draft = await call(admin, "POST", { body: {
    title: "Silk Smooth Half Glow", category: "Silk Smooth Waxing Combos",
    description: "Original description", priceLabel: "AED 187.95",
    imageUrl: "/silk-smooth-half-glow.webp", imageAlt: "Original alt",
    includedItems: ["Half Arms", "Half Legs"], bookingUrl: "https://booking.example/half-glow",
    sortOrder: 20,
  } });
  assert.equal(draft.code, 201);
  assert.equal(draft.body.item.status, "draft");
  assert.equal(draft.body.item.priceLabel, "AED 187.95");
  const draftId = draft.body.item._id;

  const later = await call(admin, "POST", { body: {
    title: "Midday Glow", category: "Midday Glow", priceLabel: "From AED 105",
    imageUrl: "/midday-hot-oil-head-massage.webp", sortOrder: 10, status: "published",
    seoTitle: "Admin-only SEO",
  } });
  const earlier = await call(admin, "POST", { body: {
    title: "Beauty Package Bud", category: "Signature Beauty Packages", priceLabel: "AED 229",
    imageUrl: "/beauty-package-bud.webp", sortOrder: 2, status: "published",
  } });

  const edited = await call(admin, "PUT", { query: { id: draftId }, body: {
    category: "Updated Category", priceLabel: "From AED 187.95",
    imageUrl: "/updated-package.webp", imageAlt: "Updated alt", sortOrder: 1,
  } });
  assert.equal(edited.code, 200);
  assert.equal(edited.body.item.title, "Silk Smooth Half Glow");
  assert.equal(edited.body.item.description, "Original description");
  assert.equal(edited.body.item.category, "Updated Category");
  assert.equal(edited.body.item.priceLabel, "From AED 187.95");
  assert.equal(edited.body.item.imageUrl, "/updated-package.webp");
  assert.equal(edited.body.item.imageAlt, "Updated alt");
  assert.deepEqual(edited.body.item.includedItems, ["Half Arms", "Half Legs"]);
  assert.equal(edited.body.item.bookingUrl, "https://booking.example/half-glow");
  assert.equal(edited.body.item.sortOrder, 1);
  assert.equal(edited.body.item.status, "draft");

  const beforePublish = await call(publicRead, "GET");
  assert.equal(beforePublish.code, 200);
  assert.equal(beforePublish.headers["Cache-Control"], "no-store, max-age=0");
  assert.deepEqual(beforePublish.body.items.map((item) => item.title), ["Beauty Package Bud", "Midday Glow"]);
  assert.equal("status" in beforePublish.body.items[0], false);
  assert.equal("seoTitle" in beforePublish.body.items[0], false);
  assert.equal("createdAt" in beforePublish.body.items[0], false);
  assert.equal(beforePublish.body.items[0].imageUrl, "/beauty-package-bud.webp");
  assert.equal(beforePublish.body.items[0].priceLabel, "AED 229");

  const publish = await call(admin, "PUT", { query: { id: draftId }, body: { status: "published" } });
  assert.equal(publish.code, 200);
  const afterPublish = await call(publicRead, "GET");
  assert.deepEqual(afterPublish.body.items.map((item) => item.title), ["Silk Smooth Half Glow", "Beauty Package Bud", "Midday Glow"]);
  assert.equal(afterPublish.body.items[0].category, "Updated Category");
  assert.equal(afterPublish.body.items[0].priceLabel, "From AED 187.95");
  assert.equal(afterPublish.body.items[0].imageUrl, "/updated-package.webp");
  assert.deepEqual(afterPublish.body.items[0].includedItems, ["Half Arms", "Half Legs"]);

  const unpublish = await call(admin, "PUT", { query: { id: draftId }, body: { status: "draft" } });
  assert.equal(unpublish.code, 200);
  const afterUnpublish = await call(publicRead, "GET");
  assert.equal(afterUnpublish.body.items.some((item) => item._id === draftId), false);

  const deleted = await call(admin, "DELETE", { query: { id: later.body.item._id } });
  assert.equal(deleted.code, 200);
  assert.equal(collection.snapshot().length, 2);
  const afterDelete = await call(publicRead, "GET");
  assert.equal(afterDelete.body.items.some((item) => item.title === "Midday Glow"), false);
  assert.equal(earlier.code, 201);
});

test("duplicate normalized package slugs are rejected on create and edit without overwriting records", async () => {
  const { admin, call, collection } = fixture();
  const first = await call(admin, "POST", { body: { title: "Beauty Package Bud", priceLabel: "AED 229" } });
  const second = await call(admin, "POST", { body: { title: "Beauty Package Bloom", priceLabel: "AED 499" } });
  const duplicateCreate = await call(admin, "POST", { body: { title: "Other Package", slug: " BEAUTY PACKAGE BUD ", priceLabel: "AED 10" } });
  const duplicateEdit = await call(admin, "PUT", { query: { id: second.body.item._id }, body: { slug: "beauty-package-bud" } });
  assert.equal(first.code, 201);
  assert.equal(second.code, 201);
  assert.equal(duplicateCreate.code, 409);
  assert.equal(duplicateEdit.code, 409);
  assert.equal(collection.snapshot().length, 2);
  assert.equal(collection.snapshot().find((item) => String(item._id) === second.body.item._id).slug, "beauty-package-bloom");
});

test("invalid package requests return controlled 400 responses without mutating records", async () => {
  const { admin, call, collection } = fixture();
  const missingPrice = await call(admin, "POST", { body: { title: "No Price" } });
  const unsafeImage = await call(admin, "POST", { body: { title: "Unsafe Image", priceLabel: "AED 20", imageUrl: "javascript:alert(1)" } });
  const invalidOrder = await call(admin, "POST", { body: { title: "Invalid Order", priceLabel: "AED 20", sortOrder: null } });
  assert.equal(missingPrice.code, 400);
  assert.equal(unsafeImage.code, 400);
  assert.equal(invalidOrder.code, 400);
  assert.equal(collection.snapshot().length, 0);
  assert.equal((await call(admin, "PUT", { query: { id: "not-an-object-id" }, body: { priceLabel: "AED 10" } })).code, 400);
  assert.equal((await call(admin, "PUT", { query: { id: new ObjectId().toString() }, body: { priceLabel: "AED 10" } })).code, 404);
});

test("database failures return a controlled 503 without leaking internal error details", async () => {
  const { call, admin, publicRead } = fixture({ failDatabase: true });
  const adminFailure = await call(admin, "POST", { body: { title: "Package", priceLabel: "AED 99" } });
  const publicFailure = await call(publicRead, "GET");
  for (const result of [adminFailure, publicFailure]) {
    assert.equal(result.code, 503);
    assert.equal(result.body.success, false);
    assert.match(result.body.message, /unavailable/i);
    assert.equal(JSON.stringify(result.body).includes("private database connection detail"), false);
  }
});

test("public package route rejects writes and admin route reports unsupported methods", async () => {
  const { admin, publicRead, call } = fixture();
  const publicWrite = await call(publicRead, "POST", { body: { title: "Should Not Write", priceLabel: "AED 10" } });
  assert.equal(publicWrite.code, 405);
  assert.match(publicWrite.headers.Allow, /GET/);
  const adminMethod = await call(admin, "PATCH");
  assert.equal(adminMethod.code, 405);
  assert.match(adminMethod.headers.Allow, /GET/);
});
