import path from "path";

export function getUploadsDirectory(): string {
  return path.resolve(process.env.UPLOADS_DIR || path.join(process.cwd(), "uploads"));
}

export function resolveUploadPath(relativePath: string): string {
  const root = getUploadsDirectory();
  const target = path.resolve(root, relativePath);
  const relative = path.relative(root, target);

  if (!relative || relative.startsWith(`..${path.sep}`) || relative === ".." || path.isAbsolute(relative)) {
    throw new Error("Path upload tidak valid");
  }

  return target;
}

export function toUploadUrl(relativePath: string): string {
  const normalized = relativePath.split(path.sep).filter(Boolean).map(encodeURIComponent).join("/");
  return `/api/uploads/${normalized}`;
}

export function getRelativeUploadPath(url: string): string | null {
  const pathname = url.split(/[?#]/, 1)[0];
  const prefix = pathname.startsWith("/api/uploads/")
    ? "/api/uploads/"
    : pathname.startsWith("/uploads/")
      ? "/uploads/"
      : null;

  if (!prefix) return null;

  try {
    return pathname.slice(prefix.length).split("/").map(decodeURIComponent).join(path.sep);
  } catch {
    return null;
  }
}
