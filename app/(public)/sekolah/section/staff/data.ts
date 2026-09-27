import { StaffCategory } from "./types";

export const STAFF_CATEGORIES: StaffCategory[] = [
  {
    id: "wakil-kepala-sekolah",
    title: "Wakil Kepala Sekolah",
    description:
      "SMK TI BAZMA memiliki jajaran wakil kepala sekolah yang mendukung pengelolaan dan pengembangan sekolah dalam berbagai bidang.",
    members: [
      {
        id: "waka-1",
        name: "M. Dzikri Fauzan, S.Kom",
        role: "Waka. Bidang Kurikulum & Akademik",
        image: "/images/foto-guru/pak-dzikri.webp",
      },
      {
        id: "waka-2",
        name: "Mirza Bakti Sukaryana, S.Pd.",
        role: "Kepala Program Studi",
        image: "/images/foto-guru/pak-mirza.webp",
      },
    ],
  },

  {
    id: "jajaran-guru",
    title: "Jajaran Guru",
    description:
      "Tenaga pendidik profesional yang berdedikasi membimbing dan menginspirasi siswa dalam aspek akademis maupun pembentukan karakter.",
    members: [
      {
        id: "guru-1",
        name: "M. Fadhlurrahman Muzakki, S.Pd.",
        role: "Guru Mata Pelajaran Produktif",
        image: "/images/foto-guru/pak-nanang.webp",
      },
      {
        id: "guru-2",
        name: "Ristina Eka S, S.Kom.",
        role: "Guru Mata Pelajaran Produktif",
        image: "/images/foto-guru/bu-bila.webp",
      },
      {
        id: "guru-3",
        name: "Parni Handayani, S.Tr.T., Gr.",
        role: "Guru Mata Pelajaran Produktif",
        image: "/images/foto-guru/bu-parni.webp",
      },

      {
        id: "guru-4",
        name: "Priyanto",
        role: "Guru Proyek Kreatif Kewirausahaan",
        image: "/images/foto-guru/pak-pri.webp",
      },
      {
        id: "guru-4",
        name: "Miftahul Jannah",
        role: "Guru Matematika",
        image: "/images/foto-guru/bu-mita.webp",
      },
      {
        id: "guru-5",
        name: "Umar Putra W., S.Pd.",
        role: "Guru Bahasa Inggris ",
        image: "/images/foto-guru/pak-putra.webp",
      },

      {
        id: "guru-6",
        name: "Ilham Syahbana Kusuma",
        role: "Guru Bahasa Indonesia",
        image: "/images/foto-guru/pak-ilham.webp",
      },

      {
        id: "guru-7",
        name: "Indra Sujitno",
        role: "Guru PPKN",
        image: "/images/foto-guru/pak-indra.webp",
      },
    ],
  },
  {
    id: "staff-tata-usaha",
    title: "Staff Tata Usaha",
    description:
      "Mendukung kelancaran operasional dan pelayanan administrasi sekolah secara profesional, tertib, dan berintegritas.",
    members: [
      {
        id: "tu-1",
        name: "[Nama Staff Administrasi]",
        role: "Kepala Tata Usaha & Administrasi",
        isPlaceholder: true,
      },
      {
        id: "tu-2",
        name: "[Nama Staff Keuangan]",
        role: "Bendahara & Administrasi Keuangan",
        isPlaceholder: true,
      },
      {
        id: "tu-3",
        name: "[Nama Staff Dapodik]",
        role: "Operator Dapodik & Data Sekolah",
        isPlaceholder: true,
      },
    ],
  },
];
