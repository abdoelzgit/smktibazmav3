"use client";

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

export function CertificateCard() {
  return (
    <section className="w-full max-w-[1148px] mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      <div
        className="relative rounded-3xl overflow-hidden p-8 md:p-12 h-[473px] flex items-center bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(30, 58, 138, 0.85)), url('/images/students-bg.jpg')`,
        }}
      >
        <div className="relative z-10 max-w-xl">
          <h2 className="text-white text-2xl md:text-3xl font-bold mb-4">
            Sertifikat Akreditasi
          </h2>
          <p className="text-gray-200 mb-8 leading-relaxed">
            Salinan resmi sertifikat akreditasi SMK TI Bazma yang diterbitkan oleh
            BAN-S/M dapat dilihat langsung atau diunduh dalam format PDF untuk
            keperluan verifikasi.
          </p>
          <Link
            href="/sertifikat-akreditasi"
            className="inline-flex items-center gap-2 px-6 py-3 border-2 border-white text-white rounded-full font-semibold hover:bg-white hover:text-blue-900 transition-all duration-300"
          >
            Selengkapnya
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}