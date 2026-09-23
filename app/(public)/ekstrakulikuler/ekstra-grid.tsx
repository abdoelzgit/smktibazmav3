"use client";

import { ExpandableGallery, GalleryItem } from "@/components/ui/gallery-animation";

const ekstraData: GalleryItem[] = [
  {
    title: "MCRobo (Robotika)",
    description: "Wadah riset teknologi, perakitan mikrokontroler, IoT, dan pemrograman robotika kreatif.",
    image: "/images/ekstrakulikuler/robotik.webp",
  },
  {
    title: "Pramuka",
    description: "Membentuk karakter disiplin, kemandirian, kepemimpinan, dan kepedulian sosial santri.",
    image: "/images/ekstrakulikuler/pramuka.webp",
  },
  {
    title: "Hadroh",
    description: "Menyalurkan bakat seni musik perkusi rebana dan syiar nilai-nilai Islam yang indah.",
    image: "/images/ekstrakulikuler/hadroh.webp",
  },
  {
    title: "Band",
    description: "Mengasah musikalitas, harmonisasi instrumen musik modern, dan kreativitas bermusik.",
    image: "/images/ekstrakulikuler/band.webp",
  },
  {
    title: "Silat",
    description: "Melestarikan seni bela diri tradisional, melatih ketangkasan fisik, mental, dan pertahanan diri.",
    image: "/images/ekstrakulikuler/silat.webp",
  },
  {
    title: "Futsal",
    description: "Mengembangkan kebugaran fisik, sportivitas, dan kekompakan tim melalui olahraga futsal.",
    image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1200&auto=format&fit=crop",
  },
];

export function EkstraGrid() {
  return (
    <section className="w-full max-w-7xl mx-auto pt-4 pb-20 sm:pb-28 px-4 sm:px-6 lg:px-8">
      <div className="w-full">
        <ExpandableGallery images={ekstraData} clickable={false} className="w-full" />
      </div>
    </section>
  );
}