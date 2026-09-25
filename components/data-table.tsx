import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, X, Download, Trash2, Eye, ShieldAlert } from "lucide-react";
import Image from "next/image";
import { Peserta, StatusPeserta } from "./types";
import StatusBadge from "./status-badge";

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
      <div className="flex flex-col gap-4 p-4 sm:p-5 border-b border-slate-100 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-base font-bold text-slate-900">Daftar Peserta PPDB</h2>
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
            {filtered.length} Peserta
          </span>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Quick Filter Tabs */}
          <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-1 text-xs font-medium">
            <button
              type="button"
              onClick={() => setStatusFilter("ALL")}
              className={`rounded-md px-3 py-1.5 transition-colors ${statusFilter === "ALL"
                  ? "bg-white text-slate-900 shadow-xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
                }`}
            >
              Semua
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("Belum Diverifikasi")}
              className={`rounded-md px-3 py-1.5 transition-colors ${statusFilter === "Belum Diverifikasi"
                  ? "bg-white text-amber-900 shadow-xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
                }`}
            >
              Belum Diverifikasi
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("Sudah Diverifikasi")}
              className={`rounded-md px-3 py-1.5 transition-colors ${statusFilter === "Sudah Diverifikasi"
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
              className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-8 text-xs text-slate-800 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs text-slate-700">
          <thead className="border-b border-slate-200 bg-slate-50/75 text-slate-500 uppercase font-semibold">
            <tr>
              <th scope="col" className="px-4 py-3 sm:px-6">Peserta</th>
              <th scope="col" className="px-4 py-3">NISN / NIK</th>
              <th scope="col" className="px-4 py-3 hidden md:table-cell">Sekolah Asal</th>
              <th scope="col" className="px-4 py-3">Status</th>
              <th scope="col" className="px-4 py-3 text-right sm:px-6">Aksi</th>
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
                <td className="px-4 py-3 text-right whitespace-nowrap sm:px-6">
                  <div className="inline-flex items-center gap-1.5">
                    <Link
                      href={`/admin/data-ppdb/${p.id}`}
                      title="Lihat Detail Peserta"
                      className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50 hover:text-slate-900"
                    >
                      <Eye className="h-3.5 w-3.5 text-slate-500" />
                      <span className="hidden sm:inline">Detail</span>
                    </Link>

                    {onDownload && (
                      <button
                        type="button"
                        title="Unduh Data"
                        onClick={() => onDownload(p)}
                        className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-blue-700"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    )}

                    {onDelete && (
                      <button
                        type="button"
                        title="Hapus Peserta"
                        onClick={() => onDelete(p)}
                        className="rounded-md p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="py-12 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <ShieldAlert className="h-8 w-8 text-slate-300" />
                    <p className="text-sm font-semibold text-slate-700">Tidak Ada Peserta Ditemukan</p>
                    <p className="text-xs text-slate-400">
                      Coba ganti kata kunci pencarian atau ubah filter status.
                    </p>
                    {query && (
                      <button
                        type="button"
                        onClick={() => {
                          setQuery("");
                          setStatusFilter("ALL");
                        }}
                        className="mt-2 text-xs font-medium text-blue-600 hover:underline"
                      >
                        Reset Filter & Pencarian
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}