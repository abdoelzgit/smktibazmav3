"use client";

import { motion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";

type LeaderQuoteProps = {
  className?: string;
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: i * 0.15 },
  }),
};

export default function LeaderQuote({ className }: LeaderQuoteProps) {
  const name = "Ahmad Dahlan";
  const role = "Kepala Sekolah SMK TI BAZMA";
  const quote =
    "SMK TI BAZMA adalah Islamic Boarding School berbasis teknologi yang memadukan pendidikan IT, tahfidzul Qur'an, dan pembentukan karakter.";
  const footerText =
    "Sekolah Menengah Kejuruan Teknologi Informasi Bazma (SMK TI BAZMA) merupakan sekolah unggulan berasrama yang bebas.";

  return (
    <section
      data-nav-theme="dark"
    className={cn(
    "relative z-10 w-full overflow-hidden text-white",
    "py-16 sm:py-20 md:py-28 lg:py-36",
    "bg-[url('/images/kepsekbg-mobile.webp')] md:bg-[url('/images/kepsekbg.webp')]",
    "bg-cover bg-[position:top_center] bg-no-repeat bg-[#132B6D]",
    className
  )}
    >
      {/* Overlay gradient di atas background-image, bukan di atas <img> lagi */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(circle at 50% 40%, rgba(19, 43, 109, 0.3) 0%, rgba(19, 43, 109, 0.75) 75%, #132B6D 100%)",
        }}
      />

      {/* Konten — tinggi section otomatis ngikutin ini + padding, TIDAK pakai min-h fix */}
      <div className="relative z-10 mx-auto flex w-full max-w-7xl min-h-[130vh] flex-col justify-between gap-10 px-6 sm:px-10 md:px-14 lg:px-20">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          custom={0}
        >
          <h2 className="text-2xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
            {name}
          </h2>
          <p className="mt-1 text-xs font-medium text-white/80 sm:text-base md:text-lg">
            {role}
          </p>
        </motion.div>

        <div className="flex flex-col gap-6 sm:gap-10">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            custom={1}
            className="relative w-full max-w-5xl"
          >
            <div className="flex items-center justify-between gap-4 md:gap-8">
              <blockquote className="max-w-3xl text-left text-lg font-medium leading-snug sm:text-2xl md:text-3xl lg:text-[34px] lg:leading-tight">
                &ldquo;{quote}&rdquo;
              </blockquote>
              <div className="hidden shrink-0 sm:block">
                <svg
                  className="h-10 w-10 fill-current md:h-16 md:w-16 lg:h-20 lg:w-20"
                  viewBox="0 0 24 24"
                >
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            custom={2}
            className="grid grid-cols-1 gap-4 border-t border-white/10 pt-4 text-[10px] text-white/70 sm:grid-cols-2 sm:text-xs md:text-sm"
          >
            <p className="max-w-sm leading-relaxed">{footerText}</p>
            <p className="max-w-sm leading-relaxed sm:ml-auto sm:text-right">
              {footerText}
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}