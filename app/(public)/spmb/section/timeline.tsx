"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Types & mock data                                                         */
/* -------------------------------------------------------------------------- */

export type TimelineStatus = "past" | "current" | "future";

export type TimelineItem = {
  id: string;
  date: string;
  title: string;
  description: string;
  status: TimelineStatus;
};

export type TimelineSectionProps = {
  title?: string;
  description?: string;
  ctaLabel?: string;
  ctaHref?: string;
  items?: TimelineItem[];
};

const MOCK_TIMELINE: TimelineItem[] = [
  {
    id: "pendaftaran-online",
    date: "15 Nov – 28 Des 2025",
    title: "Pendaftaran Online",
    description:
      "Pendaftaran calon peserta didik secara online melalui portal resmi.",
    status: "past",
  },
  {
    id: "seleksi-administrasi",
    date: "10 – 11 Jan 2026",
    title: "Pengumuman Seleksi Administrasi",
    description:
      "Pengumuman hasil seleksi administrasi calon peserta didik.",
    status: "future",
  },
  {
    id: "tes-akademik",
    date: "24 – 25 Jan 2026",
    title: "Tes Akademik",
    description:
      "Pelaksanaan tes akademik bagi calon peserta didik yang lolos seleksi administrasi.",
    status: "future",
  },
  {
    id: "pengumuman-akademik",
    date: "7 – 8 Feb 2026",
    title: "Pengumuman Tes Akademik",
    description: "Pengumuman hasil tes akademik calon peserta didik.",
    status: "future",
  },
  {
    id: "tes-bacaan-quran",
    date: "14 – 17 Feb 2026",
    title: "Tes Bacaan Al-Qur’an",
    description:
      "Pelaksanaan tes bacaan Al-Qur’an bagi calon peserta didik.",
    status: "future",
  },
  {
    id: "pengumuman-wawancara",
    date: "22 Feb – 14 Mar 2026",
    title: "Pengumuman Jadwal Wawancara",
    description:
      "Informasi jadwal wawancara bagi calon peserta didik.",
    status: "future",
  },
  {
    id: "interview",
    date: "6 – 11 Apr 2026",
    title: "Interview",
    description: "Pelaksanaan wawancara calon peserta didik.",
    status: "future",
  },
  {
    id: "psikotes",
    date: "18 – 19 Apr 2026",
    title: "Psikotes Online & Offline",
    description: "Pelaksanaan psikotes secara online maupun offline.",
    status: "future",
  },
  {
    id: "home-visit",
    date: "4 – 9 Mei 2026",
    title: "Home Visit",
    description:
      "Kunjungan ke rumah calon peserta didik sebagai bagian dari tahapan seleksi.",
    status: "future",
  },
  {
    id: "pengumuman-akhir",
    date: "22 – 23 Mei 2026",
    title: "Pengumuman Akhir",
    description:
      "Pengumuman hasil akhir seleksi penerimaan peserta didik baru.",
    status: "future",
  },
];

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function padNumber(n: number) {
  return String(n).padStart(2, "0");
}

const LINE_TOP = 40;

const SCROLL_FACTOR = 1.2;

const DWELL_RATIO = 0.55;

function easeSmoothstep(t: number) {
  const clamped = Math.min(1, Math.max(0, t));
  return clamped * clamped * (3 - 2 * clamped);
}

/* -------------------------------------------------------------------------- */
/*  Sub-components                                                            */
/* -------------------------------------------------------------------------- */

function StatusIndicator({ status }: { status: TimelineStatus }) {
  if (status === "past") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
        <Check className="h-3.5 w-3.5" aria-hidden="true" />
        Selesai
      </span>
    );
  }

  if (status === "current") {
    return (
      <span className="inline-flex items-center gap-2 text-xs font-semibold text-[#37497A]">
        <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#37497A] opacity-60 motion-reduce:animate-none" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#37497A]" />
        </span>
        Sedang berlangsung
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
      <Clock className="h-3.5 w-3.5" aria-hidden="true" />
      Akan datang
    </span>
  );
}

