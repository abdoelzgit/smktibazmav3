"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
} from "framer-motion";
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
    description: "Pengumuman hasil seleksi administrasi calon peserta didik.",
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
    description: "Pelaksanaan tes bacaan Al-Qur’an bagi calon peserta didik.",
    status: "future",
  },
  {
    id: "pengumuman-wawancara",
    date: "22 Feb – 14 Mar 2026",
    title: "Pengumuman Jadwal Wawancara",
    description: "Informasi jadwal wawancara bagi calon peserta didik.",
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

/*
  Posisi garis = titik tengah lingkaran (node).
  Hitungan: padding atas track (16) + baris nomor (16) + jarak (8) + setengah node (16) = 56
*/
const LINE_TOP = 56;

/* -------------------------------------------------------------------------- */
/*  Sub-components                                                            */
/* -------------------------------------------------------------------------- */

function StatusIndicator({ status }: { status: TimelineStatus }) {
  if (status === "past") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-300">
        <Check className="h-3.5 w-3.5" aria-hidden="true" />
        Selesai
      </span>
    );
  }

  if (status === "current") {
    return (
      <span className="inline-flex items-center gap-2 text-xs font-semibold text-white">
        <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75 motion-reduce:animate-none" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-white" />
        </span>
        Sedang berlangsung
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-200/60">
      <Clock className="h-3.5 w-3.5" aria-hidden="true" />
      Akan datang
    </span>
  );
}

