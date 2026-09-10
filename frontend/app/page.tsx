import HeroCarousel from "@/app/hero-carousel";
import { Navbar } from "@/components/navbar";
import { Sambutan, InfoSekilas } from "@/app/summary";
import Footer from "@/components/footer";
import { ProgramHero } from "@/app/profil-jurusan";
import HowWeWork from "@/app/how-we-work";

export default function Home() {
  return (
    <main className="flex flex-col items-center" id="main-content">
     
      {/* <Navbar /> */}
      <div id="hero" className="w-full">
        <HeroCarousel />
      </div>

      <div id="about" className="w-full">
        <div id="sekolah">
          <Sambutan />
        </div>
      </div>

      <div id="mitra" className="relative w-full">
        {/* InfoSekilas rapat di top-6 (TIDAK ADA GAP ATAS) */}
        <div id="akreditasi" className="sticky top-0 mb-10 z-0">
          <InfoSekilas />
        </div>

        {/* ProgramHero sticky top-0 z-10 menimpa InfoSekilas */}
        <div id="program" className="sticky top-6 z-10">
          <div id="jurusan">
            <ProgramHero
              imageSrc="/images/foto.webp"
              imageAlt="Rak jaringan fiber optik"
              label="Profil Jurusan"
              title="Sistem Informasi, Jaringan & Aplikasi (SIJA)"
              description="SIJA adalah perpaduan antara Teknik Komputer & Jaringan (TKJ) dan Rekayasa Perangkat Lunak (RPL). Sekolah kami dilengkapi dengan teknologi terbaru dalam bidang cloud computing untuk mempersiapkan siswa menghadapi tantangan masa depan."
              ctaLabel="Lebih lengkap"
              ctaHref="/jurusan/sija"
            />
          </div>
        </div>
      </div>

      <div id="karya" className="w-full">
        <HowWeWork />
      </div>

      <div id="footer" className="w-full">
      </div>
    </main>
  );
}
