import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DUMMY_KARYA = [
  {
    title: "MyWorker AI",
    slug: "myworker-ai",
    category: "Website",
    year: "2026",
    author: "Tim Siswa SMK TI BAZMA",
    description:
      "Kreativitas dan kemampuan siswa dalam membuat solusi digital interaktif berbasis Web & AI.",
    challenge:
      "MyWorker.ai needed to present a complex AI-driven workforce platform in a way that feels simple and approachable. The product included multiple features that could easily overwhelm users. The key challenge was balancing clarity with capability. At the same time, the brand had to feel modern, intelligent, and trustworthy.",
    approach:
      "Kami menerapkan pendekatan desain berorientasi pengguna dengan mengelompokkan arsitektur informasi menjadi modul visual yang bersih, dilengkapi animasi mikro dan hirarki visual yang tegas.",
    outcome:
      "Peningkatan efisiensi antarmuka pengguna hingga 145% dan adopsi produk yang sangat cepat oleh para pengembang dan perusahaan.",
    whatWeDid:
      "User Research, System Architecture, Wireframing, High-Fidelity UI/UX Design, Next.js Development, AI API Integration.",
    tags: JSON.stringify([
      "AI Product Design",
      "UI/UX Design",
      "Web Development",
      "Interaction Design",
    ]),
    coverImage: "/images/hero-berita.jpg",
    galleryImages: JSON.stringify([
      "/images/hero-berita.jpg",
      "/images/hero-berita.jpg",
    ]),
    published: true,
    publishedAt: new Date(),
  },
  {
    title: "Branding & Interface Design",
    slug: "desain-identitas-visual",
    category: "Design",
    year: "2025",
    author: "Siswa Multimedia & Desain",
    description:
      "Kreativitas dan kemampuan siswa dalam menciptakan desain digital dan brand identity yang menarik.",
    challenge:
      "Menciptakan identitas visual modern yang mencerminkan inovasi teknologi sekolah sekaligus mudah diaplikasikan di berbagai media.",
    approach:
      "Merancang sistem desain komprehensif mulai dari logo, palet warna berkarakter, hingga antarmuka komponen UI modular.",
    outcome:
      "Terciptanya identitas visual konsisten yang meningkatkan brand awareness sekolah di tingkat nasional.",
    whatWeDid:
      "Brand Strategy, Logo Design, Component Library, UI Guidelines, 3D Assets.",
    tags: JSON.stringify([
      "UI/UX Design",
      "Brand Identity",
      "Design System",
      "3D Graphics",
    ]),
    coverImage: "/images/hero-berita.jpg",
    galleryImages: JSON.stringify(["/images/hero-berita.jpg"]),
    published: true,
    publishedAt: new Date(),
  },
  {
    title: "Cinematic Company Profile Video",
    slug: "video-profil-sekolah",
    category: "Video",
    year: "2025",
    author: "Tim Videografi BAZMA",
    description:
      "Kreativitas dan kemampuan siswa dalam memproduksi video inspiratif dan edukatif berkualitas tinggi.",
    challenge:
      "Menyampaikan nilai-nilai unggul dan kehidupan pembelajaran di SMK TI BAZMA dalam bentuk karya sinematik yang menggugah.",
    approach:
      "Pengambilan gambar sinematik multi-kamera, teknik editing dinamis, serta komposisi musik dan motion graphics kelas profesional.",
    outcome:
      "Ditonton lebih dari 50.000 kali dan dijadikan referensi utama bagi calon peserta didik baru.",
    whatWeDid:
      "Scriptwriting, Storyboarding, Directing, Color Grading, Audio Mastering.",
    tags: JSON.stringify([
      "Video Production",
      "Cinematography",
      "Motion Graphics",
      "Sound Design",
    ]),
    coverImage: "/images/hero-berita.jpg",
    galleryImages: JSON.stringify(["/images/hero-berita.jpg"]),
    published: true,
    publishedAt: new Date(),
  },
  {
    title: "Sistem Rekap Presensi AI",
    slug: "sistem-rekap-presensi",
    category: "IoT",
    year: "2025",
    author: "Siswa XI RPL SMK TI BAZMA",
    description:
      "Kreativitas dan kemampuan siswa dalam mengembangkan inovasi berbasis Internet of Things dan Computer Vision.",
    challenge:
      "Proses pencatatan presensi manual di sekolah memakan waktu hingga 15 menit setiap pagi dan rentan ketidakakuratan data.",
    approach:
      "Membangun modul kamera pintar berbasis IoT yang terhubung dengan model pengenalan wajah cerdas dan dashboard Next.js real-time.",
    outcome:
      "Waktu presensi berkurang menjadi 2 detik per siswa dengan akurasi pengenalan wajah mencapai 99.4%.",
    whatWeDid:
      "Model Training Face Recognition, Hardware Integration, Server Actions API, Realtime Dashboard.",
    tags: JSON.stringify([
      "Computer Vision",
      "IoT Hardware",
      "Fullstack Web",
      "Realtime Dashboard",
    ]),
    coverImage: "/images/hero-berita.jpg",
    galleryImages: JSON.stringify(["/images/hero-berita.jpg"]),
    published: true,
    publishedAt: new Date(),
  },
];

async function main() {
  console.log("Seeding Jejak Karya data...");
  for (const data of DUMMY_KARYA) {
    await prisma.jejakKarya.upsert({
      where: { slug: data.slug },
      update: data,
      create: data,
    });
  }
  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
