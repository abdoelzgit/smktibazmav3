"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { STAFF_CATEGORIES } from "./data";
import { StaffCard } from "./staff-card";
import { cn } from "@/lib/utils";

export default function StaffSection({ className }: { className?: string }) {
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);
  const [fadeState, setFadeState] = useState<"visible" | "fading">("visible");

  const sectionRef = useRef<HTMLElement | null>(null);
  const trackContainerRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const categoryGroupRefs = useRef<Array<HTMLDivElement | null>>([]);
  const activeIndexRef = useRef(0);
  const isTransitioningRef = useRef(false);

  // Register ScrollTrigger once on client side
  useEffect(() => {
    if (typeof window !== "undefined") {
      gsap.registerPlugin(ScrollTrigger);
    }
  }, []);

  // Handler pergantian kategori dengan animasi fade halus
  const changeCategory = (newIndex: number) => {
    if (newIndex === activeIndexRef.current || isTransitioningRef.current) return;

    isTransitioningRef.current = true;
    setFadeState("fading");

    setTimeout(() => {
      setActiveCategoryIndex(newIndex);
      activeIndexRef.current = newIndex;
      setFadeState("visible");
      isTransitioningRef.current = false;
    }, 150);
  };

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    const trackContainer = trackContainerRef.current;

    if (!section || !track || !trackContainer) return;

    // Cek preferensi reduced-motion
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const ctx = gsap.context(() => {
      // Gunakan matchMedia untuk memisahkan behavior Desktop vs Mobile
      const mm = gsap.matchMedia();

      // Desktop: Animasi Horizontal Scroll dengan Pinning
      mm.add("(min-width: 1024px)", () => {
        if (prefersReducedMotion) return;

        const getScrollDistance = () => {
          return Math.max(0, track.scrollWidth - trackContainer.clientWidth);
        };

        const updateCategoryOnScroll = (self: ScrollTrigger) => {
          const scrollDistance = getScrollDistance();
          if (scrollDistance <= 0) return;

          const currentX = self.progress * scrollDistance;
          const containerWidth = trackContainer.clientWidth;
          // Threshold pergantian kategori saat kategori masuk ke area pandang aktif
          const viewTriggerX = currentX + containerWidth * 0.25;

          let targetIdx = 0;
          for (let i = 0; i < categoryGroupRefs.current.length; i++) {
            const groupEl = categoryGroupRefs.current[i];
            if (groupEl && viewTriggerX >= groupEl.offsetLeft) {
              targetIdx = i;
            }
          }

          if (targetIdx !== activeIndexRef.current) {
            changeCategory(targetIdx);
          }
        };

        gsap.to(track, {
          x: () => -getScrollDistance(),
          ease: "none",
          scrollTrigger: {
            trigger: section,
            pin: true,
            start: "top top",
            end: () => `+=${getScrollDistance()}`,
            scrub: 1,
            invalidateOnRefresh: true,
            anticipatePin: 1,
            onUpdate: updateCategoryOnScroll,
          },
        });
      });

      // Mobile / Tablet: Tanpa Pinning (Native Horizontal Touch Swipe)
      mm.add("(max-width: 1023px)", () => {
        // Pada mobile, posisi track direset ke normal flow
        gsap.set(track, { clearProps: "transform" });
      });
    }, sectionRef);

    return () => {
      ctx.revert();
    };
  }, []);

  const activeCategory = STAFF_CATEGORIES[activeCategoryIndex];

  return (
    <section
      ref={sectionRef}
      id="staff-sekolah"
      data-nav-theme="light"
      className={cn(
        "relative w-full bg-white text-slate-900",
        // Desktop: Satu layar penuh untuk pinning yang presisi
        "lg:h-screen lg:min-h-screen lg:overflow-hidden lg:flex lg:items-center",
        // Mobile: Padding vertikal normal
        "py-16 sm:py-20 lg:py-0",
        className
      )}
    >
      <div className="mx-auto flex h-full w-full max-w-[1920px] flex-col justify-center px-6 sm:px-10 md:px-14 lg:flex-row lg:items-center lg:gap-16 xl:gap-24 lg:px-16 xl:px-24">
        {/* Kolom Kiri: Informasi Kategori (~42% pada desktop) */}
        <div className="w-full lg:w-[42%] lg:max-w-[42%] lg:shrink-0 flex flex-col justify-center">
          {/* Container teks berdimensi stabil untuk mencegah layout shift saat pergantian teks */}
          <div className="min-h-[140px] sm:min-h-[160px] lg:min-h-[220px] flex flex-col justify-center">
            <div
              className={cn(
                "transition-opacity duration-200 ease-in-out",
                fadeState === "visible" ? "opacity-100" : "opacity-0"
              )}
            >
              {/* Judul Kategori: Berukuran besar, warna biru tua (#132B6D) */}
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#132B6D] font-heading leading-tight">
                {activeCategory.title}
              </h2>

              {/* Deskripsi Kategori: Tepat di bawah judul, abu-abu dengan font ringan */}
              <p className="mt-4 sm:mt-6 text-sm sm:text-base lg:text-lg text-slate-500 font-normal leading-relaxed max-w-xl">
                {activeCategory.description}
              </p>
            </div>
          </div>
        </div>

            {/* Kolom Kanan: Grid — bisa scroll internal kalau kartunya lebih tinggi dari layar */}
            <div
              ref={(el) => {
                gridRefs.current[catIndex] = el;
              }}
              className="w-full lg:w-[60%] xl:w-[62%] lg:grow lg:h-full lg:overflow-y-auto no-scrollbar px-0 lg:pr-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 lg:gap-6 justify-items-start py-2">
                {category.members.map((member) => (
                  <div key={member.id} className="snap-start">
                    <StaffCard member={member} />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
