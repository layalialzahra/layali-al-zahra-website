import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import test from "node:test";
import sanitizeHtml from "sanitize-html";

test("sanitize-html loads through the project's ESM runtime and strips unsafe markup", () => {
  assert.equal(typeof sanitizeHtml, "function");
  const output = sanitizeHtml('<script>alert(1)</script><b>safe</b><img src=x onerror="alert(2)">');
  assert.doesNotMatch(output, /<script|onerror/i);
  assert.match(output, /<b>safe<\/b>/);
});

test("missing MongoDB configuration does not crash module initialization", () => {
  const result = spawnSync(process.execPath, [
    "--input-type=module",
    "-e",
    "delete process.env.MONGODB_URI; const db = await import('./api/_lib/mongodb.js'); try { await db.getMongoClient(); process.exitCode = 2; } catch (error) { if (error.message !== 'MONGODB_URI is not configured') throw error; }",
  ], { encoding: "utf8", env: { ...process.env, MONGODB_URI: "" } });
  assert.equal(result.status, 0, result.stderr || result.stdout);
});
