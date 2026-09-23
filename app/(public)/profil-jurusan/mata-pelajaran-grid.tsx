import {
  Code2,
  PenTool,
  Network,
  Database,
  Wifi,
  Terminal,
  ShieldCheck,
  LucideIcon,
} from "lucide-react";

interface MataPelajaran {
  id: number;
  title: string;
  subtitle: string;
  icon: LucideIcon;
}

const mapelJurusan: MataPelajaran[] = [
  { 
    id: 1, 
    title: "Desain Grafis", 
    subtitle: "Fokus pada UI/UX Design, membuat desain antarmuka yang user-friendly dan estetis.",
    icon: PenTool,
  },
  { 
    id: 2, 
    title: "Pemrograman Web", 
    subtitle: "Membangun website dinamis dengan HTML, CSS, JavaScript, dan framework modern.",
    icon: Code2,
  },
  { 
    id: 3, 
    title: "Administrasi Infrastruktur Jaringan", 
    subtitle: "Merancang, mengkonfigurasi, dan mengelola infrastruktur jaringan komputer.",
    icon: Network,
  },
  { 
    id: 4, 
    title: "Basis Data", 
    subtitle: "Merancang dan mengelola database menggunakan MySQL, PostgreSQL, dan NoSQL.",
    icon: Database,
  },
  { 
    id: 5, 
    title: "Teknologi Layanan Jaringan", 
    subtitle: "Mengimplementasikan layanan jaringan seperti DNS, DHCP, dan Web Server.",
    icon: Wifi,
  },
  { 
    id: 6, 
    title: "Sistem Operasi Jaringan", 
    subtitle: "Menginstalasi dan mengkonfigurasi sistem operasi server Linux dan Windows Server.",
    icon: Terminal,
  },
  { 
    id: 7, 
    title: "Keamanan Jaringan", 
    subtitle: "Menerapkan proteksi dan keamanan pada infrastruktur jaringan dari ancaman siber.",
    icon: ShieldCheck,
  },
];

function MapelCard({ item }: { item: MataPelajaran }) {
  const IconComponent = item.icon;
  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-xl sm:rounded-2xl bg-primary p-4 sm:p-5 text-primary-foreground transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-xl hover:shadow-primary/30 border border-white/10 hover:border-white/25 hover:bg-primary/95">
      {/* Ambient glow effect on hover */}
      <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/5 blur-2xl transition-all duration-500 group-hover:scale-150 group-hover:bg-white/10" />
      
      <div className="relative z-10">
        <div className="mb-3 sm:mb-4">
          <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg sm:rounded-xl bg-white/10 text-white transition-all duration-300 group-hover:scale-110 group-hover:bg-white group-hover:text-primary group-hover:shadow-md">
            <IconComponent className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        <h4 className="text-xs sm:text-base font-bold text-white group-hover:text-sky-200 transition-colors duration-300 leading-snug">
          {item.title}
        </h4>
        <p className="text-white/80 group-hover:text-white/95 text-[11px] sm:text-sm mt-1 sm:mt-1.5 leading-relaxed transition-colors duration-300">
          {item.subtitle}
        </p>
      </div>

      {/* Subtle bottom border glow on hover */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-sky-400/0 to-transparent transition-all duration-500 group-hover:via-sky-400/60" />
    </div>
  );
}

export function MataPelajaranGrid() {
  return (
    <section className="w-full max-w-[1111px] mx-auto pt-6 sm:pt-10 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8">
      <div className="p-4 sm:p-8 lg:p-10 space-y-12 sm:space-y-16">
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
            {mapelJurusan.map((item) => (
              <MapelCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}