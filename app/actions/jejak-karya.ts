"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { deleteUploadedFile } from "@/lib/image-utils";

const prisma = new PrismaClient();

export type ActionResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

export type CreateJejakKaryaInput = {
  title: string;
  category: string;
  year?: string;
  author: string;
  description: string;
  challenge?: string;
  approach?: string;
  outcome?: string;
  whatWeDid?: string;
  tags?: string[];
  coverImage?: string;
  galleryImages?: string[];
  demoUrl?: string;
  published: boolean;
};

function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 50);
  
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${base}-${suffix}`;
}

export async function createJejakKaryaAction(
  input: CreateJejakKaryaInput
): Promise<ActionResult<{ id: string; slug: string }>> {
  try {
    if (!input.title.trim()) {
      return { success: false, error: "Judul jejak karya tidak boleh kosong" };
    }

    const slug = generateSlug(input.title);
    const tags = input.tags ? JSON.stringify(input.tags) : null;
    const galleryImages = input.galleryImages ? JSON.stringify(input.galleryImages) : null;
    const published = input.published;
    const publishedAt = published ? new Date() : null;

    const jejakKarya = await prisma.jejakKarya.create({
      data: {
        title: input.title,
        slug,
        category: input.category,
        year: input.year || "2026",
        author: input.author,
        description: input.description,
        challenge: input.challenge || null,
        approach: input.approach || null,
        outcome: input.outcome || null,
        whatWeDid: input.whatWeDid || null,
        tags,
        coverImage: input.coverImage || null,
        galleryImages,
        demoUrl: input.demoUrl || null,
        published,
        publishedAt,
      },
      select: {
        id: true,
        slug: true,
      },
    });

    revalidatePath("/admin/jejak-karya");
    revalidatePath("/jejak-karya");

    return {
      success: true,
      data: jejakKarya,
    };
  } catch (error) {
    console.error("Error creating jejak karya:", error);
    return {
      success: false,
      error: "Gagal menyimpan jejak karya. Silakan coba lagi.",
    };
  }
}

export async function updateJejakKaryaAction(
  id: string,
  input: CreateJejakKaryaInput
): Promise<ActionResult> {
  try {
    if (!input.title.trim()) {
      return { success: false, error: "Judul jejak karya tidak boleh kosong" };
    }

    // Hapus file cover lama jika cover diganti dengan yang baru
    const existing = await prisma.jejakKarya.findUnique({
      where: { id },
      select: { coverImage: true },
    });

    if (existing?.coverImage && existing.coverImage !== input.coverImage) {
      await deleteUploadedFile(existing.coverImage);
    }

    const tags = input.tags ? JSON.stringify(input.tags) : null;
    const galleryImages = input.galleryImages ? JSON.stringify(input.galleryImages) : null;
    const published = input.published;
    const publishedAt = published ? new Date() : null;

    await prisma.jejakKarya.update({
      where: { id },
      data: {
        title: input.title,
        category: input.category,
        year: input.year || "2026",
        author: input.author,
        description: input.description,
        challenge: input.challenge || null,
        approach: input.approach || null,
        outcome: input.outcome || null,
        whatWeDid: input.whatWeDid || null,
        tags,
        coverImage: input.coverImage || null,
        galleryImages,
        demoUrl: input.demoUrl || null,
        published,
        publishedAt,
      },
    });

    revalidatePath("/admin/jejak-karya");
    revalidatePath("/jejak-karya");

    return { success: true };
  } catch (error) {
    console.error("Error updating jejak karya:", error);
    return { success: false, error: "Gagal memperbarui jejak karya" };
  }
}

export async function deleteJejakKaryaAction(id: string): Promise<ActionResult> {
  try {
    // 1. Ambil data jejak karya untuk menghapus file gambar
    const jejakKarya = await prisma.jejakKarya.findUnique({
      where: { id },
      select: { coverImage: true, galleryImages: true },
    });

    if (jejakKarya) {
      // Hapus cover image dari disk jika ada
      if (jejakKarya.coverImage) {
        await deleteUploadedFile(jejakKarya.coverImage);
      }

      // Hapus gallery images dari disk jika ada
      if (jejakKarya.galleryImages) {
        try {
          const galleryArray = JSON.parse(jejakKarya.galleryImages || "[]");
          for (const imageSrc of galleryArray) {
            await deleteUploadedFile(imageSrc);
          }
        } catch (e) {
          console.warn("Gagal menghapus gambar galeri:", e);
        }
      }
    }

    // 2. Hapus rekord dari database Prisma
    await prisma.jejakKarya.delete({
      where: { id },
    });

    revalidatePath("/admin/jejak-karya");
    revalidatePath("/jejak-karya");

    return { success: true };
  } catch (error) {
    console.error("Error deleting jejak karya:", error);
    return { success: false, error: "Gagal menghapus jejak karya" };
  }
}

export async function getJejakKaryaByIdAction(id: string): Promise<ActionResult> {
  try {
    const jejakKarya = await prisma.jejakKarya.findUnique({
      where: { id },
    });

    if (!jejakKarya) {
      return { success: false, error: "Jejak karya tidak ditemukan" };
    }

    return { success: true, data: jejakKarya };
  } catch (error) {
    console.error("Error fetching jejak karya by id:", error);
    return { success: false, error: "Gagal mengambil data jejak karya" };
  }
}