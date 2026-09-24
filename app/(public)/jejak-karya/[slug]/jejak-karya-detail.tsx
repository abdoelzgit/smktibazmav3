"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";
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
    <div
      className="min-h-screen bg-white text-slate-900 font-sans selection:bg-slate-900 selection:text-white"
      data-nav-theme="light"
    >
      {/* ── Main Layout Body (TRIONN Dribbble Style Split) ─────────────── */}
      <main className="max-w-[1600px] mx-auto px-6 pb-12 pt-24 md:px-12 md:pb-16 md:pt-28">
        <div className="flex flex-col lg:flex-row items-start gap-12 xl:gap-16">
          
          {/* ── Left Sticky Column (Details & Tabs) ────────────────────── */}
          <aside className="w-full lg:w-[420px] xl:w-[460px] shrink-0 lg:sticky lg:top-28 lg:h-[calc(100vh-9rem)] lg:flex lg:flex-col lg:justify-between lg:overflow-y-auto scrollbar-none py-1">
            
            <div className="space-y-6">
              {/* Top Back Link */}
              <div>
                <Link
                  href="/jejak-karya"
                  className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>BACK TO WORK</span>
                </Link>
              </div>

              {/* Project Title & Short Subtitle */}
              <div className="space-y-3">
                <h1 className="text-3xl xl:text-4xl font-extrabold tracking-tight text-slate-900 font-heading leading-tight">
                  {project.title}
                </h1>
                <p className="text-xs xl:text-sm text-slate-600 leading-relaxed">
                  {project.description}
                </p>
              </div>

              {/* Tags / Service Bullets */}
              <div className="space-y-1.5 pt-1">
                {project.tags && project.tags.map((tag) => (
                  <div
                    key={tag}
                    className="text-[11px] font-mono uppercase tracking-wider text-slate-500 flex items-center gap-2"
                  >
                    <span className="text-blue-600 font-bold">•</span>
                    <span>{tag}</span>
                  </div>
                ))}
              </div>

              {/* Section Tab Navigation (THE CHALLENGE, APPROACH, OUTCOME, WHAT WE DID) */}
              <div className="space-y-4 pt-3 border-t border-slate-200">
                <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 pb-2.5">
                  {TABS.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                          "text-[11px] font-bold uppercase tracking-wider transition-all pb-1 relative cursor-pointer",
                          isActive
                            ? "text-slate-900"
                            : "text-slate-400 hover:text-slate-700"
                        )}
                      >
                        {tab.label}
                        {isActive && (
                          <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-slate-900 rounded-full animate-in fade-in" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Tab Content Paragraph */}
                <div className="transition-all">
                  <p className="text-xs xl:text-sm text-slate-700 leading-relaxed">
                    {getTabContent()}
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Footer Navigation */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-xs font-bold uppercase tracking-widest text-slate-500 shrink-0 mt-6 lg:mt-0">
              <Link
                href="/jejak-karya"
                className="hover:text-slate-900 transition-colors flex items-center gap-1.5"
              >
                <span>BACK TO WORK</span>
              </Link>

              {project.nextSlug && (
                <Link
                  href={`/jejak-karya/${project.nextSlug}`}
                  className="hover:text-blue-900 transition-colors flex items-center gap-1.5 text-slate-900 font-bold"
                >
                  <span>NEXT</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>
          </aside>

          {/* ── Right Showcase Column (Mockup Visual Cards) ─────────────── */}
          <section className="flex-1 w-full min-w-0 space-y-6">

            {/* Hero Image */}
            <div className="group relative overflow-hidden rounded-2xl md:rounded-3xl border border-slate-200/80 shadow-md">
              <img
                src={project.heroImage}
                alt={project.title}
                className="w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
              />
              <div className="absolute bottom-5 left-5 right-5 md:right-auto md:max-w-sm rounded-xl border border-slate-200/80 bg-white/90 backdrop-blur-xl p-4 shadow-xl">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-blue-900 font-bold block mb-1">
                      {project.category} • {project.year}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 font-heading">
                      {project.title}
                    </h4>
                    <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                      Dibuat oleh {project.author}
                    </p>
                  </div>
                  {project.demoUrl && (
                    <a
                      href={project.demoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2.5 rounded-lg bg-slate-900 text-white hover:bg-blue-900 transition-all shrink-0 shadow-sm"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Gallery — stack kebawah */}
            {project.galleryImages && project.galleryImages.map((imgUrl, idx) => (
              <div key={idx} className="group overflow-hidden rounded-2xl md:rounded-3xl border border-slate-200/80 shadow-md">
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