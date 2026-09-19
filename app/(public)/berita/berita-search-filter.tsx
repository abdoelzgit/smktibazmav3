"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useTransition, useEffect } from "react";
import { Search, X, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface BeritaSearchFilterProps {
  categories: string[];
  initialCategory?: string;
  initialSearch?: string;
  totalResults?: number;
}

export function BeritaSearchFilter({
  categories,
  initialCategory = "Semua",
  initialSearch = "",
  totalResults,
}: BeritaSearchFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [activeCategory, setActiveCategory] = useState(initialCategory);

  useEffect(() => {
    setSearchQuery(searchParams.get("q") || "");
    setActiveCategory(searchParams.get("category") || "Semua");
  }, [searchParams]);

  const updateQueryParams = useCallback(
    (newCategory: string, newQuery: string) => {
      const params = new URLSearchParams(searchParams.toString());

      if (newCategory && newCategory !== "Semua") {
        params.set("category", newCategory);
      } else {
        params.delete("category");
      }

      if (newQuery.trim() !== "") {
        params.set("q", newQuery.trim());
      } else {
        params.delete("q");
      }

      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
      });
    },
    [pathname, router, searchParams]
  );

  const handleCategorySelect = (category: string) => {
    setActiveCategory(category);
    updateQueryParams(category, searchQuery);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    updateQueryParams(activeCategory, val);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    updateQueryParams(activeCategory, "");
  };

  const handleResetAll = () => {
    setSearchQuery("");
    setActiveCategory("Semua");
    updateQueryParams("Semua", "");
  };

  const isFiltered = activeCategory !== "Semua" || searchQuery.trim() !== "";

  return (
    <div className="w-full space-y-6 mb-8">
      {/* ── Header Title Section ─────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight font-heading">
            Berita & Artikel Terkini
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">
            Kabar terbaru, kegiatan, prestasi, dan pengumuman sekolah SMK TI BAZMA.
          </p>
        </div>

        {/* Search Input & Reset Controls */}
        <div className="flex items-center gap-2">
        

      
        </div>
      </div>

      {/* ── Filter Tabs Bar (Exact Dribbble Style) ─────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((tab) => {
              const isActive = activeCategory.toLowerCase() === tab.toLowerCase();
              return (
                <button
                  key={tab}
                  onClick={() => handleCategorySelect(tab)}
                  disabled={isPending}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 select-none cursor-pointer",
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

            <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Cari berita..."
              className="pl-9 pr-8 h-9 text-xs md:text-sm  border-b bg-card shadow-xs focus-visible:ring-1 focus-visible:ring-primary"
            />
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                title="Hapus pencarian"
                type="button"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

         
        </div>
        <Separator />
      </div>
    </div>
  );
}
