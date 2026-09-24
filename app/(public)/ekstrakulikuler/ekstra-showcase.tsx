"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ShowcaseItem {
  title: string;
  description: string;
  image: string;
}

interface EkstraShowcaseProps {
  items: ShowcaseItem[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const AUTOPLAY_DURATION = 5;

// ─── Component ────────────────────────────────────────────────────────────────

export function EkstraShowcase({ items }: EkstraShowcaseProps) {
  const prefersReducedMotion = useReducedMotion();

  const [activeIndex, setActiveIndex] = useState(0);
  const [isHidden, setIsHidden] = useState(false);

  const imageRefs = useRef<Array<HTMLImageElement | null>>([]);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const progressRefs = useRef<Array<HTMLSpanElement | null>>([]);

  const activeIndexRef = useRef(activeIndex);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const slideStartedAtRef = useRef<number>(0);
  const remainingMsRef = useRef(AUTOPLAY_DURATION * 1000);

  const prevActiveIndexRef = useRef<number | null>(null);

  const total = items.length;

  // ── Active index ref ──────────────────────────────────────────────────────

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  // ── Page visibility ───────────────────────────────────────────────────────

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsHidden(document.hidden);
    };

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    return () => {
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
    };
  }, []);

  // ── Navigation ───────────────────────────────────────────────────────────

  const goToSlide = useCallback(
    (nextIndex: number) => {
      if (!total) return;

      const normalized =
        ((nextIndex % total) + total) % total;

      if (normalized === activeIndexRef.current) return;

      setActiveIndex(normalized);
    },
    [total]
  );

  const goNext = useCallback(() => {
    goToSlide(activeIndexRef.current + 1);
  }, [goToSlide]);

  // ── Background image + content animation ─────────────────────────────────

  useEffect(() => {
    if (!items.length) return;

    const currentImage = imageRefs.current[activeIndex];

    const otherImages = imageRefs.current.filter(
      (_, index) => index !== activeIndex
    );

    const timeline = gsap.timeline();

    // Hide other images
    timeline.to(
      otherImages,
      {
        opacity: 0,
        duration: prefersReducedMotion ? 0 : 0.6,
        ease: "power2.inOut",
      },
      0
    );

    // Active image
    if (currentImage) {
      gsap.killTweensOf(currentImage);

      if (prefersReducedMotion) {
        gsap.set(currentImage, {
          opacity: 1,
          scale: 1,
        });
      } else {
        timeline
          .fromTo(
            currentImage,
            {
              opacity: 0,
              scale: 1.08,
            },
            {
              opacity: 1,
              scale: 1,
              duration: 0.9,
              ease: "power2.out",
            },
            0
          )
          .to(
            currentImage,
            {
              scale: 1.05,
              duration: AUTOPLAY_DURATION + 1,
              ease: "none",
            },
            0
          );
      }
    }

    // Text reveal
    if (contentRef.current) {
      const children =
        contentRef.current.querySelectorAll(
          "[data-reveal]"
        );

      gsap.killTweensOf(children);

      if (prefersReducedMotion) {
        gsap.set(children, {
          y: 0,
          opacity: 1,
        });
      } else {
        timeline.fromTo(
          children,
          {
            y: 24,
            opacity: 0,
          },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            ease: "power3.out",
            stagger: 0.08,
          },
          0.18
        );
      }
    }

    return () => {
      timeline.kill();
    };
  }, [activeIndex, prefersReducedMotion, items.length]);

  // ── Progress bar helpers ─────────────────────────────────────────────────

  const setBarInstant = useCallback(
    (index: number, filled: boolean) => {
      const element = progressRefs.current[index];

      if (!element) return;

      element.style.transition = "none";
      element.style.transform = filled
        ? "scaleX(1)"
        : "scaleX(0)";
    },
    []
  );

  const startBarCountdown = useCallback(
    (index: number, milliseconds: number) => {
      const element = progressRefs.current[index];

      if (!element || milliseconds <= 0) return;

      element.style.transition = "none";
      element.style.transform = "scaleX(0)";

      void element.offsetWidth;

      element.style.transition =
        `transform ${milliseconds}ms linear`;

      element.style.transform = "scaleX(1)";
    },
    []
  );

  const freezeBar = useCallback((index: number) => {
    const element = progressRefs.current[index];

    if (!element) return;

    const computed =
      window.getComputedStyle(element).transform;

    element.style.transition = "none";

    element.style.transform =
      computed === "none"
        ? "scaleX(0)"
        : computed;
  }, []);

  // ── Autoplay ──────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!total) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    const isNewSlide =
      prevActiveIndexRef.current !== activeIndex;

    prevActiveIndexRef.current = activeIndex;

    // New slide
    if (isNewSlide) {
      progressRefs.current.forEach((_, index) => {
        setBarInstant(index, false);
      });

      remainingMsRef.current =
        AUTOPLAY_DURATION * 1000;
    }

    // Page hidden
    if (isHidden) {
      const elapsed =
        Date.now() - slideStartedAtRef.current;

      remainingMsRef.current = Math.max(
        0,
        remainingMsRef.current - elapsed
      );

      freezeBar(activeIndex);

      return;
    }

    if (remainingMsRef.current <= 0) {
      remainingMsRef.current =
        AUTOPLAY_DURATION * 1000;
    }

    slideStartedAtRef.current = Date.now();

    startBarCountdown(
      activeIndex,
      remainingMsRef.current
    );

    timeoutRef.current = setTimeout(() => {
      goNext();
    }, remainingMsRef.current);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [
    activeIndex,
    isHidden,
    total,
    goNext,
    setBarInstant,
    startBarCountdown,
    freezeBar,
  ]);

  if (!items.length) return null;

  const activeItem = items[activeIndex];

  return (
    <section
      data-nav-theme="dark"
      className="
        relative
        flex
        min-h-[70vh]
        w-full
        flex-col
        overflow-hidden
        bg-[#132B6D]
        text-white
        sm:min-h-[82vh]
        lg:min-h-[88vh]
      "
      aria-label="Kegiatan Ekstrakurikuler"
      aria-roledescription="carousel"
    >
      {/* ═══════════════════════════════════════════════════════════════════
          BACKGROUND IMAGES
          ═══════════════════════════════════════════════════════════════════ */}

      <div className="absolute inset-0 overflow-hidden">
        {items.map((item, index) => (
          <Image
            key={`${item.title}-${index}`}
            ref={(element) => {
              imageRefs.current[index] = element;
            }}
            src={item.image}
            alt=""
            fill
            priority={index === 0}
            sizes="100vw"
            className="object-cover"
            style={{
              opacity: index === 0 ? 1 : 0,
            }}
            aria-hidden={index !== activeIndex}
          />
        ))}

        {/* Main navy wash */}
        <div
          className="
            pointer-events-none
            absolute
            inset-0
            bg-gradient-to-br
            from-[#0b1f5c]/95
            via-[#0b1f5c]/70
            to-[#0b1f5c]/15
          "
        />

        {/* Bottom darkening */}
        <div
          className="
            pointer-events-none
            absolute
            inset-0
            bg-gradient-to-b
            from-[#0b1f5c]/30
            via-transparent
            to-[#0b1f5c]/90
          "
        />
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          CONTENT
          ═══════════════════════════════════════════════════════════════════ */}

      <div
        className="
          relative
          z-10
          mx-auto
          flex
          w-full
          max-w-[1920px]
          flex-1
          flex-col
          justify-between
          gap-10
          px-6
          pb-6
          pt-10
          sm:px-10
          sm:pb-8
          sm:pt-14
          lg:px-16
          xl:px-24
        "
      >
        {/* ── Text ─────────────────────────────────────────────────────── */}

        <div
          ref={contentRef}
          className="
            flex
            max-w-3xl
            flex-col
            gap-4
          "
        >
          <span
            data-reveal
            className="
              text-xs
              font-mono
              uppercase
              tracking-[0.22em]
              text-white/55
              sm:text-sm
            "
          >
            Ekstrakurikuler
          </span>

          <h2
            data-reveal
            className="
              max-w-3xl
              font-heading
              text-4xl
              font-bold
              leading-[0.95]
              tracking-tight
              sm:text-5xl
              lg:text-7xl
              xl:text-8xl
            "
          >
            {activeItem.title}
          </h2>

          <div
            data-reveal
            className="
              h-[2px]
              w-12
              bg-white/50
              sm:w-16
            "
          />

          <p
            data-reveal
            className="
              max-w-2xl
              text-sm
              leading-relaxed
              text-white/80
              sm:text-base
              lg:text-lg
              xl:text-xl
            "
          >
            {activeItem.description}
          </p>
        </div>

        {/* ── Bottom Navigation ────────────────────────────────────────── */}

        <nav
          className="relative z-10"
          aria-label="Navigasi ekstrakurikuler"
        >
          <ul className="flex">
            {items.map((item, index) => {
              const isActive = index === activeIndex;

              return (
                <li
                  key={`${item.title}-${index}`}
                  className="flex-1"
                >
                  <button
                    type="button"
                    onClick={() => goToSlide(index)}
                    aria-current={isActive ? "true" : undefined}
                    className="
              group
              flex
              h-auto
              w-full
              flex-col
              items-start
              justify-start
              gap-0
              rounded-none
              px-1
              text-left
              sm:px-3
              lg:px-4
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-white/70
            "
                  >
                    {/* Title */}
                    <span
                      className={cn(
                        `
                  block
                  text-xs
                  font-semibold
                  tracking-wide
                  transition-colors
                  duration-300
                  sm:text-sm
                  lg:text-base
                `,
                        isActive
                          ? "text-white"
                          : "text-white/45 group-hover:text-white/75"
                      )}
                    >
                      {item.title}
                    </span>

                    {/* Progress Track */}
                    <span
                      className="
                mt-3
                block
                h-[1px]
                w-full
                overflow-hidden
                bg-white/15
              "
                    >
                      <span
                        ref={(element) => {
                          progressRefs.current[index] = element;
                        }}
                        className="
                  block
                  h-full
                  w-full
                  origin-left
                  bg-gradient-to-r
                  from-lime-400
                  to-emerald-400
                "
                        style={{
                          transform: "scaleX(0)",
                        }}
                      />
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </section>
  );
}