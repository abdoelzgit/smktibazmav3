export interface JejakKaryaItem {
  slug: string;
  title: string;
  category: "Website" | "Design" | "Video" | "IoT";
  year: string;
  description: string;
  tags: string[];
  challenge: string;
  approach: string;
  outcome: string;
  whatWeDid: string;
  heroImage: string;
  galleryImages: string[];
  demoUrl?: string;
  author: string;
  prevSlug?: string;
  nextSlug?: string;
}

export const JEJAK_KARYA_LIST: JejakKaryaItem[] = [
  {
    slug: "myworker-ai",
    title: "MyWorker AI",
    category: "Website",
    year: "2026",
    description:
      "Kreativitas dan kemampuan siswa dalam membuat solusi digital interaktif berbasis Web & AI.",
    tags: [
      "AI Product Design",
      "UI/UX Design",
      "Web Development",
      "Interaction Design",
    ],
    challenge:
      "MyWorker.ai needed to present a complex AI-driven workforce platform in a way that feels simple and approachable. The product included multiple features that could easily overwhelm users. The key challenge was balancing clarity with capability. At the same time, the brand had to feel modern, intelligent, and trustworthy.",
    approach:
      "Kami menerapkan pendekatan desain berorientasi pengguna dengan mengelompokkan arsitektur informasi menjadi modul visual yang bersih, dilengkapi animasi mikro dan hirarki visual yang tegas.",
    outcome:
      "Peningkatan efisiensi antarmuka pengguna hingga 145% dan adopsi produk yang sangat cepat oleh para pengembang dan perusahaan.",
    whatWeDid:
      "User Research, System Architecture, Wireframing, High-Fidelity UI/UX Design, Next.js Development, AI API Integration.",
    heroImage: "/images/hero-berita.jpg",
    galleryImages: [
      "/images/hero-berita.jpg",
      "/images/hero-berita.jpg",
    ],
    author: "Tim Siswa SMK TI BAZMA",
    prevSlug: "sistem-inventaris-lab",
    nextSlug: "desain-identitas-visual",
  },
  {
    slug: "desain-identitas-visual",
    title: "Branding & Interface Design",
    category: "Design",
    year: "2025",
    description:
      "Kreativitas dan kemampuan siswa dalam menciptakan desain digital dan brand identity yang menarik.",
    tags: [
      "UI/UX Design",
      "Brand Identity",
      "Design System",
      "3D Graphics",
    ],
    challenge:
      "Menciptakan identitas visual modern yang mencerminkan inovasi teknologi sekolah sekaligus mudah diaplikasikan di berbagai media.",
    approach:
      "Merancang sistem desain komprehensif mulai dari logo, palet warna berkarakter, hingga antarmuka komponen UI modular.",
    outcome:
      "Terciptanya identitas visual konsisten yang meningkatkan brand awareness sekolah di tingkat nasional.",
    whatWeDid:
      "Brand Strategy, Logo Design, Component Library, UI Guidelines, 3D Assets.",
    heroImage: "/images/hero-berita.jpg",
    galleryImages: [
      "/images/hero-berita.jpg",
    ],
    author: "Siswa Multimedia & Desain",
    prevSlug: "myworker-ai",
    nextSlug: "video-profil-sekolah",
  },
  {
    slug: "video-profil-sekolah",
    title: "Cinematic Company Profile Video",
    category: "Video",
    year: "2025",
    description:
      "Kreativitas dan kemampuan siswa dalam memproduksi video inspiratif dan edukatif berkualitas tinggi.",
    tags: [
      "Video Production",
      "Cinematography",
      "Motion Graphics",
      "Sound Design",
    ],
    challenge:
      "Menyampaikan nilai-nilai unggul dan kehidupan pembelajaran di SMK TI BAZMA dalam bentuk karya sinematik yang menggugah.",
    approach:
      "Pengambilan gambar sinematik multi-kamera, teknik editing dinamis, serta komposisi musik dan motion graphics kelas profesional.",
    outcome:
      "Ditonton lebih dari 50.000 kali dan dijadikan referensi utama bagi calon peserta didik baru.",
    whatWeDid:
      "Scriptwriting, Storyboarding, Directing, Color Grading, Audio Mastering.",
    heroImage: "/images/hero-berita.jpg",
    galleryImages: [
      "/images/hero-berita.jpg",
    ],
    author: "Tim Videografi BAZMA",
    prevSlug: "desain-identitas-visual",
    nextSlug: "sistem-rekap-presensi",
  },
  {
    slug: "sistem-rekap-presensi",
    title: "Sistem Rekap Presensi AI",
    category: "IoT",
    year: "2025",
    description:
      "Kreativitas dan kemampuan siswa dalam mengembangkan inovasi berbasis Internet of Things dan Computer Vision.",
    tags: [
      "Computer Vision",
      "IoT Hardware",
      "Fullstack Web",
      "Realtime Dashboard",
    ],
    challenge:
      "Proses pencatatan presensi manual di sekolah memakan waktu hingga 15 menit setiap pagi dan rentan ketidakakuratan data.",
    approach:
      "Membangun modul kamera pintar berbasis IoT yang terhubung dengan model pengenalan wajah cerdas dan dashboard Next.js real-time.",
    outcome:
      "Waktu presensi berkurang menjadi 2 detik per siswa dengan akurasi pengenalan wajah mencapai 99.4%.",
    whatWeDid:
      "Model Training Face Recognition, Hardware Integration, Server Actions API, Realtime Dashboard.",
    heroImage: "/images/hero-berita.jpg",
    galleryImages: [
      "/images/hero-berita.jpg",
    ],
    author: "Siswa XI RPL SMK TI BAZMA",
    prevSlug: "video-profil-sekolah",
    nextSlug: "myworker-ai",
  },
];

export function getJejakKaryaBySlug(slug: string): JejakKaryaItem {
  const found = JEJAK_KARYA_LIST.find(
    (item) => item.slug.toLowerCase() === slug.toLowerCase()
  );
  return found || JEJAK_KARYA_LIST[0];
}
