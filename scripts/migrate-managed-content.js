import { MongoClient } from "mongodb";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { normalizeManagedSlug, validateServiceInput, validateOfferInput, validatePackageInput, validateFaqInput } from "../api/_lib/managed-content.js";
import { legacyServicesData } from "../src/data/legacy-services.js";
import { legacyOffersData } from "../src/data/legacy-offers.js";
import { legacyPackagesData } from "../src/data/legacy-packages.js";
import { legacyFaqs } from "../src/data/legacy-faqs.js";

const BOOKING_URL = "https://store.zylu.co/business/layali-al-zahra-beauty-salon-llc/services";
const COLLECTIONS = ["services", "offers", "packages", "faqs"];

export function buildManagedContentRecords() {
  const services = legacyServicesData.map((source, sortOrder) => validateServiceInput({
    slug: source.id,
    title: source.title,
    description: "",
    imageUrl: source.image,
    imageAlt: source.title,
    category: source.category || "",
    subservices: source.subservices.map((item, index) => ({
      id: `${normalizeManagedSlug(item.name)}-${index + 1}`,
      name: item.name,
      price: item.price,
    })),
    sortOrder,
    status: "published",
  }));
  const offers = legacyOffersData.map((source, sortOrder) => {
    const validityLabel = String(source.validUntil || "");
    const validityType = validityLabel.startsWith("Every ") ? "recurring" : "label";
    return validateOfferInput({
      slug: normalizeManagedSlug(source.title),
      title: source.title,
      description: source.description,
      priceLabel: source.badge,
      imageUrl: source.image,
      imageAlt: source.title,
      validityType,
      validityLabel,
      bookingUrl: BOOKING_URL,
      sortOrder,
      status: "published",
    });
  });
  const packages = legacyPackagesData.map((source, sortOrder) => validatePackageInput({
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
  }));
  const faqs = Object.entries(legacyFaqs).flatMap(([pageKey, items]) =>
    items.map((source, sortOrder) => validateFaqInput({
      pageKey,
      question: source.q,
      answer: source.a,
      sortOrder,
      status: "published",
    })),
  );
  return { services, offers, packages, faqs };
}

function recordFilter(collectionName, record) {
  if (collectionName === "faqs") return { pageKey: record.pageKey, question: record.question };
  return { slug: record.slug };
}

export async function migrateManagedContent({
  apply = false,
  uri = process.env.MONGODB_URI,
  dbName = process.env.MONGODB_DB_NAME || "layalialzahra",
  clientFactory = (connectionString) => new MongoClient(connectionString, { serverSelectionTimeoutMS: 5000 }),
  collections = COLLECTIONS,
} = {}) {
  const allowedCollections = [...new Set(collections)];
  if (allowedCollections.some((name) => !COLLECTIONS.includes(name))) throw new Error("Invalid managed content collection");
  const records = buildManagedContentRecords();
  const counts = Object.fromEntries(allowedCollections.map((name) => [name, records[name].length]));
  if (!apply) return { applied: false, counts };
  if (!uri) throw new Error("MONGODB_URI is required for --apply");

  const client = clientFactory(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    const results = {};
    for (const name of allowedCollections) {
      const collection = db.collection(name);
      if (name === "faqs") {
        await collection.createIndex({ pageKey: 1, question: 1 }, { unique: true, name: "page_question_unique" });
      } else {
        await collection.createIndex({ slug: 1 }, { unique: true, name: "slug_unique" });
      }
      await collection.createIndex({ status: 1, sortOrder: 1, createdAt: 1 }, { name: "managed_content_order" });
      const now = new Date();
      const operations = records[name].map((record) => {
        const { createdAt: _createdAt, ...fields } = record;
        return {
          updateOne: {
            filter: recordFilter(name, record),
            // Seed only missing records. Never replace content an admin has edited,
            // unpublished or reordered on a previous run.
            update: { $setOnInsert: { ...fields, createdAt: now, updatedAt: now } },
            upsert: true,
          },
        };
      });
      const result = await collection.bulkWrite(operations, { ordered: false });
      results[name] = {
        inserted: result.upsertedCount || 0,
        alreadyPresent: result.matchedCount || 0,
        modified: result.modifiedCount || 0,
      };
    }
    return { applied: true, counts, results };
  } finally {
    await client.close();
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const apply = process.argv.includes("--apply");
  migrateManagedContent({ apply })
    .then((result) => console.log(JSON.stringify({ mode: apply ? "apply" : "dry-run", ...result }, null, 2)))
    .catch((error) => {
      console.error(error.message);
      process.exitCode = 1;
    });
}
