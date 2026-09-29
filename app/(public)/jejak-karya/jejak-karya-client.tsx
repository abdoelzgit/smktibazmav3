"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import {
  Globe,
  Palette,
  Video,
  Zap,
  Play,
  X,
  Search,
  ArrowUpRight,
  Filter,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";
import { Hero } from "@/components/hero";
import { getPublishedJejakKaryaAction } from "@/app/actions/jejak-karya-list";
import { PortalLink } from "@/components/portal-transition";

type CategoryFilter = "Semua" | "Website" | "Design" | "Video" | "IoT";

interface ProjectsSectionProps {
  projects: Array<any>;
  isLoading: boolean;
  selectedCategory: string;
  onResetCategory: () => void;
  onOpenVideoModal: (proj: any) => void;
}

const CATEGORIES: {
  id: "Website" | "Design" | "Video" | "IoT";
  title: string;
  desc: string;
  icon: typeof Globe;
}[] = [
  {
    id: "Website",
    title: "Website",
    desc: "Kreativitas dan kemampuan siswa dalam membuat solusi digital interaktif.",
    icon: Globe,
  },
  {
    id: "Design",
    title: "Design",
    desc: "Kreativitas dan kemampuan siswa dalam menciptakan desain digital menarik.",
    icon: Palette,
  },
  {
    id: "Video",
    title: "Video",
    desc: "Kreativitas dan kemampuan siswa dalam memproduksi video inspiratif dan edukatif.",
    icon: Video,
  },
  {
    id: "IoT",
    title: "IoT",
    desc: "Kreativitas dan kemampuan siswa dalam mengembangkan inovasi berbasis Internet of Things.",
    icon: Zap,
  },
];

