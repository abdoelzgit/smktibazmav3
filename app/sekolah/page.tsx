import Footer from "@/components/footer";
import { Navbar } from "@/components/navbar";
import HeroCarousel from "../hero-carousel";
import { Hero } from "@/components/hero";

export default function SekolahPage() {
  return (
    <main className="flex h-full flex-col items-center ">
      <Navbar />
      <Hero
        title="Profil Sekolah"
        backgroundImage="/images/hero-network.jpg"
      />
      
      <Footer />
    </main>
  );
}
