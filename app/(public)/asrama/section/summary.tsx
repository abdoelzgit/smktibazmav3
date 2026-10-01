"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

export default function SummaryAsrama() {
  return (
    <section
      data-nav-theme="light"
      className="w-full bg-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Bagian Teks */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true, margin: "-10%" }}
          className="p-6 sm:p-10 bg-white relative rounded-none"
        >
          {/* H2 diubah menjadi Biru Tua (Navy) */}
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#132B6D] mb-6 leading-tight">
            Sekilas Tentang Asrama SMK TI Bazma
          </h2>

          {/* Paragraf diubah menjadi Abu-abu Kebiruan yang lebih soft */}
          <div className="space-y-4 text-lg sm:text-xl text-slate-700/80 leading-loose text-justify">
            <p className="">
              Asrama SMK TI BAZMA merupakan lingkungan pembinaan siswa yang
              mengintegrasikan kehidupan berasrama dengan pendidikan karakter
              dan nilai-nilai keislaman. Melalui berbagai kegiatan harian, siswa
              dibimbing untuk membangun kemandirian, kedisiplinan, tanggung
              jawab, serta kebersamaan dalam lingkungan yang positif dan
              terarah.
            </p>
          
          </div>
        </motion.div>

        {/* Bagian Gambar dengan Rounded Corner */}
        <div className="relative w-full overflow-hidden rounded-2xl shadow-lg aspect-[16/9] sm:aspect-[21/9]">
          <Image
            src="/images/info-asrama.webp"
            alt="Siswa-siswi SMK TI Bazma"
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}