function DesktopNode({
  item,
  index,
  isFocused,
}: {
  item: TimelineItem;
  index: number;
  isFocused: boolean;
}) {
  const nodeClass =
    item.status === "past"
      ? "relative z-10 h-2.5 w-2.5 rounded-full bg-[#37497A]/60"
      : item.status === "current"
        ? "relative z-10 h-3.5 w-3.5 rounded-full bg-[#37497A]"
        : "relative z-10 h-2.5 w-2.5 rounded-full border-2 border-slate-300 bg-white";

  const titleClass =
    item.status === "past"
      ? "text-slate-500"
      : item.status === "current" || isFocused
        ? "text-[#37497A]"
        : "text-slate-800";

  return (
    <li
      data-timeline-item
      className="relative flex w-[230px] shrink-0 flex-col px-3 sm:w-[270px] lg:w-[300px] xl:w-[320px]"
    >
      <div className="flex h-4 items-center">
        <span className="text-[11px] font-semibold tracking-[0.15em] text-slate-400">
          {padNumber(index + 1)}
        </span>
      </div>

      <div className="mt-3 flex h-6 items-center">
        <span className={nodeClass} aria-hidden="true">
          {item.status === "current" && (
            <span className="absolute -inset-1 animate-ping rounded-full bg-[#37497A]/30 motion-reduce:animate-none" />
          )}
        </span>
      </div>

      <div
        className={`mt-4 transition-opacity duration-300 ${isFocused ? "opacity-100" : "opacity-55"
          }`}
      >
        <h3 className={`text-base font-bold leading-snug ${titleClass}`}>
          {item.title}
        </h3>

        <p className="mt-1 text-sm font-medium text-slate-500">
          {item.date}
        </p>

        {isFocused && (
          <p className="mt-2 max-w-[230px] text-sm leading-relaxed text-slate-500">
            {item.description}
          </p>
        )}
      </div>
    </li>
  );
}

