"use client";

import { EkstraShowcase } from "./ekstra-showcase";

const ekstraData = [
  {
    title: "MCRobo",
    description:
      "MCRobo (Microcontroller & Robotics) merupakan laboratorium kreatif bagi santri untuk mendalami rancang bangun perangkat keras, pemrograman mikrokontroler, otomasi sistem, dan implementasi Internet of Things (IoT). Melalui eksplorasi sensor, aktuator, dan kecerdasan komputasi, santri diajak mengembangkan proyek teknologi tepat guna secara kolaboratif.",
    image: "/images/ekstrakulikuler/robotik.webp",
  },
  {
    title: "Pramuka",
    description:
      "Gerakan Pramuka di SMK TI BAZMA menjadi pilar utama pembinaan karakter, kedisiplinan, kemandirian, dan jiwa kepemimpinan santri. Melalui navigasi darat, keterampilan bertahan hidup (survival), penjelajahan alam terbuka, serta bakti sosial, santri dilatih memiliki ketangguhan mental, integritas moral, dan kepekaan sosial yang tinggi.",
    image: "/images/ekstrakulikuler/pramuka.webp",
  },
  {
    title: "Silat",
    description:
      "Pencak Silat membekali santri dengan warisan seni bela diri nusantara yang melatih ketangkasan gerak, kekuatan refleks, serta ketahanan fisik. Lebih dari sekadar teknik pertahanan diri, silat menanamkan nilai-nilai kesatria, kerendahan hati, penguasaan emosi, dan kedisiplinan spiritual yang selaras dengan nilai-nilai keislaman.",
    image: "/images/ekstrakulikuler/silat.webp",
  },
  {
    title: "Futsal",
    description:
      "Futsal menjadi sarana pembinaan kebugaran fisik, strategi berpikir cepat, dan soliditas kerja sama tim. Melalui latihan terstruktur dan simulasi pertandingan kompetitif, santri mengasah sportivitas, komunikasi interpersonal yang efektif, serta daya juang pantang menyerah untuk mencapai prestasi bersama.",
    image:
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1200&auto=format&fit=crop",
  },
  {
    title: "Hadroh",
    description:
      "Aktivitas Hadroh menyalurkan kecintaan santri pada seni musik perkusi rebana tradisional bernuansa Islami. Melalui harmonisasi ketukan instrumen dan lantunan shalawat, santri melatih kepekaan estetika musikal, kekompakan ansambel, serta menghidupkan syiar dakwah yang menyejukkan hati di lingkungan sekolah dan masyarakat.",
    image: "/images/ekstrakulikuler/hadroh.webp",
  },
  {
    title: "Band",
    description:
      "Grup Band santri memberikan ruang eksplorasi musikalitas modern melalui perpaduan instrumen gitar, bass, keyboard, dan drum. Kegiatan ini melatih kepekaan aransemen harmoni, ketepatan tempo, serta ekspresi kreativitas audio dalam format pertunjukan grup yang harmonis, inspiratif, dan berjiwa muda.",
    image: "/images/ekstrakulikuler/band.webp",
  },
];

export function EkstraGrid() {
  return <EkstraShowcase items={ekstraData} />;
}
