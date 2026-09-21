"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { STAFF_CATEGORIES } from "./data";
import { StaffCard } from "./staff-card";
import { cn } from "@/lib/utils";

export default function StaffSection({ className }: { className?: string }) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const panelRefs = useRef<Array<HTMLDivElement | null>>([]);
  const gridRefs = useRef<Array<HTMLDivElement | null>>([]); // kotak scrollable per kategori

  useEffect(() => {
    if (typeof window !== "undefined") {
      gsap.registerPlugin(ScrollTrigger);
    }
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    const wrapper = wrapperRef.current;
    if (!section || !wrapper) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(min-width: 1024px)", () => {
        if (prefersReducedMotion) return;

        const totalCategories = STAFF_CATEGORIES.length;

        panelRefs.current.forEach((panel, i) => {
          if (!panel) return;
          gsap.set(panel, { opacity: i === 0 ? 1 : 0, force3D: true });
        });

        // Reset semua grid ke posisi scroll paling atas
        gridRefs.current.forEach((grid) => {
          if (!grid) return;
          gsap.set(grid, { scrollTop: 0 });
        });

        // Hitung berapa px tiap grid "kelebihan tinggi" dibanding kotaknya
        const overflowAmounts = gridRefs.current.map((grid) => {
          if (!grid) return 0;
          return Math.max(0, grid.scrollHeight - grid.clientHeight);
        });

        const masterTl = gsap.timeline({ paused: true });

        let currentTime = 0;
        const fadeDuration = 0.8;
        const baseHoldDuration = 1.0;
        const scrollPxPerSecond = 500; // makin kecil = makin lama waktu buat scroll grid panjang

        const getHoldTime = (index: number) => {
          const membersCount = STAFF_CATEGORIES[index].members.length;
          const base = membersCount > 4 ? baseHoldDuration * 1.6 : baseHoldDuration;
          const extraForScroll = overflowAmounts[index] / scrollPxPerSecond;
          return base + extraForScroll;
        };

        for (let i = 0; i < totalCategories - 1; i++) {
          const holdStart = currentTime;
          const holdTime = getHoldTime(i);

          // Kalau grid kategori ini lebih tinggi dari kotaknya, scroll dulu sampai habis
          if (overflowAmounts[i] > 0 && gridRefs.current[i]) {
            masterTl.to(
              gridRefs.current[i],
              {
                scrollTop: overflowAmounts[i],
                duration: holdTime,
                ease: "none",
              },
              holdStart
            );
          }
          currentTime += holdTime;

          const animStartTime = currentTime;
          const currentPanel = panelRefs.current[i];
          const nextPanel = panelRefs.current[i + 1];
          if (!currentPanel || !nextPanel) continue;

          masterTl.to(
            currentPanel,
            { opacity: 0, duration: fadeDuration, ease: "power1.inOut", force3D: true },
            animStartTime
          );
          masterTl.to(
            nextPanel,
            { opacity: 1, duration: fadeDuration, ease: "power1.inOut", force3D: true },
            animStartTime
          );

          currentTime += fadeDuration;
        }

        // Hold + scroll untuk kategori terakhir sebelum unpin
        const lastIndex = totalCategories - 1;
        const lastHoldStart = currentTime;
        const lastHoldTime = getHoldTime(lastIndex);
        if (overflowAmounts[lastIndex] > 0 && gridRefs.current[lastIndex]) {
          masterTl.to(
            gridRefs.current[lastIndex],
            {
              scrollTop: overflowAmounts[lastIndex],
              duration: lastHoldTime,
              ease: "none",
            },
            lastHoldStart
          );
        }
        currentTime += lastHoldTime;

        const totalScrollDistance = currentTime * 400;

        ScrollTrigger.create({
          trigger: section,
          pin: true,
          pinSpacing: true,
          start: "top top",
          end: `+=${totalScrollDistance}`,
          scrub: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          animation: masterTl,
        });
      });

      mm.add("(max-width: 1023px)", () => {
        gsap.set(wrapper, { clearProps: "all" });
        panelRefs.current.forEach((panel) => {
          if (!panel) return;
          gsap.set(panel, { clearProps: "all" });
        });
        gridRefs.current.forEach((grid) => {
          if (!grid) return;
          gsap.set(grid, { clearProps: "all" });
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="staff-sekolah"
      data-nav-theme="light"
      className={cn(
        "relative w-full bg-white text-slate-900",
        "py-16 sm:py-20 lg:py-0 lg:h-screen",
        className
      )}
    >
      <div ref={wrapperRef} className="relative w-full h-full">
        {STAFF_CATEGORIES.map((category, catIndex) => (
          <div
            key={category.id}
            ref={(el) => {
              panelRefs.current[catIndex] = el;
            }}
            className={cn(
              "w-full flex flex-col lg:flex-row lg:items-stretch lg:gap-16 xl:gap-24",
              "lg:absolute lg:inset-0 lg:h-full lg:py-16 xl:py-20",
              "mx-auto max-w-[1920px] px-6 sm:px-10 md:px-14 lg:px-16 xl:px-24",
              "will-change-[opacity]"
            )}
          >
            {/* Kolom Kiri: Title — diam di tengah, tidak ikut scroll */}
            <div className="w-full lg:w-[40%] xl:w-[38%] lg:shrink-0 flex flex-col justify-center mb-8 lg:mb-0 lg:h-full">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#132B6D] font-heading leading-tight">
                {category.title}
              </h2>
              <p className="mt-4 sm:mt-6 text-sm sm:text-base lg:text-lg text-slate-500 font-normal leading-relaxed max-w-xl">
                {category.description}
              </p>
            </div>

            {/* Kolom Kanan: Grid — bisa scroll internal kalau kartunya lebih tinggi dari layar */}
            <div
              ref={(el) => {
                gridRefs.current[catIndex] = el;
              }}
              className="w-full lg:w-[60%] xl:w-[62%] lg:grow lg:h-full lg:overflow-y-auto no-scrollbar"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 xl:gap-8 justify-items-start py-2">
                {category.members.map((member) => (
                  <div key={member.id} className="w-full flex justify-center sm:justify-start">
                    <StaffCard member={member} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}