const STATUSES = new Set(["draft", "published"]);
const PAGE_KEYS = new Set(["services", "offers", "packages"]);
const VALIDITY_TYPES = new Set(["date-range", "recurring", "label"]);
const PUBLIC_FIELDS = {
  service: ["_id", "title", "slug", "description", "imageUrl", "imageAlt", "subservices", "category", "sortOrder"],
  offer: ["_id", "title", "slug", "description", "priceLabel", "badgeText", "imageUrl", "imageAlt", "validityType", "validFrom", "validUntil", "validityLabel", "bookingUrl", "sortOrder"],
  package: ["_id", "title", "slug", "description", "priceLabel", "category", "imageUrl", "imageAlt", "includedItems", "bookingUrl", "sortOrder"],
  faq: ["_id", "pageKey", "question", "answer", "sortOrder"],
};
const ALL_FIELDS = {
  service: [...PUBLIC_FIELDS.service, "status", "seoTitle", "metaDescription", "createdAt", "updatedAt"],
  offer: [...PUBLIC_FIELDS.offer, "status", "seoTitle", "metaDescription", "createdAt", "updatedAt"],
  package: [...PUBLIC_FIELDS.package, "status", "seoTitle", "metaDescription", "createdAt", "updatedAt"],
  faq: [...PUBLIC_FIELDS.faq, "status", "createdAt", "updatedAt"],
};

