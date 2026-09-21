import { GraduationCap, BookOpen, Code2 } from "lucide-react";

interface MataPelajaran {
  id: number;
  title: string;
  subtitle: string;
}

const mapelUmum: MataPelajaran[] = [
  { 
    id: 1, 
    title: "Matematika", 
    subtitle: "Melatih logika, pemikiran kritis, dan pemecahan masalah matematis." 
  },
  { 
    id: 2, 
    title: "Pendidikan Agama Islam", 
    subtitle: "Membentuk karakter islami dan pemahaman agama yang kuat." 
  },
  { 
    id: 3, 
    title: "PPKN", 
    subtitle: "Menanamkan nilai-nilai Pancasila dan kewarganegaraan." 
  },
  { 
    id: 4, 
    title: "IPAS", 
    subtitle: "Ilmu Pengetahuan Alam dan Sosial untuk memahami fenomena di sekitar." 
  },
  { 
    id: 5, 
    title: "Bahasa Indonesia", 
    subtitle: "Mengembangkan kemampuan komunikasi lisan dan tulisan yang baik." 
  },
  { 
    id: 6, 
    title: "Bahasa Inggris", 
    subtitle: "Meningkatkan kemampuan bahasa Inggris untuk komunikasi global." 
  },
  { 
    id: 7, 
    title: "PKK", 
    subtitle: "Prakarya dan Kewirausahaan untuk mengembangkan jiwa entrepreneur." 
  },
  { 
    id: 8, 
    title: "Seni Budaya", 
    subtitle: "Mengembangkan kreativitas dan apresiasi terhadap seni dan budaya." 
  },
  { 
    id: 9, 
    title: "Sejarah", 
    subtitle: "Memahami perjalanan sejarah Indonesia dan dunia." 
  },
];

const mapelJurusan: MataPelajaran[] = [
  { 
    id: 10, 
    title: "Desain Grafis", 
    subtitle: "Fokus pada UI/UX Design, membuat desain antarmuka yang user-friendly dan estetis." 
  },
  { 
    id: 11, 
    title: "Pemrograman Web", 
    subtitle: "Membangun website dinamis dengan HTML, CSS, JavaScript, dan framework modern." 
  },
  { 
    id: 12, 
    title: "Administrasi Infrastruktur Jaringan", 
    subtitle: "Merancang, mengkonfigurasi, dan mengelola infrastruktur jaringan komputer." 
  },
  { 
    id: 13, 
    title: "Basis Data", 
    subtitle: "Merancang dan mengelola database menggunakan MySQL, PostgreSQL, dan NoSQL." 
  },
  { 
    id: 14, 
    title: "Pemrograman Berorientasi Objek", 
    subtitle: "Mengembangkan aplikasi menggunakan konsep OOP dengan Java dan Python." 
  },
  { 
    id: 15, 
    title: "Teknologi Layanan Jaringan", 
    subtitle: "Mengimplementasikan layanan jaringan seperti DNS, DHCP, dan Web Server." 
  },
  { 
    id: 16, 
    title: "Sistem Operasi Jaringan", 
    subtitle: "Menginstalasi dan mengkonfigurasi sistem operasi server Linux dan Windows Server." 
  },
  { 
    id: 17, 
    title: "Keamanan Jaringan", 
    subtitle: "Menerapkan proteksi dan keamanan pada infrastruktur jaringan dari ancaman siber." 
  },
  { 
    id: 18, 
    title: "Pemrograman Mobile", 
    subtitle: "Membangun aplikasi mobile Android dan iOS dengan Flutter dan React Native." 
  },
];

export function MataPelajaranGrid() {
  return (
    <section className="w-full max-w-[1111px] mx-auto pt-8 sm:pt-12 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8">
      <div className="p-6 sm:p-10 space-y-12">
        
        {/* Mata Pelajaran Umum */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="w-8 h-8 text-blue-900" />
            <h3 className="text-2xl sm:text-3xl font-bold text-blue-900 leading-tight">
              Mata Pelajaran Umum
            </h3>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4">
            {mapelUmum.map((item) => (
              <div
                key={item.id}
                className="bg-blue-900 rounded-xl p-4 flex items-start gap-3 cursor-pointer hover:bg-blue-800 transition-colors duration-300"
              >
                <GraduationCap className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <h4 className="text-white text-sm font-semibold leading-tight">
                    {item.title}
                  </h4>
                  <p className="text-blue-200 text-xs mt-1 leading-snug">
                    {item.subtitle}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mata Pelajaran Jurusan */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <Code2 className="w-8 h-8 text-blue-900" />
            <h3 className="text-2xl sm:text-3xl font-bold text-blue-900 leading-tight">
              Mata Pelajaran Jurusan (SIJA)
            </h3>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4">
            {mapelJurusan.map((item) => (
              <div
                key={item.id}
                className="bg-blue-900 rounded-xl p-4 flex items-start gap-3 cursor-pointer hover:bg-blue-800 transition-colors duration-300"
              >
                <GraduationCap className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <h4 className="text-white text-sm font-semibold leading-tight">
                    {item.title}
                  </h4>
                  <p className="text-blue-200 text-xs mt-1 leading-snug">
                    {item.subtitle}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}