export function JejakKaryaClient() {
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryFilter>("Website");
  const [projects, setProjects] = useState<Array<any>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalVideo, setModalVideo] = useState<any | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await getPublishedJejakKaryaAction({
          category: selectedCategory === "Semua" ? undefined : selectedCategory,
        });
        if (res.success && res.data) {
          setProjects(res.data);
        } else {
          setError(res.error || "Gagal memuat data");
          setProjects([]);
        }
      } catch (err) {
        console.error("Error fetching projects:", err);
        setError("Terjadi kesalahan saat memuat data");
        setProjects([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, [selectedCategory]);

  const filteredProjects = projects;

  return (
    <div className="min-h-screen text-slate-900 font-sans bg-[#e5e5e5] selection:bg-slate-900 selection:text-white">
      <Hero title="" backgroundImage="/images/hero-berita.jpg" />

      <div
        className="relative z-20 max-w-6xl mx-auto px-4 -mt-24 md:-mt-28"
        data-nav-theme="light"
      >
        <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-2xl border border-slate-100">
          <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-2 scrollbar-none sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:overflow-visible sm:pb-0">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedCategory === cat.id;

              return (
                <div
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={cn(
                    "group relative flex flex-col w-full justify-between p-5 md:p-6 rounded-2xl transition-all duration-300 cursor-pointer select-none border min-w-[75vw] sm:min-w-0 snap-center sm:snap-align-none shrink-0 sm:shrink",
                    isActive
                      ? "bg-[#1e3a8a] text-white border-[#1e3a8a] shadow-xl scale-[1.02]"
                      : "bg-white text-slate-800 border-slate-100 hover:border-blue-200 hover:bg-slate-50/80 hover:shadow-md",
                  )}
                >
                  <div className="flex w-full items-center justify-between mb-4">
                    <h3
                      className={cn(
                        "text-lg md:text-xl font-bold font-heading",
                        isActive ? "text-white" : "text-slate-900",
                      )}
                    >
                      {cat.title}
                    </h3>
                    <div
                      className={cn(
                        "p-2.5 rounded-xl transition-all shrink-0",
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-blue-50 text-blue-600 group-hover:bg-blue-100",
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>

                  <p
                    className={cn(
                      "text-xs leading-relaxed transition-colors",
                      isActive ? "text-blue-100" : "text-slate-500",
                    )}
                  >
                    {cat.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Desktop: scroll horizontal */}
      <div className="hidden md:block pt-12">
        <HorizontalProjectsSection
          projects={filteredProjects}
          isLoading={isLoading}
          selectedCategory={selectedCategory}
          onResetCategory={() => setSelectedCategory("Semua")}
          onOpenVideoModal={(proj) => setModalVideo(proj)}
        />
      </div>

      {/* Mobile: carousel 1 card + tombol navigasi */}
      <div className="md:hidden pt-6">
        <MobileProjectsCarousel
          projects={filteredProjects}
          isLoading={isLoading}
          selectedCategory={selectedCategory}
          onResetCategory={() => setSelectedCategory("Semua")}
          onOpenVideoModal={(proj) => setModalVideo(proj)}
        />
      </div>

      {/* ── Section Grid List Karya dengan Search Bar ──────────────── */}
      <JejakKaryaGridListSection
        projects={projects}
        isLoading={isLoading}
        selectedCategory={selectedCategory}
        onOpenVideoModal={(proj) => setModalVideo(proj)}
      />

      {/* Video Player Modal */}
      {modalVideo && (
        <VideoPlayerModal
          videoProject={modalVideo}
          onClose={() => setModalVideo(null)}
        />
      )}
    </div>
  );
}

function getEmbedVideo(url?: string | null) {
  if (!url) return null;
  const trimmed = url.trim();

  const ytMatch = trimmed.match(
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i,
  );
  if (ytMatch && ytMatch[1]) {
    return {
      type: "youtube" as const,
      embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&rel=0`,
    };
  }

  const vimeoMatch = trimmed.match(/vimeo\.com\/(?:video\/)?([0-9]+)/i);
  if (vimeoMatch && vimeoMatch[1]) {
    return {
      type: "vimeo" as const,
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`,
    };
  }

  if (
    /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(trimmed) ||
    trimmed.includes("/uploads/")
  ) {
    return {
      type: "file" as const,
      embedUrl: trimmed,
    };
  }

  const normalized = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;
  return {
    type: "unknown" as const,
    embedUrl: normalized,
  };
}

function VideoPlayerModal({
  videoProject,
  onClose,
}: {
  videoProject: any;
  onClose: () => void;
}) {
  if (!videoProject) return null;
  const videoTarget = videoProject.demoUrl || videoProject.heroImage || "";
  const embed = getEmbedVideo(videoTarget);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl aspect-video bg-black rounded-2xl md:rounded-3xl overflow-hidden border border-white/10 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-black/60 text-white hover:bg-white hover:text-black transition-all cursor-pointer backdrop-blur-sm"
          aria-label="Tutup Player"
        >
          <X className="h-5 w-5" />
        </button>

        {!embed ? (
          <div className="flex flex-col items-center justify-center h-full text-white p-6 text-center space-y-3">
            <Video className="h-12 w-12 text-slate-500" />
            <p className="text-base font-semibold">Video tidak tersedia</p>
          </div>
        ) : embed.type === "file" ? (
          <video
            src={embed.embedUrl}
            controls
            autoPlay
            className="w-full h-full object-contain"
          />
        ) : (
          <iframe
            src={embed.embedUrl}
            title={videoProject.title}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        )}
      </div>
    </div>
  );
}

/* ───────────────────────── Desktop: scroll horizontal ───────────────────────── */

function HorizontalProjectsSection({
  projects,
  isLoading,
  selectedCategory,
  onResetCategory,
  onOpenVideoModal,
}: ProjectsSectionProps) {
  const targetRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [scrollRange, setScrollRange] = useState(0);

  useEffect(() => {
    const updateScrollRange = () => {
      if (trackRef.current) {
        const totalTrackWidth = trackRef.current.scrollWidth;
        const viewportWidth = window.innerWidth;
        const range = totalTrackWidth - viewportWidth;
        setScrollRange(range > 0 ? range : 0);
      }
    };

    requestAnimationFrame(() => {
      updateScrollRange();
      requestAnimationFrame(() => {
        updateScrollRange();
      });
    });

    window.addEventListener("resize", updateScrollRange);
    return () => {
      window.removeEventListener("resize", updateScrollRange);
    };
  }, [projects, isLoading]);

  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end end"],
  });

  const x = useTransform(scrollYProgress, [0, 0.85], [0, -scrollRange], {
    clamp: true,
  });

  return (
    <section
      ref={targetRef}
      data-nav-theme="light"
      className="relative h-[350vh] bg-[#e5e5e5] text-slate-900"
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center">
        <motion.div
          ref={trackRef}
          style={{ x }}
          className="flex items-center shrink-0"
        >
          <div className="w-[50vw] shrink-0 px-6 sm:px-10 md:px-14 lg:px-16">
            <div className="space-y-6">
              <div className="space-y-3">
                <h2 className="text-4xl sm:text-5xl md:text-[56px] lg:text-[64px] font-extrabold tracking-tight font-heading text-[#3a3a3a] leading-[1.05]">
                  Karya Pilihan
                </h2>
              </div>

              <div>
                <button
                  onClick={onResetCategory}
                  className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-mono uppercase tracking-widest text-[#555] hover:text-[#1a1a1a] border-b border-[#777] hover:border-[#1a1a1a] pb-1 transition-all cursor-pointer font-semibold"
                >
                  <span>Lihat</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          </div>

          <div className="w-px self-stretch bg-slate-300/70 shrink-0" />

          <div className="flex items-center shrink-0">
            {isLoading ? (
              [1, 2, 3].map((_, idx) => (
                <div key={idx} className="flex items-center shrink-0">
                  <div className="w-[50vw] shrink-0 px-6 sm:px-10 lg:px-12 space-y-4">
                    <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl sm:rounded-3xl bg-slate-300/70 animate-pulse" />
                    <div className="space-y-2">
                      <div className="h-6 w-3/4 bg-slate-300/70 rounded animate-pulse" />
                      <div className="h-4 w-1/2 bg-slate-300/70 rounded animate-pulse" />
                    </div>
                  </div>
                  {idx < 2 && (
                    <div className="w-px self-stretch bg-slate-300/70 shrink-0" />
                  )}
                </div>
              ))
            ) : projects.length === 0 ? (
              <div className="w-[50vw] shrink-0 px-12 text-slate-500">
                <p className="text-lg font-medium">
                  Belum ada karya untuk kategori ini.
                </p>
              </div>
            ) : (
              projects.map((project, idx) => {
                const isVideo = project.category === "Video";

                return (
                  <div
                    key={project.slug}
                    className="flex items-center shrink-0"
                  >
                    <div className="w-[50vw] shrink-0 px-6 sm:px-10 lg:px-12 group space-y-4">
                      <div
                        onClick={() => {
                          if (isVideo) onOpenVideoModal(project);
                        }}
                        className={cn(
                          "relative aspect-[16/9] w-full overflow-hidden rounded-2xl sm:rounded-3xl bg-slate-300 shadow-md border border-black/5",
                          isVideo && "cursor-pointer",
                        )}
                      >
                        <Image
                          src={project.heroImage}
                          alt={project.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 50vw"
                          className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                        />

                        {isVideo && (
                          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-all flex items-center justify-center">
                            <div className="p-4 rounded-full bg-white/90 text-slate-900 shadow-2xl transition-transform duration-300 group-hover:scale-110">
                              <Play className="h-7 w-7 fill-current translate-x-0.5" />
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 px-1">
                        <div className="space-y-1.5 max-w-lg">
                          <h3 className="text-xl sm:text-2xl font-bold text-[#1a1a1a] font-heading group-hover:text-blue-900 transition-colors">
                            {project.title}
                          </h3>
                          <p className="text-xs sm:text-sm text-[#555] line-clamp-2 leading-relaxed">
                            {project.description}
                          </p>
                        </div>

                        {isVideo ? (
                          <button
                            onClick={() => onOpenVideoModal(project)}
                            className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-[#222] border-b border-[#666] hover:border-black pb-1 shrink-0 font-bold transition-all hover:text-black self-start sm:self-auto cursor-pointer"
                          >
                            <span>PLAY VIDEO</span>
                            <Play className="h-3.5 w-3.5 fill-current" />
                          </button>
                        ) : (
                          <PortalLink
                            href={`/jejak-karya/${project.slug}`}
                            label={project.title || "Jejak Karya"}
                            className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-[#222] border-b border-[#666] hover:border-black pb-1 shrink-0 font-bold transition-all hover:text-black self-start sm:self-auto cursor-pointer"
                          >
                            <span>EXPLORE PROJECT</span>
                            <span>→</span>
                          </PortalLink>
                        )}
                      </div>
                    </div>

                    {idx < projects.length - 1 && (
                      <div className="w-px self-stretch bg-slate-300/70 shrink-0" />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ───────────────────────── Mobile: carousel 1 card ───────────────────────── */

function MobileProjectsCarousel({
  projects,
  isLoading,
  onResetCategory,
  onOpenVideoModal,
}: ProjectsSectionProps) {
  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const total = projects.length;

  // reset ke card pertama saat data/kategori berubah
  useEffect(() => {
    setIndex(0);
  }, [projects]);

  const goPrev = () => setIndex((i) => Math.max(i - 1, 0));
  const goNext = () => setIndex((i) => Math.min(i + 1, total - 1));

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (delta > 50) goPrev();
    else if (delta < -50) goNext();
  };

  return (
    <section
      data-nav-theme="light"
      className="bg-[#e5e5e5] text-slate-900 py-12 space-y-8"
    >
      {/* Header */}
      <div className="px-6 space-y-4">
        <h2 className="text-4xl font-extrabold tracking-tight font-heading text-[#3a3a3a] leading-[1.05]">
          Karya Pilihan
        </h2>
        <button
          onClick={onResetCategory}
          className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-[#555] hover:text-[#1a1a1a] border-b border-[#777] hover:border-[#1a1a1a] pb-1 transition-all cursor-pointer font-semibold"
        >
          <span>Lihat</span>
          <span>→</span>
        </button>
      </div>

      {/* Carousel */}
      {isLoading ? (
        <div className="px-6 space-y-4">
          <div className="aspect-[4/3] w-full rounded-2xl bg-slate-300/70 animate-pulse" />
          <div className="h-6 w-3/4 bg-slate-300/70 rounded animate-pulse" />
          <div className="h-4 w-1/2 bg-slate-300/70 rounded animate-pulse" />
        </div>
      ) : total === 0 ? (
        <p className="px-6 text-lg font-medium text-slate-500">
          Belum ada karya untuk kategori ini.
        </p>
      ) : (
        <>
          <div
            className="overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <motion.div
              className="flex"
              animate={{ x: `-${index * 100}%` }}
              transition={{ type: "spring", stiffness: 300, damping: 34 }}
            >
              {projects.map((project) => {
                const isVideo = project.category === "Video";

                return (
                  <div
                    key={project.slug}
                    className="w-full shrink-0 px-6 space-y-4"
                  >
                    <div
                      onClick={() => {
                        if (isVideo) onOpenVideoModal(project);
                      }}
                      className={cn(
                        "relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-slate-300 shadow-md border border-black/5",
                        isVideo && "cursor-pointer",
                      )}
                    >
                      <Image
                        src={project.heroImage}
                        alt={project.title}
                        fill
                        sizes="100vw"
                        className="object-cover"
                      />

                      {isVideo && (
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <div className="p-4 rounded-full bg-white/90 text-slate-900 shadow-2xl">
                            <Play className="h-6 w-6 fill-current translate-x-0.5" />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3 px-1">
                      <h3 className="text-xl font-bold text-[#1a1a1a] font-heading">
                        {project.title}
                      </h3>
                      <p className="text-sm text-[#555] line-clamp-3 leading-relaxed">
                        {project.description}
                      </p>

                      {isVideo ? (
                        <button
                          onClick={() => onOpenVideoModal(project)}
                          className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-[#222] border-b border-[#666] pb-1 font-bold cursor-pointer"
                        >
                          <span>PLAY VIDEO</span>
                          <Play className="h-3.5 w-3.5 fill-current" />
                        </button>
                      ) : (
                        <PortalLink
                          href={`/jejak-karya/${project.slug}`}
                          label={project.title || "Jejak Karya"}
                          className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-[#222] border-b border-[#666] pb-1 font-bold cursor-pointer"
                        >
                          <span>EXPLORE PROJECT</span>
                          <span>→</span>
                        </PortalLink>
                      )}
                    </div>
                  </div>
                );
              })}
            </motion.div>
          </div>

          {/* Navigasi */}
          <div className="px-6 flex items-center justify-between">
            <span className="font-mono text-xs tracking-widest text-[#555]">
              {String(index + 1).padStart(2, "0")} /{" "}
              {String(total).padStart(2, "0")}
            </span>

            <div className="flex items-center gap-3">
              <button
                onClick={goPrev}
                disabled={index === 0}
                aria-label="Karya sebelumnya"
                className="h-11 w-11 rounded-full border border-[#777] flex items-center justify-center text-[#222] transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={goNext}
                disabled={index === total - 1}
                aria-label="Karya berikutnya"
                className="h-11 w-11 rounded-full bg-[#1a1a1a] text-white flex items-center justify-center transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

/* ───────────────────────── Grid list + search ───────────────────────── */

function JejakKaryaGridListSection({
  projects,
  isLoading,
  selectedCategory,
  onOpenVideoModal,
}: {
  projects: Array<any>;
  isLoading: boolean;
  selectedCategory: CategoryFilter;
  onOpenVideoModal: (proj: any) => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const mobileListRef = useRef<HTMLDivElement>(null);

  const filtered = projects.filter((project) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const titleMatch = project.title?.toLowerCase().includes(q);
    const descMatch = project.description?.toLowerCase().includes(q);
    const authorMatch = project.author?.toLowerCase().includes(q);
    const tagMatch = Array.isArray(project.tags)
      ? project.tags.some((t: string) => t.toLowerCase().includes(q))
      : false;
    return titleMatch || descMatch || authorMatch || tagMatch;
  });

  return (
    <section
      className="py-16 md:py-24 bg-white text-slate-900 border-t border-slate-200/80"
      data-nav-theme="light"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono bg-blue-50 text-blue-900 font-bold border border-blue-100">
            <Filter className="h-3.5 w-3.5" />
            <span>DIREKTORI PORTOFOLIO</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-heading text-slate-900 tracking-tight">
            Daftar Karya{" "}
            {selectedCategory !== "Semua" ? `• ${selectedCategory}` : "Siswa"}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Temukan karya dan inovasi buatan talenta siswa SMK TI BAZMA.
          </p>
        </div>

        {/* Search Bar Input */}
        <div className="relative max-w-2xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari karya berdasarkan judul, teknologi, atau nama tim..."
            className="w-full pl-12 pr-10 py-3.5 sm:py-4 bg-slate-50 hover:bg-slate-100/70 focus:bg-white rounded-2xl border border-slate-200 shadow-sm text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Info Count Header & Mobile Nav Controls */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 text-xs font-mono text-slate-500">
          <div>
            Kategori:{" "}
            <span className="font-bold text-slate-900">{selectedCategory}</span>
          </div>
          <div className="flex items-center gap-3">
            <span>
              Menampilkan{" "}
              <span className="font-bold text-slate-900">{filtered.length}</span>{" "}
              karya
            </span>

            {/* Navigation Buttons - Visible on Mobile, Hidden on Desktop */}
            <div className="flex md:hidden items-center gap-1.5 ml-1">
              <button
                type="button"
                onClick={() => {
                  if (mobileListRef.current) {
                    mobileListRef.current.scrollBy({ left: -300, behavior: "smooth" });
                  }
                }}
                aria-label="Karya sebelumnya"
                className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors cursor-pointer active:scale-95 border border-slate-200/80 shadow-2xs"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  if (mobileListRef.current) {
                    mobileListRef.current.scrollBy({ left: 300, behavior: "smooth" });
                  }
                }}
                aria-label="Karya selanjutnya"
                className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors cursor-pointer active:scale-95 border border-slate-200/80 shadow-2xs"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Grid / Mobile Carousel List Cards */}
        {isLoading ? (
          <div
            ref={mobileListRef}
            className="flex overflow-x-auto snap-x gap-4 pb-6 -mx-4 px-4 scrollbar-none md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-8 md:overflow-visible md:pb-0 md:mx-0 md:px-0"
          >
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="min-w-[85vw] sm:min-w-[340px] md:min-w-0 shrink-0 md:shrink snap-center rounded-2xl border border-slate-200 bg-slate-100 p-4 space-y-4 animate-pulse"
              >
                <div className="aspect-video w-full rounded-xl bg-slate-200" />
                <div className="h-5 w-3/4 bg-slate-200 rounded" />
                <div className="h-4 w-1/2 bg-slate-200 rounded" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 px-4 bg-slate-50 rounded-3xl border border-slate-200/80 space-y-4">
            <p className="text-slate-600 font-medium">
              {searchQuery
                ? `Tidak ada karya yang sesuai dengan pencarian "${searchQuery}".`
                : "Belum ada karya yang dipublikasikan."}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="inline-flex items-center gap-2 text-xs font-bold text-blue-900 hover:underline cursor-pointer"
              >
                Reset pencarian
              </button>
            )}
          </div>
        ) : (
          <div
            ref={mobileListRef}
            className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-6 -mx-4 px-4 scrollbar-none md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-8 md:overflow-visible md:pb-0 md:mx-0 md:px-0"
          >
            {filtered.map((project) => {
              const isVideo = project.category === "Video";

              return (
                <div
                  key={project.slug}
                  className="group flex flex-col justify-between bg-white rounded-2xl md:rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 min-w-[85vw] sm:min-w-[340px] md:min-w-0 snap-center md:snap-align-none shrink-0 md:shrink"
                >
                  <div>
                    {/* Thumbnail Image */}
                    <div
                      onClick={() => {
                        if (isVideo) onOpenVideoModal(project);
                      }}
                      className={cn(
                        "relative aspect-video w-full overflow-hidden bg-slate-100",
                        isVideo && "cursor-pointer",
                      )}
                    >
                      <Image
                        src={project.heroImage}
                        alt={project.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />

                      {isVideo ? (
                        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-all flex items-center justify-center">
                          <div className="p-3.5 rounded-full bg-white/90 text-slate-900 shadow-xl transition-transform duration-300 group-hover:scale-110">
                            <Play className="h-6 w-6 fill-current translate-x-0.5" />
                          </div>
                        </div>
                      ) : (
                        <div className="absolute top-3 left-3">
                          <span className="px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider font-bold bg-white/90 backdrop-blur-md text-slate-900 border border-slate-200/80 shadow-xs">
                            {project.category}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Card Body */}
                    <div className="p-5 sm:p-6 space-y-3">
                      <div className="flex items-center justify-between  text-xs text-slate-500 font-mono">
                        {project.tags && project.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-2">
                            {project.tags.slice(0, 3).map((tag: string) => (
                              <span
                                key={tag}
                                className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-slate-100 text-slate-600"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <h3 className="text-lg font-bold text-slate-900 font-heading leading-snug group-hover:text-blue-900 transition-colors line-clamp-1">
                        {project.title}
                      </h3>

                      <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                        {project.description}
                      </p>
                    </div>
                  </div>

                  {/* Card Footer / Action Button */}
                  <div className="px-5 pb-5 sm:px-6 sm:pb-6 pt-0">
                    {isVideo ? (
                      <button
                        onClick={() => onOpenVideoModal(project)}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 text-white text-xs font-semibold py-2.5 transition-all cursor-pointer shadow-sm"
                      >
                        <Play className="h-3.5 w-3.5 fill-current" />
                        <span>PUTAR VIDEO</span>
                      </button>
                    ) : (
                      <PortalLink
                        href={`/jejak-karya/${project.slug}`}
                        label={project.title || "Jejak Karya"}
                        className="w-full sm:w-auto inline-flex items-center justify-between text-slate-900 hover:text-primary text-xs font-semibold transition-all group/btn cursor-pointer"
                      >
                        <span>Lihat Selengkapnya</span>
                        <ArrowUpRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                      </PortalLink>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}