export function normalizeManagedSlug(value) {
  return String(value || "").trim().toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 160);
}
function text(value, field, max = 500, required = false) {
  const result = String(value ?? "").trim();
  if (required && !result) throw new Error(`${field} is required`);
  if (result.length > max) throw new Error(`${field} must be ${max} characters or fewer`);
  return result;
}
function slugValue(data, result, partial) {
  if (partial && data.slug === undefined) return;
  const slug = normalizeManagedSlug(data.slug || (!partial ? data.title : ""));
  if (!slug) throw new Error("A valid slug is required");
  result.slug = slug;
}
function finiteSortOrder(value) {
  if (value === null || typeof value === "boolean" || (typeof value === "string" && !value.trim())) {
    throw new Error("Sort order must be a finite number");
  }
  const sortOrder = Number(value);
  if (!Number.isFinite(sortOrder)) throw new Error("Sort order must be a finite number");
  return sortOrder;
}
function common(data, partial, result) {
  if (!partial || data.title !== undefined) result.title = text(data.title, "Title", 180, true);
  slugValue(data, result, partial);
  for (const [field, max] of [["description", 4000], ["seoTitle", 180], ["metaDescription", 320]]) {
    if (data[field] !== undefined) result[field] = text(data[field], field, max);
  }
  if (data.status !== undefined || !partial) {
    const status = String(data.status || "draft").trim().toLowerCase();
    if (!STATUSES.has(status)) throw new Error("Invalid content status");
    result.status = status;
  }
  if (data.sortOrder !== undefined || !partial) {
    result.sortOrder = data.sortOrder === undefined ? 0 : finiteSortOrder(data.sortOrder);
  }
}
function safeUrl(value, field, { required = false } = {}) {
  const result = text(value, field, 2000, required);
  if (!result) return result;
  if (/^[\u0000-\u0020]|[\\]/.test(result) || result.startsWith("//")) throw new Error(`${field} is invalid`);
  if (result.startsWith("/")) return result;
  let parsed;
  try { parsed = new URL(result); } catch { throw new Error(`${field} must be a safe HTTPS URL or site path`); }
  if (parsed.protocol !== "https:") throw new Error(`${field} must use HTTPS`);
  return result;
}
function imageFields(data, result) {
  if (data.imageUrl !== undefined) result.imageUrl = safeUrl(data.imageUrl, "Image URL");
  if (data.imageAlt !== undefined) result.imageAlt = text(data.imageAlt, "Image alt text", 300);
}
function dateOnly(value, field) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error(`${field} must be a valid date (YYYY-MM-DD)`);
  const parsed = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) throw new Error(`${field} must be a valid date (YYYY-MM-DD)`);
  return value;
}
function serviceSubservices(value) {
  if (!Array.isArray(value) || value.length > 300) throw new Error("Subservices must be an array of 300 items or fewer");
  const seen = new Set();
  return value.map((entry) => {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) throw new Error("Each subservice must be an object");
    const name = text(entry.name, "Subservice name", 180, true);
    const id = normalizeManagedSlug(entry.id || name);
    if (!id || seen.has(id)) throw new Error("Subservice IDs must be unique and valid");
    seen.add(id);
    const item = { id, name, price: text(entry.price, "Subservice price", 100, true) };
    if (entry.description !== undefined) item.description = text(entry.description, "Subservice description", 1000);
    if (entry.bookingUrl !== undefined) item.bookingUrl = safeUrl(entry.bookingUrl, "Subservice booking URL");
    return item;
  });
}
export function validateServiceInput(input, partial = false) {
  const data = input || {};
  const result = {};
  common(data, partial, result);
  for (const field of ["imageUrl", "imageAlt"]) if (data[field] !== undefined) imageFields({ [field]: data[field] }, result);
  if (data.category !== undefined) result.category = text(data.category, "Category", 120);
  if (data.subservices !== undefined) result.subservices = serviceSubservices(data.subservices);
  return result;
}
export function validateOfferInput(input, partial = false) {
  const data = input || {};
  const result = {};
  common(data, partial, result);
  imageFields(data, result);
  if (data.priceLabel !== undefined) result.priceLabel = text(data.priceLabel, "Price label", 120);
  if (data.badgeText !== undefined) result.badgeText = text(data.badgeText, "Badge text", 120);
  if (data.bookingUrl !== undefined) result.bookingUrl = safeUrl(data.bookingUrl, "Booking URL");
  if (data.validityType !== undefined || !partial) {
    const type = String(data.validityType || "").trim().toLowerCase();
    if (!VALIDITY_TYPES.has(type)) throw new Error("Invalid offer validity type");
    result.validityType = type;
  }
  for (const field of ["validFrom", "validUntil"]) {
    if (data[field] !== undefined) result[field] = data[field] === null || data[field] === "" ? null : dateOnly(data[field], field);
  }
  if (data.validityLabel !== undefined) result.validityLabel = text(data.validityLabel, "Validity label", 180);
  if (!partial) {
    if (!result.priceLabel && !result.badgeText) throw new Error("Price label or badge text is required");
    if (result.validityType === "date-range") {
      if (!result.validFrom || !result.validUntil) throw new Error("Date-range offers require validFrom and validUntil");
      if (result.validFrom > result.validUntil) throw new Error("validFrom must not be after validUntil");
    } else if (!result.validityLabel) {
      throw new Error("Validity label is required for recurring or descriptive offers");
    }
  } else if (result.validFrom && result.validUntil && result.validFrom > result.validUntil) {
    throw new Error("validFrom must not be after validUntil");
  }
  return result;
}
export function validatePackageInput(input, partial = false) {
  const data = input || {};
  const result = {};
  common(data, partial, result);
  imageFields(data, result);
  if (data.priceLabel !== undefined || !partial) result.priceLabel = text(data.priceLabel, "Price label", 120, true);
  if (data.category !== undefined) result.category = text(data.category, "Category", 120);
  if (data.bookingUrl !== undefined) result.bookingUrl = safeUrl(data.bookingUrl, "Booking URL");
  if (data.includedItems !== undefined) {
    if (!Array.isArray(data.includedItems) || data.includedItems.length > 100) throw new Error("Included items must be an array of 100 items or fewer");
    result.includedItems = data.includedItems.map((item) => text(item, "Included item", 300, true));
  }
  return result;
}
export function validateFaqInput(input, partial = false) {
  const data = input || {};
  const result = {};
  if (data.pageKey !== undefined || !partial) {
    const pageKey = String(data.pageKey || "").trim().toLowerCase();
    if (!PAGE_KEYS.has(pageKey)) throw new Error("Invalid FAQ page key");
    result.pageKey = pageKey;
  }
  if (data.question !== undefined || !partial) result.question = text(data.question, "Question", 300, true);
  if (data.answer !== undefined || !partial) result.answer = text(data.answer, "Answer", 5000, true);
  if (data.status !== undefined || !partial) {
    const status = String(data.status || "draft").trim().toLowerCase();
    if (!STATUSES.has(status)) throw new Error("Invalid content status");
    result.status = status;
  }
  if (data.sortOrder !== undefined || !partial) {
    result.sortOrder = data.sortOrder === undefined ? 0 : finiteSortOrder(data.sortOrder);
  }
  return result;
}
export function serializeManagedItem(type, doc, { publicOnly = false } = {}) {
  const fields = publicOnly ? PUBLIC_FIELDS[type] : ALL_FIELDS[type];
  if (!fields) throw new Error("Invalid managed content type");
  const output = {};
  for (const field of fields) {
    if (doc?.[field] === undefined) continue;
    const value = doc[field];
    if (field === "_id") output[field] = String(value);
    else if (["createdAt", "updatedAt"].includes(field)) output[field] = value?.toISOString?.() || value;
    else output[field] = value;
  }
  return output;
}
