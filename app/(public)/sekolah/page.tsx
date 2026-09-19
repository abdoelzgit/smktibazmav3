import { Hero } from "@/components/hero";
import Summary from "./section/summary";
import Core from "./section/core";
import TimelineCarousel from "./section/timeline";
import Fasilitas from "./section/fasilitas";
import LeaderQuote from "./section/leaderquote";
import Staff from "./section/staff";

export default function SekolahPage() {
  return (
    <main className="flex min-h-full flex-col items-center">
      <Hero title="Profil Sekolah" backgroundImage="/images/hero-network.jpg" />
      <Summary />
      <Core />
      <TimelineCarousel />
      <Fasilitas />
      <LeaderQuote className="" />
      <Staff />
    </main>
  );
}