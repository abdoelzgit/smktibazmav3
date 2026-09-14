import Footer from "@/components/footer";
import { Navbar } from "@/components/navbar";
import HeroCarousel from "../hero-carousel";
import { Hero } from "@/components/hero";
// 1. Import komponen Summary dari folder yang dituju
import Summary from "@/app/sekolah/section/summary";
import Core from "@/app/sekolah/section/core";
import TimelineCarousel from "@/app/sekolah/section/timeline";
import Fasilitas from "@/app/sekolah/section/fasilitas";
import LeaderQuote from "@/app/sekolah/section/leaderquote";
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