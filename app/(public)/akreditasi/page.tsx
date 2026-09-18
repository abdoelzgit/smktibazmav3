import { Hero } from "@/components/hero";
import { AkreditasiContent } from "./akreditasicontent";
import { CertificateCard } from "./certificatecard";
export default function AkreditasiPage() {
  return (
    <main className="flex h-full flex-col items-center">
      <Hero
        title="Akreditasi Sekolah"
        backgroundImage="/images/hero-network.jpg"
      />
      <AkreditasiContent />
      <CertificateCard />
    </main>
  );
}