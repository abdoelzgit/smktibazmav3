import {
  BookOpen,
  Code2,
  Calculator,
  BookOpenCheck,
  Scale,
  Atom,
  Languages,
  Globe,
  Lightbulb,
  Palette,
  Landmark,
  PenTool,
  Network,
  Database,
  Boxes,
  Wifi,
  Terminal,
  ShieldCheck,
  Smartphone,
  LucideIcon,
} from "lucide-react";

interface MataPelajaran {
  id: number;
  title: string;
  subtitle: string;
  icon: LucideIcon;
}

const mapelUmum: MataPelajaran[] = [
  { 
    id: 1, 
    title: "Matematika", 
    subtitle: "Melatih logika, pemikiran kritis, dan pemecahan masalah matematis.",
    icon: Calculator,
  },
  { 
    id: 2, 
    title: "Pendidikan Agama Islam", 
    subtitle: "Membentuk karakter islami dan pemahaman agama yang kuat.",
    icon: BookOpenCheck,
  },
  { 
    id: 3, 
    title: "PPKN", 
    subtitle: "Menanamkan nilai-nilai Pancasila dan kewarganegaraan.",
    icon: Scale,
  },
  { 
    id: 4, 
    title: "IPAS", 
    subtitle: "Ilmu Pengetahuan Alam dan Sosial untuk memahami fenomena di sekitar.",
    icon: Atom,
  },
  { 
    id: 5, 
    title: "Bahasa Indonesia", 
    subtitle: "Mengembangkan kemampuan komunikasi lisan dan tulisan yang baik.",
    icon: Languages,
  },
  { 
    id: 6, 
    title: "Bahasa Inggris", 
    subtitle: "Meningkatkan kemampuan bahasa Inggris untuk komunikasi global.",
    icon: Globe,
  },
  { 
    id: 7, 
    title: "PKK", 
    subtitle: "Prakarya dan Kewirausahaan untuk mengembangkan jiwa entrepreneur.",
    icon: Lightbulb,
  },
  { 
    id: 8, 
    title: "Seni Budaya", 
    subtitle: "Mengembangkan kreativitas dan apresiasi terhadap seni dan budaya.",
    icon: Palette,
  },
  { 
    id: 9, 
    title: "Sejarah", 
    subtitle: "Memahami perjalanan sejarah Indonesia dan dunia.",
    icon: Landmark,
  },
];

const mapelJurusan: MataPelajaran[] = [
  { 
    id: 10, 
    title: "Desain Grafis", 
    subtitle: "Fokus pada UI/UX Design, membuat desain antarmuka yang user-friendly dan estetis.",
    icon: PenTool,
  },
  { 
    id: 11, 
    title: "Pemrograman Web", 
    subtitle: "Membangun website dinamis dengan HTML, CSS, JavaScript, dan framework modern.",
    icon: Code2,
  },
  { 
    id: 12, 
    title: "Administrasi Infrastruktur Jaringan", 
    subtitle: "Merancang, mengkonfigurasi, dan mengelola infrastruktur jaringan komputer.",
    icon: Network,
  },
  { 
    id: 13, 
    title: "Basis Data", 
    subtitle: "Merancang dan mengelola database menggunakan MySQL, PostgreSQL, dan NoSQL.",
    icon: Database,
  },
  { 
    id: 14, 
    title: "Pemrograman Berorientasi Objek", 
    subtitle: "Mengembangkan aplikasi menggunakan konsep OOP dengan Java dan Python.",
    icon: Boxes,
  },
  { 
    id: 15, 
    title: "Teknologi Layanan Jaringan", 
    subtitle: "Mengimplementasikan layanan jaringan seperti DNS, DHCP, dan Web Server.",
    icon: Wifi,
  },
  { 
    id: 16, 
    title: "Sistem Operasi Jaringan", 
    subtitle: "Menginstalasi dan mengkonfigurasi sistem operasi server Linux dan Windows Server.",
    icon: Terminal,
  },
  { 
    id: 17, 
    title: "Keamanan Jaringan", 
    subtitle: "Menerapkan proteksi dan keamanan pada infrastruktur jaringan dari ancaman siber.",
    icon: ShieldCheck,
  },
  { 
    id: 18, 
    title: "Pemrograman Mobile", 
    subtitle: "Membangun aplikasi mobile Android dan iOS dengan Flutter dan React Native.",
    icon: Smartphone,
  },
];

