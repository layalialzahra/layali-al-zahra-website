import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const config = JSON.parse(readFileSync(new URL("../../vercel.json", import.meta.url), "utf8"));
const cspHeader = config.headers
  .flatMap((entry) => entry.headers || [])
  .find((header) => header.key.toLowerCase() === "content-security-policy");
assert.ok(cspHeader, "Content-Security-Policy header must be configured");
const directives = Object.fromEntries(
  cspHeader.value.split(";").map((part) => {
    const [name, ...values] = part.trim().split(/\s+/);
    return [name, values];
  }),
);

test("CSP explicitly permits the existing Meta Pixel script and request origins", () => {
  assert.ok(directives["script-src"].includes("https://connect.facebook.net"));
  assert.ok(directives["img-src"].includes("https://www.facebook.com"));
  assert.ok(directives["connect-src"].includes("https://connect.facebook.net"));
  assert.ok(directives["connect-src"].includes("https://www.facebook.com"));
});
