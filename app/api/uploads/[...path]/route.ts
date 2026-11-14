import { readFile, stat } from "fs/promises";
import path from "path";
import { resolveUploadPath } from "@/lib/upload-storage";

const contentTypes: Record<string, string> = {
  ".gif": "image/gif",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".webp": "image/webp",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path: segments } = await params;

  if (segments.some((segment) => !segment || segment === "." || segment === ".." || /[\\/\0]/.test(segment))) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const filePath = resolveUploadPath(path.join(...segments));
    const fileInfo = await stat(filePath);
    if (!fileInfo.isFile()) return new Response("Not found", { status: 404 });

    const file = await readFile(filePath);
    const contentType = contentTypes[path.extname(filePath).toLowerCase()] ?? "application/octet-stream";

    return new Response(new Uint8Array(file), {
      headers: {
        "Content-Length": String(fileInfo.size),
        "Content-Type": contentType,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
