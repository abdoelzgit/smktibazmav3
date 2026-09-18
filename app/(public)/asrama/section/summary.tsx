"use client"

import React from "react"
import { motion } from "framer-motion"

export default function SummaryAsrama() {
  return (
    <section data-nav-theme="light" className="w-full bg-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
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
              Sekolah Menengah Kejuruan Teknologi Informasi Bazma (SMK TI BAZMA) merupakan sekolah unggulan berasrama 
              yang bebas biaya dan diperuntukkan untuk anak-anak tidak mampu. Pembangunan sekolah, baik fasilitas maupun 
              operasional didanai dari hasil pengelolaan wakaf dan sumber dana sosial kemanusiaan lainnya yang diamanahkan oleh 
              masyarakat.
            </p>
            <p>
              SMK TI BAZMA menyelenggarakan program pembelajaran yang ditempuh selama 4 tahun dengan siswa-siswa terbaik 
              yang berasal dari berbagai daerah di seluruh Indonesia. SMK TI Bazma menyelenggarakan pendidikan dengan jurusan 
              SIJA (Sistem Informatika, Jaringan & Aplikasi) dengan kombinasi kurikulum berbasis asrama.
            </p>
          </div>
        </motion.div>

        {/* Bagian Gambar dengan Rounded Corner */}
        <div 
          
          className="relative w-full overflow-hidden rounded-2xl shadow-lg aspect-[16/9] sm:aspect-[21/9]"
        >
          <img 
            src="/images/foto.webp" 
            alt="Siswa-siswi SMK TI Bazma" 
            className="w-full h-full object-cover"
          />
        </div>

      </div>
    </section>
  )
}