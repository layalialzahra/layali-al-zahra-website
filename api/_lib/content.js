import { ObjectId } from "mongodb";
import { getDb } from "./mongodb.js";

const CONTENT_TYPES = new Set(["blog", "tip", "news"]);
const DEFAULT_CATEGORIES = [
  "Hair Care", "Hair Treatments", "Hair Colour", "Hair Extensions",
  "Skincare", "Nails", "Brows & Lashes", "Waxing",
  "Dubai Beauty", "UAE Beauty", "Seasonal", "Events",
  "News", "Offers", "Announcements",
];

let indexesPromise;
export function normalizeSlug(value) {
  return String(value || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 160);
}
export function normalizeTags(value) {
  const source = Array.isArray(value) ? value : String(value || "").split(",");
  return [...new Set(source.map((tag) => String(tag).trim().toLowerCase()).filter(Boolean))].slice(0, 30);
}
export function sanitizeBody(value) {
  return String(value || "")
    .replace(/<\s*(script|style|iframe|object|embed)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, "")
    .replace(/\son\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/\s(href|src)\s*=\s*(["'])\s*javascript:[\s\S]*?\2/gi, " $1=\2#\2");
}
export async function ensureContentIndexes() {
  if (!indexesPromise) {
    indexesPromise = (async () => {
      const db = await getDb();
      const collection = db.collection("content");
      const indexes = [
        [{ type: 1, slug: 1 }, { unique: true, name: "type_slug_unique" }],
        [{ type: 1, status: 1, publishDate: -1 }, { name: "published_feed" }],
        [{ category: 1, status: 1, publishDate: -1 }, { name: "category_feed" }],
        [{ updatedAt: -1 }, { name: "updated_at" }],
      ];
      for (const [keys, options] of indexes) {
        try {
          await collection.createIndex(keys, options);
        } catch (error) {
          // Index creation must not take the CMS offline. CRUD also performs
          // an application-level type/slug collision check below.
          console.error("Content index initialization warning", { name: options.name, code: error?.code, message: error?.message });
        }
      }
    })().catch((error) => {
      indexesPromise = undefined;
      throw error;
    });
  }
  await indexesPromise;
}
export async function assertUniqueContentSlug(collection, type, slug, excludeId = null) {
  const filter = { type, slug };
  if (excludeId) filter._id = { $ne: excludeId };
  const existing = await collection.findOne(filter, { projection: { _id: 1 } });
  if (existing) throw Object.assign(new Error("A content item with this type and slug already exists"), { code: 11000 });
}
export function validateContentInput(input, partial = false) {
  const data = input || {};
  const result = {};
  if (!partial || data.type !== undefined) {
    const type = String(data.type || "").trim().toLowerCase();
    if (!CONTENT_TYPES.has(type)) throw new Error("Invalid content type");
    result.type = type;
  }
  if (!partial || data.title !== undefined) {
    const title = String(data.title || "").trim();
    if (!title || title.length > 180) throw new Error("Title is required and must be 180 characters or fewer");
    result.title = title;
  }
  if (!partial || data.slug !== undefined) {
    const slug = normalizeSlug(data.slug || data.title);
    if (!slug) throw new Error("A valid slug is required");
    result.slug = slug;
  }
  for (const field of ["excerpt", "altText", "author", "relatedService", "seoTitle", "metaDescription", "socialImage"]) {
    if (data[field] !== undefined) result[field] = String(data[field] || "").trim().slice(0, field === "metaDescription" ? 320 : 500);
  }
  if (data.body !== undefined) result.body = sanitizeBody(data.body);
  if (data.featuredImage !== undefined) result.featuredImage = String(data.featuredImage || "").trim().slice(0, 2000);
  if (data.category !== undefined) result.category = String(data.category || "").trim().slice(0, 100);
  if (data.tags !== undefined) result.tags = normalizeTags(data.tags);
  if (data.status !== undefined) {
    const status = String(data.status).trim().toLowerCase();
    if (!["draft", "published"].includes(status)) throw new Error("Invalid content status");
    result.status = status;
  }
  if (data.publishDate !== undefined) {
    if (data.publishDate === null || data.publishDate === "") result.publishDate = null;
    else {
      const date = new Date(data.publishDate);
      if (Number.isNaN(date.getTime())) throw new Error("Invalid publish date");
      result.publishDate = date;
    }
  }
  for (let i = 1; i <= 5; i += 1) {
    const field = `tip${i}`;
    if (data[field] !== undefined) result[field] = String(data[field] || "").trim().slice(0, 1000);
  }
  return result;
}
export function serializeContent(doc) {
  return { ...doc, _id: String(doc._id), createdAt: doc.createdAt?.toISOString?.() || doc.createdAt, updatedAt: doc.updatedAt?.toISOString?.() || doc.updatedAt, publishDate: doc.publishDate?.toISOString?.() || doc.publishDate };
}
export function toObjectId(value) {
  return ObjectId.isValid(String(value)) ? new ObjectId(String(value)) : null;
}
export { CONTENT_TYPES, DEFAULT_CATEGORIES };
