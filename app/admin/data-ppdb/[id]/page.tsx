"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  User,
  Users,
  GraduationCap,
  FileText,
  FolderArchive,
  ExternalLink,
  Building2,
  MapPin,
  Phone,
  Mail,
  AlertCircle,
  Loader2,
} from "lucide-react";
import StatusBadge from "@/components/status-badge";
import { getPendaftaranDetailAction } from "@/app/actions/ppdb-admin";

interface DetailPageProps {
  params: Promise<{ id: string }>;
}

type TabId = "biodata" | "orangTua" | "sekolah" | "rekomendasi" | "berkas";

export default function DetailPendaftaranPage({ params }: DetailPageProps) {
  const { id } = use(params);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("biodata");

  useEffect(() => {
    async function loadDetail() {
      setLoading(true);
      const res = await getPendaftaranDetailAction(id);
      if (res.success && res.data) {
        setData(res.data);
      } else {
        setError(res.error || "Gagal memuat detail pendaftaran");
      }
      setLoading(false);
    }
    loadDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
          <Loader2 className="h-5 w-5 animate-spin text-blue-900" />
          <span>Memuat detail data pendaftar...</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 md:p-8">
        <div className="max-w-4xl mx-auto rounded-xl border border-red-200 bg-red-50 p-6 text-red-800">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-6 w-6 text-red-600 shrink-0" />
            <div>
              <h2 className="text-base font-bold">Terjadi Kesalahan</h2>
              <p className="text-xs mt-1">{error || "Data pendaftaran tidak ditemukan."}</p>
            </div>
          </div>
          <div className="mt-4">
            <Link
              href="/admin/data-ppdb"
              className="inline-flex items-center gap-2 rounded-lg bg-white border border-red-200 px-4 py-2 text-xs font-semibold text-red-700 shadow-sm hover:bg-red-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Daftar PPDB
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { biodata, orangTua, sekolahAsal, rekomendasi, berkas, user, statusLabel, isAllTabsComplete } = data;

  const tabs: { id: TabId; label: string; icon: React.ElementType; complete: boolean }[] = [
    { id: "biodata", label: "Data Diri", icon: User, complete: Boolean(biodata) },
    { id: "orangTua", label: "Data Orang Tua", icon: Users, complete: Boolean(orangTua) },
    { id: "sekolah", label: "Sekolah Asal", icon: GraduationCap, complete: Boolean(sekolahAsal) },
    { id: "rekomendasi", label: "Surat Rekomendasi", icon: FileText, complete: Boolean(rekomendasi) },
    { id: "berkas", label: "Berkas Lampiran", icon: FolderArchive, complete: Boolean(berkas) },
  ];

  const berkasItems = berkas
    ? [
        { label: "Kartu Keluarga (KK)", url: berkas.kkUrl },
        { label: "KTP Orang Tua", url: berkas.ktpOrangTuaUrl },
        { label: "Akte Kelahiran", url: berkas.akteUrl },
        { label: "Ijazah / SKL", url: berkas.ijazahUrl },
        { label: "Rapor Sekolah", url: berkas.raporUrl },
        { label: "KIP / SKTM", url: berkas.kipUrl },
        { label: "Sertifikat Prestasi", url: berkas.prestasiUrl },
        { label: "Foto Tampak Depan Rumah", url: berkas.tampakDepanRumahUrl },
        { label: "Foto Tampak Samping Rumah", url: berkas.tampakSampingRumahUrl },
        { label: "Foto Kamar Tidur", url: berkas.kamarTidurUrl },
        { label: "Foto Ruang Tamu", url: berkas.ruangTamuUrl },
      ]
    : [];

  return (
    <div className="min-h-screen bg-slate-50/60 p-4 sm:p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/data-ppdb"
            className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-100 transition"
            title="Kembali"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                {biodata?.namaLengkap || user?.name || "Detail Pendaftar"}
              </h1>
              <StatusBadge status={statusLabel} />
            </div>
            <p className="mt-0.5 text-xs text-slate-500">
              No. Pendaftaran:{" "}
              <span className="font-mono font-semibold text-slate-700">
                {data.nomorPendaftaran || data.id.slice(-6).toUpperCase()}
              </span>
            </p>
          </div>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 self-start px-3 py-1.5 rounded-lg text-xs font-semibold border ${
            isAllTabsComplete
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-amber-50 text-amber-800 border-amber-200"
          }`}
        >
          {isAllTabsComplete ? (
            <><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Semua Tab Lengkap (5/5)</>
          ) : (
            <><Clock className="h-4 w-4 text-amber-600" /> Formulir Belum Lengkap</>
          )}
        </span>
      </div>

      {/* Body */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <aside className="lg:col-span-1 space-y-4">
          {/* Profile card */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm text-center space-y-4">
            <div className="mx-auto h-28 w-28 overflow-hidden rounded-full border-4 border-slate-100 bg-blue-50 flex items-center justify-center">
              {biodata?.fotoFormalUrl ? (
                <img src={biodata.fotoFormalUrl} alt={biodata.namaLengkap} className="h-full w-full object-cover" />
              ) : (
                <User className="h-14 w-14 text-blue-900/30" />
              )}
            </div>

            <div>
              <h3 className="font-bold text-slate-900">{biodata?.namaLengkap || user?.name || "Tanpa Nama"}</h3>
              <p className="text-xs text-slate-500 truncate">{user?.email || biodata?.email || "-"}</p>
            </div>

            <div className="border-t border-slate-100 pt-3 text-xs text-left space-y-2.5">
              <div className="flex items-start gap-2 text-slate-600">
                <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span className="break-all">{biodata?.email || user?.email || "-"}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span>{biodata?.noHpWhatsapp || orangTua?.noHpOi || "-"}</span>
              </div>
              <div className="flex items-start gap-2 text-slate-600">
                <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span>{sekolahAsal?.namaSekolahAsal || "Sekolah belum diisi"}</span>
              </div>
              <div className="flex items-start gap-2 text-slate-600">
                <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span>{biodata?.alamatLengkap || "-"}</span>
              </div>
            </div>
          </div>

          {/* Progress tracker */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm space-y-2">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Kelengkapan Tab</h4>
            <div className="space-y-1.5 pt-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between text-xs py-1.5 px-2.5 rounded-md border transition ${
                    activeTab === tab.id
                      ? "border-blue-200 bg-blue-50"
                      : "border-slate-100 bg-slate-50 hover:bg-slate-100"
                  }`}
                >
                  <span className="font-medium text-slate-700">{tab.label}</span>
                  {tab.complete ? (
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-[11px]">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Terisi
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-amber-700 font-medium text-[11px]">
                      <Clock className="h-3.5 w-3.5" /> Belum
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="lg:col-span-3 space-y-4">
          {/* Tab buttons */}
          <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-bold transition ${
                    active
                      ? "bg-blue-900 text-white shadow-sm"
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* ── Tab: Data Diri ── */}
          {activeTab === "biodata" && (
            <section className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-5">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <User className="h-4 w-4 text-blue-900" /> Biodata Siswa
              </h3>
              {biodata ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {[
                    { label: "Nama Lengkap", value: biodata.namaLengkap },
                    { label: "Email", value: biodata.email || user?.email },
                    { label: "NISN", value: biodata.nisn },
                    { label: "NIK", value: biodata.nik },
                    {
                      label: "Tempat, Tanggal Lahir",
                      value: `${biodata.tempatLahir || "-"}, ${
                        biodata.tanggalLahir
                          ? new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(new Date(biodata.tanggalLahir))
                          : "-"
                      }`,
                    },
                    { label: "No. HP / WhatsApp", value: biodata.noHpWhatsapp },
                    { label: "Kewarganegaraan", value: biodata.kewarganegaraan || "Indonesia" },
                    {
                      label: "Status Keluarga / Anak Ke",
                      value: `${biodata.statusKeluarga || "-"} — anak ke-${biodata.anakKe || "?"} dari ${biodata.jumlahSaudara || "?"} saudara`,
                    },
                    { label: "Tinggal Bersama", value: biodata.tinggalBersama },
                    {
                      label: "Tinggi / Berat Badan",
                      value: `${biodata.tinggiBadan ? `${biodata.tinggiBadan} cm` : "-"} / ${biodata.beratBadan ? `${biodata.beratBadan} kg` : "-"}`,
                    },
                    { label: "Riwayat Penyakit", value: biodata.riwayatPenyakit || "Tidak ada" },
                    {
                      label: "Catatan Kesehatan",
                      value: `Merokok: ${biodata.isMerokok ? "Ya" : "Tidak"} | Buta Warna: ${biodata.isButaWarna ? "Ya" : "Tidak"} | Penyakit Menular: ${biodata.hasPenyakitMenular ? "Ya" : "Tidak"}`,
                    },
                    { label: "Bahasa Asing", value: biodata.bahasaAsing || "-" },
                    { label: "Prestasi", value: biodata.riwayatPrestasi || "-" },
                    { label: "Organisasi", value: biodata.riwayatOrganisasi || "-" },
                    { label: "Media Sosial", value: biodata.mediaSosial || "-" },
                  ].map((item, i) => (
                    <div key={i} className={`rounded-lg bg-slate-50 p-3 border border-slate-100 ${i >= 14 ? "" : ""}`}>
                      <span className="text-slate-400 font-medium block mb-0.5">{item.label}</span>
                      <span className="font-semibold text-slate-800">{item.value || "-"}</span>
                    </div>
                  ))}
                  <div className="rounded-lg bg-slate-50 p-3 border border-slate-100 sm:col-span-2">
                    <span className="text-slate-400 font-medium block mb-0.5">Alamat Lengkap</span>
                    <span className="font-semibold text-slate-800">{biodata.alamatLengkap || "-"}</span>
                  </div>
                </div>
              ) : (
                <p className="py-8 text-center text-slate-400 text-xs">Data Diri belum diisi oleh pendaftar.</p>
              )}
            </section>
          )}

          {/* ── Tab: Data Orang Tua ── */}
          {activeTab === "orangTua" && (
            <section className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-5">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Users className="h-4 w-4 text-blue-900" /> Data Orang Tua / Wali
              </h3>
              {orangTua ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {[
                    { label: "Nama Ayah", value: orangTua.namaAyah },
                    { label: "Pekerjaan Ayah", value: orangTua.pekerjaanAyah },
                    { label: "Nama Ibu", value: orangTua.namaIbu },
                    { label: "Pekerjaan Ibu", value: orangTua.pekerjaanIbu },
                    { label: "No. HP Orang Tua", value: orangTua.noHpOi },
                    { label: "Keadaan Orang Tua", value: orangTua.keadaanOrangTua },
                    { label: "Penghasilan Orang Tua", value: orangTua.penghasilanOrangTua },
                    { label: "Alamat Domisili Ayah", value: orangTua.alamatDomisiliAyah },
                  ].map((item, i) => (
                    <div key={i} className="rounded-lg bg-slate-50 p-3 border border-slate-100">
                      <span className="text-slate-400 font-medium block mb-0.5">{item.label}</span>
                      <span className="font-semibold text-slate-800">{item.value || "-"}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-8 text-center text-slate-400 text-xs">Data Orang Tua belum diisi oleh pendaftar.</p>
              )}
            </section>
          )}

          {/* ── Tab: Sekolah Asal ── */}
          {activeTab === "sekolah" && (
            <section className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-5">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <GraduationCap className="h-4 w-4 text-blue-900" /> Data Sekolah Asal
              </h3>
              {sekolahAsal ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {[
                    { label: "Nama Sekolah", value: sekolahAsal.namaSekolahAsal, wide: true },
                    { label: "NPSN", value: sekolahAsal.npsnSekolah },
                    { label: "Status Sekolah", value: sekolahAsal.statusSekolah },
                    { label: "Tahun Lulus", value: sekolahAsal.tahunLulus },
                    { label: "Alamat Sekolah", value: sekolahAsal.alamatSekolah, wide: true },
                  ].map((item, i) => (
                    <div key={i} className={`rounded-lg bg-slate-50 p-3 border border-slate-100 ${item.wide ? "sm:col-span-2" : ""}`}>
                      <span className="text-slate-400 font-medium block mb-0.5">{item.label}</span>
                      <span className="font-semibold text-slate-800">{item.value || "-"}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-8 text-center text-slate-400 text-xs">Data Sekolah Asal belum diisi oleh pendaftar.</p>
              )}
            </section>
          )}

          {/* ── Tab: Surat Rekomendasi ── */}
          {activeTab === "rekomendasi" && (
            <section className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-5">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <FileText className="h-4 w-4 text-blue-900" /> Surat Rekomendasi
              </h3>
              {rekomendasi ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="rounded-lg bg-slate-50 p-3 border border-slate-100">
                    <span className="text-slate-400 font-medium block mb-0.5">Nama Pemberi Rekomendasi</span>
                    <span className="font-semibold text-slate-800">{rekomendasi.namaPemberiRekomendasi || "-"}</span>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3 border border-slate-100">
                    <span className="text-slate-400 font-medium block mb-0.5">Jabatan / Instansi</span>
                    <span className="font-semibold text-slate-800">{rekomendasi.jabatanInstansi || "-"}</span>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3 border border-slate-100">
                    <span className="text-slate-400 font-medium block mb-0.5">No. HP Pemberi Rekomendasi</span>
                    <span className="font-semibold text-slate-800">{rekomendasi.noHpPemberiRekomendasi || "-"}</span>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3 border border-slate-100">
                    <span className="text-slate-400 font-medium block mb-0.5">Berkas Surat</span>
                    {rekomendasi.suratRekomendasiUrl ? (
                      <a
                        href={rekomendasi.suratRekomendasiUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 font-bold text-blue-900 hover:underline"
                      >
                        <ExternalLink className="h-3.5 w-3.5" /> Buka Berkas
                      </a>
                    ) : (
                      <span className="text-slate-400">Tidak ada lampiran</span>
                    )}
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3 border border-slate-100 sm:col-span-2">
                    <span className="text-slate-400 font-medium block mb-0.5">Catatan Rekomendasi</span>
                    <span className="font-semibold text-slate-800">{rekomendasi.catatanRekomendasi || "-"}</span>
                  </div>
                </div>
              ) : (
                <p className="py-8 text-center text-slate-400 text-xs">Surat Rekomendasi belum diisi oleh pendaftar.</p>
              )}
            </section>
          )}

          {/* ── Tab: Berkas Lampiran ── */}
          {activeTab === "berkas" && (
            <section className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-5">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <FolderArchive className="h-4 w-4 text-blue-900" /> Berkas & Dokumen Lampiran
              </h3>
              {berkas ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                  {berkasItems.map((file, i) => (
                    <div key={i} className="rounded-lg border border-slate-200 bg-slate-50 p-3.5 space-y-2">
                      <span className="font-bold text-slate-800 block leading-tight">{file.label}</span>
                      {file.url ? (
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-[11px]">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Terunggah
                          </span>
                          <a
                            href={file.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 rounded bg-blue-900 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-blue-950 transition"
                          >
                            <ExternalLink className="h-3 w-3" /> Buka
                          </a>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-medium">Belum diunggah</span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-8 text-center text-slate-400 text-xs">Belum ada berkas yang diunggah oleh pendaftar.</p>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
