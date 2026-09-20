"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getJejakKaryaListAction } from "@/app/actions/jejak-karya-list";
import { deleteJejakKaryaAction } from "@/app/actions/jejak-karya";
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
  Calendar,
  Edit3,
  Trash2,
  FolderOpen,
  ArrowUpRight,
  Upload,
  Zap,
  Globe,
  Palette,
  Video,
} from "lucide-react";

interface JejakKaryaItem {
  id: string;
  slug: string;
  title: string;
  category: "Website" | "Design" | "Video" | "IoT";
  year: string;
  author: string;
  description: string;
  status: "published" | "draft";
  publishedAt: string;
  coverImage?: string;
}

const TABS = ["Semua", "Dipublikasikan", "Draft", "Website", "Design", "Video", "IoT"];

const CATEGORY_ICONS = {
  Website: Globe,
  Design: Palette,
  Video: Video,
  IoT: Zap,
};

export default function JejakKaryaAdminPage() {
  const [activeTab, setActiveTab] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [list, setList] = useState<JejakKaryaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchList = async () => {
    setIsLoading(true);
    const res = await getJejakKaryaListAction();
    if (res.success && res.data) {
      setList(
        res.data.map((item: any) => ({
          id: item.id,
          slug: item.slug,
          title: item.title,
          category: item.category,
          year: item.year,
          author: item.author,
          description: item.description,
          status: item.status,
          publishedAt: item.publishedAt,
          coverImage: item.coverImage,
        }))
      );
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchList();
  }, []);

  const filtered = list.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.author.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (activeTab === "Semua") return true;
    if (activeTab === "Dipublikasikan") return item.status === "published";
    if (activeTab === "Draft") return item.status === "draft";
    return item.category === activeTab;
  });

  const handleDelete = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus jejak karya ini?")) {
      const res = await deleteJejakKaryaAction(id);
      if (res.success) {
        setList((prev) => prev.filter((b) => b.id !== id));
      } else {
        alert(res.error || "Gagal menghapus jejak karya");
      }
    }
  };

  return (
    <div className="flex-1 p-6 md:p-8 w-full mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight font-heading">
            Kelola Jejak Karya
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">
            Publikasikan portofolio dan karya inovasi siswa SMK TI BAZMA.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-48 md:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari jejak karya..."
              className="pl-8 h-9 text-xs bg-card border-border focus-visible:ring-1"
            />
          </div>
          <Link
            href="/admin/jejak-karya/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs rounded-lg whitespace-nowrap"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Buat Karya</span>
          </Link>
        </div>
      </div>

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
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                )}
              >
                {tab}
              </button>
            );
          })}
        </div>
        <Separator />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            Memuat jejak karya...
          </div>
        ) : (
          <>
            <Link
              href="/admin/jejak-karya/new"
              className="group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-card/40 p-8 text-center transition-all duration-300 hover:border-primary/60 hover:bg-card hover:shadow-md min-h-[320px] aspect-4/3 cursor-pointer"
            >
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110">
                <div className="relative">
                  <Upload className="h-7 w-7" />
                  <Plus className="absolute -right-1 -top-1 h-3.5 w-3.5 stroke-[3]" />
                </div>
              </div>

              <h3 className="text-lg font-bold text-foreground font-heading group-hover:text-primary transition-colors">
                Tambah Jejak Karya Baru
              </h3>
              <p className="mt-2 text-xs text-muted-foreground max-w-[240px] leading-relaxed">
                Buat portofolio baru untuk memamerkan inovasi dan karya siswa.
              </p>

              <div className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-foreground px-5 py-2 text-xs font-semibold text-background transition-all group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-sm">
                <span>Buat karya pertama</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </div>
            </Link>

            {filtered.map((item) => {
              const Icon = CATEGORY_ICONS[item.category];
              return (
                <div
                  key={item.id}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xs transition-all duration-300 hover:shadow-md hover:border-border/80 min-h-[320px] aspect-4/3"
                >
                  <div className="relative aspect-video w-full overflow-hidden bg-muted">
                    {item.coverImage ? (
                      <img
                        src={item.coverImage}
                        alt={item.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-muted/60 text-muted-foreground">
                        <Icon className="h-10 w-10 opacity-40" />
                      </div>
                    )}

                    <div className="absolute left-3 top-3 flex items-center gap-1.5">
                      <span className="rounded-full bg-background/90 px-2.5 py-0.5 text-[10px] font-semibold text-foreground backdrop-blur-md border border-border/60">
                        {item.category}
                      </span>
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-0.5 text-[10px] font-semibold border backdrop-blur-md",
                          item.status === "published"
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400"
                            : "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400"
                        )}
                      >
                        {item.status === "published" ? "Dipublikasikan" : "Draft"}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col justify-between p-4">
                    <div className="space-y-1.5">
                      <h4 className="text-sm font-bold text-foreground line-clamp-2 font-heading group-hover:text-primary transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {item.author} • {item.year}
                      </p>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-3 text-[11px] text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{item.publishedAt}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <Link
                          href={`/admin/jejak-karya/${item.id}/edit`}
                          className="inline-flex items-center justify-center h-7 w-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                          title="Edit"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => handleDelete(item.id)}
                          className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          title="Hapus"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