export function MataPelajaranGrid() {
  return (
    <section className="w-full max-w-[1111px] mx-auto pt-6 sm:pt-10 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8">
      <div className="p-4 sm:p-8 lg:p-10 space-y-12 sm:space-y-16">
        
        {/* Mata Pelajaran Umum */}
        <div>
          <div className="flex items-center justify-between mb-6 sm:mb-8 pb-3 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#132B6D]/10 text-[#132B6D]">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#132B6D] leading-tight font-heading">
                Mata Pelajaran Umum
              </h3>
            </div>
            <span className="hidden sm:inline-flex items-center text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-600">
              {mapelUmum.length} Mata Pelajaran
            </span>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4 lg:gap-5">
            {mapelUmum.map((item) => {
              const IconComponent = item.icon;
              return (
                <div
                  key={item.id}
                  className="group relative flex flex-col justify-between rounded-xl sm:rounded-2xl bg-[#132B6D] p-3.5 sm:p-5 text-white transition-all duration-300 hover:bg-[#0f2359] hover:shadow-xl hover:-translate-y-1 border border-white/10"
                >
                  <div>
                    <div className="mb-2.5 sm:mb-3.5">
                      <div className="flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-lg sm:rounded-xl bg-white/10 text-white transition-colors duration-300 group-hover:bg-white group-hover:text-[#132B6D]">
                        <IconComponent className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </div>
                    </div>

                    <h4 className="text-xs sm:text-base font-bold text-white group-hover:text-lime-300 transition-colors leading-snug">
                      {item.title}
                    </h4>
                    <p className="text-white/75 text-[11px] sm:text-sm mt-1 sm:mt-1.5 leading-relaxed">
                      {item.subtitle}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mata Pelajaran Jurusan */}
        <div>
          <div className="flex items-center justify-between mb-6 sm:mb-8 pb-3 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#132B6D]/10 text-[#132B6D]">
                <Code2 className="w-5 h-5" />
              </div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#132B6D] leading-tight font-heading">
                Mata Pelajaran Kejuruan (SIJA)
              </h3>
            </div>
            <span className="hidden sm:inline-flex items-center text-xs font-semibold px-3 py-1 rounded-full bg-[#132B6D]/10 text-[#132B6D]">
              {mapelJurusan.length} Mata Pelajaran
            </span>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4 lg:gap-5">
            {mapelJurusan.map((item) => {
              const IconComponent = item.icon;
              return (
                <div
                  key={item.id}
                  className="group relative flex flex-col justify-between rounded-xl sm:rounded-2xl bg-[#132B6D] p-3.5 sm:p-5 text-white transition-all duration-300 hover:bg-[#0f2359] hover:shadow-xl hover:-translate-y-1 border border-white/10"
                >
                  <div>
                    <div className="mb-2.5 sm:mb-3.5">
                      <div className="flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-lg sm:rounded-xl bg-white/10 text-white transition-colors duration-300 group-hover:bg-white group-hover:text-[#132B6D]">
                        <IconComponent className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </div>
                    </div>

                    <h4 className="text-xs sm:text-base font-bold text-white group-hover:text-lime-300 transition-colors leading-snug">
                      {item.title}
                    </h4>
                    <p className="text-white/75 text-[11px] sm:text-sm mt-1 sm:mt-1.5 leading-relaxed">
                      {item.subtitle}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}