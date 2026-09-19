import { Hero } from "@/components/hero";
import SummaryAsrama from "./section/summary";
import ProgramAsrama from "./section/program";
import Fasilitas from "./section/fasilitas";

export default function AsramaPage() {
  return (
    <main className="flex min-h-full flex-col items-center">
      <Hero
        title="Profil Asrama"
        backgroundImage="/images/hero-network.jpg"
      />
      <SummaryAsrama />
      <ProgramAsrama />
      <Fasilitas />
    </main>
  );
}
