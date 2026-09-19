import { ShareButton } from "@/components/share-button";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const berita = await prisma.berita.findMany({
    where: { published: true },
    select: { slug: true },
  });

  return berita.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const berita = await prisma.berita.findUnique({
    where: { slug },
    select: { title: true, excerpt: true },
  });

  if (!berita) return { title: "Berita tidak ditemukan" };

  return {
    title: berita.title,
    description: berita.excerpt || berita.title,
  };
}

export default async function BeritaDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const berita = await prisma.berita.findUnique({
    where: { slug, published: true },
  });

  if (!berita) {
    notFound();
  }

  let blocks: Array<{
    id: string;
    type: "paragraph" | "heading" | "image";
    content: string;
    imageSrc?: string;
    caption?: string;
  }> = [];

  try {
    blocks = JSON.parse(berita.content || "[]");
  } catch {
    blocks = [];
  }

  const publishedDate = berita.publishedAt
    ? berita.publishedAt.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  const shareUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "https://smktibazma.sch.id"}/berita/${berita.slug}`;

  return (
    <main className="relative min-h-screen bg-background py-8 md:py-12" data-nav-theme="light">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        {/* Navigation Back Button */}


        {/* ── Article Detail Layout (Matches Admin Preview Mode Exactly) ── */}
        <div className="space-y-6">
          {/* Header Info: Category, Date, Title, Excerpt */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary">
                {berita.category}
              </span>
              <span className="text-xs text-muted-foreground">
                {publishedDate}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight font-heading leading-tight">
              {berita.title}
            </h1>
            {berita.excerpt && (
              <p className="text-lg text-muted-foreground leading-relaxed italic">
                {berita.excerpt}
              </p>
            )}
          </div>

          {/* Cover Image Banner */}
          {berita.coverImage && !berita.coverImage.startsWith("blob:") && (
            <div className="overflow-hidden rounded-2xl border border-border shadow-sm">
              <img
                src={berita.coverImage}
                alt={berita.title}
                className="w-full aspect-video object-cover"
              />
            </div>
          )}

          {/* Article Blocks Content */}
          <div className="prose prose-slate dark:prose-invert max-w-none pt-4 space-y-4">
            {blocks.map((block) => (
              <div key={block.id}>
                {block.type === "heading" && (
                  <h2 className="text-xl md:text-2xl font-bold text-foreground font-heading mt-6 mb-2">
                    {block.content || "Sub-judul..."}
                  </h2>
                )}
                {block.type === "paragraph" && (
                  <p className="text-xl text-foreground leading-relaxed whitespace-pre-wrap">
                    {block.content || "Teks paragraf..."}
                  </p>
                )}
                {block.type === "image" && block.imageSrc && (
                  <figure className="my-6 space-y-2">
                    <img
                      src={block.imageSrc}
                      alt="Konten Berita"
                      className="rounded-xl w-full max-h-[450px] object-cover border border-border"
                    />
                    {block.caption && (
                      <figcaption className="text-center text-xs text-muted-foreground">
                        {block.caption}
                      </figcaption>
                    )}
                  </figure>
                )}
              </div>
            ))}
          </div>

          {/* Share Section Footer */}
          <div className="mt-12 pt-6 border-t border-border">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs md:text-sm font-medium text-muted-foreground">
                Bagikan artikel ini:
              </p>
              <ShareButton shareUrl={shareUrl} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
