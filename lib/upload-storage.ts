import path from "path";

export function getUploadsDirectory(): string {
  return path.resolve(
    process.env.UPLOAD_DIR ||
      process.env.UPLOADS_DIR ||
      path.join(process.cwd(), "uploads"),
  );
}

export function resolveUploadPath(relativePath: string): string {
  if (
    typeof relativePath !== "string" ||
    relativePath.length === 0 ||
    relativePath.includes("\0") ||
    path.isAbsolute(relativePath) ||
    relativePath.split(/[\\/]/).includes("..")
  ) {
    throw new Error("Path upload tidak valid");
  }

  const root = getUploadsDirectory();
  const target = path.resolve(root, relativePath);
  const relative = path.relative(root, target);

  if (
    !relative ||
    relative.startsWith(`..${path.sep}`) ||
    relative === ".." ||
    path.isAbsolute(relative)
  ) {
    throw new Error("Path upload tidak valid");
  }

  return target;
}

export function toUploadUrl(relativePath: string): string {
  const normalized = relativePath.split(path.sep).filter(Boolean).map(encodeURIComponent).join("/");
  return `/api/uploads/${normalized}`;
}

export function toPpdbUploadUrl(relativePath: string): string {
  const normalized = relativePath.split(path.sep).filter(Boolean).map(encodeURIComponent).join("/");
  return `/api/ppdb/file/${normalized}`;
}

export function getRelativeUploadPath(url: string): string | null {
  const pathname = url.split(/[?#]/, 1)[0];
  const prefixes = ["/api/ppdb/file/", "/api/uploads/", "/uploads/"];
  const prefix = prefixes.find((candidate) => pathname.startsWith(candidate));

  if (!prefix) return null;

  try {
    return pathname.slice(prefix.length).split("/").map(decodeURIComponent).join(path.sep);
  } catch {
    return null;
  }
}
