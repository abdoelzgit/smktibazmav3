"use server";

import { prisma } from "@/lib/prisma";

export type GetPublishedJejakKaryaOptions = {
  category?: string;
  search?: string;
};

function formatImage(url?: string | null): string | undefined {
  if (!url) return undefined;
  if (url.startsWith("blob:")) return undefined;
  return url;
}

export async function getJejakKaryaListAction() {
  try {
    const list = await prisma.jejakKarya.findMany({
      orderBy: { createdAt: "desc" },
    });

    return {
      success: true,
      data: list.map((item) => {
        let parsedTags: string[] = [];
        try {
          parsedTags = item.tags ? JSON.parse(item.tags) : [];
        } catch {
          parsedTags = [];
        }

        let parsedGallery: string[] = [];
        try {
          parsedGallery = item.galleryImages ? JSON.parse(item.galleryImages) : [];
        } catch {
          parsedGallery = [];
        }

        return {
          id: item.id,
          slug: item.slug,
          title: item.title,
          category: item.category as "Website" | "Design" | "Video" | "IoT",
          year: item.year,
          author: item.author,
          description: item.description,
          challenge: item.challenge || "",
          approach: item.approach || "",
          outcome: item.outcome || "",
          whatWeDid: item.whatWeDid || "",
          tags: parsedTags,
          coverImage: formatImage(item.coverImage) || "/images/hero-berita.jpg",
          galleryImages: parsedGallery.map((img) => formatImage(img)).filter(Boolean) as string[],
          demoUrl: item.demoUrl || undefined,
          status: item.published ? ("published" as const) : ("draft" as const),
          publishedAt: item.publishedAt
            ? item.publishedAt.toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : item.createdAt.toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
              }),
        };
      }),
    };
  } catch (error) {
    console.error("Error fetching jejak karya list:", error);
    return { success: false, error: "Gagal mengambil data jejak karya" };
  }
}

export async function getPublishedJejakKaryaAction(options?: GetPublishedJejakKaryaOptions) {
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
        { description: { contains: q, mode: "insensitive" } },
        { author: { contains: q, mode: "insensitive" } },
      ];
    }

    const list = await prisma.jejakKarya.findMany({
      where,
      orderBy: { publishedAt: "desc" },
    });

    return {
      success: true,
      data: list.map((item, index) => {
        let parsedTags: string[] = [];
        try {
          parsedTags = item.tags ? JSON.parse(item.tags) : [];
        } catch {
          parsedTags = [];
        }

        let parsedGallery: string[] = [];
        try {
          parsedGallery = item.galleryImages ? JSON.parse(item.galleryImages) : [];
        } catch {
          parsedGallery = [];
        }

        const formattedCover = formatImage(item.coverImage) || "/images/hero-berita.jpg";
        const formattedGallery = parsedGallery.map((img) => formatImage(img)).filter(Boolean) as string[];

        // Tentukan prev/next slug berdasarkan urutan
        const prevItem = index > 0 ? list[index - 1] : list[list.length - 1];
        const nextItem = index < list.length - 1 ? list[index + 1] : list[0];

        return {
          slug: item.slug,
          title: item.title,
          category: item.category as "Website" | "Design" | "Video" | "IoT",
          year: item.year,
          description: item.description,
          tags: parsedTags,
          challenge: item.challenge || "",
          approach: item.approach || "",
          outcome: item.outcome || "",
          whatWeDid: item.whatWeDid || "",
          heroImage: formattedCover,
          galleryImages: formattedGallery.length > 0 ? formattedGallery : [formattedCover],
          demoUrl: item.demoUrl || undefined,
          author: item.author,
          prevSlug: prevItem?.slug,
          nextSlug: nextItem?.slug,
        };
      }),
    };
  } catch (error) {
    console.error("Error fetching published jejak karya:", error);
    return { success: false, error: "Gagal mengambil data jejak karya" };
  }
}

export async function getPublishedJejakKaryaBySlugAction(slug: string) {
  try {
    const item = await prisma.jejakKarya.findUnique({
      where: { slug, published: true },
    });

    if (!item) {
      return { success: false, error: "Jejak karya tidak ditemukan" };
    }

    let parsedTags: string[] = [];
    try {
      parsedTags = item.tags ? JSON.parse(item.tags) : [];
    } catch {
      parsedTags = [];
    }

    let parsedGallery: string[] = [];
    try {
      parsedGallery = item.galleryImages ? JSON.parse(item.galleryImages) : [];
    } catch {
      parsedGallery = [];
    }

    const formattedCover = formatImage(item.coverImage) || "/images/hero-berita.jpg";
    const formattedGallery = parsedGallery.map((img) => formatImage(img)).filter(Boolean) as string[];

    // Cari list untuk prev/next
    const allPublished = await prisma.jejakKarya.findMany({
      where: { published: true },
      orderBy: { publishedAt: "desc" },
      select: { slug: true },
    });

    const currentIndex = allPublished.findIndex((p) => p.slug === slug);
    const prevSlug = currentIndex > 0 ? allPublished[currentIndex - 1].slug : allPublished[allPublished.length - 1]?.slug;
    const nextSlug = currentIndex < allPublished.length - 1 ? allPublished[currentIndex + 1].slug : allPublished[0]?.slug;

    return {
      success: true,
      data: {
        slug: item.slug,
        title: item.title,
        category: item.category as "Website" | "Design" | "Video" | "IoT",
        year: item.year,
        description: item.description,
        tags: parsedTags,
        challenge: item.challenge || "",
        approach: item.approach || "",
        outcome: item.outcome || "",
        whatWeDid: item.whatWeDid || "",
        heroImage: formattedCover,
        galleryImages: formattedGallery.length > 0 ? formattedGallery : [formattedCover],
        demoUrl: item.demoUrl || undefined,
        author: item.author,
        prevSlug,
        nextSlug,
      },
    };
  } catch (error) {
    console.error("Error fetching jejak karya by slug:", error);
    return { success: false, error: "Gagal mengambil detail jejak karya" };
  }
}
