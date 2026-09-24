"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Types & data                                                              */
/* -------------------------------------------------------------------------- */

type PreparationItem = {
  id: string;
  number: string;
  title: string;
  shortDescription: string;
  detail: React.ReactNode;
};

const TEMPLATE_LINK = "https://bit.ly/spmbsmktibazma26";

const PREPARATION_ITEMS: PreparationItem[] = [
  {
    id: "persyaratan",
    number: "01",
    title: "Persyaratan Pendaftar",
    shortDescription:
      "Pastikan kamu memenuhi seluruh persyaratan untuk mengikuti SPMB.",
    detail: (
      <ul className="space-y-3">
        {[
          "Laki-laki muslim dan mampu membaca Al-Qur'an dengan baik.",
          "Berasal dari keluarga dhuafa (dibuktikan dengan SKTM dari Masjid setempat).",
          "Lulus jenjang SMP/MTs/Sederajat pada TP 2026 atau 2025.",
          "Usia maksimal 17 tahun pada tanggal 30 Juni 2026.",
          "Sehat jasmani dan rohani (tidak buta warna, tidak merokok dan tidak mempunyai penyakit menular).",
          "Berkelakuan baik, tidak memiliki catatan kejahatan, dan tidak pernah terlibat dalam tindak pidana.",
          "Mendapat persetujuan Orangtua/Wali untuk tinggal di asrama selama masa pendidikan (4 tahun).",
          "Memiliki minat yang tinggi terhadap dunia digital dan teknologi informasi.",
          "Membuat akun pendaftaran, melengkapi berkas persyaratan dan mengikuti seluruh rangkaian alur seleksi.",
        ].map((text) => (
          <li key={text} className="flex gap-3 text-sm leading-relaxed text-[#4A4A4A] sm:text-base">
            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#37497A]" aria-hidden="true" />
            <span>{text}</span>
          </li>
        ))}
      </ul>
    ),
  },
  {
    id: "dokumen",
    number: "02",
    title: "Dokumen Pendukung",
    shortDescription:
      "Siapkan dokumen yang diperlukan untuk proses pendaftaran.",
    detail: (
      <div className="space-y-6">
        <ul className="space-y-3">
          {[
            "Rapor Semester 3-5",
            "Scan/foto Kartu Keluarga",
            "Scan/foto BPJS atau KIS",
            "Scan/foto KIP",
            "Surat keterangan tidak mampu (SKTM) dari DKM setempat",
            "Surat Rekomendasi dari kepala SMP/Wali kelas/Guru",
            "Bukti pembayaran listrik",
            "Foto berwarna rumah yang ditempati (tampak depan, samping, kamar tidur, ruang tamu, dapur, kamar mandi)",
            "Membuat video perkenalan sesuai ketentuan",
          ].map((text) => (
            <li key={text} className="flex gap-3 text-sm leading-relaxed text-[#4A4A4A] sm:text-base">
              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#37497A]" aria-hidden="true" />
              <span>{text}</span>
            </li>
          ))}
        </ul>

        <p className="text-sm leading-relaxed text-[#7A7A7A]">
          Template surat rekomendasi, SKTM, dan ketentuan video dapat diunduh
          di{" "}
          <a
            href={TEMPLATE_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-[#37497A] underline underline-offset-2 hover:text-[#2b3a63]"
          >
            {TEMPLATE_LINK.replace("https://", "")}
          </a>
          .
        </p>
      </div>
    ),
  },
  {
    id: "video",
    number: "03",
    title: "Video Perkenalan",
    shortDescription:
      "Ikuti ketentuan video perkenalan sesuai panduan SPMB.",
    detail: (
      <div className="space-y-8">
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-[0.15em] text-[#37497A]">
            Ketentuan
          </h4>
          <ul className="mt-3 space-y-3">
            {[
              "Follow akun resmi Instagram @smktibazma.",
              "Menggunakan akun pendaftar (tidak dapat diwakilkan oleh akun orang tua/wali) dan tidak diprivate sampai akhir masa pendaftaran.",
              "Mention 3 temanmu dan @smktibazma.",
              "Dilarang menggunakan tools AI dalam bentuk apapun.",
            ].map((text) => (
              <li key={text} className="flex gap-3 text-sm leading-relaxed text-[#4A4A4A] sm:text-base">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#37497A]" aria-hidden="true" />
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-[0.15em] text-[#37497A]">
            Caption Reels
          </h4>
          <p className="mt-3 whitespace-pre-line break-words rounded-md border border-[#CFCFCF] bg-[#FAFAFA] p-4 text-sm leading-relaxed text-[#4A4A4A]">
            {
              '"Saya sudah mendaftar SPMB SMK TI BAZMA! SMK Berasrama Bebas Biaya dengan jurusan SIJA (Sistem Informasi, Jaringan dan Aplikasi) Pendaftaran ditutup sampai 28 Desember 2025 daftar melalui spmb.smktibazma.sch.id @smktibazma #SPMBSMKTIBAZMA2026 #SMKTIBAZMA #BAZMA"'
            }
          </p>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-[0.15em] text-[#37497A]">
            Isi Konten Video
          </h4>
          <ol className="mt-3 space-y-3">
            {[
              "Perkenalan diri, ceritakan tentang keunggulan dirimu dan hal bermanfaat dari keunggulan tersebut.",
              "Ceritakan motivasimu dan alasanmu mengikuti SPMB SMK TI BAZMA.",
              "Ceritakan tentang tujuan hidup atau cita-citamu dan bagaimana bersekolah di SMK TI BAZMA dapat membantumu meraih hal tersebut.",
              "Bagaimana saya akan berkembang di SMK TI BAZMA dan peran yang ingin saya miliki di dunia Teknologi.",
              "Sebutkan hal bermanfaat yang akan kamu ikhtiarkan jika nantinya diterima sebagai siswa SMK TI BAZMA.",
            ].map((text, idx) => (
              <li key={text} className="flex gap-3 text-sm leading-relaxed text-[#4A4A4A] sm:text-base">
                <span className="shrink-0 font-semibold tabular-nums text-[#37497A]">
                  {idx + 1}.
                </span>
                <span>{text}</span>
              </li>
            ))}
          </ol>
        </div>

        <p className="text-sm leading-relaxed text-[#7A7A7A]">
          Ketentuan lengkap video dapat diunduh di{" "}
          <a
            href={TEMPLATE_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-[#37497A] underline underline-offset-2 hover:text-[#2b3a63]"
          >
            {TEMPLATE_LINK.replace("https://", "")}
          </a>
          .
        </p>
      </div>
    ),
  },
];

/* -------------------------------------------------------------------------- */
/*  Row sub-component                                                        */
/* -------------------------------------------------------------------------- */

function PreparationRow({
  item,
  isOpen,
  onToggle,
}: {
  item: PreparationItem;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const panelId = useId();

  return (
    <div className="border-b border-[#CFCFCF]">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className="flex w-full items-start justify-between gap-4 py-6 text-left transition-colors hover:bg-[#37497A]/[0.03] sm:py-8"
      >
        <div className="flex min-w-0 gap-4 sm:gap-6">
          <span className="shrink-0 text-2xl font-bold tabular-nums text-[#37497A] sm:text-3xl">
            {item.number}
          </span>
          <div className="min-w-0">
            <h3 className="text-base font-bold uppercase tracking-wide text-[#222222] sm:text-lg">
              {item.title}
            </h3>
            <p className="mt-1 max-w-xl text-sm leading-relaxed text-[#7A7A7A] sm:text-base">
              {item.shortDescription}
            </p>
          </div>
        </div>

        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="mt-1 shrink-0 text-[#37497A]"
        >
          <ChevronDown className="h-5 w-5" aria-hidden="true" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={panelId}
            role="region"
            aria-label={item.title}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pb-8 pl-0 pr-1 sm:pb-10 sm:pl-[calc(2rem+1.5rem)]">
              {item.detail}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main component                                                            */
/* -------------------------------------------------------------------------- */

export default function PreparationSection() {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggle = (id: string) => {
    setOpenId((current) => (current === id ? null : id));
  };

  return (
    <section
      aria-labelledby="preparation-title"
      className="w-full bg-white py-16 sm:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#37497A]">
          Sebelum Mendaftar
        </span>
        <h2
          id="preparation-title"
          className="mt-3 text-2xl font-bold tracking-tight text-[#222222] sm:text-3xl"
        >
          Persiapkan Pendaftaran
        </h2>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#7A7A7A] sm:text-base">
          Persiapkan hal-hal yang diperlukan sebelum mengikuti seluruh
          rangkaian SPMB.
        </p>

        <div className="mt-10 border-t border-[#CFCFCF] sm:mt-12">
          {PREPARATION_ITEMS.map((item) => (
            <PreparationRow
              key={item.id}
              item={item}
              isOpen={openId === item.id}
              onToggle={() => toggle(item.id)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}