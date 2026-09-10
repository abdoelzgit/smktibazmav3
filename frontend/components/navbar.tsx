"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import Image from "next/image";

// ─── Types ──────────────────────────────────────────────────────────────────
type SubLink = { label: string; href: string };
type NavLink = { label: string; href: string; children?: SubLink[] };

function hasChildren(
  item: NavLink | SubLink,
): item is NavLink & { children: SubLink[] } {
  return (
    "children" in item &&
    Array.isArray(item.children) &&
    item.children.length > 0
  );
}

// ─── Data ───────────────────────────────────────────────────────────────────
// TODO: ganti label & href submenu di bawah ini sesuai section aslinya
const navLinks: NavLink[] = [
  { label: "Beranda", href: "/" },
  {
    label: "Tentang Kami",
    href: "#about",
    children: [
      { label: "Tentang Sekolah", href: "/sekolah" },
      { label: "Tentang Asrama", href: "/asrama" },
      { label: "Mitra kami", href: "#mitra" },
      { label: "Akreditasi", href: "#akreditasi" },
    ],
  },
  {
    label: "Program",
    href: "#program",
    children: [
      { label: "Profil Jurusan", href: "#jurusan" },
      { label: "Ekstrakulikuler", href: "#ekstrakulikuler" },
    ],
  },
  { label: "Jejak Karya", href: "#karya" },
  { label: "Berita", href: "#berita" },
  { label: "SPMB", href: "#spmb" },
];

