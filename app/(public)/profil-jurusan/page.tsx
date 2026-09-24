import { Hero } from "@/components/hero";
import { JurusanContent } from "./jurusan-content";
import { MataPelajaranGrid } from "./mata-pelajaran-grid";

export default function JurusanPage() {
  return (
    <main className="flex h-full flex-col items-center">
      <Hero
        title="Profil Jurusan"
        backgroundImage="/images/profil-jurusan.webp"
      />

      <JurusanContent />

      <MataPelajaranGrid />
    </main>
  );
}