import { Hero } from "@/components/hero";
import { EkstraContent } from "./ekstra-content";
import { EkstraGrid } from "./ekstra-grid";

export default function EkstrakulikulerPage() {
  return (
    <main className="flex h-full flex-col items-center">
      <Hero
        title="Ekstrakulikuler"
        backgroundImage="/images/ekstrakulikuler.webp"
      />

      <EkstraContent />

      <EkstraGrid />
    </main>
  );
}