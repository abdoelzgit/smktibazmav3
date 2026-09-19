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
        name: "[Nama Wakil Kepala Sekolah]",
        role: "Waka. Bidang Kurikulum & Akademik",
        isPlaceholder: true,
      },
      {
        id: "waka-2",
        name: "[Nama Wakil Kepala Sekolah]",
        role: "Waka. Bidang Kesiswaan & Asrama",
        isPlaceholder: true,
      },
      {
        id: "waka-3",
        name: "[Nama Wakil Kepala Sekolah]",
        role: "Waka. Hubungan Industri & Sarpras",
        isPlaceholder: true,
      },
    ],
  },
  {
    id: "kepala-program-keahlian",
    title: "Kepala Program Keahlian",
    description:
      "Memimpin dan mengembangkan kurikulum keahlian teknologi informasi agar selaras dengan kebutuhan industri terkini.",
    members: [
      {
        id: "kaprog-1",
        name: "[Nama Kepala Program]",
        role: "Kepala Program Keahlian SIJA",
        isPlaceholder: true,
      },
      {
        id: "kaprog-2",
        name: "[Nama Koordinator Prakerin]",
        role: "Koordinator Hubungan Industri & Magang",
        isPlaceholder: true,
      },
    ],
  },
  {
    id: "kepala-laboratorium",
    title: "Kepala Laboratorium",
    description:
      "Mengelola fasilitas laboratorium dan sarana praktik teknologi guna mendukung kegiatan belajar mengajar yang optimal.",
    members: [
      {
        id: "kalab-1",
        name: "[Nama Kepala Lab]",
        role: "Kepala Lab Sistem Komputer & Jaringan",
        isPlaceholder: true,
      },
      {
        id: "kalab-2",
        name: "[Nama Kepala Lab]",
        role: "Kepala Lab Rekayasa Perangkat Lunak",
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
        name: "[Nama Guru Produktif]",
        role: "Guru Produktif Cloud & Networking",
        isPlaceholder: true,
      },
      {
        id: "guru-2",
        name: "[Nama Guru Produktif]",
        role: "Guru Produktif Web & Mobile App",
        isPlaceholder: true,
      },
      {
        id: "guru-3",
        name: "[Nama Guru Agama]",
        role: "Guru Pendidikan Agama Islam & Tahfidz",
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
