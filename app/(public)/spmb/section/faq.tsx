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
    question: "Kapan Pendaftaran Peserta Didik Baru (PPDB) dibuka?",
    answer:
      "Pendaftaran PPDB SMK TI BAZMA dibuka setiap tahun ajaran baru (sekitar bulan November - Januari). Informasi jadwal resmi dan syarat administrasi diumumkan secara berkala di portal resmi ini.",
  },
  {
    question: "Kapan Pendaftaran Peserta Didik Baru (PPDB) dibuka?",
    answer:
      "Pendaftaran PPDB dibuka secara berkala. Pastikan Anda memenuhi kriteria dan memantau update tanggal penting pada halaman utama SPMB.",
  },
  {
    question: "Kapan Pendaftaran Peserta Didik Baru (PPDB) dibuka?",
    answer:
      "Jadwal lengkap pendaftaran, seleksi berkas, tes akademik, hingga pengumuman dapat diakses melalui portal resmi penerimaan siswa baru SMK TI BAZMA.",
  },
  {
    question: "Kapan Pendaftaran Peserta Didik Baru (PPDB) dibuka?",
    answer:
      "Proses pendaftaran dilakukan secara online melalui website resmi dengan melengkapi berkas administrasi yang dipersyaratkan.",
  },
  {
    question: "Kapan Pendaftaran Peserta Didik Baru (PPDB) dibuka?",
    answer:
      "Pendaftaran bebas biaya (100% beasiswa) diperuntukkan bagi calon peserta didik yang memenuhi syarat akademik dan kriteria kurang mampu (dhuafa).",
  },
  {
    question: "Kapan Pendaftaran Peserta Didik Baru (PPDB) dibuka?",
    answer:
      "Untuk informasi lebih lanjut mengenai teknis pendaftaran, Anda dapat menghubungi panitia PPDB melalui kontak resmi yang tertera pada website.",
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
          className="group flex w-full items-center justify-between gap-4 py-4 sm:py-[18px] lg:py-5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#37497A] focus-visible:ring-offset-2 rounded-sm cursor-pointer"
        >
          <span className="text-[15px] sm:text-base lg:text-lg leading-snug lg:leading-7 font-normal text-[#222222] transition-colors group-hover:text-black">
            {question}
          </span>
          <ChevronDown
            className={`h-4 w-4 lg:h-5 lg:w-5 shrink-0 text-slate-500 transition-transform duration-300 group-hover:text-slate-700 ${
              open ? "rotate-180 text-slate-700" : ""
            }`}
            aria-hidden="true"
          />
        </button>
      </h3>

      <div
        id={`${id}-panel`}
        role="region"
        aria-labelledby={`${id}-button`}
        className={`grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <p className="pb-5 pr-8 text-sm lg:text-base leading-relaxed text-slate-500">
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function FaqSection({
  title = "Persyaratan Pendaftar",
  subtitle = "Pertanyaan yang sering diajukan",
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
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true }}
          className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between lg:gap-16"
        >
          {/* Sisi Kiri: Judul & Subjudul */}
          <div className="lg:w-5/12 lg:max-w-md lg:pt-1">
            <h2
              id="faq-title"
              className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#37497A]"
            >
              {title}
            </h2>
            <p className="mt-1.5 text-sm sm:text-base font-normal text-[#7A7A7A]">
              {subtitle}
            </p>
          </div>

          {/* Sisi Kanan: Daftar Accordion (tanpa garis atas, sesuai desain) */}
          <div className="w-full lg:w-[40%] lg:max-w-3xl">
            {items.map((item, index) => (
              <FaqAccordionItem
                key={index}
                id={`faq-item-${index}`}
                question={item.question}
                answer={item.answer}
                open={openIndex === index}
                onToggle={() =>
                  setOpenIndex((prev) => (prev === index ? null : index))
                }
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}