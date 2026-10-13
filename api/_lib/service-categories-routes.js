import { requireAdmin, sameOrigin } from "./auth.js";
import { getDb } from "./mongodb.js";

const MAX_NAME = 120;
function fail(res, status, message) { return res.status(status).json({ success: false, message }); }
function normalizeName(value) {
  if (typeof value !== "string") throw new Error("Category name is required");
  const name = value.trim().replace(/\s+/g, " ");
  if (!name || name.length > MAX_NAME) throw new Error(`Category name must be between 1 and ${MAX_NAME} characters`);
  if (/[\u0000-\u001f\u007f]/.test(name)) throw new Error("Category name contains invalid characters");
  return name;
}
function key(name) { return name.toLocaleLowerCase("en-US"); }

export function createServiceCategoriesHandler(options = {}) {
  const dbProvider = options.getDb || getDb;
  const authenticate = options.requireAdmin || requireAdmin;
  const originCheck = options.sameOrigin || sameOrigin;
  return async function handler(req, res) {
    const method = String(req.method || "GET").toUpperCase();
    if (!(await authenticate(req, res))) return;
    if (!["GET", "POST", "PUT", "DELETE"].includes(method)) {
      res.setHeader("Allow", "GET, POST, PUT, DELETE");
      return fail(res, 405, "Method not allowed");
    }
    if (method !== "GET" && !originCheck(req)) return fail(res, 403, "Forbidden");
    try {
      const db = await dbProvider();
      const categories = db.collection("service_categories");
      const services = db.collection("services");
      await categories.createIndex({ key: 1 }, { unique: true, name: "service_category_key_unique" });
      if (method === "GET") {
        const [saved, used] = await Promise.all([
          categories.find({}).sort({ name: 1 }).toArray(),
          services.distinct("category", { category: { $type: "string", $ne: "" } }),
        ]);
        const byKey = new Map();
        for (const item of saved) byKey.set(item.key, { id: String(item._id), name: item.name });
        for (const value of used) {
          const name = String(value || "").trim();
          if (name && !byKey.has(key(name))) byKey.set(key(name), { id: null, name });
        }
        return res.status(200).json({ success: true, items: [...byKey.values()].sort((a, b) => a.name.localeCompare(b.name)) });
      }
      const body = req.body && typeof req.body === "object" && !Array.isArray(req.body) ? req.body : {};
      if (method === "POST") {
        const name = normalizeName(body.name);
        const categoryKey = key(name);
        const existing = await categories.findOne({ key: categoryKey });
        if (existing) return fail(res, 409, "A category with this name already exists");
        const result = await categories.insertOne({ name, key: categoryKey, createdAt: new Date(), updatedAt: new Date() });
        return res.status(201).json({ success: true, item: { id: String(result.insertedId), name } });
      }
      const oldName = normalizeName(body.oldName);
      const oldKey = key(oldName);
      const newName = method === "PUT" ? normalizeName(body.name) : oldName;
      const existing = await categories.findOne({ key: oldKey });
      if (method === "PUT") {
        if (key(newName) !== oldKey && await categories.findOne({ key: key(newName) })) return fail(res, 409, "A category with this name already exists");
        await services.updateMany({ category: oldName }, { $set: { category: newName, updatedAt: new Date() } });
        if (existing) await categories.updateOne({ _id: existing._id }, { $set: { name: newName, key: key(newName), updatedAt: new Date() } });
        else await categories.updateOne({ key: key(newName) }, { $set: { name: newName, key: key(newName), updatedAt: new Date() } }, { upsert: true });
        return res.status(200).json({ success: true, item: { id: existing ? String(existing._id) : null, name: newName } });
      }
      const usedCount = await services.countDocuments({ category: { $regex: `^${oldName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" } });
      if (usedCount > 0) return fail(res, 409, "This category is assigned to services. Reassign those services before deleting the category.");
      if (existing) await categories.deleteOne({ _id: existing._id });
      return res.status(200).json({ success: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to manage service categories";
      if (/duplicate key/i.test(message)) return fail(res, 409, "A category with this name already exists");
      return fail(res, 400, message.slice(0, 200));
    }
  };
}
