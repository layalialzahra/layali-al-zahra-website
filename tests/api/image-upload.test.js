import test from "node:test";
import assert from "node:assert/strict";
import { isAllowedImagePayload } from "../../api/_lib/image-upload.js";

test("accepts supported image signatures matching declared MIME type", () => {
  assert.equal(isAllowedImagePayload("image/jpeg", Buffer.from([0xff, 0xd8, 0xff, 0x00])), true);
  assert.equal(isAllowedImagePayload("image/png", Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])), true);
  assert.equal(isAllowedImagePayload("image/webp", Buffer.from("RIFF0000WEBP")), true);
  assert.equal(isAllowedImagePayload("image/gif", Buffer.from("GIF89a")), true);
});

test("rejects mismatched MIME types and unsupported payloads", () => {
  assert.equal(isAllowedImagePayload("image/png", Buffer.from("<html>bad</html>")), false);
  assert.equal(isAllowedImagePayload("image/jpeg", Buffer.from("GIF89a")), false);
  assert.equal(isAllowedImagePayload("image/svg+xml", Buffer.from("<svg/>")), false);
  assert.equal(isAllowedImagePayload("image/png", null), false);
});
