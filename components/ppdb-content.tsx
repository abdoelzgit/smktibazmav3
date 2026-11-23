"use client";

import {
  ClipboardList,
  SlidersHorizontal,
  FileText,
  BrainCircuit,
  MessagesSquare,
  Sparkles,
  House,
  Megaphone,
  ArrowUpRight,
  CheckCircle2,
  XCircle,
  MessageCircle,
  type LucideIcon,
} from "lucide-react";

import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui/avatar";
import Link from "next/link";
/**
 * ------------------------------------------------------------------
 * Tipe data
 * ------------------------------------------------------------------
 */
export interface Siswa {
  nama: string;
  noHp?: string;
  domisili?: string;
  tanggalDaftar?: string;
  sekolahAsal?: string;
  nisn?: string;
  foto?: string | null;
  jenisKelaminIcon?: string;
}

export interface ProgressItem {
  title: string;
  tab: string;
  saved: boolean;
  verified: boolean;
}

export interface Step {
  id: number;
  label: string;
  icon: LucideIcon;
}

/**
 * ------------------------------------------------------------------
 * Data default — ganti dengan data asli (fetch dari API / server component)
 * ------------------------------------------------------------------
 */
const STEPS: Step[] = [
  { id: 1, label: "Pendaftaran", icon: ClipboardList },
  { id: 2, label: "Seleksi Berkas", icon: SlidersHorizontal },
  { id: 3, label: "Tes Akademik", icon: FileText },
  { id: 6, label: "Wawancara", icon: MessagesSquare },
  { id: 5, label: "Tes Psikotest", icon: BrainCircuit },
  { id: 5, label: "Tes Minat & Bakat", icon: Sparkles },
  { id: 5, label: "Home Visit", icon: House },
  { id: 7, label: "Pengumuman", icon: Megaphone },
];

const PROGRESS_CARDS: ProgressItem[] = [
  { title: "Data Diri", tab: "Data Diri", saved: false, verified: false },
  { title: "Riwayat", tab: "Riwayat", saved: false, verified: false },
  { title: "Data Orang Tua", tab: "Data orang Tua", saved: false, verified: false },
  { title: "Sekolah Asal", tab: "Data sekolah Asal", saved: false, verified: false },
  { title: "Dokumen", tab: "Berkas", saved: false, verified: false },
  { title: "Surat Rekomendasi", tab: "Surat Rekomendasi", saved: false, verified: false },
  { title: "Finalisasi", tab: "Finalisasi", saved: false, verified: false },
];

// Ganti dengan tautan undangan grup WhatsApp pendaftar.
const WHATSAPP_GROUP_LINK = "https://chat.whatsapp.com/Bjuf01iH0UOBqq20jwMWkf";

/**
 * ------------------------------------------------------------------
 * Kartu Biodata Siswa
 * ------------------------------------------------------------------
 */
function BiodataSiswa({ siswa }: { siswa: Siswa }) {
  const initials = siswa.nama
    .split(" ")
    .slice(0, 2)
    .map((s) => s[0])
    .join("")
    .toUpperCase();

  return (
    <section className="w-full rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
      <h2 className="text-lg font-semibold text-slate-900">Biodata Siswa</h2>

      <div className="mt-5 flex flex-col gap-6 sm:flex-row sm:items-center">
        {/* Foto */}
        <Avatar
          size="xl"
          className="h-30 w-30 bg-slate-200 text-lg font-semibold text-slate-500"
        >
          {siswa.foto ? (
            <AvatarImage
              src={siswa.foto}
              alt={siswa.nama}
            />
          ) : (
            <AvatarFallback className="bg-slate-200 text-lg font-semibold text-slate-500">
              {initials}
            </AvatarFallback>
          )}
        </Avatar>

        {/* Detail */}
        <div className="grid flex-1 grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-4">
          <Field label="Nama lengkap" value={siswa.nama} strong />
          <Field label="No. HP" value={siswa.noHp} />
          <Field label="Domisili" value={siswa.domisili} />
          <Field label="Tanggal Pendaftaran" value={siswa.tanggalDaftar} />
          <Field label="Sekolah Asal" value={siswa.sekolahAsal} />
          <Field label="NISN" value={siswa.nisn} />
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  value,
  strong,
}: {
  label: string;
  value?: string;
  strong?: boolean;
}) {
  return (
    <div>
      <p className="text-xs text-slate-400">{label}</p>
      <p
        className={
          strong
            ? "mt-1 text-sm font-semibold text-slate-900"
            : "mt-1 text-sm text-slate-700"
        }
      >
        {value || "-"}
      </p>
    </div>
  );
}

/**
 * ------------------------------------------------------------------
 * Kartu Progress Pendaftaran
 * ------------------------------------------------------------------
 */