// ─── Drawer constants (mirror MultiLevelDrawerMenu) ────────────────────────
const CLIP_HIDDEN = "inset(0% 0% 0% 100% round 12px)";
const CLIP_VISIBLE = "inset(0% 0% 0% 0% round 12px)";
const HOVER_DUR = 0.4;
const HOVER_EASE = "back.out";
const DOT_GAP = 14;

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isInverted, setIsInverted] = useState(true);
  const [activeDrawerLink, setActiveDrawerLink] = useState<NavLink | null>(
    null,
  );

  const headerRef = useRef<HTMLElement>(null);
  const rafRef = useRef<number | null>(null);
  const isScrolledRef = useRef(false);
  const isInvertedRef = useRef(true);

  // ── Drawer refs ────────────────────────────────────────────────────────
  const drawerRootRef = useRef<HTMLDivElement>(null);
  const drawerOverlayRef = useRef<HTMLDivElement>(null);
  const drawerScrimRef = useRef<HTMLButtonElement>(null);
  const drawerPanelRef = useRef<HTMLDivElement>(null);
  const drawerLabelRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const drawerDotRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const drawerOpenTlRef = useRef<gsap.core.Timeline | null>(null);
  const drawerCloseTlRef = useRef<gsap.core.Timeline | null>(null);
  const isDrawerOpenRef = useRef(false);

  // ── High-performance adaptive nav color ────────────────────────────────────
  // Strategi: pada setiap scroll event, cari elemen [data-nav-theme] yang
  // saat ini berada paling dekat di bawah navbar (top edge ≤ THRESHOLD dari
  // atas viewport). Pendekatan ini lebih reliable dari IntersectionObserver
  // untuk kasus section pendek atau halaman yang sudah discroll saat load.
  useEffect(() => {
    const NAVBAR_HEIGHT = 80; // px — batas deteksi tema

    const getActiveTheme = (): boolean => {
      const sections = Array.from(
        document.querySelectorAll<HTMLElement>("[data-nav-theme]"),
      );
      if (sections.length === 0) return true; // default dark

      // Cari section yang top-nya paling mendekati NAVBAR_HEIGHT dari atas
      // (yaitu section yang baru saja "masuk" ke bawah navbar)
      let activeSection: HTMLElement | null = null;
      for (const section of sections) {
        const top = section.getBoundingClientRect().top;
        if (top <= NAVBAR_HEIGHT) {
          activeSection = section;
        } else {
          break; // sorted top-to-bottom, stop di first section below threshold
        }
      }

      if (!activeSection) {
        // Belum ada section yang melewati threshold → pakai tema section pertama
        activeSection = sections[0];
      }

      return activeSection.getAttribute("data-nav-theme") === "dark";
    };

    const onScroll = () => {
      // Cek scroll threshold untuk background navbar
      const nextIsScrolled = window.scrollY > 50;
      if (nextIsScrolled !== isScrolledRef.current) {
        isScrolledRef.current = nextIsScrolled;
        setIsScrolled(nextIsScrolled);
      }

      // Cek tema berdasarkan section yang aktif
      const nextIsDark = getActiveTheme();
      if (nextIsDark !== isInvertedRef.current) {
        isInvertedRef.current = nextIsDark;
        setIsInverted(nextIsDark);
      }
    };

    // Jalankan sekali saat mount untuk menentukan tema awal
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const scrollToSection = (href: string) => {
    if (isDrawerOpenRef.current) closeDrawer();
    setIsMenuOpen(false);

    // Hanya href berupa hash (#section) yang valid untuk querySelector.
    // href seperti "/" atau "/sekolah" adalah route, bukan anchor di halaman ini.
    if (!href.startsWith("#")) {
      window.location.href = href;
      return;
    }

    const element = document.querySelector(href);
    if (element) {
      const headerOffset = 88;
      const targetTop =
        element.getBoundingClientRect().top + window.scrollY - headerOffset;
      window.scrollTo({ top: targetTop, behavior: "smooth" });
    }
  };
  // ── Drawer: initial state ──────────────────────────────────────────────
  useEffect(() => {
    const overlay = drawerOverlayRef.current;
    const scrim = drawerScrimRef.current;
    const panel = drawerPanelRef.current;
    if (!overlay || !panel) return;

    overlay.setAttribute("inert", "");
    overlay.setAttribute("aria-hidden", "true");
    overlay.style.pointerEvents = "none";
    gsap.set(panel, { clipPath: CLIP_HIDDEN });
    gsap.set(scrim, { opacity: 0 });
  }, []);

  // ── Drawer: build open/close timelines for current content ────────────
  const buildDrawerTimelines = () => {
    const overlay = drawerOverlayRef.current;
    const scrim = drawerScrimRef.current;
    const panel = drawerPanelRef.current;
    if (!overlay || !panel) return;

    if (drawerOpenTlRef.current) drawerOpenTlRef.current.kill();
    if (drawerCloseTlRef.current) drawerCloseTlRef.current.kill();

    const labels = drawerLabelRefs.current.filter(Boolean) as HTMLSpanElement[];
    const dots = drawerDotRefs.current.filter(Boolean) as HTMLSpanElement[];

    drawerOpenTlRef.current = gsap.timeline({
      paused: true,
      defaults: { ease: "expo.out" },
      onStart: () => {
        overlay.removeAttribute("inert");
        overlay.setAttribute("aria-hidden", "false");
        overlay.style.pointerEvents = "auto";
      },
    });
    drawerOpenTlRef.current
      .set(panel, { clipPath: CLIP_HIDDEN })
      .set(scrim, { opacity: 0 })
      .set(dots, { scale: 0 })
      .set(labels, { opacity: 0, x: -16 })
      .to(scrim, { opacity: 1, duration: 0.5 }, 0)
      .to(panel, { clipPath: CLIP_VISIBLE, duration: 0.8 }, 0.03)
      .to(labels, { opacity: 1, x: 0, duration: 0.5, stagger: 0.06 }, 0.32);

    drawerCloseTlRef.current = gsap.timeline({
      paused: true,
      defaults: { ease: "expo.out" },
      onComplete: () => {
        overlay.setAttribute("inert", "");
        overlay.setAttribute("aria-hidden", "true");
        overlay.style.pointerEvents = "none";
        setActiveDrawerLink(null);
      },
    });
    drawerCloseTlRef.current
      .to(labels, { opacity: 0, duration: 0.15, stagger: 0.03 }, 0)
      .to(panel, { clipPath: CLIP_HIDDEN, duration: 0.5 }, 0.05)
      .to(scrim, { opacity: 0, duration: 0.4 }, 0.05);
  };

  const openDrawer = (link?: NavLink | null) => {
    drawerLabelRefs.current = [];
    drawerDotRefs.current = [];
    setActiveDrawerLink(link ?? null);
    isDrawerOpenRef.current = true;
    // tunggu 1 frame supaya ref label/dot dari list baru sudah ter-mount
    requestAnimationFrame(() => {
      buildDrawerTimelines();
      drawerCloseTlRef.current?.pause(0);
      drawerOpenTlRef.current?.restart();
    });
  };

  const closeDrawer = useCallback(() => {
    if (!isDrawerOpenRef.current) return;
    isDrawerOpenRef.current = false;
    setIsMenuOpen(false);
    drawerOpenTlRef.current?.pause();
    drawerCloseTlRef.current?.restart();
  }, []);

  const openMobileDrawer = () => {
    setIsMenuOpen(true);
    openDrawer(null);
  };

  const handleNavClick = (link: NavLink) => {
    if (link.children?.length) {
      openDrawer(link);
    } else {
      scrollToSection(link.href);
    }
  };

  const handleDrawerLinkEnter = (index: number) => {
    const dot = drawerDotRefs.current[index];
    const lbl = drawerLabelRefs.current[index];
    if (!dot || !lbl) return;
    const offset = dot.offsetWidth + DOT_GAP;
    gsap.to(dot, {
      scale: 1,
      duration: HOVER_DUR,
      ease: HOVER_EASE,
      overwrite: "auto",
    });
    gsap.to(lbl, {
      x: offset,
      duration: HOVER_DUR,
      ease: HOVER_EASE,
      overwrite: "auto",
    });
  };

  const handleDrawerLinkLeave = (index: number) => {
    const dot = drawerDotRefs.current[index];
    const lbl = drawerLabelRefs.current[index];
    if (!dot || !lbl) return;
    gsap.to(dot, {
      scale: 0,
      duration: HOVER_DUR,
      ease: HOVER_EASE,
      overwrite: "auto",
    });
    gsap.to(lbl, {
      x: 0,
      duration: HOVER_DUR,
      ease: HOVER_EASE,
      overwrite: "auto",
    });
  };

  const handleDrawerLinkClick = (href: string) => {
    closeDrawer();
    scrollToSection(href);
  };

  const drawerItems: Array<NavLink | SubLink> =
    activeDrawerLink?.children ?? navLinks;

  // ESC menutup drawer
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isDrawerOpenRef.current) closeDrawer();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [closeDrawer]);

  // Logika adaptive (showInverted) berlaku sesuai data-nav-theme section yang sedang aktif di layar.
  const showInverted = isInverted;

  const navText = showInverted
    ? "text-white/85 hover:text-white"
    : "text-[#0a0e27]/80 hover:text-[#0a0e27]";
  const iconLineColor = showInverted ? "bg-white" : "bg-[#0a0e27]";
  const navUnderline = showInverted ? "bg-white" : "bg-[#0a0e27]";
  const logoSrc = showInverted
    ? "/images/logo-secondary.png"
    : "/images/logo.png";
  const headerSurface = isScrolled
    ? showInverted
      ? "bg-[#0a0e27]/80 backdrop-blur-md "
      : "bg-background/90 backdrop-blur-md "
    : "";

  return (
    <>
      <motion.header
        ref={headerRef}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${headerSurface}`}
      >
        <nav className="mx-auto flex w-full max-w-[1920px] items-center justify-between px-6 py-4 sm:px-10 md:py-6 lg:px-16 xl:px-24">
          {/* Logo */}
          <a
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="group flex h-12 items-center md:h-12"
            aria-label="Kembali ke bagian utama"
          >
            <Image
              src={logoSrc}
              alt="SMKTIBAZMA"
              width={400}
              height={72}
              priority
              className="h-12 w-auto object-contain transition-opacity duration-300 sm:h-11 md:h-18"
            />
          </a>

          {/* Desktop Navigation */}
          <ul className="hidden items-center justify-end gap-8 md:flex">
            {navLinks.map((link) => (
              <li key={link.label}>
                <button
                  onClick={() => handleNavClick(link)}
                  aria-haspopup={link.children ? "dialog" : undefined}
                  className={`group relative font-sans text-[13px] font-semibold transition-colors duration-300 ${navText}`}
                >
                  {link.label.toUpperCase()}
                  <span
                    className={`absolute -bottom-1 left-0 h-px w-0 transition-all duration-300 group-hover:w-full ${navUnderline}`}
                  />
                </button>
              </li>
            ))}
          </ul>

          {/* Mobile Menu Button */}
          <button
            onClick={() => {
              if (isDrawerOpenRef.current) {
                closeDrawer();
              } else {
                openMobileDrawer();
              }
            }}
            className="md:hidden relative w-8 h-8 flex flex-col items-center justify-center gap-1.5"
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
            aria-controls="mobile-navigation-drawer"
          >
            <motion.span
              animate={isMenuOpen ? { rotate: 45, y: 5 } : { rotate: 0, y: 0 }}
              className={`h-px w-6 origin-center ${iconLineColor}`}
            />
            <motion.span
              animate={
                isMenuOpen ? { opacity: 0, x: -10 } : { opacity: 1, x: 0 }
              }
              className={`h-px w-6 ${iconLineColor}`}
            />
            <motion.span
              animate={
                isMenuOpen ? { rotate: -45, y: -5 } : { rotate: 0, y: 0 }
              }
              className={`h-px w-6 origin-center ${iconLineColor}`}
            />
          </button>
        </nav>
      </motion.header>

      {/* Mobile Menu Overlay (list biasa, klik item ber-submenu akan buka drawer) */}
      {/* Multi-level Drawer — dipicu dari menu Tentang Kami / Program */}
      <div ref={drawerRootRef}>
        <div
          ref={drawerOverlayRef}
          className="fixed inset-0 z-[60] "
          id="mobile-navigation-drawer"
          role="dialog"
          aria-modal="true"
          aria-hidden="true"
          aria-label={activeDrawerLink?.label ?? "Navigasi utama"}
          inert
          style={{ pointerEvents: "none" }}
        >
          <button
            ref={drawerScrimRef}
            onClick={closeDrawer}
            aria-label="Tutup menu"
            className="absolute inset-0 bg-[#0a0e27]/60 backdrop-blur-sm"
            style={{ opacity: 0 }}
          />

          <aside
            ref={drawerPanelRef}
            className="fixed inset-0 flex w-full flex-col overflow-hidden bg-background px-6 py-7 shadow-2xl shadow-[#0a0e27]/25 sm:absolute sm:inset-y-5 sm:right-5 sm:left-auto sm:w-full sm:max-w-md sm:rounded-xl sm:border sm:border-border/70 sm:px-8 sm:py-8 md:inset-y-6 md:right-6 md:px-10 md:py-10"
            style={{ clipPath: CLIP_HIDDEN }}
          >
            <div className="mb-10 flex items-center justify-between">
              {activeDrawerLink ? (
                <button
                  onClick={() => openDrawer(null)}
                  className="font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground md:hidden"
                >
                  Back
                </button>
              ) : (
                <span className="font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Menu
                </span>
              )}
              <button
                onClick={closeDrawer}
                aria-label="Tutup"
                className="relative flex h-8 w-8 items-center justify-center"
              >
                <span className="absolute h-px w-5 rotate-45 bg-foreground" />
                <span className="absolute h-px w-5 -rotate-45 bg-foreground" />
              </button>
            </div>

            <ul
              key={activeDrawerLink?.label ?? "main"}
              className="flex flex-col gap-1"
            >
              {drawerItems.map((item, i) => (
                <li key={item.label}>
                  <button
                    onClick={() => {
                      if (hasChildren(item)) {
                        openDrawer(item);
                      } else {
                        handleDrawerLinkClick(item.href);
                      }
                    }}
                    className="group relative flex w-full items-center justify-between py-3 text-left"
                  >
                    <span
                      className={`font-sans text-2xl font-semibold tracking-tight text-foreground transition-colors duration-300 hover:text-blue-800 md:text-3xl `}
                    >
                      {item.label}
                    </span>
                    {hasChildren(item) ? (
                      <span className="text-xl text-muted-foreground transition-transform duration-300 group-hover:translate-x-1">
                        &gt;
                      </span>
                    ) : null}
                  </button>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </div>
    </>
  );
}
