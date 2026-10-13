import test from "node:test";
import assert from "node:assert/strict";
import { migrateManagedContent } from "../../scripts/migrate-managed-content.js";

test("repeat apply does not duplicate legacy records", async () => {
  const store = new Map();
  const clientFactory = () => ({
    connect: async () => {}, close: async () => {},
    db: () => ({ collection(name) {
      if (!store.has(name)) store.set(name, []);
      const docs = store.get(name);
      return {
        createIndex: async () => {},
        bulkWrite: async (ops) => {
          let upsertedCount = 0, matchedCount = 0;
          for (const op of ops) {
            const { filter, update } = op.updateOne;
            const doc = docs.find((item) => Object.entries(filter).every(([key, value]) => item[key] === value));
            if (doc) { Object.assign(doc, update.$set); matchedCount++; }
            else { docs.push({ ...filter, ...update.$set, ...update.$setOnInsert }); upsertedCount++; }
          }
          return { upsertedCount, matchedCount, modifiedCount: matchedCount };
        },
      };
    } }),
  });
  await migrateManagedContent({ apply: true, uri: "mongodb://example.test", clientFactory });
  const first = [...store.values()].reduce((n, docs) => n + docs.length, 0);
  const secondResult = await migrateManagedContent({ apply: true, uri: "mongodb://example.test", clientFactory });
  const second = [...store.values()].reduce((n, docs) => n + docs.length, 0);
  assert.equal(first, 56);
  assert.equal(second, first);
  assert.equal(secondResult.results.services.upserted, 0);
});
