"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, X, Download, Trash2, Eye, ShieldAlert, MoreHorizontal } from "lucide-react";
import Image from "next/image";
import { Peserta, StatusPeserta } from "./types";
import StatusBadge from "./status-badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DataTableProps {
  data: Peserta[];
  onDownload?: (peserta: Peserta) => void;
  onDelete?: (peserta: Peserta) => void;
}

export default function DataTable({ data, onDownload, onDelete }: DataTableProps) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | StatusPeserta>("ALL");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return data.filter((p) => {
      const matchQuery =
        !q ||
        [p.nama, p.nisn, p.nik, p.alamat, p.sekolahAsal || ""]
          .some((field) => field.toLowerCase().includes(q));

      const matchStatus =
        statusFilter === "ALL" || p.status === statusFilter;

      return matchQuery && matchStatus;
    });
  }, [data, query, statusFilter]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs">
      {/* Header & Controls Toolbar */}
      <div className="flex flex-col gap-3.5 p-4 sm:p-5 border-b border-slate-100 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-2.5">
          <h2 className="text-base font-bold text-slate-900">Daftar Peserta PPDB</h2>
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
            {filtered.length} Peserta
          </span>
        </div>

        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
          {/* Quick Filter Tabs - Full width responsive on mobile */}
          <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-1 text-xs font-medium w-full sm:w-auto overflow-x-auto">
            <button
              type="button"
              onClick={() => setStatusFilter("ALL")}
              className={`flex-1 sm:flex-none whitespace-nowrap rounded-md px-3 py-2 text-xs transition-colors min-h-[36px] ${
                statusFilter === "ALL"
                  ? "bg-white text-slate-900 shadow-xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Semua
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("Belum Diverifikasi")}
              className={`flex-1 sm:flex-none whitespace-nowrap rounded-md px-3 py-2 text-xs transition-colors min-h-[36px] ${
                statusFilter === "Belum Diverifikasi"
                  ? "bg-white text-amber-900 shadow-xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Belum Diverifikasi
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("Sudah Diverifikasi")}
              className={`flex-1 sm:flex-none whitespace-nowrap rounded-md px-3 py-2 text-xs transition-colors min-h-[36px] ${
                statusFilter === "Sudah Diverifikasi"
                  ? "bg-white text-emerald-900 shadow-xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Terverifikasi
            </button>
          </div>

          {/* Search Bar Input */}
          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari nama, NISN, NIK..."
              className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-8 text-xs text-slate-800 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 min-h-[38px]"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                aria-label="Hapus pencarian"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile View: Reflow Card List (Smartphones < 768px) ── */}
      <div className="block md:hidden divide-y divide-slate-100">
        {filtered.map((p) => (
          <div key={p.id} className="p-4 space-y-3 transition-colors hover:bg-slate-50/50">
            {/* Top row: Avatar + Name + Alamat & Action Menu */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full overflow-hidden bg-blue-100 ring-2 ring-blue-50">
                  {p.fotoFormalUrl ? (
                    <Image
                      src={p.fotoFormalUrl}
                      alt={`${p.nama} Foto Formal`}
                      fill
                      className="object-cover"
                      sizes="44px"
                    />
                  ) : (
                    <span className="font-bold text-blue-900 text-xs">
                      {getInitials(p.nama)}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-slate-900 text-sm leading-snug break-words">
                    {p.nama}
                  </h3>
                  <p className="text-slate-500 text-xs truncate max-w-[200px]">
                    {p.alamat || "Alamat belum diisi"}
                  </p>
                </div>
              </div>

              {/* 3-dots Action Menu - Always in-viewport & tap-friendly */}
              <DropdownMenu>
                <DropdownMenuTrigger
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200/90 bg-white text-slate-600 shadow-2xs transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 active:bg-slate-100 cursor-pointer"
                  aria-label={`Menu aksi untuk ${p.nama}`}
                >
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Aksi</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" sideOffset={6} className="w-48 shadow-lg">
                  <DropdownMenuItem
                    render={<Link href={`/admin/data-ppdb/${p.id}`} />}
                    className="cursor-pointer font-medium py-2.5"
                  >
                    <Eye className="h-4 w-4 text-slate-500" />
                    <span>Lihat Detail</span>
                  </DropdownMenuItem>

                  {onDownload && (
                    <DropdownMenuItem
                      onClick={() => onDownload(p)}
                      className="cursor-pointer font-medium py-2.5"
                    >
                      <Download className="h-4 w-4 text-slate-500" />
                      <span>Unduh Data</span>
                    </DropdownMenuItem>
                  )}

                  {onDelete && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => onDelete(p)}
                        className="cursor-pointer font-medium text-red-600 focus:bg-red-50 focus:text-red-700 py-2.5"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                        <span>Hapus Peserta</span>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Middle row: Status & Sekolah Asal */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100/70">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 min-w-0">
                <span className="font-medium text-slate-400">Sekolah:</span>
                <span className="font-semibold text-slate-700 truncate max-w-[180px]">
                  {p.sekolahAsal || "—"}
                </span>
              </div>
              <StatusBadge status={p.status} />
            </div>

            {/* Bottom info strip: NISN & NIK */}
            <div className="flex items-center justify-between rounded-lg bg-slate-50 border border-slate-100 px-3 py-2 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 font-medium">NISN:</span>
                <span className="font-bold text-slate-900 font-mono">{p.nisn}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 font-medium">NIK:</span>
                <span className="font-medium text-slate-600 font-mono">{p.nik}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Desktop View: Full Data Table (Screens >= 768px) ── */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs text-slate-700">
          <thead className="border-b border-slate-200 bg-slate-50/75 text-slate-500 uppercase font-semibold">
            <tr>
              <th scope="col" className="px-4 py-3 sm:px-6">Peserta</th>
              <th scope="col" className="px-4 py-3">NISN / NIK</th>
              <th scope="col" className="px-4 py-3 hidden md:table-cell">Sekolah Asal</th>
              <th scope="col" className="px-4 py-3">Status</th>
              <th scope="col" className="w-14 px-4 py-3 text-right sm:px-6">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((p) => (
              <tr key={p.id} className="transition-colors hover:bg-slate-50/60">
                {/* Peserta Info with Avatar */}
                <td className="px-4 py-3.5 sm:px-6">
                  <div className="flex items-center gap-3">
                    <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full overflow-hidden bg-blue-100">
                      {p.fotoFormalUrl ? (
                        <Image
                          src={p.fotoFormalUrl}
                          alt={`${p.nama} Foto Formal`}
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      ) : (
                        <span className="font-bold text-blue-900 text-xs">
                          {getInitials(p.nama)}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm leading-snug">{p.nama}</p>
                      <p className="text-slate-500 text-xs truncate max-w-[200px] sm:max-w-xs">{p.alamat}</p>
                    </div>
                  </div>
                </td>

                {/* NISN / NIK */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <p className="font-semibold text-slate-900">{p.nisn}</p>
                  <p className="text-slate-400 text-xs">NIK: {p.nik}</p>
                </td>

                {/* Sekolah Asal */}
                <td className="px-4 py-3 hidden md:table-cell whitespace-nowrap text-slate-600">
                  {p.sekolahAsal || "—"}
                </td>

                {/* Status */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <StatusBadge status={p.status} />
                </td>

                {/* Action Controls */}
                <td className="w-14 px-4 py-3 text-right whitespace-nowrap sm:px-6">
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200/80 bg-white text-slate-600 shadow-2xs transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 cursor-pointer"
                      aria-label={`Menu aksi untuk ${p.nama}`}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Aksi</span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" sideOffset={6} className="w-44">
                      <DropdownMenuItem
                        render={<Link href={`/admin/data-ppdb/${p.id}`} />}
                        className="cursor-pointer font-medium"
                      >
                        <Eye className="h-4 w-4 text-slate-500" />
                        <span>Lihat Detail</span>
                      </DropdownMenuItem>

                      {onDownload && (
                        <DropdownMenuItem
                          onClick={() => onDownload(p)}
                          className="cursor-pointer font-medium"
                        >
                          <Download className="h-4 w-4 text-slate-500" />
                          <span>Unduh Data</span>
                        </DropdownMenuItem>
                      )}

                      {onDelete && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => onDelete(p)}
                            className="cursor-pointer font-medium text-red-600 focus:bg-red-50 focus:text-red-700 dark:focus:bg-red-950/30"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                            <span>Hapus Peserta</span>
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Empty State ── */}
      {filtered.length === 0 && (
        <div className="py-12 px-4 text-center">
          <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
            <ShieldAlert className="h-8 w-8 text-slate-300" />
            <p className="text-sm font-semibold text-slate-700">Tidak Ada Peserta Ditemukan</p>
            <p className="text-xs text-slate-400">
              Coba ganti kata kunci pencarian atau ubah filter status di atas.
            </p>
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setStatusFilter("ALL");
                }}
                className="mt-2 text-xs font-semibold text-blue-600 hover:underline min-h-[36px] px-3 py-1.5"
              >
                Reset Filter & Pencarian
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}