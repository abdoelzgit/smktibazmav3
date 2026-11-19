import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import path from "node:path";
import { getRelativeUploadPath, getUploadsDirectory, resolveUploadPath, toPpdbUploadUrl } from "./upload-storage";

const originalUploadDir = process.env.UPLOAD_DIR;
const originalUploadsDir = process.env.UPLOADS_DIR;

before(() => {
  delete process.env.UPLOAD_DIR;
  delete process.env.UPLOADS_DIR;
});

after(() => {
  if (originalUploadDir === undefined) delete process.env.UPLOAD_DIR;
  else process.env.UPLOAD_DIR = originalUploadDir;

  if (originalUploadsDir === undefined) delete process.env.UPLOADS_DIR;
  else process.env.UPLOADS_DIR = originalUploadsDir;
});

test("uses UPLOAD_DIR and keeps the legacy UPLOADS_DIR fallback", () => {
  process.env.UPLOAD_DIR = "./custom-uploads";
  process.env.UPLOADS_DIR = "./legacy-uploads";
  assert.equal(getUploadsDirectory(), path.resolve("./custom-uploads"));

  delete process.env.UPLOAD_DIR;
  assert.equal(getUploadsDirectory(), path.resolve("./legacy-uploads"));
});

test("resolves a non-empty path within the upload directory", () => {
  process.env.UPLOAD_DIR = path.resolve("./uploads-test-root");
  assert.equal(
    resolveUploadPath("ppdb/user/file.pdf"),
    path.join(path.resolve("./uploads-test-root"), "ppdb", "user", "file.pdf"),
  );
});

test("maps private PPDB file URLs back to a relative storage key", () => {
  const url = toPpdbUploadUrl(path.join("ppdb", "user-1", "kk-file.pdf"));
  assert.equal(
    getRelativeUploadPath(url),
    path.join("ppdb", "user-1", "kk-file.pdf"),
  );
});

test("rejects traversal, absolute, empty, and null-byte paths", () => {
  process.env.UPLOAD_DIR = path.resolve("./uploads-test-root");

  for (const invalidPath of [
    "../etc/passwd",
    path.resolve("/abs/path"),
    "a/../../b",
    "",
    "ppdb/user\0/file.pdf",
  ]) {
    assert.throws(() => resolveUploadPath(invalidPath), /Path upload tidak valid/);
  }
});
