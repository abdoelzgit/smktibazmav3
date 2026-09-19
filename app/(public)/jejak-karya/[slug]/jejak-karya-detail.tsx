"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ExternalLink, Sparkles } from "lucide-react";
import { JejakKaryaItem } from "@/lib/jejak-karya-data";
import { cn } from "@/lib/utils";

interface DetailProps {
  project: JejakKaryaItem;
}

type TabType = "challenge" | "approach" | "outcome" | "whatWeDid";

const TABS: { id: TabType; label: string }[] = [
  { id: "challenge", label: "THE CHALLENGE" },
  { id: "approach", label: "APPROACH" },
  { id: "outcome", label: "OUTCOME" },
  { id: "whatWeDid", label: "WHAT WE DID" },
];

export function JejakKaryaDetailClient({ project }: DetailProps) {
  const [activeTab, setActiveTab] = useState<TabType>("challenge");

  const getTabContent = () => {
    switch (activeTab) {
      case "challenge":
        return project.challenge;
      case "approach":
        return project.approach;
      case "outcome":
        return project.outcome;
      case "whatWeDid":
        return project.whatWeDid;
      default:
        return project.challenge;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 font-sans selection:bg-white selection:text-black">

      {/* ── Main Layout Body (TRIONN Dribbble Style Split) ─────────────── */}
      {/* pt-24 md:pt-28 memberi ruang di bawah navbar yang fixed */}
      <main className="max-w-[1600px] mx-auto px-6 pb-8 pt-24 md:px-12 md:pb-12 md:pt-28">
        <div className="flex flex-col lg:flex-row items-start gap-12 xl:gap-16">
          
          {/* ── Left Sticky Column (Details & Tabs) ────────────────────── */}
          {/* lg:top-28 disesuaikan dengan pt-28 agar sticky tidak tertimpa navbar */}
          <aside className="w-full lg:w-[420px] xl:w-[460px] shrink-0 space-y-10 lg:sticky lg:top-28">
            
            {/* Top Back Link */}
            <div>
              <Link
                href="/jejak-karya"
                className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-zinc-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>BACK TO WORK</span>
              </Link>
            </div>

            {/* Project Title & Short Subtitle */}
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white font-heading leading-tight">
                {project.title}
              </h1>
              <p className="text-sm md:text-base text-zinc-400 leading-relaxed">
                {project.description}
              </p>
            </div>

            {/* Tags / Service Bullets */}
            <div className="space-y-2 pt-2">
              {project.tags.map((tag) => (
                <div
                  key={tag}
                  className="text-xs font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-2"
                >
                  <span className="text-zinc-600">-</span>
                  <span>{tag}</span>
                </div>
              ))}
            </div>

            {/* Section Tab Navigation (THE CHALLENGE, APPROACH, OUTCOME, WHAT WE DID) */}
            <div className="space-y-6 pt-4 border-t border-zinc-900">
              <div className="flex flex-wrap items-center gap-4 border-b border-zinc-900 pb-3">
                {TABS.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        "text-xs font-bold uppercase tracking-wider transition-all pb-1 relative cursor-pointer",
                        isActive
                          ? "text-white"
                          : "text-zinc-500 hover:text-zinc-300"
                      )}
                    >
                      {tab.label}
                      {isActive && (
                        <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-white rounded-full animate-in fade-in" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Tab Content Paragraph */}
              <div className="min-h-[120px] transition-all">
                <p className="text-xs md:text-sm text-zinc-300 leading-relaxed">
                  {getTabContent()}
                </p>
              </div>
            </div>

            {/* Bottom Footer Navigation */}
            <div className="pt-6 border-t border-zinc-900 flex items-center justify-between text-xs font-bold uppercase tracking-widest text-zinc-400">
              <Link
                href="/jejak-karya"
                className="hover:text-white transition-colors flex items-center gap-1.5"
              >
                <span>BACK TO WORK</span>
              </Link>

              {project.nextSlug && (
                <Link
                  href={`/jejak-karya/${project.nextSlug}`}
                  className="hover:text-white transition-colors flex items-center gap-1.5 text-white"
                >
                  <span>NEXT</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>
          </aside>

          {/* ── Right Showcase Column (Mockup Visual Cards) ─────────────── */}
       <section className="flex-1 w-full min-w-0 space-y-5">

            {/* Hero Image */}
            <div className="group relative overflow-hidden rounded-2xl">
              <img
                src={project.heroImage}
                alt={project.title}
                className="w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
              />
              <div className="absolute bottom-5 left-5 right-5 md:right-auto md:max-w-sm rounded-xl border border-white/10 bg-black/60 backdrop-blur-xl p-4 shadow-xl">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 block mb-1">
                      {project.category} • {project.year}
                    </span>
                    <h4 className="text-sm font-bold text-white font-heading">
                      {project.title}
                    </h4>
                    <p className="text-xs text-zinc-400 line-clamp-1 mt-0.5">
                      Dibuat oleh {project.author}
                    </p>
                  </div>
                  {project.demoUrl && (
                    <a
                      href={project.demoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2.5 rounded-lg bg-white text-black hover:bg-zinc-200 transition-all shrink-0"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Gallery — stack kebawah */}
            {project.galleryImages && project.galleryImages.map((imgUrl, idx) => (
              <div key={idx} className="group  overflow-hidden rounded-2xl">
                <img
                  src={imgUrl}
                  alt={`${project.title} preview ${idx + 1}`}
                  className="w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                />
              </div>
            ))}

          </section>

        </div>
      </main>
    </div>
  );
}