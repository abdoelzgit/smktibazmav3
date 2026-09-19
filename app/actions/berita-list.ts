"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { CreateBeritaInput } from "./berita";

import { prisma } from "@/lib/prisma";

export type ActionResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

export type GetPublishedBeritaOptions = {
  category?: string;
  search?: string;
};

function formatCoverImage(url?: string | null): string | undefined {
  if (!url) return undefined;
  if (url.startsWith("blob:")) {
    return undefined;
  }
  return url;
}

export async function getBeritaListAction() {
  try {
    const berita = await prisma.berita.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      success: true,
      data: berita.map((b) => ({
        id: b.id,
        title: b.title,
        excerpt: b.excerpt || "",
        category: b.category,
        status: b.published ? ("published" as const) : ("draft" as const),
        publishedAt: b.publishedAt
          ? b.publishedAt.toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
          : b.createdAt.toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
            }),
        coverImage: formatCoverImage(b.coverImage),
      })),
    };
  } catch (error) {
    console.error("Error fetching berita:", error);
    return { success: false, error: "Gagal mengambil data berita" };
  }
}

export async function getPublishedBeritaAction(options?: GetPublishedBeritaOptions) {
  try {
    const { category, search } = options || {};

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { published: true };

    if (category && category !== "Semua") {
      where.category = { equals: category, mode: "insensitive" };
    }

    if (search && search.trim() !== "") {
      const q = search.trim();
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { excerpt: { contains: q, mode: "insensitive" } },
        { category: { contains: q, mode: "insensitive" } },
      ];
    }

    const berita = await prisma.berita.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        category: true,
        coverImage: true,
        publishedAt: true,
      },
    });

    return {
      success: true,
      data: berita.map((b) => ({
        id: b.id,
        slug: b.slug,
        title: b.title,
        excerpt: b.excerpt || "",
        category: b.category,
        coverImage: formatCoverImage(b.coverImage),
        publishedAt: b.publishedAt
          ? b.publishedAt.toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })
          : "",
      })),
    };
  } catch (error) {
    console.error("Error fetching published berita:", error);
    return { success: false, error: "Gagal mengambil berita" };
  }
}

export async function getPublishedCategoriesAction() {
  try {
    const defaultCategories = [
      "Semua",
      "Akademik",
      "Pengumuman",
      "Kegiatan Sekolah",
      "Prestasi",
      "Asrama",
      "Teknologi",
    ];

    const distinctCategories = await prisma.berita.findMany({
      where: { published: true },
      select: { category: true },
      distinct: ["category"],
    });

    const categoryList = distinctCategories
      .map((item) => item.category)
      .filter((cat): cat is string => Boolean(cat));

    const combined = Array.from(new Set([...defaultCategories, ...categoryList]));

    return {
      success: true,
      data: combined,
    };
  } catch (error) {
    console.error("Error fetching categories:", error);
    return {
      success: true,
      data: [
        "Semua",
        "Akademik",
        "Pengumuman",
        "Kegiatan Sekolah",
        "Prestasi",
        "Asrama",
        "Teknologi",
      ],
    };
  }
}



