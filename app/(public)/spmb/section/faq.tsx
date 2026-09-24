"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion } from "framer-motion";

export type FaqItem = {
  question: string;
  answer: string;
};

export type FaqSectionProps = {
  title?: string;
  subtitle?: string;
  items?: FaqItem[];
};

const DEFAULT_FAQS: FaqItem[] = [
  {
    question: "Siapa saja yang dapat mendaftar SPMB SMK TI BAZMA?",
    answer:
      "Pendaftar merupakan laki-laki muslim yang mampu membaca Al-Qur'an dengan baik, berasal dari keluarga dhuafa, lulus SMP/MTs/sederajat pada TP 2026 atau 2025, serta memenuhi persyaratan lainnya yang telah ditentukan.",
  },
  {
    question: "Apa saja persyaratan untuk mendaftar?",
    answer:
      "Persyaratan meliputi kemampuan membaca Al-Qur'an, berasal dari keluarga dhuafa yang dibuktikan dengan SKTM dari masjid setempat, lulus SMP/MTs/sederajat pada TP 2026 atau 2025, usia maksimal 17 tahun pada 30 Juni 2026, sehat jasmani dan rohani, berkelakuan baik, mendapat persetujuan orang tua/wali untuk tinggal di asrama selama masa pendidikan, serta memiliki minat tinggi terhadap dunia digital dan teknologi informasi.",
  },
  {
    question: "Dokumen apa saja yang perlu disiapkan?",
    answer:
      "Dokumen pendukung yang diperlukan meliputi rapor semester 3–5, Kartu Keluarga, BPJS atau KIS, KIP, SKTM dari DKM setempat, surat rekomendasi dari kepala SMP/wali kelas/guru, bukti pembayaran listrik, foto berwarna rumah yang ditempati, serta video perkenalan sesuai ketentuan.",
  },
  {
    question: "Bagaimana ketentuan video perkenalan?",
    answer:
      "Pendaftar harus mengikuti akun resmi Instagram @smktibazma, menggunakan akun Instagram milik sendiri dan tidak mem-private akun sampai akhir masa pendaftaran, menggunakan caption yang telah ditentukan, serta mention 3 teman dan @smktibazma.",
  },
  {
    question: "Apa saja yang harus dibahas dalam video?",
    answer:
      "Video berisi perkenalan diri, keunggulan diri dan manfaatnya, motivasi mengikuti SPMB SMK TI BAZMA, tujuan hidup atau cita-cita, bagaimana bersekolah di SMK TI BAZMA dapat membantu mencapai tujuan tersebut, perkembangan yang ingin dicapai di SMK TI BAZMA, peran yang ingin dimiliki di dunia teknologi, serta hal bermanfaat yang ingin diikhtiarkan jika diterima.",
  },
  {
    question: "Apakah boleh menggunakan tools AI untuk membuat video?",
    answer:
      "Tidak. Ketentuan SPMB menyatakan bahwa pendaftar dilarang menggunakan tools AI dalam bentuk apapun untuk video.",
  },
  {
    question: "Di mana saya bisa mendapatkan template dokumen?",
    answer:
      "Template surat rekomendasi, SKTM, dan ketentuan video dapat diunduh melalui link yang telah disediakan pada informasi resmi SPMB.",
  },
  {
    question: "Apa yang harus dilakukan setelah membuat akun pendaftaran?",
    answer:
      "Pendaftar perlu melengkapi berkas persyaratan dan mengikuti seluruh rangkaian alur seleksi sesuai ketentuan SPMB.",
  },
];
function FaqAccordionItem({
  id,
  question,
  answer,
  open,
  onToggle,
}: {
  id: string;
  question: string;
  answer: string;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-[#CFCFCF]">
      <h3>
        <button
          type="button"
          id={`${id}-button`}
          aria-expanded={open}
          aria-controls={`${id}-panel`}
          onClick={onToggle}
          className="group flex w-full items-center justify-between gap-4 py-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#37497A] focus-visible:ring-offset-2 rounded-sm cursor-pointer sm:py-[18px] lg:py-5"
        >
          <span className="text-[15px] font-normal leading-snug text-[#222222] transition-colors group-hover:text-black sm:text-base lg:text-lg lg:leading-7">
            {question}
          </span>

          <ChevronDown
            className={`h-4 w-4 shrink-0 text-slate-500 transition-transform duration-300 group-hover:text-slate-700 lg:h-5 lg:w-5 ${open ? "rotate-180 text-slate-700" : ""
              }`}
            aria-hidden="true"
          />
        </button>
      </h3>

      <div
        id={`${id}-panel`}
        role="region"
        aria-labelledby={`${id}-button`}
        className={`grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          }`}
      >
        <div className="overflow-hidden">
          <p className="pb-5 pr-8 text-sm leading-relaxed text-slate-500 lg:text-base">
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function FaqSection({
  title = "Frequently Asked Questions",
  subtitle = "Pertanyaan seputar proses penerimaan peserta didik",
  items = DEFAULT_FAQS,
}: FaqSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section
      aria-labelledby="faq-title"
      className="w-full bg-white py-16 sm:py-20 lg:py-24"
    >
      <div className="mx-auto w-full max-w-[1920px] px-6 sm:px-10 lg:px-16 xl:px-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.6,
            ease: [0.22, 1, 0.36, 1],
          }}
          viewport={{ once: true }}
          className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between lg:gap-16"
        >
          {/* Sisi Kiri: Judul & Subjudul */}
          <div className="lg:w-5/12 lg:max-w-md lg:pt-1">
            <h2
              id="faq-title"
              className="text-2xl font-bold tracking-tight text-[#37497A] sm:text-3xl lg:text-4xl"
            >
              {title}
            </h2>

            <p className="mt-1.5 text-sm font-normal text-[#7A7A7A] sm:text-base">
              {subtitle}
            </p>
          </div>

          {/* Sisi Kanan: Daftar Accordion */}
          <div className="w-full lg:w-[40%] lg:max-w-3xl">
            {items.map((item, index) => (
              <FaqAccordionItem
                key={index}
                id={`faq-item-${index}`}
                question={item.question}
                answer={item.answer}
                open={openIndex === index}
                onToggle={() =>
                  setOpenIndex((prev) =>
                    prev === index ? null : index
                  )
                }
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}