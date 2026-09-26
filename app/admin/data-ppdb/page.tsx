"use client";

import { useEffect, useState, useTransition } from "react";
import StatCard from "@/components/stat-card";
import DataTable from "@/components/data-table";
import { Peserta } from "@/components/types";
import { Users, CheckCircle2, Clock, Download, RefreshCw, Loader2 } from "lucide-react";
import {
  getPendaftaranPpdbListAction,
  deletePendaftaranAction,
} from "@/app/actions/ppdb-admin";

export default function DashboardContent() {
  const [pesertaList, setPesertaList] = useState<Peserta[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isPending, startTransition] = useTransition();
  const [notification, setNotification] = useState<string | null>(null);

  const loadDataFromDb = async () => {
    setLoading(true);
    const result = await getPendaftaranPpdbListAction();
    if (result.success && result.data) {
      setPesertaList(result.data);
    } else {
      showToast(result.error || "Gagal memuat data dari database");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadDataFromDb();
  }, []);

  const totalPeserta = pesertaList.length;
  const totalTerverifikasi = pesertaList.filter((p) => p.status === "Sudah Diverifikasi").length;
  const totalBelumTerverifikasi = totalPeserta - totalTerverifikasi;
  const verifikasiPercentage = totalPeserta > 0 ? Math.round((totalTerverifikasi / totalPeserta) * 100) : 0;

  const showToast = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleDelete = (peserta: Peserta) => {
    if (confirm(`Apakah Anda yakin ingin menghapus data pendaftaran ${peserta.nama} dari database?`)) {
      setPesertaList((prev) => prev.filter((p) => p.id !== peserta.id));

      startTransition(async () => {
        const res = await deletePendaftaranAction(peserta.id);
        if (res.success) {
          showToast(`Data peserta ${peserta.nama} berhasil dihapus dari database.`);
        } else {
          loadDataFromDb();
          showToast(res.error || "Gagal menghapus data dari database.");
        }
      });
    }
  };

  const handleDownloadSingle = (peserta: Peserta) => {
    const csvContent = `data:text/csv;charset=utf-8,NISN,Nama,NIK,Sekolah Asal,Alamat,Status\n"${peserta.nisn}","${peserta.nama}","${peserta.nik}","${peserta.sekolahAsal || ""}","${peserta.alamat}","${peserta.status}"`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `PPDB_${peserta.nisn}_${peserta.nama.replace(/\s+/g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`File data ${peserta.nama} berhasil diunduh.`);
  };

  const handleExportAll = () => {
    if (pesertaList.length === 0) {
      showToast("Tidak ada data untuk diexport.");
      return;
    }

    const headers = "NISN,Nama,NIK,Sekolah Asal,Alamat,Status\n";
    const rows = pesertaList
      .map(
        (p) =>
          `"${p.nisn}","${p.nama}","${p.nik}","${p.sekolahAsal || ""}","${p.alamat}","${p.status}"`
      )
      .join("\n");

    const encodedUri = encodeURI(`data:text/csv;charset=utf-8,${headers}${rows}`);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `PPDB_Semua_Peserta_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Seluruh data peserta PPDB berhasil diexport ke CSV.");
  };

  return (
    <div className="min-h-screen space-y-6 bg-slate-50/60 p-4 sm:p-6 md:p-8">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-slate-900 px-4 py-3 text-xs font-semibold text-white shadow-lg flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col gap-3.5 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Manajemen Data PPDB (Database)
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Terhubung langsung dengan database PostgreSQL Prisma. Peserta otomatis terverifikasi setelah melengkapi semua informasi.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={loadDataFromDb}
            disabled={loading || isPending}
            className="flex-1 sm:flex-none inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50 disabled:opacity-50 active:bg-slate-100"
            title="Refresh data dari database"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading || isPending ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={handleExportAll}
            className="flex-1 sm:flex-none inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-blue-900 px-4 py-2 text-xs font-semibold text-white shadow-2xs transition hover:bg-blue-950 active:bg-blue-900"
          >
            <Download className="h-4 w-4 text-white" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Total Pendaftar"
          value={loading ? "..." : totalPeserta}
          description="Terdaftar di database PostgreSQL"
          icon={Users}
          variant="primary"
        />
        <StatCard
          label="Sudah Diverifikasi"
          value={loading ? "..." : totalTerverifikasi}
          description={`${verifikasiPercentage}% dari total berkas pendaftar`}
          icon={CheckCircle2}
          variant="success"
        />
        <StatCard
          label="Belum Diverifikasi"
          value={loading ? "..." : totalBelumTerverifikasi}
          description="Menunggu kelengkapan data peserta"
          icon={Clock}
          variant="warning"
        />
      </div>

      {/* Loading Indicator */}
      {loading ? (
        <div className="flex h-48 w-full items-center justify-center rounded-xl border border-slate-200 bg-white p-8 shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            <Loader2 className="h-5 w-5 animate-spin text-blue-900" />
            <span>Memuat data pendaftaran dari database...</span>
          </div>
        </div>
      ) : (
        /* Main Data Table */
        <DataTable
          data={pesertaList}
          onDownload={handleDownloadSingle}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}