function ProgressPendaftaran({ items }: { items: ProgressItem[] }) {
  return (
    <section>
      <h2 className="mb-4 text-lg font-semibold text-slate-900">Progress Pendaftaran</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((item, i) => (
          <Link
            key={`${item.title}-${i}`}
            href={`/spmb/form?tab=${encodeURIComponent(item.tab)}`}
            className="group flex min-h-32 flex-col items-start justify-between gap-4 rounded-2xl bg-white p-5 text-left shadow-sm ring-1 ring-slate-100 transition hover:ring-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#132b6d]"
          >
            <div className="flex w-full items-center justify-between">
              <span className="text-sm font-semibold text-slate-900">
                {item.title}
              </span>
              <ArrowUpRight className="h-4 w-4 text-slate-400 transition group-hover:text-slate-700" />
            </div>

            {item.verified ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Tersimpan &amp; lengkap
              </span>
            ) : (
              <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${item.saved ? "text-amber-700" : "text-rose-500"}`}>
                {item.saved ? <XCircle className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                {item.saved ? "Belum lengkap" : "Belum disimpan"}
              </span>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}

/**
 * ------------------------------------------------------------------
 * Alur Pendaftaran (stepper)
 * ------------------------------------------------------------------
 */
function AlurPendaftaran({
  steps,
  currentStep,
}: {
  steps: Step[];
  currentStep: number;
}) {
  return (
    <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
      {/* Header navy */}
      <div className="flex flex-col items-start gap-3 bg-[#0F1E4D] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <h2 className="text-base font-semibold text-white">Alur Pendaftaran</h2>
        
      </div>

      {/* Mobile timeline */}
      <div className="px-4 py-5 sm:px-6 lg:hidden">
        <ol className="space-y-4">
          {steps.map((step, index) => {
            const isDone = step.id < currentStep;
            const isActive = step.id === currentStep;
            const isLast = index === steps.length - 1;
            const Icon = step.icon;

            return (
              <li key={step.id} className="relative flex min-h-12 items-start gap-3">
                {!isLast && (
                  <span
                    aria-hidden="true"
                    className={`absolute left-5 top-10 -bottom-4 w-px ${
                      isDone ? "bg-[#0F1E4D]" : "bg-slate-200"
                    }`}
                  />
                )}
                <span
                  className={`relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full ${
                    isActive || isDone
                      ? "bg-[#0F1E4D] text-white"
                      : "bg-slate-100 text-slate-400"
                  } ${isActive ? "ring-4 ring-[#0F1E4D]/10" : ""}`}
                >
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1 pt-1.5">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                    Tahap {String(step.id).padStart(2, "0")}
                  </p>
                  <p className={`mt-0.5 break-words text-sm ${
                    isActive ? "font-semibold text-slate-900" : isDone ? "font-medium text-slate-700" : "text-slate-500"
                  }`}>
                    {step.label}
                  </p>
                </div>
                {isActive && (
                  <span className="mt-2 shrink-0 rounded-full bg-[#0F1E4D]/5 px-2 py-1 text-[10px] font-semibold text-[#0F1E4D]">
                    Saat ini
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </div>

      {/* Desktop stepper */}
      <div className="hidden px-6 py-8 lg:block">
        <ol className="flex items-start justify-between">
          {steps.map((step, index) => {
            const isDone = step.id < currentStep;
            const isActive = step.id === currentStep;
            const isLast = index === steps.length - 1;
            const Icon = step.icon;

            return (
              <li
                key={step.id}
                className="relative flex flex-1 flex-col items-center text-center"
              >
                {/* Garis penghubung */}
                {!isLast && (
                  <div
                    className={`absolute left-1/2 top-5 h-px w-full ${
                      isDone ? "bg-[#0F1E4D]" : "bg-slate-200"
                    }`}
                  />
                )}

                {/* Nomor bulat */}
                <span
                  className={`relative z-10 flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold text-white ${
                    isDone || isActive ? "bg-emerald-500" : "bg-[#0F1E4D]"
                  }`}
                >
                  {step.id}
                </span>

                {/* Ikon */}
                <div
                  className={`relative z-10 mt-3 flex h-12 w-12 items-center justify-center rounded-full ${
                    isActive || isDone
                      ? "bg-[#0F1E4D] text-white"
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>

                {/* Label */}
                <span
                  className={`mt-3 text-xs ${
                    isActive ? "font-semibold text-slate-900" : "text-slate-400"
                  }`}
                >
                  {step.label}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}


//  Props komponen utama
export interface DashboardContentProps {
  siswa?: Siswa;
  progressItems?: ProgressItem[];
  currentStep?: number;
}

const DEFAULT_SISWA: Siswa = {
  nama: "muhammad taqy abdurahman khirom",
  noHp: "-",
  domisili: "-",
  tanggalDaftar: "18 Agustus 2026",
  sekolahAsal: "-",
  nisn: "-",
  foto: null,
};

export default function DashboardContent({
  siswa = DEFAULT_SISWA,
  progressItems = PROGRESS_CARDS,
  currentStep = 1,
}: DashboardContentProps) {
  return (
    <div className="flex min-w-0 w-full flex-1 flex-col gap-6">
      <BiodataSiswa siswa={siswa} />
      <section className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
            <MessageCircle className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-base font-semibold text-slate-900">Grup WhatsApp Pendaftar</h2>
            <p className="mt-1 text-sm text-slate-600">Bergabung ke grup WhatsApp pendaftar.</p>
          </div>
        </div>
        <a
          href={WHATSAPP_GROUP_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2"
        >
          <MessageCircle className="size-4" aria-hidden="true" />
          Gabung Grup WhatsApp
        </a>
      </section>
      <ProgressPendaftaran items={progressItems} />
      <AlurPendaftaran steps={STEPS} currentStep={currentStep} />
    </div>
  );
}
