import type { Metadata } from "next";
import { Hero } from "@/components/hero";
import { JurusanContent } from "./jurusan-content";
import { MataPelajaranGrid } from "./mata-pelajaran-grid";

export const metadata: Metadata = {
  title: "Profil Jurusan",
  description: "Program Keahlian Sistem Informatika, Jaringan & Aplikasi (SIJA) 4 Tahun SMK TI BAZMA.",
};

export default function JurusanPage() {
  return (
    <main className="flex h-full flex-col items-center">
      <Hero
        title="Profil Jurusan"
        backgroundImage="/images/profil-jurusan.webp"
      />

      <JurusanContent />

      <MataPelajaranGrid />
    </main>
  );
}