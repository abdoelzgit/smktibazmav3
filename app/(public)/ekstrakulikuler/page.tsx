import type { Metadata } from "next";
import { Hero } from "@/components/hero";
import { EkstraContent } from "./ekstra-content";
import { EkstraGrid } from "./ekstra-grid";

export const metadata: Metadata = {
  title: "Aktivitas Siswa",
  description:
    "Aktivitas dan pengembangan potensi siswa di SMK TI BAZMA, mulai dari riset teknologi, kepanduan, olahraga, hingga seni budaya Islami.",
};

export default function EkstrakulikulerPage() {
  return (
    <main className="flex h-full flex-col items-center">
      <Hero
        title="Aktivitas Siswa"
        backgroundImage="/images/ekstrakulikuler.webp"
      />

      <EkstraContent />

      <EkstraGrid />
    </main>
  );
}