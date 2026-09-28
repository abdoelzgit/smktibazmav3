import type { Metadata } from "next";
import { Hero } from "@/components/hero";
import { EkstraContent } from "./ekstra-content";
import { EkstraGrid } from "./ekstra-grid";

export const metadata: Metadata = {
  title: "Ekstrakulikuler",
  description: "Kegiatan ekstrakurikuler dan pengembangan bakat siswa di SMK TI BAZMA.",
};

export default function EkstrakulikulerPage() {
  return (
    <main className="flex h-full flex-col items-center">
      <Hero
        title="Ekstrakulikuler"
        backgroundImage="/images/ekstrakulikuler.webp"
      />

      <EkstraContent />

      <EkstraGrid />
    </main>
  );
}