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

function createDb(initial = []) {
  const documents = initial.map((item) => ({ ...item }));
  const collection = {
    documents,
    async createIndex() {},
    async findOne(filter = {}) {
      return documents.find((item) => Object.entries(filter).every(([key, value]) => {
        if (key === "_id") return String(item._id) === String(value);
        if (value && typeof value === "object" && "$ne" in value) return String(item[key]) !== String(value.$ne);
        return item[key] === value;
      })) || null;
    },
    async insertOne(document) {
      const inserted = { ...document, _id: new ObjectId() };
      documents.push(inserted);
      return { insertedId: inserted._id };
    },
    async findOneAndUpdate(filter, update) {
      const item = await this.findOne(filter);
      if (!item) return null;
      Object.assign(item, update.$set);
      return item;
    },
    async deleteOne(filter) {
      const item = await this.findOne(filter);
      if (!item) return { deletedCount: 0 };
      documents.splice(documents.indexOf(item), 1);
      return { deletedCount: 1 };
    },
    find() {
      return { sort() { return this; }, skip() { return this; }, limit() { return this; }, async toArray() { return documents; } };
    },
    async countDocuments() { return documents.length; },
  };
  return { db: { collection: () => collection }, collection };
}

async function invoke(handler, method, { id, body = {}, origin = "https://layali.example" } = {}) {
  const res = response();
  await handler({
    method,
    headers: { host: "layali.example", origin },
    query: id === undefined ? {} : { id },
    body,
  }, res);
  return res;
}

test("unauthenticated POST, PUT and DELETE requests stop before database access", async () => {
  for (const method of ["POST", "PUT", "DELETE"]) {
    let databaseReached = false;
    const handler = createManagedContentHandler("service", {
      admin: true,
      requireAdmin: (_req, res) => { res.status(401).json({ success: false, message: "Authentication required" }); return null; },
      sameOrigin: () => true,
      getDb: () => { databaseReached = true; throw new Error("database must not be reached"); },
    });
    const res = await invoke(handler, method, { id: "507f1f77bcf86cd799439011", body: { title: "Injected change" } });
    assert.equal(res.code, 401, method);
    assert.equal(databaseReached, false, method);
  }
});

test("cross-origin POST, PUT and DELETE requests are rejected before database access", async () => {
  for (const method of ["POST", "PUT", "DELETE"]) {
    let databaseReached = false;
    const handler = createManagedContentHandler("service", {
      admin: true,
      requireAdmin: () => ({ username: "verified-admin" }),
      sameOrigin: () => false,
      getDb: () => { databaseReached = true; throw new Error("database must not be reached"); },
    });
    const res = await invoke(handler, method, { id: "507f1f77bcf86cd799439011", origin: "https://attacker.example", body: { title: "Injected change" } });
    assert.equal(res.code, 403, method);
    assert.equal(databaseReached, false, method);
  }
});

test("invalid create, update and delete requests return controlled errors without changing records", async () => {
  const existing = {
    _id: new ObjectId("507f1f77bcf86cd799439011"),
    title: "Existing service",
    slug: "existing-service",
    description: "Original description",
    status: "published",
    sortOrder: 4,
    createdAt: new Date("2026-01-01T00:00:00Z"),
    updatedAt: new Date("2026-01-01T00:00:00Z"),
  };
  const { db, collection } = createDb([existing]);
  const handler = createManagedContentHandler("service", {
    admin: true,
    requireAdmin: () => ({ username: "verified-admin" }),
    sameOrigin: () => true,
    getDb: () => db,
  });
  const before = JSON.stringify(collection.documents);

  const invalidCreate = await invoke(handler, "POST", { body: { title: "   " } });
  assert.equal(invalidCreate.code, 400);
  assert.equal(JSON.stringify(collection.documents), before, "invalid create must not insert a record");

  const invalidUpdate = await invoke(handler, "PUT", { id: String(existing._id), body: { sortOrder: "" } });
  assert.equal(invalidUpdate.code, 400);
  assert.equal(JSON.stringify(collection.documents), before, "invalid update must not modify the existing record");

  const invalidDelete = await invoke(handler, "DELETE", { id: "not-an-object-id" });
  assert.equal(invalidDelete.code, 400);
  assert.equal(JSON.stringify(collection.documents), before, "invalid delete identifier must not remove a record");
});
