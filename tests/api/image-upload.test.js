import test from "node:test";
import assert from "node:assert/strict";
import { createUploadHandler, MAX_FILE_SIZE } from "../../api/admin/upload.js";
import { isAllowedImagePayload } from "../../api/_lib/image-upload.js";

const signatures = {
  "image/jpeg": Buffer.from([0xff, 0xd8, 0xff, 0x00]),
  "image/png": Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  "image/webp": Buffer.from("RIFF0000WEBP"),
  "image/gif": Buffer.from("GIF89a"),
};

function response() {
  return {
    code: 200, headers: {}, body: null,
    status(code) { this.code = code; return this; },
    json(body) { this.body = body; return this; },
    setHeader(name, value) { this.headers[name] = value; },
  };
}

function request(payload, contentType = "image/png", headers = {}) {
  return {
    method: "POST",
    headers: { host: "layali.example", origin: "https://layali.example", "content-type": contentType, ...headers },
    async *[Symbol.asyncIterator]() {
      if (Array.isArray(payload)) {
        for (const chunk of payload) yield chunk;
      } else if (payload !== null) {
        yield payload;
      }
    },
  };
}

function uploadHandler({ storeBlob = async (pathname, _buffer, options) => ({
  url: "https://images.example/" + pathname,
  pathname,
  contentType: options.contentType,
}), authenticate = async () => ({ username: "admin" }), checkSameOrigin = () => true, logger = { error() {} } } = {}) {
  return createUploadHandler({ storeBlob, authenticate, checkSameOrigin, logger });
}

test("accepts supported image signatures matching declared MIME type", () => {
  for (const [type, payload] of Object.entries(signatures)) {
    assert.equal(isAllowedImagePayload(type, payload), true, type);
  }
});

test("rejects mismatched MIME types, unsupported SVG and non-buffer payloads", () => {
  assert.equal(isAllowedImagePayload("image/png", Buffer.from("<html>bad</html>")), false);
  assert.equal(isAllowedImagePayload("image/jpeg", signatures["image/gif"]), false);
  assert.equal(isAllowedImagePayload("image/svg+xml", Buffer.from("<svg/>")), false);
  assert.equal(isAllowedImagePayload("image/png", null), false);
});

