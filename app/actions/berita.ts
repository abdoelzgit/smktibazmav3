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

export type CreateBeritaInput = {
  title: string;
  excerpt?: string;
  category?: string;
  coverSrc?: string | null;
  blocks: Array<{
    id: string;
    type: "paragraph" | "heading" | "image";
    content: string;
    imageSrc?: string;
    caption?: string;
  }>;
  status: "draft" | "published";
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

export async function createBeritaAction(
  input: CreateBeritaInput
): Promise<ActionResult<{ id: string; slug: string }>> {
  try {
    if (!input.title.trim()) {
      return { success: false, error: "Judul berita tidak boleh kosong" };
    }

    const slug = generateSlug(input.title);
    const content = JSON.stringify(input.blocks);
    const published = input.status === "published";
    const publishedAt = published ? new Date() : null;

    const berita = await prisma.berita.create({
      data: {
        title: input.title,
        slug,
        category: input.category || "Akademik",
        excerpt: input.excerpt || null,
        content,
        coverImage: input.coverSrc || null,
        published,
        publishedAt,
      },
      select: {
        id: true,
        slug: true,
      },
    });

    revalidatePath("/admin/berita");
    revalidatePath("/berita");

    return {
      success: true,
      data: berita,
    };
  } catch (error) {
    console.error("Error creating berita:", error);
    return {
      success: false,
      error: "Gagal menyimpan berita. Silakan coba lagi.",
    };
  }
}

export async function updateBeritaAction(
  id: string,
  input: CreateBeritaInput
): Promise<ActionResult> {
  try {
    if (!input.title.trim()) {
      return { success: false, error: "Judul berita tidak boleh kosong" };
    }

    // Hapus file cover lama jika cover diganti dengan yang baru
    const existing = await prisma.berita.findUnique({
      where: { id },
      select: { coverImage: true },
    });

    if (existing?.coverImage && existing.coverImage !== input.coverSrc) {
      await deleteUploadedFile(existing.coverImage);
    }

    const published = input.status === "published";
    await prisma.berita.update({
      where: { id },
      data: {
        title: input.title,
        category: input.category || "Akademik",
        excerpt: input.excerpt || null,
        content: JSON.stringify(input.blocks),
        coverImage: input.coverSrc || null,
        published,
        publishedAt: published ? new Date() : null,
      },
    });

    revalidatePath("/admin/berita");
    revalidatePath("/berita");

    return { success: true };
  } catch (error) {
    console.error("Error updating berita:", error);
    return { success: false, error: "Gagal memperbarui berita" };
  }
}

export async function deleteBeritaAction(id: string): Promise<ActionResult> {
  try {
    // 1. Ambil data berita untuk menghapus file cover & gambar blok di public/
    const berita = await prisma.berita.findUnique({
      where: { id },
      select: { coverImage: true, content: true },
    });

    if (berita) {
      // Hapus cover image dari disk jika ada
      if (berita.coverImage) {
        await deleteUploadedFile(berita.coverImage);
      }

      // Hapus gambar-gambar di dalam artikel dari disk jika ada
      try {
        const blocks = JSON.parse(berita.content || "[]");
        for (const block of blocks) {
          if (block.type === "image" && block.imageSrc) {
            await deleteUploadedFile(block.imageSrc);
          }
        }
      } catch (e) {
        console.warn("Gagal menghapus gambar blok berita:", e);
      }
    }

    // 2. Hapus rekord dari database Prisma
    await prisma.berita.delete({
      where: { id },
    });

    revalidatePath("/admin/berita");
    revalidatePath("/berita");

    return { success: true };
  } catch (error) {
    console.error("Error deleting berita:", error);
    return { success: false, error: "Gagal menghapus berita" };
  }
}

export async function getBeritaByIdAction(id: string): Promise<ActionResult> {
  try {
    const berita = await prisma.berita.findUnique({
      where: { id },
    });

    if (!berita) {
      return { success: false, error: "Berita tidak ditemukan" };
    }

    return { success: true, data: berita };
  } catch (error) {
    console.error("Error fetching berita by id:", error);
    return { success: false, error: "Gagal mengambil data berita" };
  }
}
