import fs from "fs/promises";
import path from "path";
import sharp from "sharp";

export interface SaveImageOptions {
  /**
   * Sub-folder tujuan di dalam `public/uploads/`.
   * Contoh: `"berita"`, `"fasilitas"`, `"pengumuman"`, `"user"`.
   * Default: `"general"`
   */
  folder?: string;

  /**
   * Batas ukuran maksimal file dalam MB.
   * Default: 5 (5MB)
   */
  maxSizeMB?: number;

  /**
   * Kualitas kompresi format WebP (1-100).
   * Default: 80
   */
  quality?: number;

  /**
   * Apakah ingin mengonversi gambar ke format WebP.
   * Default: true
   */
  convertToWebP?: boolean;
}

export interface SaveImageResult {
  url: string;
  fileName: string;
  filePath: string;
}

/**
 * Mengonversi Buffer / Uint8Array gambar ke format WebP menggunakan library `sharp`.
 */
export async function convertBufferToWebP(
  buffer: Uint8Array | Buffer,
  quality = 80
): Promise<Buffer> {
  return await sharp(buffer).webp({ quality }).toBuffer();
}

/**
 * Utilitas serbaguna untuk menyimpan gambar ke `public/uploads/[folder]/`
 * dengan opsi konversi otomatis ke WebP.
 */
export async function saveUploadedImage(
  file: File,
  options: SaveImageOptions = {}
): Promise<SaveImageResult> {
  const {
    folder = "general",
    maxSizeMB = 5,
    quality = 80,
    convertToWebP = true,
  } = options;

  if (!file) {
    throw new Error("Tidak ada file yang diberikan.");
  }

  // Validasi tipe file
  if (!file.type.startsWith("image/")) {
    throw new Error("File harus berupa gambar (JPG, PNG, WebP, GIF, dll).");
  }

  // Validasi ukuran file
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    throw new Error(`Ukuran gambar tidak boleh melebihi ${maxSizeMB}MB.`);
  }

  const bytes = await file.arrayBuffer();
  const inputBuffer = Buffer.from(bytes);

  let finalBuffer: Uint8Array = inputBuffer;
  let fileExtension = path.extname(file.name) || ".jpg";

  if (convertToWebP) {
    try {
      finalBuffer = await convertBufferToWebP(inputBuffer, quality);
      fileExtension = ".webp";
    } catch (error) {
      console.warn("Gagal mengonversi gambar ke WebP, menggunakan file asli:", error);
    }
  }

  // Buat nama file unik
  const originalExt = path.extname(file.name);
  const cleanFileName = path
    .basename(file.name, originalExt)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-");
  const uniqueFileName = `${Date.now()}-${cleanFileName}${fileExtension}`;

  // Path tujuan penyimpanan di folder public/uploads/[folder]/
  const uploadDir = path.join(process.cwd(), "public", "uploads", folder);

  // Pastikan folder tujuan ada
  await fs.mkdir(uploadDir, { recursive: true });

  const filePath = path.join(uploadDir, uniqueFileName);
  await fs.writeFile(filePath, finalBuffer);

  const publicUrl = `/uploads/${folder}/${uniqueFileName}`;

  return {
    url: publicUrl,
    fileName: uniqueFileName,
    filePath,
  };
}

/**
 * Menghapus berkas gambar dari direktori `public/` berdasarkan URL publik relatifnya.
 * Contoh URL: `/uploads/berita/1726712345-cover.webp`
 */
export async function deleteUploadedFile(
  publicUrl: string | null | undefined
): Promise<boolean> {
  if (!publicUrl || typeof publicUrl !== "string") {
    return false;
  }

  // Hanya proses URL lokal yang berada di /uploads/
  if (!publicUrl.startsWith("/uploads/")) {
    return false;
  }

  try {
    const cleanUrl = publicUrl.split("?")[0];
    const absolutePath = path.join(process.cwd(), "public", cleanUrl);

    await fs.unlink(absolutePath);
    return true;
  } catch (error: any) {
    // Abaikan jika berkas memang tidak ditemukan (ENOENT)
    if (error?.code !== "ENOENT") {
      console.warn(`Gagal menghapus berkas ${publicUrl}:`, error);
    }
    return false;
  }
}
