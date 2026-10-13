import test from "node:test";
import assert from "node:assert/strict";
import { validateOfferInput } from "../../api/_lib/managed-content.js";
import { createManagedContentHandler } from "../../api/_lib/managed-content-routes.js";

const OFFER_ID = "aaaaaaaaaaaaaaaaaaaaaaaa";

function response() {
  return {
    code: 200, headers: {}, body: null,
    status(code) { this.code = code; return this; },
    json(body) { this.body = body; return this; },
    setHeader(name, value) { this.headers[name] = value; },
  };
}
function matches(doc, filter = {}) {
  return Object.entries(filter).every(([key, value]) => {
    if (value && typeof value === "object" && "$ne" in value) return String(doc[key]) !== String(value.$ne);
    return String(doc[key]) === String(value);
  });
}
function makeDatabase(initial = []) {
  const docs = initial.map((doc) => ({ ...doc }));
  const collection = {
    createIndex: async () => "ok",
    findOne: async (filter) => docs.find((doc) => matches(doc, filter)) || null,
    insertOne: async (doc) => { const stored = { ...doc, _id: OFFER_ID }; docs.push(stored); return { insertedId: OFFER_ID }; },
    find: (filter) => {
      const items = docs.filter((doc) => matches(doc, filter));
      return { sort() { return { skip() { return { limit() { return { toArray: async () => items }; } }; }, toArray: async () => items }; } };
    },
    countDocuments: async (filter) => docs.filter((doc) => matches(doc, filter)).length,
    findOneAndUpdate: async (filter, update) => {
      const doc = docs.find((item) => matches(item, filter));
      if (!doc) return null;
      Object.assign(doc, update.$set);
      return doc;
    },
    deleteOne: async (filter) => {
      const index = docs.findIndex((doc) => matches(doc, filter));
      if (index < 0) return { deletedCount: 0 };
      docs.splice(index, 1);
      return { deletedCount: 1 };
    },
  };
  return { db: { collection: () => collection }, docs };
}
function adminHandler(store) {
  return createManagedContentHandler("offer", {
    admin: true,
    requireAdmin: () => ({ username: "tester" }),
    sameOrigin: () => true,
    getDb: async () => store.db,
  });
}
function publicHandler(store) {
  return createManagedContentHandler("offer", { getDb: async () => store.db });
}

test("offer price labels remain exact display strings, including decimal prices and From labels", () => {
  assert.equal(validateOfferInput({
    title: "Massage", priceLabel: "AED 178.50", validityType: "label", validityLabel: "Midday Special",
  }).priceLabel, "AED 178.50");
  assert.equal(validateOfferInput({
    title: "Hair Styling", priceLabel: "From AED 99", validityType: "recurring", validityLabel: "Every Monday",
  }).priceLabel, "From AED 99");
});

test("recurring and descriptive validity labels are preserved without inferred dates", () => {
  const recurring = validateOfferInput({
    title: "Monday Offer", priceLabel: "AED 105", validityType: "recurring", validityLabel: "Every Monday",
  });
  const descriptive = validateOfferInput({
    title: "Midday Offer", priceLabel: "AED 178.50", validityType: "label", validityLabel: "Midday Special",
    validFrom: "2026-12-01", validUntil: "2026-12-31",
  });
  assert.equal(recurring.validityLabel, "Every Monday");
  assert.equal(descriptive.validityLabel, "Midday Special");
  assert.equal(recurring.validFrom, null);
  assert.equal(recurring.validUntil, null);
  assert.equal(descriptive.validFrom, null);
  assert.equal(descriptive.validUntil, null);
});

test("date-bound offers accept an inclusive same-day boundary and valid leap day", () => {
  const offer = validateOfferInput({
    title: "Single Day Offer", priceLabel: "From", validityType: "date-range",
    validFrom: "2028-02-29", validUntil: "2028-02-29",
  });
  assert.equal(offer.validFrom, "2028-02-29");
  assert.equal(offer.validUntil, "2028-02-29");
});

test("date-bound offers reject reversed, impossible and non-ISO dates", () => {
  const base = { title: "Date Offer", priceLabel: "AED 99", validityType: "date-range" };
  assert.throws(() => validateOfferInput({ ...base, validFrom: "2026-12-31", validUntil: "2026-12-01" }), /must not be after/i);
  assert.throws(() => validateOfferInput({ ...base, validFrom: "2026-02-29", validUntil: "2026-03-01" }), /valid date/i);
  assert.throws(() => validateOfferInput({ ...base, validFrom: "2026-2-01", validUntil: "2026-03-01" }), /YYYY-MM-DD/i);
  assert.throws(() => validateOfferInput({ ...base, validFrom: "2026-01-01" }), /require validFrom and validUntil/i);
});

test("offer CRUD and publication preserve labels and expose only published records", async () => {
  const store = makeDatabase();
  const admin = adminHandler(store);
  const publicRead = publicHandler(store);
  const created = response();
  await admin({ method: "POST", query: {}, headers: {}, body: {
    title: "Leap Day Offer", slug: "leap-day-offer", priceLabel: "AED 99.75",
    validityType: "date-range", validFrom: "2028-02-29", validUntil: "2028-02-29", status: "published",
  } }, created);
  assert.equal(created.code, 201);
  assert.equal(created.body.item.priceLabel, "AED 99.75");
  assert.equal(created.body.item.status, "published");

  const publicBefore = response();
  await publicRead({ method: "GET", query: {}, headers: {} }, publicBefore);
  assert.equal(publicBefore.code, 200);
  assert.equal(publicBefore.body.items.length, 1);
  assert.equal(publicBefore.body.items[0].validFrom, "2028-02-29");

  const edit = response();
  await admin({ method: "PUT", query: { id: OFFER_ID }, headers: {}, body: { priceLabel: "From AED 99.75", status: "draft" } }, edit);
  assert.equal(edit.code, 200);
  assert.equal(edit.body.item.priceLabel, "From AED 99.75");
  assert.equal(edit.body.item.validUntil, "2028-02-29");

  const publicDraft = response();
  await publicRead({ method: "GET", query: {}, headers: {} }, publicDraft);
  assert.equal(publicDraft.body.items.length, 0);

  const publish = response();
  await admin({ method: "PUT", query: { id: OFFER_ID }, headers: {}, body: { status: "published" } }, publish);
  assert.equal(publish.code, 200);
  assert.equal(publish.body.item.status, "published");

  const changeValidity = response();
  await admin({ method: "PUT", query: { id: OFFER_ID }, headers: {}, body: {
    validityType: "recurring", validityLabel: "Every Monday",
  } }, changeValidity);
  assert.equal(changeValidity.code, 200);
  assert.equal(changeValidity.body.item.validityLabel, "Every Monday");
  assert.equal(changeValidity.body.item.validFrom, null);
  assert.equal(changeValidity.body.item.validUntil, null);

  const remove = response();
  await admin({ method: "DELETE", query: { id: OFFER_ID }, headers: {} }, remove);
  assert.equal(remove.code, 200);
  assert.equal(store.docs.length, 0);
});