/* Lingkaran step (dipakai desktop & mobile) */
function StepDot({
  status,
  isFocused = false,
}: {
  status: TimelineStatus;
  isFocused?: boolean;
}) {
  const base =
    "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-4 border-[#132B6D] shadow-sm transition-transform duration-300";

  if (status === "past") {
    return (
      <span
        className={`${base} bg-white text-[#132B6D] ${
          isFocused ? "scale-110 ring-4 ring-white/30" : ""
        }`}
        aria-hidden="true"
      >
        <Check className="h-4 w-4 text-[#132B6D]" strokeWidth={3} />
      </span>
    );
  }

  if (status === "current") {
    return (
      <span
        className={`${base} scale-110 bg-white ring-4 ring-white/40`}
        aria-hidden="true"
      >
        <span className="absolute -inset-1 animate-ping rounded-full bg-white/40 motion-reduce:animate-none" />
        <span className="relative h-2.5 w-2.5 rounded-full bg-[#132B6D]" />
      </span>
    );
  }

  return (
    <span
      className={`${base} bg-white/20 ${
        isFocused ? "scale-110 ring-4 ring-white/30" : ""
      }`}
      aria-hidden="true"
    />
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
  const titleClass =
    item.status === "past"
      ? "text-white/70"
      : item.status === "current" || isFocused
        ? "text-white"
        : "text-white/85";

  return (
    <li
      data-timeline-item
      className="relative flex w-[230px] shrink-0 flex-col pr-4 sm:w-[270px] lg:w-[300px] xl:w-[320px]"
    >
      <div className="flex h-4 items-center">
        <span className="text-[11px] font-mono font-semibold tracking-[0.15em] text-blue-200/70">
          {padNumber(index + 1)}
        </span>
      </div>

      <div className="mt-2 flex h-8 items-center">
        <StepDot status={item.status} isFocused={isFocused} />
      </div>

      <div className="mt-4">
        <h3 className={`text-base font-bold leading-snug transition-colors duration-300 ${titleClass}`}>
          {item.title}
        </h3>

        <p className="mt-1 text-sm font-medium text-blue-200/80">{item.date}</p>

        <p
          className={`mt-2 min-h-[56px] max-w-[240px] text-sm leading-relaxed text-blue-100/80 transition-opacity duration-300 ${
            isFocused ? "opacity-100 font-normal" : "opacity-40"
          }`}
        >
          {item.description}
        </p>
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
  const titleClass =
    item.status === "past"
      ? "text-white/70"
      : item.status === "current"
        ? "text-white"
        : "text-white/90";

  return (
    <motion.li
      initial={{ opacity: 0, y: 20, x: -6 }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{
        duration: 0.45,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={`relative pl-12 ${isLast ? "" : "pb-8"}`}
    >
      <div className="absolute left-0 top-0">
        <StepDot status={item.status} />
      </div>

      <span className="block text-[11px] font-mono font-semibold leading-8 tracking-[0.15em] text-blue-200/70">
        {padNumber(index + 1)}
      </span>

      <h3 className={`text-lg font-bold leading-snug ${titleClass}`}>
        {item.title}
      </h3>

      <p className="mt-1 text-sm font-medium text-blue-200/80">{item.date}</p>

      <p className="mt-2 text-sm leading-relaxed text-blue-100/70">
        {item.description}
      </p>

      <div className="mt-3">
        <StatusIndicator status={item.status} />
      </div>
    </motion.li>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main component                                                            */
/* -------------------------------------------------------------------------- */

export default function TimelineSection({
  title = "Timeline SPMB 2026",
  description = "Pantau setiap tahapan penerimaan siswa baru, dari sosialisasi sampai daftar ulang, supaya tidak ada jadwal penting yang terlewat.",
  ctaLabel = "Daftar Sekarang",
  ctaHref = "/login",
  items = MOCK_TIMELINE,
}: TimelineSectionProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const trackContainerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLOListElement>(null);
  const mobileListRef = useRef<HTMLOListElement>(null);

  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);
  const [isDesktop, setIsDesktop] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const [maxTranslate, setMaxTranslate] = useState(0);
  const [totalTrackWidth, setTotalTrackWidth] = useState(0);
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

  const measureDimensions = useCallback(() => {
    if (!trackRef.current || !trackContainerRef.current) return;
    const trackW = trackRef.current.scrollWidth;
    const contW = trackContainerRef.current.clientWidth;
    const maxScroll = Math.max(0, trackW - contW + 40);
    setMaxTranslate(maxScroll);
    setTotalTrackWidth(trackW);
  }, []);

  useEffect(() => {
    measureDimensions();
    window.addEventListener("resize", measureDimensions);
    return () => {
      window.removeEventListener("resize", measureDimensions);
    };
  }, [items, isDesktop, measureDimensions]);

  // Desktop horizontal scroll
  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["start start", "end end"],
  });

  const x = useTransform(scrollYProgress, [0, 1], [0, -maxTranslate]);

  const progressLineWidth = useTransform(scrollYProgress, (v) => {
    if (!totalTrackWidth) return 32;
    return 32 + v * (totalTrackWidth - 32);
  });

  // Mobile vertical scroll line
  const { scrollYProgress: mobileScrollProgress } = useScroll({
    target: mobileListRef,
    offset: ["start 75%", "end 65%"],
  });

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const count = items.length;
    if (count <= 1) return;

    const index = Math.min(
      count - 1,
      Math.max(0, Math.round(latest * (count - 1))),
    );

    if (index !== activeIndexRef.current) {
      activeIndexRef.current = index;
      setActiveIndex(index);
      setCanPrev(index > 0);
      setCanNext(index < count - 1);
    }
  });

  const scrollToIndex = (targetIndex: number) => {
    const safeIndex = Math.max(0, Math.min(items.length - 1, targetIndex));

    if (hijackActive && wrapperRef.current) {
      const wrapper = wrapperRef.current;
      const n = items.length;
      if (n < 2) return;

      const targetProgress = safeIndex / (n - 1);
      const scrollableHeight = wrapper.offsetHeight - window.innerHeight;
      const wrapperTopAbsolute =
        wrapper.getBoundingClientRect().top + window.scrollY;

      const targetScrollY =
        wrapperTopAbsolute + targetProgress * scrollableHeight;

      window.scrollTo({
        top: targetScrollY,
        behavior: "smooth",
      });
    } else if (trackRef.current) {
      const el = trackRef.current.querySelectorAll<HTMLElement>(
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
    scrollToIndex(activeIndexRef.current - 1);
  };

  const handleNext = () => {
    scrollToIndex(activeIndexRef.current + 1);
  };

  const arrowClass =
    "flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-colors hover:border-white hover:bg-white hover:text-[#132B6D] focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/5 disabled:text-white/20 cursor-pointer shadow-sm";

  return (
    <div
      ref={wrapperRef}
      data-nav-theme="dark"
      className="relative w-full bg-[#132B6D] text-white"
      style={{
        height: hijackActive
          ? `calc(100vh + ${(items.length - 1) * 320}px)`
          : "auto",
      }}
    >
      <section
        ref={sectionRef}
        data-nav-theme="dark"
        aria-labelledby="timeline-title"
        className={
          hijackActive
            ? "sticky top-0 flex h-screen w-full items-center overflow-hidden py-6 lg:py-12 bg-[#132B6D] text-white"
            : "relative w-full bg-[#132B6D] text-white pt-2 pb-14 sm:pt-4 sm:pb-20 lg:py-16"
        }
      >
        <div className="mx-auto flex h-full w-full max-w-[1920px] flex-col justify-center px-4 sm:px-6 lg:px-16 xl:px-24">
          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3 lg:gap-16 lg:items-center">
            {/* Sisi Kiri / Header: Sticky di Mobile & Tablet, Centered di Desktop */}
            <div className="sticky top-14 sm:top-16 z-20 bg-[#132B6D] pt-4 pb-5 shadow-[0_16px_20px_-10px_rgba(19,43,109,0.95)] lg:shadow-none lg:static lg:bg-transparent lg:p-0 lg:col-span-1 lg:self-center">
              <h2
                id="timeline-title"
                className="text-2xl font-bold tracking-tight text-white font-heading sm:text-4xl lg:text-5xl leading-tight"
              >
                {title}
              </h2>

              <p className="mt-2 sm:mt-4 max-w-md text-xs sm:text-base leading-relaxed text-blue-100/80">
                {description}
              </p>

              <div className="mt-4 sm:mt-8">
                <Link
                  href={ctaHref}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 sm:px-6 sm:py-3 text-xs sm:text-sm font-semibold text-[#132B6D] transition-colors hover:bg-blue-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 shadow-sm"
                >
                  {ctaLabel}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </div>

            <div className="flex min-w-0 flex-col lg:col-span-2 pt-2">
              {/* Desktop View */}
              <div className="hidden lg:block">
                <div className="mb-4 flex justify-end gap-3 px-1">
                  <button
                    type="button"
                    onClick={handlePrev}
                    disabled={!canPrev}
                    aria-label="Tahapan sebelumnya"
                    className={arrowClass}
                  >
                    <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                  </button>

                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={!canNext}
                    aria-label="Tahapan berikutnya"
                    className={arrowClass}
                  >
                    <ChevronRight className="h-5 w-5" aria-hidden="true" />
                  </button>
                </div>

                <div
                  ref={trackContainerRef}
                  className="relative w-full overflow-hidden px-2 py-4"
                >
                  <motion.ol
                    ref={trackRef}
                    tabIndex={0}
                    aria-label="Tahapan penerimaan siswa baru"
                    className={`relative flex w-max py-4 focus:outline-none ${
                      hijackActive
                        ? "overflow-visible"
                        : "overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                    }`}
                    style={{
                      x: hijackActive ? x : 0,
                    }}
                  >
                    {/* Track garis latar */}
                    <span
                      className="pointer-events-none absolute left-0 h-1 -translate-y-1/2 rounded-full bg-white/20"
                      style={{
                        top: LINE_TOP,
                        width: totalTrackWidth
                          ? `${totalTrackWidth}px`
                          : "100%",
                      }}
                      aria-hidden="true"
                    />

                    {/* Progress line */}
                    <motion.span
                      className="pointer-events-none absolute left-0 h-1 -translate-y-1/2 rounded-full bg-white"
                      style={{
                        top: LINE_TOP,
                        width: hijackActive ? progressLineWidth : "0px",
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
                  </motion.ol>
                </div>
              </div>

              {/* Mobile View with Continuous Scroll-Progress Line */}
              <div className="relative lg:hidden pt-4">
                <ol ref={mobileListRef} className="relative pl-0">
                  {/* Continuous background vertical line */}
                  <div
                    className="absolute left-[15px] top-4 bottom-6 w-[2px] bg-white/20 rounded-full"
                    aria-hidden="true"
                  >
                    {/* Continuous animated vertical progress line */}
                    <motion.div
                      style={{
                        scaleY: mobileScrollProgress,
                        transformOrigin: "top",
                      }}
                      className="w-full h-full bg-white rounded-full"
                    />
                  </div>

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
        </div>
      </section>
    </div>
  );
}