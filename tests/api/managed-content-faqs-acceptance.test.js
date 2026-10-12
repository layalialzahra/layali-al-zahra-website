import test from "node:test";
import assert from "node:assert/strict";
import { ObjectId } from "mongodb";
import { validateFaqInput } from "../../api/_lib/managed-content.js";
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
    if (key === "_id") return String(document._id) === String(value);
    if (key === "$or") return value.some((clause) => matches(document, clause));
    if (value && typeof value === "object" && "$ne" in value) return String(document[key]) !== String(value.$ne);
    if (value && typeof value === "object" && "$regex" in value) return value.$regex.test(String(document[key] || ""));
    return document[key] === value;
  });
}

function fakeDb(initial = []) {
  const documents = initial.map((item) => ({ ...item }));
  const collection = {
    documents,
    async createIndex() {},
    async findOne(filter) { return documents.find((item) => matches(item, filter)) || null; },
    async insertOne(document) {
      const inserted = { ...document, _id: new ObjectId() };
      documents.push(inserted);
      return { insertedId: inserted._id };
    },
    find(filter = {}) {
      let sortSpec = {};
      let skipCount = 0;
      let limitCount = Infinity;
      const cursor = {
        sort(spec) { sortSpec = spec; return cursor; },
        skip(count) { skipCount = count; return cursor; },
        limit(count) { limitCount = count; return cursor; },
        async toArray() {
          const result = documents.filter((item) => matches(item, filter));
          const fields = Object.entries(sortSpec);
          result.sort((left, right) => {
            for (const [field, direction] of fields) {
              const a = left[field] instanceof Date ? left[field].getTime() : left[field];
              const b = right[field] instanceof Date ? right[field].getTime() : right[field];
              if (a < b) return -1 * direction;
              if (a > b) return direction;
            }
            return 0;
          });
          return result.slice(skipCount, skipCount + limitCount);
        },
      };
      return cursor;
    },
    async countDocuments(filter = {}) { return documents.filter((item) => matches(item, filter)).length; },
    async findOneAndUpdate(filter, update) {
      const item = documents.find((entry) => matches(entry, filter));
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
  };
  return { db: { collection: () => collection }, collection };
}

function adminHandler(db) {
  return createManagedContentHandler("faq", {
    admin: true,
    requireAdmin: () => ({ username: "test-admin" }),
    sameOrigin: () => true,
    getDb: () => db,
  });
}

function publicHandler(db) {
  return createManagedContentHandler("faq", { getDb: () => db });
}

async function call(handler, { method = "GET", query = {}, body = {} } = {}) {
  const res = response();
  await handler({ method, query, body, headers: {} }, res);
  return res;
}

test("FAQ validation requires an explicit valid page association on create", () => {
  for (const pageKey of [undefined, "", null, "blog", "services-and-offers", "SERVICES?"]) {
    const input = { question: "How do I book?", answer: "Contact the salon." };
    if (pageKey !== undefined) input.pageKey = pageKey;
    assert.throws(() => validateFaqInput(input), /invalid faq page key/i, String(pageKey));
  }
  assert.deepEqual(validateFaqInput({
    pageKey: " SERVICES ", question: "How do I book?", answer: "Contact the salon.",
  }).pageKey, "services");
});

test("FAQ partial updates preserve omitted association but reject an invalid reassignment", () => {
  assert.deepEqual(validateFaqInput({ sortOrder: 4 }, true), { sortOrder: 4 });
  assert.throws(() => validateFaqInput({ pageKey: "" }, true), /invalid faq page key/i);
  assert.throws(() => validateFaqInput({ pageKey: "blog" }, true), /invalid faq page key/i);
  assert.throws(() => validateFaqInput({ pageKey: null }, true), /invalid faq page key/i);
});

test("FAQ CRUD defaults to draft, supports ordering/publication/reassignment and deletion", async () => {
  const { db, collection } = fakeDb();
  const handler = adminHandler(db);
  const created = await call(handler, {
    method: "POST",
    body: { pageKey: "services", question: "Can I book online?", answer: "Yes.", sortOrder: 8 },
  });
  assert.equal(created.code, 201);
  assert.equal(created.body.item.status, "draft");
  assert.equal(created.body.item.pageKey, "services");
  assert.equal(collection.documents.length, 1);
  const id = created.body.item._id;

  const updated = await call(handler, {
    method: "PUT", query: { id },
    body: { status: "published", sortOrder: 2 },
  });
  assert.equal(updated.code, 200);
  assert.equal(updated.body.item.status, "published");
  assert.equal(updated.body.item.pageKey, "services", "omitting pageKey must not detach the FAQ");
  assert.equal(updated.body.item.sortOrder, 2);

  const reassigned = await call(handler, {
    method: "PUT", query: { id }, body: { pageKey: "offers" },
  });
  assert.equal(reassigned.code, 200);
  assert.equal(reassigned.body.item.pageKey, "offers");
  assert.equal(reassigned.body.item.status, "published");

  const unpublished = await call(handler, { method: "PUT", query: { id }, body: { status: "draft" } });
  assert.equal(unpublished.code, 200);
  assert.equal(unpublished.body.item.status, "draft");
  const publicOffers = await call(publicHandler(db), { query: { pageKey: "offers" } });
  assert.deepEqual(publicOffers.body.items, [], "unpublishing must immediately remove the FAQ from public reads");

  const deleted = await call(handler, { method: "DELETE", query: { id } });
  assert.equal(deleted.code, 200);
  assert.equal(collection.documents.length, 0);
});

test("FAQ create and update reject missing or invalid associations without mutation", async () => {
  const { db, collection } = fakeDb();
  const handler = adminHandler(db);
  for (const body of [
    { question: "Missing association", answer: "Answer." },
    { pageKey: "blog", question: "Wrong association", answer: "Answer." },
  ]) {
    const res = await call(handler, { method: "POST", body });
    assert.equal(res.code, 400);
  }
  assert.equal(collection.documents.length, 0);

  const valid = await call(handler, {
    method: "POST", body: { pageKey: "packages", question: "Package question", answer: "Package answer" },
  });
  const id = valid.body.item._id;
  for (const pageKey of ["", "invalid", null]) {
    const res = await call(handler, { method: "PUT", query: { id }, body: { pageKey } });
    assert.equal(res.code, 400);
  }
  assert.equal(collection.documents[0].pageKey, "packages");
});

test("public FAQ reads isolate each page, exclude drafts and malformed associations, and preserve order", async () => {
  const now = new Date("2026-10-12T10:00:00Z");
  const { db } = fakeDb([
    { _id: new ObjectId(), pageKey: "services", question: "Service later", answer: "S2", status: "published", sortOrder: 5, createdAt: now },
    { _id: new ObjectId(), pageKey: "services", question: "Service first", answer: "S1", status: "published", sortOrder: 1, createdAt: now },
    { _id: new ObjectId(), pageKey: "offers", question: "Offer only", answer: "O", status: "published", sortOrder: 1, createdAt: now },
    { _id: new ObjectId(), pageKey: "packages", question: "Package only", answer: "P", status: "published", sortOrder: 1, createdAt: now },
    { _id: new ObjectId(), pageKey: "services", question: "Service draft", answer: "Hidden", status: "draft", sortOrder: 0, createdAt: now },
    { _id: new ObjectId(), question: "Missing page key", answer: "Must not leak", status: "published", sortOrder: 0, createdAt: now },
    { _id: new ObjectId(), pageKey: "blog", question: "Invalid page key", answer: "Must not leak", status: "published", sortOrder: 0, createdAt: now },
  ]);
  const handler = publicHandler(db);
  const expected = {
    services: ["Service first", "Service later"],
    offers: ["Offer only"],
    packages: ["Package only"],
  };
  for (const [pageKey, questions] of Object.entries(expected)) {
    const res = await call(handler, { query: { pageKey } });
    assert.equal(res.code, 200);
    assert.deepEqual(res.body.items.map((item) => item.question), questions);
    assert.ok(res.body.items.every((item) => !("status" in item)), "public FAQ data must omit internal publication status");
    assert.ok(res.body.items.every((item) => item.pageKey === pageKey));
  }
});

test("public FAQ reads reject missing and invalid page keys instead of returning mixed-page FAQs", async () => {
  const { db } = fakeDb([
    { _id: new ObjectId(), pageKey: "services", question: "Visible only on services", answer: "A", status: "published", sortOrder: 0 },
  ]);
  const handler = publicHandler(db);
  for (const query of [{}, { pageKey: "" }, { pageKey: "blog" }, { pageKey: null }]) {
    const res = await call(handler, { query });
    assert.equal(res.code, 400);
    assert.equal(res.body.success, false);
  }
});

test("admin FAQ listing can filter by one valid page key and rejects an invalid filter", async () => {
  const { db } = fakeDb([
    { _id: new ObjectId(), pageKey: "services", question: "Services Q", answer: "A", status: "published", sortOrder: 0, updatedAt: new Date() },
    { _id: new ObjectId(), pageKey: "offers", question: "Offers Q", answer: "A", status: "published", sortOrder: 0, updatedAt: new Date() },
  ]);
  const handler = adminHandler(db);
  const services = await call(handler, { query: { pageKey: "services" } });
  assert.equal(services.code, 200);
  assert.deepEqual(services.body.items.map((item) => item.pageKey), ["services"]);
  const invalid = await call(handler, { query: { pageKey: "blog" } });
  assert.equal(invalid.code, 400);
});
