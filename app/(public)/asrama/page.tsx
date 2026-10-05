import type { Metadata } from "next";
import { Hero } from "@/components/hero";
import SummaryAsrama from "./section/summary";
import ProgramAsrama from "./section/program";
import Fasilitas from "./section/fasilitas";
import Ustadz from "./section/ustadz";

export const metadata: Metadata = {
  title: "Profil Asrama",
  description: "Fasilitas, pembinaan karakter, dan kehidupan santri di Islamic Boarding School SMK TI BAZMA.",
};

export default function AsramaPage() {
  return (
    <main className="flex min-h-full flex-col items-center">
      <Hero
        title="Profil Asrama"
        backgroundImage="/images/asrama.webp"
      />
      <SummaryAsrama />
      <ProgramAsrama />
      <Fasilitas />
      <Ustadz />
    </main>
  );
}