test("stores supported formats and returns a validated HTTPS URL with the storage path and declared type", async () => {
  for (const [type, payload] of Object.entries(signatures)) {
    let stored;
    const handler = uploadHandler({ storeBlob: async (pathname, buffer, options) => {
      stored = { pathname, buffer, options };
      return { url: "https://images.example/" + pathname, pathname, contentType: "image/not-trusted" };
    } });
    const res = response();
    await handler(request(payload, type), res);
    assert.equal(res.code, 201, type);
    assert.equal(res.body.success, true);
    assert.match(res.body.url, /^https:\/\//);
    assert.equal(res.body.pathname, stored.pathname);
    assert.equal(res.body.contentType, type);
    assert.deepEqual(stored.buffer, payload);
    assert.equal(stored.options.access, "public");
    assert.equal(stored.options.contentType, type);
    assert.equal(stored.options.addRandomSuffix, false);
    assert.equal(stored.options.cacheControlMaxAge, 2592000);
    assert.match(stored.pathname, /^layali-al-zahra\/content\/.+\.(jpg|png|webp|gif)$/);
  }
});

test("rejects unsupported MIME types, empty bodies and signature mismatches without storage writes", async () => {
  let writes = 0;
  const handler = uploadHandler({ storeBlob: async () => { writes++; throw new Error("must not store"); } });
  for (const [req, expected] of [
    [request(signatures["image/png"], "image/svg+xml"), 400],
    [request(null, "image/png"), 400],
    [request(Buffer.from("<script>alert(1)</script>"), "image/png"), 400],
    [request(signatures["image/gif"], "image/png"), 400],
  ]) {
    const res = response();
    await handler(req, res);
    assert.equal(res.code, expected);
    assert.equal(res.body.success, false);
  }
  assert.equal(writes, 0);
});

test("enforces the 4 MiB limit from actual streamed bytes and declared content length", async () => {
  let writes = 0;
  const handler = uploadHandler({ storeBlob: async () => { writes++; return { url: "https://images.example/file.png" }; } });
  const exactLimit = Buffer.concat([signatures["image/png"], Buffer.alloc(MAX_FILE_SIZE - signatures["image/png"].length)]);
  const accepted = response();
  await handler(request(exactLimit, "image/png", { "content-length": String(MAX_FILE_SIZE) }), accepted);
  assert.equal(accepted.code, 201);

  const tooLarge = response();
  await handler(request([signatures["image/png"], Buffer.alloc(MAX_FILE_SIZE - signatures["image/png"].length + 1)], "image/png"), tooLarge);
  assert.equal(tooLarge.code, 413);

  const declaredTooLarge = response();
  await handler(request(null, "image/png", { "content-length": String(MAX_FILE_SIZE + 1) }), declaredTooLarge);
  assert.equal(declaredTooLarge.code, 413);
  assert.equal(writes, 1, "only the exact-limit valid image should be stored");
});

test("rejects malformed content length and non-byte stream chunks safely", async () => {
  const handler = uploadHandler();
  const badLength = response();
  await handler(request(signatures["image/png"], "image/png", { "content-length": "2x" }), badLength);
  assert.equal(badLength.code, 400);

  const badChunk = response();
  const req = { ...request(null), async *[Symbol.asyncIterator]() { yield "not bytes"; } };
  await handler(req, badChunk);
  assert.equal(badChunk.code, 400);
});

test("storage failures and stream failures return generic errors without exposing provider details", async () => {
  let loggedArgs;
  const logger = { error: (...args) => { loggedArgs = args; } };
  const handler = uploadHandler({
    storeBlob: async () => { throw new Error("secret-token-in-provider-error"); },
    logger,
  });
  const storageError = response();
  await handler(request(signatures["image/png"]), storageError);
  assert.equal(storageError.code, 503);
  assert.doesNotMatch(JSON.stringify(storageError.body), /secret-token/);
  assert.deepEqual(loggedArgs, ["Admin image upload failed"]);

  const brokenRequest = {
    ...request(null),
    async *[Symbol.asyncIterator]() { throw new Error("sensitive stream error"); },
  };
  const streamError = response();
  await uploadHandler({ logger })(brokenRequest, streamError);
  assert.equal(streamError.code, 503);
  assert.doesNotMatch(JSON.stringify(streamError.body), /sensitive stream error/);
});

test("rejects malformed or non-HTTPS storage URLs and does not return them to the caller", async () => {
  for (const url of ["http://images.example/file.png", "not-a-url", "https://user:pass@images.example/file.png", undefined]) {
    const res = response();
    await uploadHandler({ storeBlob: async () => ({ url, pathname: "file.png" }) })(request(signatures["image/png"]), res);
    assert.equal(res.code, 503, String(url));
    assert.equal(res.body.success, false);
    assert.equal("url" in res.body, false);
  }
});

test("authentication and origin failures stop before reading or storing upload data", async () => {
  let writes = 0;
  let reads = 0;
  const req = {
    ...request(signatures["image/png"]),
    async *[Symbol.asyncIterator]() { reads++; yield signatures["image/png"]; },
  };
  const unauthenticated = response();
  await uploadHandler({ authenticate: async (_req, res) => { res.status(401).json({ success: false }); return null; }, storeBlob: async () => { writes++; } })(req, unauthenticated);
  assert.equal(unauthenticated.code, 401);
  assert.equal(reads, 0);

  const crossOrigin = response();
  await uploadHandler({ checkSameOrigin: () => false, storeBlob: async () => { writes++; } })(req, crossOrigin);
  assert.equal(crossOrigin.code, 403);
  assert.equal(reads, 0);
  assert.equal(writes, 0);
});
