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
    description:
      "Pengumuman hasil tes akademik calon peserta didik.",
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
    description:
      "Pelaksanaan wawancara calon peserta didik.",
    status: "future",
  },
  {
    id: "psikotes",
    date: "18 – 19 Apr 2026",
    title: "Psikotes Online & Offline",
    description:
      "Pelaksanaan psikotes secara online maupun offline.",
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
/*  Style maps per status                                                     */
/* -------------------------------------------------------------------------- */

const CARD_STYLE: Record<TimelineStatus, string> = {
  past: "border-slate-200 bg-slate-50",
  current:
    "border-[#37497A] bg-white ring-1 ring-[#37497A] shadow-[0_16px_36px_-10px_rgba(55,73,122,0.45)]",
  future: "border-slate-200 bg-white",
};

const DATE_BADGE_STYLE: Record<TimelineStatus, string> = {
  past: "bg-slate-200 text-slate-600",
  current: "bg-[#37497A] text-white",
  future: "bg-[#37497A]/10 text-[#37497A]",
};

const TITLE_STYLE: Record<TimelineStatus, string> = {
  past: "text-slate-600",
  current: "text-[#37497A]",
  future: "text-slate-900",
};

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

function TimelineCard({ item }: { item: TimelineItem }) {
  return (
    <li
      aria-current={item.status === "current" ? "step" : undefined}
      // MOBILE FIRST: Lebar responsif (85vw di mobile, fixed di desktop)
      className={`flex min-h-[320px] w-[85vw] shrink-0 snap-center flex-col gap-4 rounded-2xl border p-6 sm:w-[360px] md:w-[400px] lg:w-[440px] xl:w-[480px] ${CARD_STYLE[item.status]}`}
    >
      <span
        className={`inline-flex w-fit items-center rounded-lg px-3 py-1.5 text-sm font-semibold ${DATE_BADGE_STYLE[item.status]}`}
      >
        {item.date}
      </span>

      <h3
        className={`text-xl font-bold leading-snug ${TITLE_STYLE[item.status]}`}
      >
        {item.title}
      </h3>

      <p className="text-base leading-relaxed text-slate-500">
        {item.description}
      </p>

      <div className="mt-auto border-t border-slate-200 pt-4">
        <StatusIndicator status={item.status} />
      </div>
    </li>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main component                                                            */
/* -------------------------------------------------------------------------- */

const SCROLL_FACTOR = 1.2;

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
  
  // State untuk menyimpan dimensi track agar perhitungan tinggi wrapper akurat sejak awal
  const [trackScrollWidth, setTrackScrollWidth] = useState(0);

  const [translateX, setTranslateX] = useState(0);
  const activeIndexRef = useRef(0);

  const hijackActive = isDesktop && !reducedMotion;

  // 1. Deteksi Layar & Reduced Motion
  useEffect(() => {
    const checkFlags = () => {
      setIsDesktop(window.innerWidth >= 1024);
      setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    };
    checkFlags();
    window.addEventListener("resize", checkFlags);
    return () => window.removeEventListener("resize", checkFlags);
  }, []);

  // 2. Resize Observer untuk mengukur Track secara akurat
  useEffect(() => {
    const trackEl = trackRef.current;
    if (!trackEl) return;

    const updateDimensions = () => {
      setTrackScrollWidth(trackEl.scrollWidth);
    };

    // Panggil sekali di awal
    updateDimensions();

    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(trackEl);

    return () => resizeObserver.disconnect();
  }, [items]);

  // 3. Reset Posisi Saat Masuk Mode Mobile
  useEffect(() => {
    const track = trackRef.current;
    if (!track || isDesktop) return;

    // Reset ke awal
    track.scrollTo({ left: 0, behavior: "auto" });
    
    // Reset state navigasi
    activeIndexRef.current = 0;
    setCanPrev(false);
    // Cek apakah ada konten yang overflow untuk mengaktifkan tombol next
    setCanNext(track.scrollWidth > track.clientWidth + 10);
  }, [isDesktop, items]);

  // 4. Logika Scroll Hijack (Desktop)
  const handleScroll = useCallback(() => {
    if (!hijackActive || !wrapperRef.current || !trackRef.current) return;

    const wrapper = wrapperRef.current;
    const track = trackRef.current;

    const wrapperRect = wrapper.getBoundingClientRect();
    const scrollableHeight = wrapper.offsetHeight - window.innerHeight;

    if (scrollableHeight <= 0) return;

    const progress = Math.min(1, Math.max(0, -wrapperRect.top / scrollableHeight));
    
    // Gunakan trackScrollWidth dari state agar lebih stabil
    const maxTranslate = trackScrollWidth - track.clientWidth;
    
    if (maxTranslate <= 0) return;

    const nextTranslate = -progress * maxTranslate;
    
    requestAnimationFrame(() => {
      setTranslateX(nextTranslate);
    });

    // Update Active Index
    const cardEls = Array.from(track.children) as HTMLElement[];
    if (cardEls.length > 0) {
      let closestIndex = 0;
      let minDistance = Infinity;

      cardEls.forEach((el, idx) => {
        const distanceFromView = Math.abs(el.offsetLeft + nextTranslate);
        if (distanceFromView < minDistance) {
          minDistance = distanceFromView;
          closestIndex = idx;
        }
      });

      if (activeIndexRef.current !== closestIndex) {
        activeIndexRef.current = closestIndex;
        setCanPrev(closestIndex > 0);
        setCanNext(closestIndex < items.length - 1);
      }
    }
  }, [hijackActive, items.length, trackScrollWidth]);

  useEffect(() => {
    if (!hijackActive) {
      setTranslateX(0);
      return;
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); 
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hijackActive, handleScroll]);

  // 5. Listener Scroll Native untuk Mobile (Agar tombol Next/Prev sinkron setelah swipe)
  useEffect(() => {
    if (!hijackActive && trackRef.current) {
      const el = trackRef.current;
      
      const updateMobileNav = () => {
        const cards = Array.from(el.children) as HTMLElement[];
        if (cards.length === 0) return;

        let closestIndex = 0;
        let minDistance = Infinity;

        // Cari kartu yang paling dekat dengan tengah viewport atau kiri viewport
        // Di sini kita pakai logika sederhana: kartu mana yang offsetLeft-nya paling dekat dengan scrollLeft
        cards.forEach((card, index) => {
            // Kita cari kartu yang 'paling masuk' ke area pandang
            // Jarak antara sisi kiri kartu terhadap sisi kiri container (scrollLeft)
            const distance = Math.abs(card.offsetLeft - el.scrollLeft);
            
            if (distance < minDistance) {
                minDistance = distance;
                closestIndex = index;
            }
        });

        activeIndexRef.current = closestIndex;
        setCanPrev(el.scrollLeft > 10);
        setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 10);
      };

      el.addEventListener("scroll", updateMobileNav);
      // Panggil sekali untuk inisialisasi state tombol
      updateMobileNav();

      return () => el.removeEventListener("scroll", updateMobileNav);
    }
  }, [hijackActive, items]);

  // 6. Fungsi Navigasi Tombol
  const scrollToIndex = (targetIndex: number) => {
    const safeIndex = Math.max(0, Math.min(items.length - 1, targetIndex));
    const track = trackRef.current;
    if (!track) return;

    if (hijackActive && wrapperRef.current) {
      // Desktop: Scroll Window Vertically
      const wrapper = wrapperRef.current;
      const targetCard = track.children[safeIndex] as HTMLElement;
      if (!targetCard) return;

      const maxTranslate = trackScrollWidth - track.clientWidth;
      if (maxTranslate <= 0) return;
      
      const targetTranslate = -targetCard.offsetLeft;
      const targetProgress = -targetTranslate / maxTranslate;

      const scrollableHeight = wrapper.offsetHeight - window.innerHeight;
      const wrapperTopAbsolute = wrapper.getBoundingClientRect().top + window.scrollY;
      const targetScrollY = wrapperTopAbsolute + targetProgress * scrollableHeight;

      window.scrollTo({ top: targetScrollY, behavior: "smooth" });
    } else {
      // Mobile: Native Horizontal Scroll
      const card = track.children[safeIndex] as HTMLElement;
      if (card) {
        card.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      }
    }
  };

  const handlePrev = () => scrollToIndex(activeIndexRef.current - 1);
  const handleNext = () => scrollToIndex(activeIndexRef.current + 1);

  const arrowClass =
    "flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full border border-slate-300 bg-white text-[#37497A] transition-colors hover:border-[#37497A] hover:bg-[#37497A] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#37497A] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-white disabled:text-slate-300 cursor-pointer shadow-sm";

  return (
    <div
      ref={wrapperRef}
      className="relative w-full bg-white"
      style={{
        // Hitung tinggi berdasarkan trackScrollWidth state
        height: hijackActive
          ? `calc(100vh + ${trackScrollWidth * SCROLL_FACTOR}px)`
          : "auto",
      }}
    >
      <section
        ref={sectionRef}
        aria-labelledby="timeline-title"
        className={
          hijackActive
            ? "sticky top-0 flex h-screen w-full items-center overflow-hidden py-12 lg:py-24"
            : "relative w-full bg-white py-12 sm:py-16 lg:py-24"
        }
      >
        <div className="mx-auto flex h-full w-full max-w-[1920px] flex-col justify-center px-4 sm:px-6 lg:px-16 xl:px-24">
          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3 lg:gap-16">
            
            {/* Kiri: Info */}
            <div className="lg:col-span-1 lg:self-center">
              <h2 id="timeline-title" className="text-3xl font-bold tracking-tight text-[#37497A] sm:text-4xl">
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
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>

            {/* Kanan: Carousel */}
            <div className="flex min-w-0 flex-col lg:col-span-2">
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

              <div className="relative w-full overflow-hidden pl-1 pr-1">
                <ol
                  ref={trackRef}
                  tabIndex={0}
                  aria-label="Tahapan penerimaan siswa baru"
                  // Mobile: overflow-x-auto + snap
                  // Desktop: overflow-visible (karena digerakkan transform)
                  className="relative flex w-full snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain py-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden focus:outline-none lg:gap-5 lg:overflow-visible lg:py-2"
                  style={{
                    transform: hijackActive ? `translateX(${translateX}px)` : "none",
                    transition: hijackActive ? "transform 0.1s linear" : "none",
                  }}
                >
                  {items.map((item) => (
                    <TimelineCard key={item.id} item={item} />
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