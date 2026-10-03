"use client";

import { useId, useRef, useState, useEffect } from "react";
import {
  AnimatePresence,
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
  type MotionValue,
} from "framer-motion";
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
// Rentang scroll untuk tiap item: muncul bertahap dan tetap aktif
const STEP_RANGES = [
  { range: [0.0, 0.2, 1.0], opacity: [0.2, 1, 1], y: [36, 0, 0] },
  { range: [0.25, 0.5, 1.0], opacity: [0.2, 1, 1], y: [36, 0, 0] },
  { range: [0.55, 0.8, 1.0], opacity: [0.2, 1, 1], y: [36, 0, 0] },
];

/* -------------------------------------------------------------------------- */
/*  Row Sub-Component with Scroll Progress Animation                          */
/* -------------------------------------------------------------------------- */

function PreparationRow({
  item,
  index,
  isUnlocked,
  scrollYProgress,
  isOpen,
  onToggle,
}: {
  item: PreparationItem;
  index: number;
  isUnlocked: boolean;
  scrollYProgress: MotionValue<number>;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const panelId = useId();
  const config = STEP_RANGES[index] || STEP_RANGES[0];

  const opacity = useTransform(scrollYProgress, config.range, config.opacity);
  const y = useTransform(scrollYProgress, config.range, config.y);

  return (
    <motion.div
      style={{ opacity, y }}
      className={`border-b border-[#CFCFCF] transition-all duration-300 ${isUnlocked ? "opacity-100" : "opacity-35"
        }`}
    >
      <button
        type="button"
        disabled={!isUnlocked}
        onClick={isUnlocked ? onToggle : undefined}
        aria-expanded={isUnlocked && isOpen}
        aria-controls={panelId}
        className={`group flex w-full items-start justify-between gap-4 py-5 text-left sm:py-6 lg:py-7 ${isUnlocked
            ? "cursor-pointer"
            : "cursor-not-allowed select-none pointer-events-none"
          }`}
      >
        <div className="flex min-w-0 items-start gap-4 sm:gap-6">
          <span
            className={`shrink-0 font-mono text-2xl font-semibold leading-snug sm:text-3xl transition-colors ${isUnlocked ? "text-[#37497A]" : "text-black"
              }`}
          >
            {item.number}
          </span>
          <div className="min-w-0">
            <h3
              className={`font-heading text-base font-bold uppercase tracking-wide leading-snug sm:text-lg lg:text-xl transition-colors ${isUnlocked
                  ? "text-[#222222] group-hover:text-[#132B6D]"
                  : "text-black"
                }`}
            >
              {item.title}
            </h3>
            <p
              className={`mt-1.5 text-sm leading-relaxed sm:text-base max-w-2xl transition-colors ${isUnlocked ? "text-[#7A7A7A]" : "text-black"
                }`}
            >
              {item.shortDescription}
            </p>
          </div>
        </div>

        <motion.span
          animate={{ rotate: isUnlocked && isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className={`mt-1 shrink-0 transition-colors ${isUnlocked
              ? "text-[#37497A] group-hover:text-[#132B6D]"
              : "text-black opacity-0"
            }`}
        >
          <ChevronDown className="h-5 w-5 lg:h-6 lg:w-6" aria-hidden="true" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isUnlocked && isOpen && (
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
            <div className="pb-6 pt-1 pl-10 pr-2 sm:pb-8 sm:pl-14 lg:pl-16">
              <div className="max-h-[34vh] sm:max-h-[38vh] overflow-y-auto pr-3 [scrollbar-width:thin] [scrollbar-color:rgba(19,43,109,0.18)_transparent]">
                {item.detail}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main component with Sticky Scroll-in-Place                                */
/* -------------------------------------------------------------------------- */

export default function PreparationSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [unlockedIndex, setUnlockedIndex] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Pantau progress scroll untuk membuka kunci item berikutnya
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (latest >= 0.55) {
      setUnlockedIndex(2);
    } else if (latest >= 0.25) {
      setUnlockedIndex(1);
    } else {
      setUnlockedIndex(0);
    }
  });

  // Jika di-scroll naik dan item yang terbuka terkunci lagi, tutup accordionnya
  useEffect(() => {
    if (openId) {
      const activeIdx = PREPARATION_ITEMS.findIndex((it) => it.id === openId);
      if (activeIdx > unlockedIndex) {
        setOpenId(null);
      }
    }
  }, [unlockedIndex, openId]);

  const toggle = (id: string) => {
    setOpenId((current) => (current === id ? null : id));
  };

  return (
    <section
      ref={containerRef}
      data-nav-theme="light"
      aria-labelledby="preparation-title"
      className="relative w-full h-[240vh] bg-white text-slate-900"
    >
      {/* Sticky Viewport Frame */}
      <div className="sticky top-0 flex min-h-screen w-full flex-col justify-between px-6 pt-16 pb-6 sm:px-10 sm:pt-20 sm:pb-8 lg:px-16 xl:px-24 overflow-hidden">
        <div className="mx-auto w-full max-w-[1920px] my-auto">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16 xl:gap-24 items-center">
            {/* Kolom Kiri: Teks diam & sticky di tengah vertikal dengan hierarki font jajaran guru */}
            <div className="w-full flex flex-col justify-center">
              <h2
                id="preparation-title"
                className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#132B6D] font-heading leading-tight"
              >
                Persiapan Pendaftaran
              </h2>
              <p className="mt-4 sm:mt-6 text-sm sm:text-base lg:text-lg text-slate-500 font-normal leading-relaxed max-w-xl">
                Persiapkan hal-hal yang diperlukan sebelum mengikuti seluruh
                rangkaian alur seleksi SPMB SMK TI BAZMA.
              </p>
            </div>

            {/* Kolom Kanan: Isi muncul satu persatu berjejer (tanpa border atas) */}
            <div className="w-full flex flex-col justify-center">
              {PREPARATION_ITEMS.map((item, index) => (
                <PreparationRow
                  key={item.id}
                  item={item}
                  index={index}
                  isUnlocked={index <= unlockedIndex}
                  scrollYProgress={scrollYProgress}
                  isOpen={openId === item.id}
                  onToggle={() => toggle(item.id)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Full-width Scroll Progress Bar at the Bottom */}
        <div className="mx-auto w-full max-w-[1920px] pt-4" aria-hidden="true">
          <div className="relative h-[2px] w-full bg-[#132B6D]/15 overflow-hidden">
            <motion.div
              style={{ scaleX: scrollYProgress, transformOrigin: "left" }}
              className="h-full w-full bg-[#132B6D]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}