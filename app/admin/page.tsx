export const dynamic = "force-dynamic";

import Link from "next/link";
import {
  DatabaseSearch,
  Newspaper,
  AppWindow,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  WifiOff,
  Database,
} from "lucide-react";
import { getDatabaseStatus } from "@/app/actions/system";

export default async function AdminDashboardPage() {
  const dbStatus = await getDatabaseStatus();

  const quickModules = [
    {
      title: "Data PPDB",
      description: "Kelola berkas calon santri baru, verifikasi data pendaftar, dan export ke CSV.",
      href: "/admin/data-ppdb",
      icon: DatabaseSearch,
      accentColor: "bg-blue-600",
 
      buttonText: "Buka Data PPDB",
    },
    {
      title: "Kelola Berita",
      description: "Tulis dan publikasikan kabar sekolah, prestasi santri, dan pengumuman resmi.",
      href: "/admin/berita",
      icon: Newspaper,
      accentColor: "bg-emerald-600",

      buttonText: "Kelola Berita",
    },
    {
      title: "Jejak Karya",
      description: "Dokumentasi dan showcase karya santri meliputi Website, Desain, IoT, dan Video.",
      href: "/admin/jejak-karya",
      icon: AppWindow,
      accentColor: "bg-indigo-600",
      buttonText: "Lihat Jejak Karya",
    },
  ];

  return (
    <div className="flex-1 space-y-6 p-4 sm:p-6 md:p-8 bg-slate-50/60 min-h-screen">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-slate-900 p-5 sm:p-7 text-white shadow-sm">
        <div className="relative z-10 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-blue-100 backdrop-blur-xs">
              <span>Dashboard Admin SMK TI BAZMA</span>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight">
              Selamat Datang di Admin SMK TI Bazma
            </h1>
            <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed">
              Kelola data pendaftaran PPDB, publikasi berita, dan showcase karya siswa dalam satu tempat yang terintegrasi.
            </p>
          </div>
          <div className="flex items-center gap-3 pt-2 md:pt-0">
            <Link
              href="/admin/data-ppdb"
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs sm:text-sm font-bold text-blue-900 shadow-sm transition hover:bg-blue-50 active:scale-98"
            >
              <span>Lihat Data PPDB</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Ambient subtle decoration */}
        <div className="pointer-events-none absolute -right-12 -top-12 h-56 w-56 rounded-full bg-white/5 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-8 right-32 h-40 w-40 rounded-full bg-indigo-500/10 blur-xl" />
      </div>

      {/* Main Modules Grid */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
          Modul Utama
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quickModules.map((module) => {
            const Icon = module.icon;
            return (
              <div
                key={module.title}
                className="group relative flex flex-col justify-between rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:border-slate-300 hover:shadow-md"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div
                      className={`flex h-11 w-11 items-center justify-center `}
                    >
                      <Icon className="h-7 w-7" />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-400">Modul</span>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-900 transition-colors">
                      {module.title}
                    </h3>
                    <p className="mt-1 text-xs text-slate-900 leading-relaxed">
                      {module.description}
                    </p>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100">
                  <Link
                    href={module.href}
                    className="inline-flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200"
                  >
                    <span>{module.buttonText}</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* System Information Card — real-time DB status */}
      <div
        className={`rounded-xl border p-4 sm:p-5 shadow-xs transition-colors ${
          dbStatus.online
            ? "bg-white border-slate-200/80"
            : "bg-red-50 border-red-200"
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">

              {dbStatus.online ? (
                <ShieldCheck className="h-5 w-5" />
              ) : (
                <WifiOff className="h-5 w-5" />
              )}
           
            <div>
              <p
                className={`text-xs sm:text-sm font-bold ${
                  dbStatus.online ? "text-slate-900" : "text-red-800"
                }`}
              >
                {dbStatus.online ? "Sistem Terhubung & Aman" : "Koneksi Database Terputus"}
              </p>
              <p
                className={`text-xs ${
                  dbStatus.online ? "text-slate-500" : "text-red-600"
                }`}
              >
                {dbStatus.online
                  ? `Database PostgreSQL aktif via Prisma ORM${dbStatus.latencyMs !== null ? ` · ${dbStatus.latencyMs}ms` : ""}`
                  : "Tidak dapat menjangkau database. Periksa koneksi atau konfigurasi Prisma."}
              </p>
            </div>
          </div>

          <div
            className={`flex items-center gap-2 text-xs font-semibold ${
              dbStatus.online ? "text-emerald-600" : "text-red-500"
            }`}
          >

            {dbStatus.online ? (
              <>
                <span
                  className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse"
                  aria-hidden="true"
                />
                <span>Database Online</span>
              </>
            ) : (
              <>
                <span
                  className="inline-block h-2 w-2 rounded-full bg-red-500"
                  aria-hidden="true"
                />
                <span>Database Offline</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
