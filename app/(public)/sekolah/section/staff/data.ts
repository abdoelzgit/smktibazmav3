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
        isPlaceholder: true,
      },
      {
        id: "waka-2",
        name: "Mirza Bakti Sukaryana, S.Pd.",
        role: "Kepala Program Studi",
        isPlaceholder: true,
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
        isPlaceholder: true,
      },
      {
        id: "guru-2",
        name: "Ristina Eka S, S.Kom.",
        role: "Guru Mata Pelajaran Produktif",
        isPlaceholder: true,
      },
      {
        id: "guru-3",
        name: "Parni Handayani, S.Tr.T., Gr.",
        role: "Guru Mata Pelajaran Produktif",
        isPlaceholder: true,
      },

      {
        id: "guru-4",
        name: "",
        role: "Guru Pendidikan Agama Islam",
        isPlaceholder: true,
      },
      {
        id: "guru-4",
        name: "[Nama Guru Umum]",
        role: "Guru Matematika & Sains Terapan",
        isPlaceholder: true,
      },
      {
        id: "guru-5",
        name: "[Nama Guru Umum]",
        role: "Guru Bahasa Inggris Komunikasi",
        isPlaceholder: true,
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
