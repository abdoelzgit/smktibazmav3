import type { Metadata } from "next";
import { Hero } from "@/components/hero";
import Summary from "./section/summary";
import Core from "./section/core";
import TimelineCarousel from "./section/timeline";
import Fasilitas from "./section/fasilitas";
import LeaderQuote from "./section/leaderquote";
import Staff from "./section/staff";

export const metadata: Metadata = {
  title: "Profil Sekolah",
  description: "Profil lengkap, visi misi, dan sejarah SMK TI BAZMA.",
};

export default function SekolahPage() {
  return (
    <main className="flex min-h-full flex-col items-center">
      <Hero title="Profil Sekolah" backgroundImage="/images/sekolah.webp" />
      <Summary />
      <Core />
      <TimelineCarousel />
      <Fasilitas />
      <LeaderQuote className="" />
      <Staff />
    </main>
  );
}
