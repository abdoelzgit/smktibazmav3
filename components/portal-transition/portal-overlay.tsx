"use client";

import { useEffect, useRef, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import gsap from "gsap";
import { usePortalTransition } from "./portal-transition-context";

// Jumlah strip horizontal untuk efek "blinds"
const STRIPE_COUNT = 9;
// Warna penutup strip (warna utama brand #132B6D)
const REVEAL_COLOR = "#fff";

export function PortalOverlay() {
  const router = useRouter();
  const pathname = usePathname();
  const { registerTransition } = usePortalTransition();

  const backdropRef = useRef<HTMLDivElement>(null);
  const portalCardRef = useRef<HTMLDivElement>(null);
  const portalTextRef = useRef<HTMLDivElement>(null);

  // Container strip horizontal + refs ke tiap "fill" strip
  const stripesRef = useRef<HTMLDivElement>(null);
  const stripeFillsRef = useRef<(HTMLDivElement | null)[]>([]);

  const routeResolverRef = useRef<(() => void) | null>(null);
  const pendingPathRef = useRef<string | null>(null);
  const rafIdRef = useRef<number | null>(null);

  // Efek Decode Teks menggunakan warna putih #FFFFFF di atas background biru #132B6D
  const scrambleInto = useCallback(
    (el: HTMLElement, finalText: string, duration: number) => {
      const glyphs = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      el.innerHTML = "";
      const spans = [...finalText].map((ch) => {
        const s = document.createElement("span");
        s.textContent = ch;
        el.appendChild(s);
        return { s, ch };
      });

      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }

      const start = performance.now();
      function frame(now: number) {
        const p = Math.min(1, (now - start) / duration);
        const resolved = Math.floor(p * finalText.length);
        spans.forEach((item, i) => {
          if (item.ch === " " || i < resolved) {
            item.s.textContent = item.ch;
            item.s.style.color = "#132B6D";
            item.s.style.opacity = "1";
          } else {
            item.s.textContent = glyphs[(Math.random() * glyphs.length) | 0];
            item.s.style.color = "#132B6D";
            item.s.style.opacity = "0.35";
          }
        });
        if (p < 1) {
          rafIdRef.current = requestAnimationFrame(frame);
        }
      }
      rafIdRef.current = requestAnimationFrame(frame);
    },
    [],
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      if (routeResolverRef.current) {
        routeResolverRef.current = null;
        pendingPathRef.current = null;
      }
    };
  }, []);

  // Pantau perpindahan route untuk sinkronisasi load page
  useEffect(() => {
    if (pendingPathRef.current && routeResolverRef.current) {
      const targetPath = pendingPathRef.current.split("?")[0].split("#")[0];
      const currentPath = pathname.split("?")[0].split("#")[0];

      if (currentPath === targetPath || targetPath === "") {
        pendingPathRef.current = null;
        const resolver = routeResolverRef.current;
        routeResolverRef.current = null;

        // Beri waktu browser untuk merender halaman baru & reset posisi scroll ke atas
        requestAnimationFrame(() => {
          window.scrollTo({ top: 0, left: 0, behavior: "instant" });
          setTimeout(() => {
            resolver();
          }, 80);
        });
      }
    }
  }, [pathname]);

  useEffect(() => {
    const handleTransition = async (href: string, label: string) => {
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (prefersReducedMotion) {
        router.push(href);
        return;
      }

      const backdrop = backdropRef.current;
      const card = portalCardRef.current;
      const portalText = portalTextRef.current;
      const stripesContainer = stripesRef.current;
      const stripeFills = stripeFillsRef.current;
      if (
        !backdrop ||
        !card ||
        !portalText ||
        !stripesContainer ||
        stripeFills.length < STRIPE_COUNT
      ) {
        router.push(href);
        return;
      }

      const targetPath = href.split("?")[0].split("#")[0];
      const isSamePath = targetPath === pathname;

      // =========================================================================
      // FASE 1: UNIFIED STAGGERED BLINDS CLOSE + FLOATING TEXT DECODE (NO WHITE CARD)
      // -------------------------------------------------------------------------
      // Strip horizontal menutup layar secara staggered (0 -> 1).
      // Teks decode melayang langsung (tanpa background kotak putih) di atas layar biru.
      // =========================================================================
      gsap.set(stripesContainer, { display: "flex" });
      gsap.set(stripeFills, {
        scaleY: 0,
        transformOrigin: "top center",
        backgroundColor: REVEAL_COLOR,
      });

      gsap.set(card, {
        display: "flex",
        opacity: 0,
        scale: 0.8,
        backgroundColor: "transparent",
        border: "none",
        boxShadow: "none",
        left: "50%",
        top: "50%",
        xPercent: -50,
        yPercent: -50,
      });

      gsap.set(portalText, { display: "flex", opacity: 1 });
      scrambleInto(portalText, label.toUpperCase(), 380);

      // Timeline Fase 1: Strip menutup layar + Teks melayang muncul di tengah
      const tl1 = gsap.timeline();
      tl1
        .to(
          stripeFills,
          {
            scaleY: 1,
            duration: 0.38,
            ease: "power2.inOut",
            force3D: true,
            stagger: {
              each: 0.028,
              from: "start",
            },
          },
          0,
        )
        .to(
          card,
          {
            opacity: 1,
            scale: 1,
            duration: 0.35,
            ease: "back.out(1.3)",
          },
          0.12,
        );

      await tl1;
      tl1.kill();
      await new Promise((r) => setTimeout(r, 100));

      // =========================================================================
      // FASE TUNGGU LOAD HALAMAN BARU & RESET SCROLL
      // =========================================================================
      router.push(href);

      if (!isSamePath) {
        pendingPathRef.current = href;
        await new Promise<void>((resolve) => {
          routeResolverRef.current = resolve;
          setTimeout(() => {
            if (routeResolverRef.current) {
              routeResolverRef.current = null;
              pendingPathRef.current = null;
              resolve();
            }
          }, 1800);
        });
      } else {
        await new Promise((r) => setTimeout(r, 180));
      }

      window.scrollTo({ top: 0, left: 0, behavior: "instant" });

      // =========================================================================
      // FASE 2: UNIFIED TEXT FADE-OUT + STAGGERED BLINDS REVEAL PAGE BARU
      // -------------------------------------------------------------------------
      // Teks melayang fade-out halus ke atas,
      // sementara strip horizontal menyusut (1 -> 0) secara staggered dari atas
      // ke bawah memperlihatkan halaman baru secara utuh.
      // =========================================================================
      const tl2 = gsap.timeline();
      tl2
        .to(
          card,
          {
            opacity: 0,
            scale: 0.95,
            y: -20,
            duration: 0.25,
            ease: "power2.in",
          },
          0,
        )
        .to(
          stripeFills,
          {
            scaleY: 0,
            duration: 0.45,
            ease: "power2.inOut",
            force3D: true,
            stagger: {
              each: 0.032,
              from: "start",
            },
          },
          0.08,
        );

      await tl2;
      tl2.kill();

      // Selesai transisi: sembunyikan container
      gsap.set([stripesContainer, card], { display: "none" });

      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };

    registerTransition(handleTransition);
  }, [router, pathname, registerTransition, scrambleInto]);

  return (
    <>
      {/* Backdrop penutup layar putih (Fallback) */}
      <div
        ref={backdropRef}
        className="fixed inset-0 z-[9998] pointer-events-none bg-white opacity-0"
        aria-hidden="true"
      />

      {/* Container Strip Horizontal Blinds (Z-Index 10000) */}
      <div
        ref={stripesRef}
        className="fixed inset-0 z-[10000] hidden flex-col pointer-events-none"
        style={{ display: "none" }}
        aria-hidden="true"
      >
        {Array.from({ length: STRIPE_COUNT }).map((_, i) => (
          <div
            key={i}
            className="relative w-full flex-1"
            style={{ overflow: "visible" }}
          >
            <div
              ref={(el) => {
                stripeFillsRef.current[i] = el;
              }}
              className="absolute inset-x-0 w-full"
              style={{
                top: "-1px",
                height: "calc(100% + 2px)",
                backgroundColor: REVEAL_COLOR,
                transform: "scaleY(0)",
                transformOrigin: "top center",
                willChange: "transform",
              }}
            />
          </div>
        ))}
      </div>

      {/* Teks Decode Melayang Tanpa Kotak Putih (Z-Index 10010 - Di Atas Strip Blinds) */}
      <div
        ref={portalCardRef}
        className="fixed z-[10010] hidden pointer-events-none items-center justify-center will-change-[transform,opacity]"
        aria-hidden="true"
      >
        <div
          ref={portalTextRef}
          className="flex items-center gap-1 font-heading text-xl sm:text-3xl font-bold tracking-widest text-white whitespace-pre select-none uppercase px-6 drop-shadow-lg"
        />
      </div>
    </>
  );
}
