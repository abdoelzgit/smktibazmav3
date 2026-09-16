import { Hero } from "@/components/hero";
import Summary from "./section/summary";
import Core from "./section/core";
import TimelineCarousel from "./section/timeline";
import Fasilitas from "./section/fasilitas";
import LeaderQuote from "./section/leaderquote";
export default function SekolahPage() {
  return (
    <main className="flex min-h-full flex-col items-center">
      {/* atau bisa juga tanpa class tinggi sama sekali: */}
      {/* <main className="flex flex-col items-center"> */}

      <Hero title="Profil Sekolah" backgroundImage="/images/hero-network.jpg" />
      <Summary />
      <Core />
      <TimelineCarousel />
      <Fasilitas />
      <LeaderQuote className="" />
    </main>
  );
}