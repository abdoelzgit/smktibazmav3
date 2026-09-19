import { Hero } from "@/components/hero";
import { MitraContent } from "./mitra-content";
import { ImageAutoSlider } from "@/components/ui/image-auto-slider";

export default function MitraPage() {
  return (
    <main className="flex h-full flex-col items-center">
      <Hero
        title="Mitra Sekolah"
        backgroundImage="/images/hero-network.jpg"
      />
      
      <MitraContent />
      
      {/* 1. Marquee Slider (Logo bergerak) */}
      <ImageAutoSlider itemCount={8} />

    </main>
  );
}