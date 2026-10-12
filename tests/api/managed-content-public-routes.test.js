import test from "node:test";
import assert from "node:assert/strict";
import { createManagedContentHandler } from "../../api/_lib/managed-content-routes.js";

function database(docs) {
  const collection = {
    createIndex: async () => "ok",
    find(filter) {
      const items = docs.filter((doc) => Object.entries(filter).every(([key, value]) => doc[key] === value));
      return { sort() { return { toArray: async () => items }; } };
    },
  };
  return { collection: () => collection };
}

test("public service API returns published records only and strips internal fields", async () => {
  const db = database([
    { _id: "one", title: "Hair Cuts", slug: "hair-cuts", status: "published", sortOrder: 1, privateNote: "x" },
    { _id: "two", title: "Draft Service", slug: "draft-service", status: "draft", sortOrder: 2 },
  ]);
  const handler = createManagedContentHandler("service", { getDb: async () => db });
  const res = { code: 200, body: null, headers: {}, status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; }, setHeader(name, value) { this.headers[name] = value; } };
  await handler({ method: "GET", query: {}, headers: {} }, res);
  assert.equal(res.code, 200);
  assert.equal(res.body.items.length, 1);
  assert.equal(res.body.items[0].title, "Hair Cuts");
  assert.equal("status" in res.body.items[0], false);
  assert.equal("privateNote" in res.body.items[0], false);
  assert.match(res.headers["Cache-Control"], /no-store/);
});

test("public FAQ API filters by page and published status", async () => {
  const db = database([
    { _id: "one", pageKey: "services", question: "Q1", answer: "A1", status: "published", sortOrder: 1 },
    { _id: "two", pageKey: "offers", question: "Q2", answer: "A2", status: "published", sortOrder: 2 },
    { _id: "three", pageKey: "services", question: "Q3", answer: "A3", status: "draft", sortOrder: 3 },
  ]);
  const handler = createManagedContentHandler("faq", { getDb: async () => db });
  const res = { code: 200, body: null, headers: {}, status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; }, setHeader(name, value) { this.headers[name] = value; } };
  await handler({ method: "GET", query: { pageKey: "services" }, headers: {} }, res);
  assert.equal(res.code, 200);
  assert.equal(res.body.items.length, 1);
  assert.equal(res.body.items[0].question, "Q1");
});
