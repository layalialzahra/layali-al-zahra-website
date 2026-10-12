import test from "node:test";
import assert from "node:assert/strict";
import { ObjectId } from "mongodb";
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
    if (key === "$or") return value.some((clause) => Object.entries(clause).some(([field, condition]) => condition.$regex
      ? condition.$regex.test(String(document[field] || "")) : document[field] === condition));
    if (value && typeof value === "object" && "$ne" in value) return String(document[key]) !== String(value.$ne);
    if (key === "_id") return String(document[key]) === String(value);
    return document[key] === value;
  });
}

function makeCollection() {
  let documents = [];
  return {
    async createIndex() {},
    async findOne(filter) { return documents.find((item) => matches(item, filter)) || null; },
    async insertOne(document) {
      const inserted = { ...document, _id: new ObjectId() };
      documents.push(inserted);
      return { insertedId: inserted._id };
    },
    async findOneAndUpdate(filter, update) {
      const index = documents.findIndex((item) => matches(item, filter));
      if (index < 0) return null;
      documents[index] = { ...documents[index], ...update.$set };
      return documents[index];
    },
    async deleteOne(filter) {
      const before = documents.length;
      documents = documents.filter((item) => !matches(item, filter));
      return { deletedCount: before - documents.length };
    },
    async countDocuments(filter) { return documents.filter((item) => matches(item, filter)).length; },
    find(filter) {
      let rows = documents.filter((item) => matches(item, filter));
      let offset = 0;
      let count = Infinity;
      const cursor = {
        sort(spec) {
          rows = [...rows].sort((a, b) => {
            for (const [key, direction] of Object.entries(spec)) {
              const av = a[key] == null ? "" : a[key];
              const bv = b[key] == null ? "" : b[key];
              const comparison = av instanceof Date && bv instanceof Date ? av.getTime() - bv.getTime()
                : typeof av === "number" && typeof bv === "number" ? av - bv
                : String(av).localeCompare(String(bv));
              if (comparison) return comparison * direction;
            }
            return 0;
          });
          return cursor;
        },
        skip(value) { offset = value; return cursor; },
        limit(value) { count = value; return cursor; },
        async toArray() { return rows.slice(offset, offset + count); },
      };
      return cursor;
    },
    snapshot() { return [...documents]; },
  };
}

function fixture() {
  const collection = makeCollection();
  const db = { collection: (name) => { assert.equal(name, "services"); return collection; } };
  const admin = createManagedContentHandler("service", {
    admin: true,
    requireAdmin: () => ({ username: "test-admin" }),
    sameOrigin: () => true,
    getDb: async () => db,
  });
  const publicRead = createManagedContentHandler("service", { getDb: async () => db });
  async function call(handler, method, { query = {}, body = {}, headers = {} } = {}) {
    const res = response();
    await handler({ method, query, body, headers }, res);
    return res;
  }
  return { collection, admin, publicRead, call };
}

test("creates a service as a draft by default and edits only supplied fields, including display order", async () => {
  const { admin, call } = fixture();
  const created = await call(admin, "POST", { body: { title: "Hair Cuts", description: "Original description", sortOrder: 8 } });
  assert.equal(created.code, 201);
  assert.equal(created.body.item.status, "draft");
  assert.equal(created.body.item.slug, "hair-cuts");
  const id = created.body.item._id;

  const edited = await call(admin, "PUT", { query: { id }, body: { description: "Updated description", sortOrder: 2 } });
  assert.equal(edited.code, 200);
  assert.equal(edited.body.item.title, "Hair Cuts");
  assert.equal(edited.body.item.description, "Updated description");
  assert.equal(edited.body.item.sortOrder, 2);
  assert.equal(edited.body.item.status, "draft");
});

test("explicit publish and unpublish transitions persist the requested status", async () => {
  const { admin, call } = fixture();
  const created = await call(admin, "POST", { body: { title: "Hair Colour", status: "published" } });
  assert.equal(created.code, 201);
  assert.equal(created.body.item.status, "published");

  const unpublished = await call(admin, "PUT", { query: { id: created.body.item._id }, body: { status: "draft" } });
  assert.equal(unpublished.code, 200);
  assert.equal(unpublished.body.item.status, "draft");

  const republished = await call(admin, "PUT", { query: { id: created.body.item._id }, body: { status: "published" } });
  assert.equal(republished.code, 200);
  assert.equal(republished.body.item.status, "published");
});

test("rejects duplicate normalized slugs without inserting a second service", async () => {
  const { admin, call, collection } = fixture();
  const first = await call(admin, "POST", { body: { title: "Hair & Cuts" } });
  const duplicate = await call(admin, "POST", { body: { title: "Other Service", slug: " HAIR & CUTS " } });
  assert.equal(first.code, 201);
  assert.equal(duplicate.code, 409);
  assert.match(duplicate.body.message, /slug already exists/i);
  assert.equal(collection.snapshot().length, 1);
});

test("returns a controlled 400 for missing titles and invalid ordering values", async () => {
  const { admin, call, collection } = fixture();
  const missingTitle = await call(admin, "POST", { body: { title: "   " } });
  const nullOrder = await call(admin, "POST", { body: { title: "Hair Spa", sortOrder: null } });
  const blankOrder = await call(admin, "POST", { body: { title: "Hair Spa", sortOrder: "" } });
  assert.equal(missingTitle.code, 400);
  assert.equal(nullOrder.code, 400);
  assert.equal(blankOrder.code, 400);
  assert.equal(collection.snapshot().length, 0);
});

test("public services are sorted by sortOrder, omit drafts and exclude admin-only fields", async () => {
  const { admin, publicRead, call } = fixture();
  await call(admin, "POST", { body: { title: "Later Service", status: "published", sortOrder: 20, seoTitle: "Internal SEO" } });
  await call(admin, "POST", { body: { title: "Earlier Service", status: "published", sortOrder: 1, seoTitle: "Internal SEO" } });
  await call(admin, "POST", { body: { title: "Draft Service", status: "draft", sortOrder: 0 } });

  const result = await call(publicRead, "GET");
  assert.equal(result.code, 200);
  assert.deepEqual(result.body.items.map((item) => item.title), ["Earlier Service", "Later Service"]);
  assert.equal(result.body.items.some((item) => item.status === "draft"), false);
  assert.equal("seoTitle" in result.body.items[0], false);
  assert.equal("createdAt" in result.body.items[0], false);
});

test("delete removes only the selected service and it no longer appears in public reads", async () => {
  const { admin, publicRead, call } = fixture();
  const created = await call(admin, "POST", { body: { title: "Delete Me", status: "published" } });
  const deleted = await call(admin, "DELETE", { query: { id: created.body.item._id } });
  const publicResult = await call(publicRead, "GET");
  assert.equal(deleted.code, 200);
  assert.equal(deleted.body.success, true);
  assert.deepEqual(publicResult.body.items, []);
});


test("rejects changing a service slug to another record's slug", async () => {
  const { admin, call, collection } = fixture();
  const first = await call(admin, "POST", { body: { title: "Hair Cuts" } });
  const second = await call(admin, "POST", { body: { title: "Hair Colour" } });
  const duplicateEdit = await call(admin, "PUT", {
    query: { id: second.body.item._id },
    body: { slug: "hair-cuts" },
  });
  assert.equal(duplicateEdit.code, 409);
  assert.match(duplicateEdit.body.message, /slug already exists/i);
  assert.equal(collection.snapshot().length, 2);
  assert.equal(collection.snapshot().find((item) => String(item._id) === second.body.item._id).slug, "hair-colour");
  assert.equal(first.code, 201);
});
