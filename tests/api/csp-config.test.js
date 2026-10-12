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

const html = readFileSync(new URL("../../index.html", import.meta.url), "utf8");

test("CSP does not permit unsafe inline or eval scripts", () => {
  assert.ok(!directives["script-src"].includes("'unsafe-inline'"));
  assert.ok(!directives["script-src"].includes("'unsafe-eval'"));
});

test("executable tracking code is loaded from the same-origin external script", () => {
  assert.match(html, /<script src="\/tracking\.js" defer><\/script>/);
  const inlineExecutable = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)]
    .filter(([, attributes, body]) =>
      !/\bsrc\s*=/.test(attributes) &&
      !/type\s*=\s*["']application\/ld\+json["']/i.test(attributes) &&
      body.trim().length > 0
    );
  assert.equal(inlineExecutable.length, 0, "Executable inline scripts must be moved out of index.html");
});
