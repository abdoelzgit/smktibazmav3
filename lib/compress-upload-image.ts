const MAX_IMAGE_DIMENSION = 2200;
const WEBP_QUALITY = 0.84;

export async function compressUploadImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || /image\/(gif|svg\+xml)/i.test(file.type)) {
    return file;
  }

  if (file.type === "image/webp" && file.size <= 1.5 * 1024 * 1024) {
    return file;
  }

  if (typeof createImageBitmap === "undefined") {
    return file;
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return file;
  }

  try {
    const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));

    const context = canvas.getContext("2d");
    if (!context) return file;
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

    const compressed = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/webp", WEBP_QUALITY);
    });

    if (!compressed || compressed.size >= file.size) return file;

    const baseName = file.name.replace(/\.[^.]+$/, "") || "upload";
    return new File([compressed], `${baseName}.webp`, {
      type: "image/webp",
      lastModified: file.lastModified,
    });
  } finally {
    bitmap.close();
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