function MobileTimelineItem({
  item,
  index,
  isLast,
}: {
  item: TimelineItem;
  index: number;
  isLast: boolean;
}) {
  const dotClass =
    item.status === "past"
      ? "h-3 w-3 rounded-full bg-[#37497A]/60"
      : item.status === "current"
        ? "h-3.5 w-3.5 rounded-full bg-[#37497A] ring-4 ring-[#37497A]/15"
        : "h-3 w-3 rounded-full border-2 border-slate-300 bg-white";

  const titleClass =
    item.status === "past"
      ? "text-slate-500"
      : item.status === "current"
        ? "text-[#37497A]"
        : "text-slate-900";

  return (
    <li className={`relative pl-8 ${isLast ? "" : "pb-8"}`}>
      {!isLast && (
        <span
          className="absolute left-[5px] top-4 w-px bg-slate-200"
          style={{ height: "calc(100% - 0.25rem)" }}
          aria-hidden="true"
        />
      )}

      <span
        className={`absolute left-0 top-1 z-10 ${dotClass}`}
        aria-hidden="true"
      />

      <span className="text-[11px] font-semibold tracking-[0.15em] text-slate-400">
        {padNumber(index + 1)}
      </span>

      <h3 className={`mt-1 text-lg font-bold leading-snug ${titleClass}`}>
        {item.title}
      </h3>

      <p className="mt-1 text-sm font-medium text-slate-500">
        {item.date}
      </p>

      <p className="mt-2 text-sm leading-relaxed text-slate-500">
        {item.description}
      </p>

      <div className="mt-3">
        <StatusIndicator status={item.status} />
      </div>
    </li>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main component                                                            */
/* -------------------------------------------------------------------------- */

export default function TimelineSection({
  title = "Timeline SPMB 2026",
  description = "Pantau setiap tahapan penerimaan siswa baru, dari sosialisasi sampai daftar ulang, supaya tidak ada jadwal penting yang terlewat.",
  ctaLabel = "Daftar Sekarang",
  ctaHref = "/pendaftaran",
  items = MOCK_TIMELINE,
}: TimelineSectionProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLOListElement>(null);

  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);
  const [isDesktop, setIsDesktop] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const [trackScrollWidth, setTrackScrollWidth] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);

  const activeIndexRef = useRef(0);

  const hijackActive = isDesktop && !reducedMotion;

  useEffect(() => {
    const checkFlags = () => {
      setIsDesktop(window.innerWidth >= 1024);

      setReducedMotion(
        window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      );
    };

    checkFlags();

    window.addEventListener("resize", checkFlags);

    return () => {
      window.removeEventListener("resize", checkFlags);
    };
  }, []);

  useEffect(() => {
    const trackEl = trackRef.current;

    if (!trackEl) return;

    const updateDimensions = () => {
      setTrackScrollWidth(trackEl.scrollWidth);
    };

    updateDimensions();

    const resizeObserver = new ResizeObserver(updateDimensions);

    resizeObserver.observe(trackEl);

    return () => {
      resizeObserver.disconnect();
    };
  }, [items]);

  const handleScroll = useCallback(() => {
    if (!hijackActive || !wrapperRef.current || !trackRef.current) {
      return;
    }

    const wrapper = wrapperRef.current;
    const track = trackRef.current;

    const wrapperRect = wrapper.getBoundingClientRect();

    const scrollableHeight =
      wrapper.offsetHeight - window.innerHeight;

    if (scrollableHeight <= 0) {
      return;
    }

    const progress = Math.min(
      1,
      Math.max(0, -wrapperRect.top / scrollableHeight),
    );

    const itemEls = Array.from(
      track.querySelectorAll<HTMLElement>("[data-timeline-item]"),
    );

    const n = itemEls.length;

    if (n < 2) {
      return;
    }

    const scaledProgress = progress * (n - 1);

    const segmentIndex = Math.min(
      n - 2,
      Math.floor(scaledProgress),
    );

    const segmentProgress =
      scaledProgress - segmentIndex;

    const fromOffset =
      itemEls[segmentIndex].offsetLeft;

    const toOffset =
      itemEls[segmentIndex + 1].offsetLeft;

    let movementProgress = 0;

    if (segmentProgress > DWELL_RATIO) {
      movementProgress =
        (segmentProgress - DWELL_RATIO) /
        (1 - DWELL_RATIO);
    }

    movementProgress = easeSmoothstep(movementProgress);

    const currentOffset =
      fromOffset +
      (toOffset - fromOffset) * movementProgress;

    const nextTranslate = -currentOffset;

    requestAnimationFrame(() => {
      setTranslateX(nextTranslate);
    });

    let closestIndex = 0;
    let minDistance = Infinity;

    itemEls.forEach((el, idx) => {
      const distance = Math.abs(
        el.offsetLeft + nextTranslate,
      );

      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = idx;
      }
    });

    if (activeIndexRef.current !== closestIndex) {
      activeIndexRef.current = closestIndex;

      setActiveIndex(closestIndex);
      setCanPrev(closestIndex > 0);
      setCanNext(closestIndex < n - 1);
    }
  }, [hijackActive]);

  useEffect(() => {
    if (!hijackActive) {
      setTranslateX(0);
      return;
    }

    window.addEventListener(
      "scroll",
      handleScroll,
      { passive: true },
    );

    handleScroll();

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll,
      );
    };
  }, [hijackActive, handleScroll]);

  const scrollToIndex = (targetIndex: number) => {
    const safeIndex = Math.max(
      0,
      Math.min(items.length - 1, targetIndex),
    );

    const track = trackRef.current;

    if (!track) {
      return;
    }

    if (hijackActive && wrapperRef.current) {
      const wrapper = wrapperRef.current;

      const n = items.length;

      if (n < 2) {
        return;
      }

      const targetProgress =
        safeIndex === n - 1
          ? 1
          : (safeIndex + DWELL_RATIO / 2) / (n - 1);

      const scrollableHeight =
        wrapper.offsetHeight - window.innerHeight;

      const wrapperTopAbsolute =
        wrapper.getBoundingClientRect().top +
        window.scrollY;

      const targetScrollY =
        wrapperTopAbsolute +
        targetProgress * scrollableHeight;

      window.scrollTo({
        top: targetScrollY,
        behavior: "smooth",
      });
    } else {
      const el =
        track.querySelectorAll<HTMLElement>(
          "[data-timeline-item]",
        )[safeIndex];

      el?.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  };

  const handlePrev = () => {
    scrollToIndex(
      activeIndexRef.current - 1,
    );
  };

  const handleNext = () => {
    scrollToIndex(
      activeIndexRef.current + 1,
    );
  };

  const arrowClass =
    "flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 bg-white text-[#37497A] transition-colors hover:border-[#37497A] hover:bg-[#37497A] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#37497A] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-white disabled:text-slate-300 cursor-pointer shadow-sm";

  const progressWidth = Math.min(
    trackScrollWidth,
    Math.abs(translateX),
  );

  return (
    <div
      ref={wrapperRef}
      className="relative w-full bg-white"
      style={{
        height: hijackActive
          ? `calc(100vh + ${trackScrollWidth * SCROLL_FACTOR
          }px)`
          : "auto",
      }}
    >
      <section
        ref={sectionRef}
        aria-labelledby="timeline-title"
        className={
          hijackActive
            ? "sticky top-0 flex h-screen w-full items-center overflow-hidden py-6 lg:py-12"
            : "relative w-full bg-white py-8 sm:py-12 lg:py-16"
        }
      >
        <div className="mx-auto flex h-full w-full max-w-[1920px] flex-col justify-center px-4 sm:px-6 lg:px-16 xl:px-24">
          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3 lg:gap-16">

            <div className="lg:col-span-1 lg:self-center">
              <h2
                id="timeline-title"
                className="text-3xl font-bold tracking-tight text-[#37497A] sm:text-4xl"
              >
                {title}
              </h2>

              <p className="mt-4 max-w-md text-base leading-relaxed text-slate-600">
                {description}
              </p>

              <Link
                href={ctaHref}
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#37497A] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#2b3a63] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#37497A] focus-visible:ring-offset-2"
              >
                {ctaLabel}

                <ArrowRight
                  className="h-4 w-4"
                  aria-hidden="true"
                />
              </Link>
            </div>

            <div className="flex min-w-0 flex-col lg:col-span-2">

              <div className="hidden lg:block">

                <div className="mb-4 flex justify-end gap-3 px-1">
                  <button
                    type="button"
                    onClick={handlePrev}
                    disabled={!canPrev}
                    aria-label="Tahapan sebelumnya"
                    className={arrowClass}
                  >
                    <ChevronLeft
                      className="h-5 w-5"
                      aria-hidden="true"
                    />
                  </button>

                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={!canNext}
                    aria-label="Tahapan berikutnya"
                    className={arrowClass}
                  >
                    <ChevronRight
                      className="h-5 w-5"
                      aria-hidden="true"
                    />
                  </button>
                </div>

                <div className="relative w-full overflow-hidden pl-1 pr-1">

                  <ol
                    ref={trackRef}
                    tabIndex={0}
                    aria-label="Tahapan penerimaan siswa baru"
                    className={`relative flex w-full py-4 focus:outline-none ${hijackActive
                        ? "overflow-visible"
                        : "overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                      }`}
                    style={{
                      transform: hijackActive
                        ? `translateX(${translateX}px)`
                        : "none",

                      transition: hijackActive
                        ? "transform 0.1s linear"
                        : "none",
                    }}
                  >

                    <span
                      className="pointer-events-none absolute left-0 h-px bg-slate-200"
                      style={{
                        top: LINE_TOP,
                        width: trackScrollWidth
                          ? `${trackScrollWidth}px`
                          : "100%",
                      }}
                      aria-hidden="true"
                    />

                    <span
                      className="pointer-events-none absolute left-0 h-px bg-[#37497A] transition-[width] duration-100"
                      style={{
                        top: LINE_TOP,
                        width: `${progressWidth}px`,
                      }}
                      aria-hidden="true"
                    />

                    {items.map((item, idx) => (
                      <DesktopNode
                        key={item.id}
                        item={item}
                        index={idx}
                        isFocused={idx === activeIndex}
                      />
                    ))}
                  </ol>
                </div>
              </div>

              <ol className="lg:hidden">
                {items.map((item, idx) => (
                  <MobileTimelineItem
                    key={item.id}
                    item={item}
                    index={idx}
                    isLast={idx === items.length - 1}
                  />
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}