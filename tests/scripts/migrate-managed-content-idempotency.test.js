import test from "node:test";
import assert from "node:assert/strict";
import { migrateManagedContent } from "../../scripts/migrate-managed-content.js";

test("repeat apply inserts missing legacy records without overwriting admin edits", async () => {
  const store = new Map();
  const clientFactory = () => ({
    connect: async () => {}, close: async () => {},
    db: () => ({ collection(name) {
      if (!store.has(name)) store.set(name, []);
      const docs = store.get(name);
      return {
        createIndex: async () => {},
        bulkWrite: async (ops) => {
          let upsertedCount = 0, matchedCount = 0, modifiedCount = 0;
          for (const op of ops) {
            const { filter, update } = op.updateOne;
            const doc = docs.find((item) => Object.entries(filter).every(([key, value]) => item[key] === value));
            if (doc) {
              matchedCount++;
              // MongoDB ignores $setOnInsert when a matching record already exists.
            } else {
              docs.push({ ...filter, ...update.$setOnInsert });
              upsertedCount++;
              modifiedCount++;
            }
          }
          return { upsertedCount, matchedCount, modifiedCount };
        },
      };
    } }),
  });

  await migrateManagedContent({ apply: true, uri: "mongodb://example.test", clientFactory });
  const first = [...store.values()].reduce((n, docs) => n + docs.length, 0);
  const existingService = store.get("services")[0];
  existingService.title = "Admin-edited title";
  existingService.status = "draft";
  existingService.sortOrder = 99;

  const secondResult = await migrateManagedContent({ apply: true, uri: "mongodb://example.test", clientFactory });
  const second = [...store.values()].reduce((n, docs) => n + docs.length, 0);

  assert.equal(first, 56);
  assert.equal(second, first);
  assert.equal(secondResult.results.services.inserted, 0);
  assert.equal(secondResult.results.services.alreadyPresent, 15);
  assert.equal(existingService.title, "Admin-edited title");
  assert.equal(existingService.status, "draft");
  assert.equal(existingService.sortOrder, 99);
});
