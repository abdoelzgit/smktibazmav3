export const dynamic = "force-dynamic";

import Link from "next/link";
import {
  Users,
  CheckCircle2,
  Clock,
  Newspaper,
  AppWindow,
  ArrowRight,
  Plus,
  ExternalLink,
  ShieldCheck,
  WifiOff,
  ChevronRight,
  FileText,
  Sparkles,
  Layers,
  Calendar,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getDatabaseStatus } from "@/app/actions/system";
import { StatusPendaftaran } from "@prisma/client";

export default async function AdminDashboardPage() {
  const [
    dbStatus,
    totalPendaftar,
    pendaftarVerifikasi,
    pendaftarPending,
    recentPendaftar,
    totalBerita,
    beritaPublished,
    totalKarya,
    karyaPublished,
  ] = await Promise.all([
    getDatabaseStatus(),
    prisma.pendaftaran.count(),
    prisma.pendaftaran.count({
      where: {
        status: { in: [StatusPendaftaran.VERIFIED, StatusPendaftaran.ACCEPTED] },
      },
    }),
    prisma.pendaftaran.count({
      where: {
        status: { in: [StatusPendaftaran.SUBMITTED, StatusPendaftaran.DRAFT] },
      },
    }),
    prisma.pendaftaran.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        biodata: {
          select: {
            namaLengkap: true,
            nisn: true,
          },
        },
        sekolahAsal: {
          select: {
            namaSekolahAsal: true,
          },
        },
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    }),
    prisma.berita.count(),
    prisma.berita.count({ where: { published: true } }),
    prisma.jejakKarya.count(),
    prisma.jejakKarya.count({ where: { published: true } }),
  ]);

  const currentDateIndo = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <div className="flex-1 space-y-6 p-4 sm:p-6 md:p-8 bg-slate-50/70 min-h-screen">
      {/* ── Top Header Bar ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-900/10 px-2.5 py-0.5 text-xs font-semibold text-blue-900">
              SMK TI BAZMA
            </span>
            <span className="text-xs text-slate-400">·</span>
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              <span>{currentDateIndo}</span>
            </div>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Pusat Kendali Administrasi
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Pantau pendaftaran calon santri baru, aktivitas publikasi berita, dan kurasi karya siswa.
          </p>
        </div>

        {/* Database Health Pill */}
        <div className="flex items-center self-start sm:self-auto gap-2">
          <div
            className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
              dbStatus.online
                ? "bg-white border-slate-200 text-slate-700 shadow-2xs"
                : "bg-rose-50 border-rose-200 text-rose-800"
            }`}
          >
            {dbStatus.online ? (
              <>
                <span
                  className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"
                  aria-hidden="true"
                />
                <span className="font-semibold text-slate-800">PostgreSQL</span>
                <span className="text-slate-400">·</span>
                <span className="text-emerald-700 font-mono font-semibold">
                  {dbStatus.latencyMs !== null ? `${dbStatus.latencyMs}ms` : "Aktif"}
                </span>
              </>
            ) : (
              <>
                <WifiOff className="h-3.5 w-3.5 text-rose-600" />
                <span className="font-semibold">DB Terputus</span>
              </>
            )}
          </div>

          <Link
            href="/"
            target="_blank"
            className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 hover:text-slate-900 transition"
            title="Buka Website Publik SMK TI BAZMA"
          >
            <span>Web Publik</span>
            <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
          </Link>
        </div>
      </div>

      {/* ── Key Metrics Overview (KPIs) ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Metric 1: Total Pendaftar */}
        <div className="relative flex flex-col justify-between rounded-xl border border-slate-200/90 bg-white p-5 shadow-2xs transition-all hover:border-slate-300">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Total Pendaftar PPDB</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-900">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {totalPendaftar}
              </span>
              <span className="text-xs text-slate-500 font-medium">calon santri</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Terdaftar di database</span>
            <Link
              href="/admin/data-ppdb"
              className="font-semibold text-blue-900 hover:text-blue-950 inline-flex items-center gap-0.5"
            >
              Kelola <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Metric 2: Perlu Verifikasi (Attention Gate) */}
        <div
          className={`relative flex flex-col justify-between rounded-xl border p-5 shadow-2xs transition-all ${
            pendaftarPending > 0
              ? "border-amber-200 bg-amber-50/30"
              : "border-slate-200/90 bg-white"
          }`}
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Perlu Verifikasi</span>
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                  pendaftarPending > 0
                    ? "bg-amber-100 text-amber-800"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span
                className={`text-2xl sm:text-3xl font-extrabold ${
                  pendaftarPending > 0 ? "text-amber-900" : "text-slate-900"
                }`}
              >
                {pendaftarPending}
              </span>
              <span className="text-xs text-slate-500 font-medium">berkas menunggu</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              {pendaftarPending > 0 ? "Menunggu tindakan admin" : "Semua berkas tervalidasi"}
            </span>
            <Link
              href="/admin/data-ppdb"
              className="font-semibold text-amber-900 hover:underline inline-flex items-center gap-0.5"
            >
              Tinjau <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Metric 3: Berita & Pengumuman */}
        <div className="relative flex flex-col justify-between rounded-xl border border-slate-200/90 bg-white p-5 shadow-2xs transition-all hover:border-slate-300">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Kabar & Publikasi</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-800">
                <Newspaper className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {totalBerita}
              </span>
              <span className="text-xs text-slate-500 font-medium">artikel total</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              {beritaPublished} rilis · {totalBerita - beritaPublished} draf
            </span>
            <Link
              href="/admin/berita"
              className="font-semibold text-emerald-800 hover:text-emerald-900 inline-flex items-center gap-0.5"
            >
              Kelola <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Metric 4: Jejak Karya */}
        <div className="relative flex flex-col justify-between rounded-xl border border-slate-200/90 bg-white p-5 shadow-2xs transition-all hover:border-slate-300">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Jejak Karya Siswa</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-900">
                <AppWindow className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {totalKarya}
              </span>
              <span className="text-xs text-slate-500 font-medium">portofolio</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              {karyaPublished} tayang di web
            </span>
            <Link
              href="/admin/jejak-karya"
              className="font-semibold text-indigo-900 hover:text-indigo-950 inline-flex items-center gap-0.5"
            >
              Kelola <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* ── Main Work Area: Left 2 Cols (Recent Registrations) + Right 1 Col (Quick Actions & System) ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Recent PPDB Applicants */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border border-slate-200/90 bg-white shadow-2xs overflow-hidden">
            {/* Table Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Pendaftar PPDB Terbaru
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  5 calon peserta didik yang baru mendaftar di sistem.
                </p>
              </div>

              <Link
                href="/admin/data-ppdb"
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-900 hover:text-blue-950 hover:underline"
              >
                <span>Lihat Semua ({totalPendaftar})</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Table Content */}
            {recentPendaftar.length === 0 ? (
              <div className="p-8 text-center">
                <Users className="mx-auto h-8 w-8 text-slate-300" />
                <p className="mt-2 text-xs font-semibold text-slate-700">Belum Ada Pendaftar Baru</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Data calon santri baru akan muncul di sini setelah formulir PPDB diisi.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/80 text-[11px] font-semibold text-slate-500 border-b border-slate-100 uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3 sm:px-5">Calon Santri</th>
                      <th className="px-4 py-3 hidden md:table-cell">Sekolah Asal</th>
                      <th className="px-4 py-3">Waktu Daftar</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentPendaftar.map((p) => {
                      const nama = p.biodata?.namaLengkap || p.user.name || "Pendaftar Baru";
                      const nisn = p.biodata?.nisn || "-";
                      const sekolah = p.sekolahAsal?.namaSekolahAsal || "Belum diisi";
                      const tanggal = new Intl.DateTimeFormat("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      }).format(p.createdAt);

                      const isVerified =
                        p.status === StatusPendaftaran.VERIFIED ||
                        p.status === StatusPendaftaran.ACCEPTED;

                      return (
                        <tr
                          key={p.id}
                          className="hover:bg-slate-50/60 transition-colors"
                        >
                          <td className="px-4 py-3.5 sm:px-5">
                            <div className="font-semibold text-slate-900">{nama}</div>
                            <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                              NISN: {nisn}
                            </div>
                          </td>
                          <td className="px-4 py-3.5 hidden md:table-cell text-slate-600 truncate max-w-[180px]">
                            {sekolah}
                          </td>
                          <td className="px-4 py-3.5 text-slate-600 whitespace-nowrap">
                            {tanggal}
                          </td>
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold border ${
                                isVerified
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : "bg-amber-50 text-amber-800 border-amber-200"
                              }`}
                            >
                              {isVerified ? (
                                <>
                                  <CheckCircle2 className="h-3 w-3" /> Terverifikasi
                                </>
                              ) : (
                                <>
                                  <Clock className="h-3 w-3" /> Menunggu
                                </>
                              )}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-right whitespace-nowrap">
                            <Link
                              href={`/admin/data-ppdb/${p.id}`}
                              className="inline-flex min-h-[32px] items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 hover:text-blue-900 transition"
                            >
                              Detail
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Quick Actions & System Info */}
        <div className="space-y-4">
          {/* Quick Actions Panel */}
          <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-2xs space-y-3.5">
            <h2 className="text-sm font-bold text-slate-900">
              Menu
            </h2>

            <div className="space-y-2">
              <Link
                href="/admin/data-ppdb"
                className="group flex items-center justify-between rounded-lg border border-slate-200/80 bg-slate-50/50 p-3 text-xs font-semibold text-slate-800 transition hover:bg-slate-100 hover:border-slate-300"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-100 text-blue-900">
                    <Users className="h-4 w-4" />
                  </div>
                  <div>
                    <div>Kelola & Verifikasi PPDB</div>
                    <div className="text-[11px] font-normal text-slate-500">
                      Tinjau berkas calon santri
                    </div>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <Link
                href="/admin/berita/new"
                className="group flex items-center justify-between rounded-lg border border-slate-200/80 bg-slate-50/50 p-3 text-xs font-semibold text-slate-800 transition hover:bg-slate-100 hover:border-slate-300"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-100 text-emerald-800">
                    <Plus className="h-4 w-4" />
                  </div>
                  <div>
                    <div>Tulis Berita Baru</div>
                    <div className="text-[11px] font-normal text-slate-500">
                      Rilis berita sekolah
                    </div>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <Link
                href="/admin/jejak-karya/new"
                className="group flex items-center justify-between rounded-lg border border-slate-200/80 bg-slate-50/50 p-3 text-xs font-semibold text-slate-800 transition hover:bg-slate-100 hover:border-slate-300"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-indigo-100 text-indigo-900">
                    <Plus className="h-4 w-4" />
                  </div>
                  <div>
                    <div>Tambah Jejak Karya</div>
                    <div className="text-[11px] font-normal text-slate-500">
                      Showcase project siswa Bazma
                    </div>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          {/* System Environment Summary */}
          <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-2xs space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Role
            </h2>

            <div className="space-y-2.5 text-xs text-slate-600">

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Akses Role</span>
                <span className="font-semibold text-slate-800">Super Administrator</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
