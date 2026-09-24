"use client";

import { EkstraShowcase } from "./ekstra-showcase";

const ekstraData = [
  {
    title: "MCRobo (Robotika)",
    description:
      "MCRobo menjadi wadah bagi santri untuk mengembangkan kemampuan di bidang robotika dan teknologi. Kegiatan mencakup perakitan mikrokontroler, pemrograman, Internet of Things (IoT), serta pembuatan berbagai proyek teknologi secara kreatif dan kolaboratif.",
    image: "/images/ekstrakulikuler/robotik.webp",
  },
  {
    title: "Pramuka",
    description:
      "Pramuka menjadi kegiatan untuk membentuk karakter santri melalui latihan kedisiplinan, kemandirian, kepemimpinan, dan kerja sama. Berbagai kegiatan dilakukan untuk melatih keberanian, tanggung jawab, serta kepedulian terhadap lingkungan dan sesama.",
    image: "/images/ekstrakulikuler/pramuka.webp",
  },
  {
    title: "Silat",
    description:
      "Silat menjadi wadah untuk mempelajari seni bela diri sekaligus melatih ketangkasan dan kedisiplinan. Selain kemampuan fisik, kegiatan ini juga membentuk keberanian, pengendalian diri, mental yang kuat, serta sikap menghargai orang lain.",
    image: "/images/ekstrakulikuler/silat.webp",
  },
  {
    title: "Futsal",
    description:
      "Futsal menjadi kegiatan olahraga yang mendorong santri untuk menjaga kebugaran sekaligus belajar bekerja sama dalam tim. Latihan dan pertandingan membantu mengembangkan kemampuan bermain, sportivitas, komunikasi, serta semangat untuk saling mendukung.",
    image:
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1200&auto=format&fit=crop",
  },
  {
    title: "Hadroh",
    description:
      "Hadroh menjadi wadah bagi santri yang memiliki minat dalam seni musik Islami. Melalui permainan rebana dan latihan bersama, santri belajar mengembangkan musikalitas, kekompakan, serta menyalurkan kreativitas dalam kegiatan yang bernuansa dakwah dan syiar Islam.",
    image: "/images/ekstrakulikuler/hadroh.webp",
  },
  {
    title: "Band",
    description:
      "Band menjadi ruang bagi santri untuk mengembangkan kemampuan bermusik melalui berbagai instrumen musik modern. Latihan dilakukan secara bersama untuk membangun musikalitas, harmonisasi, kreativitas, dan kemampuan bekerja sebagai sebuah tim.",
    image: "/images/ekstrakulikuler/band.webp",
  },
];

export function EkstraGrid() {
  return <EkstraShowcase items={ekstraData} />;
}