import { Hero } from "@/components/hero";
import FasilitasAsrama from "./section/fasilitasAsrama";
import SummaryAsrama from "./section/summary";

export default function AsramaPage() {
  return (
    <main className="flex min-h-full flex-col items-center">
      <Hero
        title="Profil Asrama"
        backgroundImage="/images/hero-network.jpg"
      />
      <SummaryAsrama />
      <FasilitasAsrama />
    </main>
  );
}
