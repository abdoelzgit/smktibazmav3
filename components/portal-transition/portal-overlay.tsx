"use client";

import { useEffect, useRef, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import gsap from "gsap";
import { usePortalTransition } from "./portal-transition-context";

const CARD_INSET = 0.08;
const ENTRY_W = 90;

export function PortalOverlay() {
  const router = useRouter();
  const pathname = usePathname();
  const { registerTransition } = usePortalTransition();

  const backdropRef = useRef<HTMLDivElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);
  const portalCardRef = useRef<HTMLDivElement>(null);
  const portalTextRef = useRef<HTMLDivElement>(null);
  const portalPreviewRef = useRef<HTMLDivElement>(null);

  const routeResolverRef = useRef<(() => void) | null>(null);
  const pendingPathRef = useRef<string | null>(null);
  const rafIdRef = useRef<number | null>(null);

  // Set inset persentase pada #portal-card (frame effect biru-putih)
  const setCardInset = useCallback((frac: number) => {
    if (!portalCardRef.current) return;
    gsap.set(portalCardRef.current, {
      left: `${frac * 100}%`,
      top: `${frac * 100}%`,
      width: `${(1 - 2 * frac) * 100}%`,
      height: `${(1 - 2 * frac) * 100}%`,
    });
  }, []);

  // Menutup inset frame ke 0% sehingga menjadi solid putih pekat
  const collapseCard = useCallback((duration: number) => {
    return gsap.timeline().to(portalCardRef.current, {
      left: "0%",
      top: "0%",
      width: "100%",
      height: "100%",
      duration,
      ease: "power1.in",
    });
  }, []);

  // Efek Decode Teks menggunakan warna biru #132B6D
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
            item.s.style.color = "#132B6D"; // Biru utama solid
            item.s.style.opacity = "1";
          } else {
            item.s.textContent = glyphs[(Math.random() * glyphs.length) | 0];
            item.s.style.color = "#132B6D";
            item.s.style.opacity = "0.35"; // Biru transparan
          }
        });
        if (p < 1) {
          rafIdRef.current = requestAnimationFrame(frame);
        }
      }
      rafIdRef.current = requestAnimationFrame(frame);
    },
    []
  );

  // Pantau perpindahan route untuk sinkronisasi load page
  useEffect(() => {
    if (pendingPathRef.current && routeResolverRef.current) {
      const targetPath = pendingPathRef.current.split("?")[0].split("#")[0];
      const currentPath = pathname.split("?")[0].split("#")[0];

      if (currentPath === targetPath || targetPath === "") {
        pendingPathRef.current = null;
        const resolver = routeResolverRef.current;
        routeResolverRef.current = null;

        // Beri waktu browser untuk menyelesaikan layout & paint halaman baru
        requestAnimationFrame(() => {
          setTimeout(() => {
            resolver();
          }, 150);
        });
      }
    }
  }, [pathname]);

  useEffect(() => {
    const handleTransition = async (href: string, label: string) => {
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      if (prefersReducedMotion) {
        router.push(href);
        return;
      }

      const portal = portalRef.current;
      const backdrop = backdropRef.current;
      const portalText = portalTextRef.current;
      const portalPreview = portalPreviewRef.current;
      if (!portal || !backdrop || !portalText || !portalPreview) {
        router.push(href);
        return;
      }

      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const smallW = ENTRY_W;
      const smallH = Math.max(54, smallW * (vh / vw));
      const targetPath = href.split("?")[0].split("#")[0];
      const isSamePath = targetPath === pathname;

      // =========================================================================
      // FASE 1: EXIT DARI TENGAH (CENTER GROW)
      // =========================================================================
      gsap.set(portal, {
        display: "flex",
        opacity: 1,
        borderRadius: 12,
        left: "50%",
        top: "50%",
        xPercent: -50,
        yPercent: -50,
        width: smallW,
        height: smallH,
        force3D: true,
      });
      gsap.set(portalText, { display: "flex", opacity: 1 });
      gsap.set(portalPreview, { display: "none" });
      portalPreview.innerHTML = "";
      setCardInset(CARD_INSET);

      // Jalankan animasi decode teks halaman tujuan
      scrambleInto(portalText, label.toUpperCase(), 460);

      // Kotak portal membesar dari tengah ke seluruh viewport
      await gsap.timeline().to(portal, {
        left: "50%",
        top: "50%",
        xPercent: -50,
        yPercent: -50,
        width: vw,
        height: vh,
        borderRadius: 0,
        duration: 0.5,
        ease: "power3.inOut",
        force3D: true,
      });

      // Panel dalam menutup pekat (collapsing border)
      await collapseCard(0.16);

      // Aktifkan backdrop putih di belakang
      gsap.set(backdrop, { opacity: 1 });

      // =========================================================================
      // FASE TUNGGU LOAD HALAMAN BARU (SEAMLESS WAITING)
      // =========================================================================
      router.push(href);

      if (!isSamePath) {
        pendingPathRef.current = href;
        await new Promise<void>((resolve) => {
          routeResolverRef.current = resolve;
          // Fallback timeout jika navigasi instan / cache
          setTimeout(() => {
            if (routeResolverRef.current) {
              routeResolverRef.current = null;
              pendingPathRef.current = null;
              resolve();
            }
          }, 2500);
        });
      } else {
        await new Promise((r) => setTimeout(r, 260));
      }

      // =========================================================================
      // FASE 2: ENTRY / REVEAL (HANYA BINGKAI MEMBESAR, KONTEN TETAP NORMAL 1:1)
      // =========================================================================
      // Salin snapshot konten halaman baru ke dalam preview
      const contentEl =
        document.getElementById("public-page-content") ||
        document.querySelector("main") ||
        document.body;

      if (contentEl) {
        portalPreview.innerHTML = contentEl.innerHTML;
      }

      gsap.set(portalText, { display: "none" });
      // Konten halaman diatur berukuran 100% viewport tetap (scale: 1, tidak diperbesar/zoom)
      gsap.set(portalPreview, {
        display: "block",
        width: vw,
        height: vh,
        left: "50%",
        top: "50%",
        xPercent: -50,
        yPercent: -50,
        transformOrigin: "50% 50%",
        scale: 1,
        opacity: 1,
      });

      setCardInset(CARD_INSET);
      gsap.set(portal, {
        borderRadius: 12,
        left: "50%",
        top: "50%",
        xPercent: -50,
        yPercent: -50,
        width: smallW,
        height: smallH,
        force3D: true,
      });

      // Hanya bingkai portal yang membesar membuka ke seluruh layar
      await gsap.timeline().to(portal, {
        left: "50%",
        top: "50%",
        xPercent: -50,
        yPercent: -50,
        width: vw,
        height: vh,
        borderRadius: 0,
        duration: 0.52,
        ease: "power3.inOut",
        force3D: true,
      });

      await collapseCard(0.14);

      // Fade out penutup lembut
      await gsap
        .timeline()
        .to(portal, { opacity: 0, duration: 0.22, ease: "power1.out" }, 0)
        .to(backdrop, { opacity: 0, duration: 0.22, ease: "power1.out" }, 0);

      gsap.set(portal, { display: "none" });
      portalPreview.innerHTML = "";
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };

    registerTransition(handleTransition);
  }, [
    router,
    pathname,
    registerTransition,
    scrambleInto,
    setCardInset,
    collapseCard,
  ]);

  return (
    <>
      {/* Backdrop penutup layar (Putih Bersih) */}
      <div
        ref={backdropRef}
        className="fixed inset-0 z-[9998] pointer-events-none bg-white opacity-0"
        aria-hidden="true"
      />

      {/* Portal Container Outer (Biru Brand #132B6D) */}
      <div
        ref={portalRef}
        className="fixed z-[9999] hidden items-center justify-center pointer-events-none bg-[#132B6D] shadow-2xl will-change-[width,height,transform,opacity]"
        aria-hidden="true"
      >
        {/* Portal Card Inner (Lubang / Window Inset dengan overflow: hidden) */}
        <div
          ref={portalCardRef}
          className="absolute bg-white rounded-md overflow-hidden flex items-center justify-center will-change-[width,height,left,top]"
          style={{
            left: `${CARD_INSET * 100}%`,
            top: `${CARD_INSET * 100}%`,
            width: `${(1 - 2 * CARD_INSET) * 100}%`,
            height: `${(1 - 2 * CARD_INSET) * 100}%`,
          }}
        >
          {/* Text Decoder (Fase 1: Teks Decoder) */}
          <div
            ref={portalTextRef}
            className="flex items-center gap-1 font-heading text-lg sm:text-2xl font-bold tracking-wider text-[#132B6D] whitespace-pre select-none uppercase px-6"
          />

          {/* Portal Preview (Fase 2: Konten Halaman Baru Tetap Skala 1:1 Normal) */}
          <div
            ref={portalPreviewRef}
            className="absolute pointer-events-none overflow-hidden"
            style={{
              left: "50%",
              top: "50%",
              transformOrigin: "50% 50%",
            }}
          />
        </div>
      </div>
    </>
  );
}
