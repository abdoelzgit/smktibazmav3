"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Globe, Palette, Video, Zap } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { JEJAK_KARYA_LIST, JejakKaryaItem } from "@/lib/jejak-karya-data";
import { cn } from "@/lib/utils";
import { Hero } from "@/components/hero";

type CategoryFilter = "Semua" | "Website" | "Design" | "Video" | "IoT";

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
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("Semua");

  const filteredProjects =
    selectedCategory === "Semua"
      ? JEJAK_KARYA_LIST
      : JEJAK_KARYA_LIST.filter((item) => item.category === selectedCategory);

  return (
    <div className="min-h-screen bg-[#e5e5e5] text-slate-900 font-sans selection:bg-slate-900 selection:text-white">
      {/* ── 1. Hero Header Section ──────────────────────────────────────── */}
      <Hero title="JEJAK KARYA" backgroundImage="/images/hero-berita.jpg" />

      {/* ── 2. Floating Overlapping Category Cards Container ─────────────── */}
      <div className="relative z-20 max-w-6xl mx-auto px-4 -mt-24 md:-mt-28" data-nav-theme="light">
        <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-2xl border border-slate-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedCategory === cat.id;

              return (
                <div
                  key={cat.id}
                  onClick={() =>
                    setSelectedCategory(isActive ? "Semua" : cat.id)
                  }
                  className={cn(
                    "group relative flex flex-col justify-between p-5 md:p-6 rounded-2xl transition-all duration-300 cursor-pointer select-none border",
                    isActive
                      ? "bg-[#1e3a8a] text-white border-[#1e3a8a] shadow-xl scale-[1.02]"
                      : "bg-white text-slate-800 border-slate-100 hover:border-blue-200 hover:bg-slate-50/80 hover:shadow-md"
                  )}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3
                      className={cn(
                        "text-lg md:text-xl font-bold font-heading",
                        isActive ? "text-white" : "text-slate-900"
                      )}
                    >
                      {cat.title}
                    </h3>
                    <div
                      className={cn(
                        "p-2.5 rounded-xl transition-all shrink-0",
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-blue-50 text-blue-600 group-hover:bg-blue-100"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>

                  <p
                    className={cn(
                      "text-xs leading-relaxed transition-colors",
                      isActive ? "text-blue-100" : "text-slate-500"
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

      {/* ── 3. Horizontal Scroll Pinned Projects Section ───────────────── */}
      <div className="pt-12">
        <HorizontalProjectsSection
          projects={filteredProjects}
          selectedCategory={selectedCategory}
          onResetCategory={() => setSelectedCategory("Semua")}
        />
      </div>
    </div>
  );
}

// ── Horizontal Pinned Scroll Section Component ─────────────────────────────────

function HorizontalProjectsSection({
  projects,
  selectedCategory,
  onResetCategory,
}: {
  projects: JejakKaryaItem[];
  selectedCategory: string;
  onResetCategory: () => void;
}) {
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

    updateScrollRange();
    window.addEventListener("resize", updateScrollRange);
    return () => window.removeEventListener("resize", updateScrollRange);
  }, [projects]);

  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end end"],
  });

  // Horizontal translation finishes at progress = 0.85, leaving the last
  // 15% of the vertical scroll as a "hold" — the last card stays fully
  // visible and still before the section releases into normal vertical flow.
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
          {/* Title Block — exactly 50% viewport width */}
          <div className="w-[50vw] shrink-0 px-6 sm:px-10 md:px-14 lg:px-16">
            <div className="space-y-6">
              <div className="space-y-3">
                <h2 className="text-4xl sm:text-5xl md:text-[56px] lg:text-[64px] font-extrabold tracking-tight font-heading text-[#3a3a3a] leading-[1.05]">
                  Selected work <br />
                  &amp; explorations
                </h2>
                {selectedCategory !== "Semua" && (
                  <span className="inline-block px-3.5 py-1.5 rounded-full text-xs font-mono bg-white text-blue-900 font-bold border border-slate-300 shadow-xs">
                    Kategori: {selectedCategory}
                  </span>
                )}
              </div>

              <div>
                <button
                  onClick={onResetCategory}
                  className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-mono uppercase tracking-widest text-[#555] hover:text-[#1a1a1a] border-b border-[#777] hover:border-[#1a1a1a] pb-1 transition-all cursor-pointer font-semibold"
                >
                  <span>VIEW ALL PROJECTS</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          </div>

          {/* Divider between title block and first card */}
          <div className="w-px self-stretch bg-slate-300/70 shrink-0" />

          {/* Project Cards — each exactly 50% viewport width */}
          <div className="flex items-center shrink-0">
            {projects.map((project, idx) => (
              <div key={project.slug} className="flex items-center shrink-0">
                <div className="w-[50vw] shrink-0 px-6 sm:px-10 lg:px-12 group space-y-4">
                  {/* Card Image Frame */}
                  <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl sm:rounded-3xl bg-slate-300 shadow-md border border-black/5">
                    <img
                      src={project.heroImage}
                      alt={project.title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                    />
                  </div>

                  {/* Card Bottom Meta */}
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 px-1">
                    <div className="space-y-1.5 max-w-lg">
                      <h3 className="text-xl sm:text-2xl font-bold text-[#1a1a1a] font-heading group-hover:text-blue-900 transition-colors">
                        {project.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#555] line-clamp-2 leading-relaxed">
                        {project.description}
                      </p>
                    </div>

                    <Link
                      href={`/jejak-karya/${project.slug}`}
                      className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-[#222] border-b border-[#666] hover:border-black pb-1 shrink-0 font-bold transition-all hover:text-black self-start sm:self-auto"
                    >
                      <span>EXPLORE PROJECT</span>
                      <span>→</span>
                    </Link>
                  </div>
                </div>

                {/* Divider after each card, except the last */}
                {idx < projects.length - 1 && (
                  <div className="w-px self-stretch bg-slate-300/70 shrink-0" />
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}