import crypto from "node:crypto";
import { getDb } from "../../_lib/mongodb.js";

const COOKIE_NAME = "layali_admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 8;
const SCRYPT = { N: 16384, r: 8, p: 1, keyLength: 64 };

function base64url(value) { return Buffer.from(value).toString("base64url"); }
function fromBase64url(value) { return Buffer.from(value, "base64url"); }
function getSessionSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32) throw new Error("ADMIN_SESSION_SECRET is not configured securely");
  return secret;
}
export function hashPassword(password) {
  if (typeof password !== "string" || password.length < 12) throw new Error("Password must be at least 12 characters");
  const salt = crypto.randomBytes(16);
  const derived = crypto.scryptSync(password, salt, SCRYPT.keyLength, { N: SCRYPT.N, r: SCRYPT.r, p: SCRYPT.p, maxmem: 32 * 1024 * 1024 });
  return `scrypt$${SCRYPT.N}$${SCRYPT.r}$${SCRYPT.p}$${salt.toString("base64url")}$${derived.toString("base64url")}`;
}
export function verifyPassword(password, stored) {
  try {
    const [algorithm, n, r, p, saltValue, hashValue] = String(stored).split("$");
    if (algorithm !== "scrypt") return false;
    const salt = Buffer.from(saltValue, "base64url");
    const expected = Buffer.from(hashValue, "base64url");
    const actual = crypto.scryptSync(password, salt, expected.length, { N: Number(n), r: Number(r), p: Number(p), maxmem: 32 * 1024 * 1024 });
    return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
  } catch { return false; }
}
function sign(payload) {
  const body = base64url(JSON.stringify(payload));
  const signature = crypto.createHmac("sha256", getSessionSecret()).update(body).digest("base64url");
  return `${body}.${signature}`;
}
function verify(token) {
  try {
    const [body, signature] = String(token).split(".");
    if (!body || !signature) return null;
    const expected = crypto.createHmac("sha256", getSessionSecret()).update(body).digest("base64url");
    const a = Buffer.from(signature); const b = Buffer.from(expected);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
    const payload = JSON.parse(fromBase64url(body).toString("utf8"));
    if (!payload?.sub || !payload?.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch { return null; }
}
function parseCookies(req) {
  const header = req.headers?.cookie || "";
  return Object.fromEntries(header.split(";").filter(Boolean).map((part) => {
    const index = part.indexOf("=");
    return [part.slice(0, index).trim(), decodeURIComponent(part.slice(index + 1).trim())];
  }));
}
export function getSession(req) {
  const token = parseCookies(req)[COOKIE_NAME];
  return token ? verify(token) : null;
}
export function setSession(res, admin) {
  const now = Math.floor(Date.now() / 1000);
  const token = sign({ sub: String(admin._id), username: admin.username, iat: now, exp: now + SESSION_TTL_SECONDS });
  res.setHeader("Set-Cookie", `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_TTL_SECONDS}; ${process.env.NODE_ENV === "production" ? "Secure; " : ""}`);
}
export function clearSession(res) {
  res.setHeader("Set-Cookie", `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; ${process.env.NODE_ENV === "production" ? "Secure; " : ""}`);
}
export function requireAdmin(req, res) {
  const session = getSession(req);
  if (!session) { res.status(401).json({ success: false, message: "Authentication required" }); return null; }
  return session;
}
export function sameOrigin(req) {
  const origin = req.headers?.origin;
  if (!origin) return true;
  const host = req.headers?.host;
  const protocol = req.headers?.["x-forwarded-proto"] || (process.env.NODE_ENV === "production" ? "https" : "http");
  return origin === `${protocol}://${host}`;
}
export async function adminExists() {
  const db = await getDb();
  return (await db.collection("admins").countDocuments({}, { limit: 1 })) > 0;
}
export async function findAdmin(username) {
  const db = await getDb();
  return db.collection("admins").findOne({ username: String(username).trim().toLowerCase() });
}
