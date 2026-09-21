import { Hero } from "@/components/hero";
import {
  getPublishedBeritaAction,
  getPublishedCategoriesAction,
} from "@/app/actions/berita-list";
import { BeritaSearchFilter } from "./berita-search-filter";
import { PortalLink } from "@/components/portal-transition";
import { Newspaper, Calendar, ArrowRight, SearchX } from "lucide-react";

interface BeritaPageProps {
  searchParams: Promise<{
    category?: string;
    q?: string;
  }>;
}

export default async function BeritaPage({ searchParams }: BeritaPageProps) {
  const resolvedSearchParams = await searchParams;
  const currentCategory = resolvedSearchParams?.category || "Semua";
  const searchQuery = resolvedSearchParams?.q || "";

  const [{ success, data: beritaList }, { data: categories }] =
    await Promise.all([
      getPublishedBeritaAction({
        category: currentCategory,
        search: searchQuery,
      }),
      getPublishedCategoriesAction(),
    ]);

  const activeCategories = categories || [
    "Semua",
    "Akademik",
    "Pengumuman",
    "Kegiatan Sekolah",
    "Prestasi",
    "Asrama",
    "Teknologi",
  ];

  const hasFilterActive = currentCategory !== "Semua" || searchQuery.trim() !== "";

  return (
    <main className="min-h-screen">
      <Hero
        title="Berita Terkini"
        backgroundImage="/images/hero-berita.jpg"
      />

      <section data-nav-theme="light" className="px-4 py-12 md:py-16 md:px-8 lg:px-16 max-w-7xl mx-auto">
        {/* Search & Category Filter Header */}
        <BeritaSearchFilter
          categories={activeCategories}
          initialCategory={currentCategory}
          initialSearch={searchQuery}
          totalResults={beritaList?.length ?? 0}
        />

        {/* Grid List Berita */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {success && beritaList && beritaList.length > 0 ? (
            beritaList.map((berita) => (
              <article
                key={berita.id}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xs hover:shadow-md transition-all duration-300 hover:border-primary/30"
              >
                <PortalLink
                  href={`/berita/${berita.slug}`}
                  label={berita.category || "Berita"}
                  className="flex flex-col h-full cursor-pointer"
                >
                  {/* Cover Image */}
                  <div className="aspect-video w-full overflow-hidden bg-muted/40 relative">
                    {berita.coverImage ? (
                      <img
                        src={berita.coverImage}
                        alt={berita.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
                        <Newspaper className="h-12 w-12 text-primary/40" />
                      </div>
                    )}
                    <div className="absolute left-4 top-4 rounded-full bg-background/90 px-3 py-1 text-xs font-semibold text-foreground backdrop-blur-sm border border-border/40">
                      {berita.category}
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5 text-primary/70" />
                        <time dateTime={berita.publishedAt}>{berita.publishedAt}</time>
                      </div>

                      <h3 className="text-xl font-bold text-foreground font-heading line-clamp-2 group-hover:text-primary transition-colors">
                        {berita.title}
                      </h3>

                      {berita.excerpt && (
                        <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                          {berita.excerpt}
                        </p>
                      )}
                    </div>

                    <div className="pt-4 flex items-center justify-between border-t border-border/40 mt-auto">
                      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary group-hover:gap-2.5 transition-all">
                        Baca selengkapnya
                        <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </div>
                </PortalLink>
              </article>
            ))
          ) : (
            <div className="col-span-full text-center py-20 px-4  bg-card/50">
              {hasFilterActive ? (
                <div className="max-w-md mx-auto space-y-3">
                  <SearchX className="h-14 w-14 mx-auto text-muted-foreground/50" />
                  <h3 className="text-xl font-bold text-foreground">
                    Berita Tidak Ditemukan
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {searchQuery
                      ? `Tidak ada berita yang cocok dengan kata kunci "${searchQuery}"`
                      : `Belum ada berita pada kategori "${currentCategory}".`}
                  </p>
                  <p className="text-xs text-muted-foreground/80">
                    Coba ganti kata kunci atau pilih kategori berita lainnya.
                  </p>
                </div>
              ) : (
                <div className="max-w-md mx-auto space-y-3">
                  <Newspaper className="h-14 w-14 mx-auto text-muted-foreground/50" />
                  <h3 className="text-xl font-bold text-foreground">Belum Ada Berita</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Saat ini belum ada berita yang dipublikasikan. Cek kembali nanti untuk kabar terbaru.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Pagination placeholder */}
        {success && beritaList && beritaList.length > 6 && (
          <div className="mt-16 text-center">
            <nav className="inline-flex items-center gap-2">
              <button className="h-10 w-10 rounded-full border border-border bg-background text-sm font-medium text-foreground hover:bg-muted disabled:opacity-50">
                1
              </button>
              <button className="h-10 w-10 rounded-full border border-border bg-background text-sm font-medium text-muted-foreground hover:bg-muted">
                2
              </button>
              <button className="h-10 w-10 rounded-full border border-border bg-background text-sm font-medium text-muted-foreground hover:bg-muted">
                3
              </button>
              <span className="px-2 text-muted-foreground">...</span>
              <button className="h-10 w-10 rounded-full border border-border bg-background text-sm font-medium text-muted-foreground hover:bg-muted">
                →
              </button>
            </nav>
          </div>
        )}
      </section>
    </main>
  );
}

