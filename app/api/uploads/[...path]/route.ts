import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import { getAuthenticatedUserFromToken } from "@/lib/server-auth";
import { resolveUploadPath } from "@/lib/upload-storage";

export const runtime = "nodejs";

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

  if (segments.length === 0 || segments.some((segment) => !segment || segment === "." || segment === ".." || /[\\/\0]/.test(segment))) {
    return new Response("Not found", { status: 404 });
  }

  const relativePath = path.join(...segments);
  if (segments[0] === "ppdb") {
    const user = await getAuthenticatedUserFromToken();
    if (!user) return new Response("Tidak terautentikasi", { status: 401 });
    const ownerPrefix = `${path.join("ppdb", user.userId)}${path.sep}`;
    if (user.role !== "ADMIN" && !relativePath.startsWith(ownerPrefix)) {
      return new Response("Akses ditolak", { status: 403 });
    }
  }

  try {
    const filePath = resolveUploadPath(relativePath);
    const fileInfo = await stat(filePath);
    if (!fileInfo.isFile()) return new Response("Not found", { status: 404 });

    const contentType = contentTypes[path.extname(filePath).toLowerCase()] ?? "application/octet-stream";
    const stream = Readable.toWeb(createReadStream(filePath)) as unknown as ReadableStream<Uint8Array>;

    return new Response(stream, {
      headers: {
        "Content-Length": String(fileInfo.size),
        "Content-Type": contentType,
        "Cache-Control": "private, no-store",
        "Content-Disposition": "inline",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
