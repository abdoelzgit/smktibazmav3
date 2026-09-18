"use client";

import {
  ClipboardList,
  SlidersHorizontal,
  FileText,
  BrainCircuit,
  Mic,
  Megaphone,
  ArrowUpRight,
  CheckCircle2,
  XCircle,
  type LucideIcon,
} from "lucide-react";

import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui/avatar";
/**
 * ------------------------------------------------------------------
 * Tipe data
 * ------------------------------------------------------------------
 */
export interface Siswa {
  nama: string;
  usia?: string;
  domisili?: string;
  tanggalDaftar?: string;
  sekolahAsal?: string;
  nisn?: string;
  foto?: string | null;
  jenisKelaminIcon?: string;
}

export interface ProgressItem {
  title: string;
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
  { id: 4, label: "Tes Psikotest", icon: BrainCircuit },
  { id: 5, label: "Wawancara", icon: Mic },
  { id: 6, label: "Pengumuman", icon: Megaphone },
];

const PROGRESS_CARDS: ProgressItem[] = [
  { title: "Biodata Diri", verified: true },
  { title: "Unggah Berkas", verified: false },
  { title: "Tes Seleksi", verified: false },
  { title: "Biodata Diri", verified: true },
];

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
    <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
      <h2 className="text-lg font-semibold text-slate-900">Biodata Siswa</h2>

      <div className="mt-5 flex flex-col gap-6 sm:flex-row sm:items-center">
        {/* Foto */}
        <Avatar
          size="lg"
          className="h-16 w-16 bg-slate-200 text-lg font-semibold text-slate-500"
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
          <Field label="Usia" value={siswa.usia} />
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
      <h2 className="mb-4 text-lg font-semibold text-slate-900">
        Progress Pendaftaran
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item, i) => (
          <button
            key={`${item.title}-${i}`}
            type="button"
            className="group flex flex-col items-start gap-4 rounded-2xl bg-white p-5 text-left shadow-sm ring-1 ring-slate-100 transition hover:ring-slate-300"
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
                Sudah diverifikasi
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-rose-500">
                <XCircle className="h-3.5 w-3.5" />
                Belum diverifikasi
              </span>
            )}
          </button>
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
      <div className="flex items-center justify-between bg-[#0F1E4D] px-6 py-4">
        <h2 className="text-base font-semibold text-white">Alur Pendaftaran</h2>
        <button
          type="button"
          className="rounded-full border border-white/30 px-4 py-1.5 text-xs font-medium text-white transition hover:bg-white/10"
        >
          Tata Cara Pendaftaran
        </button>
      </div>

      {/* Stepper */}
      <div className="px-6 py-8">
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
  usia: "-",
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
    <div className="flex flex-col gap-6">
      <BiodataSiswa siswa={siswa} />
      <ProgressPendaftaran items={progressItems} />
      <AlurPendaftaran steps={STEPS} currentStep={currentStep} />
    </div>
  );
}