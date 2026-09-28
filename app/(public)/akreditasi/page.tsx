import type { Metadata } from "next";
import { Hero } from "@/components/hero";
import { AkreditasiContent } from "./akreditasicontent";
import { CertificateCard } from "./certificatecard";

export const metadata: Metadata = {
  title: "Akreditasi",
  description: "Informasi lengkap mengenai akreditasi sekolah SMK TI BAZMA.",
};


export default function AkreditasiPage() {
  return (
    <main className="flex h-full flex-col items-center">
      <Hero
        title="Akreditasi Sekolah"
        backgroundImage="/images/akreditasi.webp  "
      />
      <AkreditasiContent />
      <CertificateCard />
    </main>
  );
}