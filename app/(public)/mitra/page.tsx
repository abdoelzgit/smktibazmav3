import { Hero } from "@/components/hero";
import { MitraContent } from "./mitra-content";
import { ImageAutoSlider } from "@/components/ui/image-auto-slider";
import ProfileMitraFullScreen from "./mitra-profile";

export default function MitraPage() {
  return (
    <main className="flex h-full flex-col items-center">
      <Hero
        title="Mitra Sekolah"
        backgroundImage="/images/mitra-hero.webp"
      />

      <MitraContent />

      {/* 1. Marquee Slider (Logo bergerak) dengan jarak proporsional */}
      <div className="w-full pt-2 pb-16 sm:pb-20 md:pb-24 bg-white">
        <ImageAutoSlider itemCount={8} />
      </div>

      {/* 2. Profil Mitra (Card) */}
      <ProfileMitraFullScreen />
    </main>
  );
}
