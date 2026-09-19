"use server";

import { ActionResult } from "./berita";
import { saveUploadedImage } from "@/lib/image-utils";

/**
 * Server Action generik untuk mengunggah gambar ke folder `public/uploads/[folder]/`.
 * Mendukung pengiriman nama sub-folder (misal: "berita", "fasilitas", "user", "galeri").
 */
export async function uploadFileAction(
  formData: FormData,
  targetFolder = "berita"
): Promise<ActionResult<{ url: string; fileName: string }>> {
  try {
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || targetFolder;

    if (!file) {
      return { success: false, error: "Tidak ada file yang diunggah" };
    }

    const result = await saveUploadedImage(file, {
      folder,
      maxSizeMB: 5,
      quality: 80,
      convertToWebP: true,
    });

    return {
      success: true,
      data: {
        url: result.url,
        fileName: result.fileName,
      },
    };
  } catch (error: any) {
    console.error("Error uploading file:", error);
    return {
      success: false,
      error: error?.message || "Gagal mengunggah file. Silakan coba lagi.",
    };
  }
}
