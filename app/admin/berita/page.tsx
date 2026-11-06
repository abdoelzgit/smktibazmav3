"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
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
  Loader2,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

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
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  const countFor = (tab: string) => {
    if (tab === "Semua") return beritaList.length;
    if (tab === "Dipublikasikan") return beritaList.filter((b) => b.status === "published").length;
    if (tab === "Draft") return beritaList.filter((b) => b.status === "draft").length;
    return beritaList.filter((b) => b.category === tab).length;
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus berita ini?")) return;
    setDeletingId(id);
    const res = await deleteBeritaAction(id);
    if (res.success) {
      setBeritaList((prev) => prev.filter((b) => b.id !== id));
    } else {
      alert(res.error || "Gagal menghapus berita");
    }
    setDeletingId(null);
  };

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 w-full mx-auto space-y-6">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight font-heading">
            Kelola Berita &amp; Artikel
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">
            Publikasikan kabar terbaru, prestasi, dan pengumuman sekolah SMK TI BAZMA.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="relative flex-1 sm:w-48 md:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari berita..."
              className="pl-8 h-9 text-xs bg-card border-border focus-visible:ring-1 w-full"
            />
          </div>
          <Link
            href="/admin/berita/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs rounded-lg whitespace-nowrap min-h-[36px]"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Buat Berita</span>
          </Link>
        </div>
      </div>

      {/* ── Filter Tabs ─────────────────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          {TABS.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 select-none whitespace-nowrap",
                  isActive
                    ? "bg-foreground text-background font-semibold shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
                )}
              >
                {tab}
                <span
                  className={cn(
                    "ml-1 text-[10px] tabular-nums",
                    isActive ? "text-background/60" : "text-muted-foreground/50",
                  )}
                >
                  {countFor(tab)}
                </span>
              </button>
            );
          })}
        </div>
        <Separator />
      </div>

      {/* ── Grid ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">

        {/* ── CARD 1: Create / Upload Shortcut ────────────────────────── */}
        <Link
          href="/admin/berita/new"
          className="group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-card/40 p-8 text-center transition-all duration-300 hover:border-primary/60 hover:bg-card hover:shadow-md cursor-pointer min-h-[260px]"
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

        {/* ── CARDS 2..N: Existing Berita ─────────────────────────────── */}
        {isLoading ? (
          <div className="sm:col-span-1 lg:col-span-2 flex h-64 items-center justify-center rounded-xl border border-border/60 bg-card">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Memuat berita...</span>
            </div>
          </div>
        ) : filteredBerita.length === 0 ? (
          <div className="sm:col-span-1 lg:col-span-2 flex flex-col items-center justify-center rounded-xl border border-dashed border-border/60 bg-card/30 py-14 px-6 text-center">
            <Newspaper className="h-8 w-8 text-muted-foreground/30" />
            <p className="mt-3 text-sm font-medium text-foreground">Tidak ada berita ditemukan</p>
            <p className="mt-1 text-xs text-muted-foreground max-w-xs">
              {searchQuery
                ? `Tidak ada artikel yang cocok dengan "${searchQuery}".`
                : `Belum ada artikel pada kategori "${activeTab}".`}
            </p>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="mt-4 px-4 py-1.5 text-xs font-medium border border-border rounded-lg hover:bg-muted transition-colors"
              >
                Hapus pencarian
              </button>
            )}
          </div>
        ) : (
          filteredBerita.map((item) => (
            <article
              key={item.id}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xs transition-all duration-300 hover:shadow-md hover:border-border/80"
            >
              {/* Cover Image */}
              <div className="relative w-full overflow-hidden bg-muted" style={{ aspectRatio: "16/10" }}>
                {item.coverImage ? (
                  <Image
                    src={item.coverImage}
                    alt={item.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
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

              {/* Card Body */}
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
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      disabled={deletingId === item.id}
                      className="inline-flex items-center justify-center h-7 w-7 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
                      title="Hapus Berita"
                    >
                      {deletingId === item.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-rose-600" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                      <span className="sr-only">Hapus</span>
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
