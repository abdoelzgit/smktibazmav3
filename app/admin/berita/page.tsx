"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AppSidebar } from "@/components/app-sidebar";
import { getBeritaListAction } from "@/app/actions/berita-list";
import { deleteBeritaAction } from "@/app/actions/berita";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Plus,
  Search,
  Newspaper,
  Calendar,
  MoreVertical,
  Eye,
  Edit3,
  Trash2,
  FolderOpen,
  ArrowUpRight,
  Upload,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────────

interface BeritaItem {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  status: "published" | "draft";
  publishedAt: string;
  coverImage?: string;
}

const TABS = [
  "Semua",
  "Dipublikasikan",
  "Draft",
  "Akademik",
  "Prestasi",
  "Kegiatan Sekolah",
  "Pengumuman",
  "Asrama",
];

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function BeritaAdminPage() {
  const [activeTab, setActiveTab] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [beritaList, setBeritaList] = useState<BeritaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBerita = async () => {
    setIsLoading(true);
    const res = await getBeritaListAction();
    if (res.success && res.data) {
      setBeritaList(res.data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchBerita();
  }, []);

  // Filter logic
  const filteredBerita = beritaList.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === "Semua") return true;
    if (activeTab === "Dipublikasikan") return item.status === "published";
    if (activeTab === "Draft") return item.status === "draft";
    return item.category === activeTab;
  });

  const handleDelete = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus berita ini?")) {
      const res = await deleteBeritaAction(id);
      if (res.success) {
        setBeritaList((prev) => prev.filter((b) => b.id !== id));
      } else {
        alert(res.error || "Gagal menghapus berita");
      }
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-background min-h-screen flex flex-col">
        {/* ── Top Header Bar ─────────────────────────────────────────────── */}
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-border px-4 md:px-6">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-vertical:h-4 data-vertical:self-auto"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="font-semibold">
                    Kelola Berita
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-48 md:w-64">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari berita..."
                className="pl-8 h-8 text-xs bg-muted/40 border-border focus-visible:ring-1"
              />
            </div>
            <Link
              href="/admin/berita/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm rounded-lg"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Buat Berita</span>
            </Link>
          </div>
        </header>

        {/* ── Content Container ───────────────────────────────────────────── */}
        <div className="flex-1 p-6 md:p-8  w-full mx-auto space-y-6">
          {/* Header Title Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight font-heading">
                Kelola Berita & Artikel
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground mt-1">
                Publikasikan kabar terbaru, prestasi, dan pengumuman sekolah SMK TI BAZMA.
              </p>
            </div>
          </div>

          {/* ── Filter Tabs Bar (Exact Dribbble Style from image) ─────────── */}
          <div className="space-y-4">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
              {TABS.map((tab) => {
                const isActive = activeTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      "px-4 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 select-none",
                      isActive
                        ? "bg-foreground text-background font-semibold shadow-xs"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
                    )}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>
            <Separator />
          </div>

          {/* ── 3-Column Grid Layout (Dribbble Shots Style) ──────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                Memuat berita...
              </div>
            ) : (
              <>
                {/* ── CARD 1: Special Upload / Create First Shot Card ─────────── */}
            <Link
              href="/admin/berita/new"
              className="group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-card/40 p-8 text-center transition-all duration-300 hover:border-primary/60 hover:bg-card hover:shadow-md min-h-[320px] aspect-4/3 cursor-pointer"
            >
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110">
                <div className="relative">
                  <Upload className="h-7 w-7" />
                  <Plus className="absolute -right-1 -top-1 h-3.5 w-3.5 stroke-[3]" />
                </div>
              </div>

              <h3 className="text-lg font-bold text-foreground font-heading group-hover:text-primary transition-colors">
                Tambah Berita Baru
              </h3>
              <p className="mt-2 text-xs text-muted-foreground max-w-[240px] leading-relaxed">
                Tulis artikel, masukkan gambar cover, dan publikasikan berita kegiatan sekolah.
              </p>

              <div className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-foreground px-5 py-2 text-xs font-semibold text-background transition-all group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-sm">
                <span>Buat berita pertama</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </div>
            </Link>

            {/* ── CARDS 2..N: Existing Berita Items ───────────────────────── */}
            {filteredBerita.map((item) => (
              <div
                key={item.id}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xs transition-all duration-300 hover:shadow-md hover:border-border/80 min-h-[320px] aspect-4/3"
              >
                {/* Image Cover */}
                <div className="relative aspect-video w-full overflow-hidden bg-muted">
                  {item.coverImage ? (
                    <img
                      src={item.coverImage}
                      alt={item.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-muted/60 text-muted-foreground">
                      <Newspaper className="h-10 w-10 opacity-40" />
                    </div>
                  )}

                  {/* Status & Category Badges */}
                  <div className="absolute left-3 top-3 flex items-center gap-1.5">
                    <span className="rounded-full bg-background/90 px-2.5 py-0.5 text-[10px] font-semibold text-foreground backdrop-blur-md border border-border/60">
                      {item.category}
                    </span>
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-[10px] font-semibold border backdrop-blur-md",
                        item.status === "published"
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400"
                          : "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400",
                      )}
                    >
                      {item.status === "published" ? "Dipublikasikan" : "Draft"}
                    </span>
                  </div>
                </div>

                {/* Card Body Content */}
                <div className="flex flex-1 flex-col justify-between p-4">
                  <div className="space-y-1.5">
                    <h4 className="text-sm font-bold text-foreground line-clamp-2 font-heading group-hover:text-primary transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {item.excerpt}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-3 text-[11px] text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{item.publishedAt}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Link
                        href={`/admin/berita/${item.id}/edit`}
                        className="inline-flex items-center justify-center h-7 w-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        title="Edit Berita"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => handleDelete(item.id)}
                        className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        title="Hapus Berita"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
