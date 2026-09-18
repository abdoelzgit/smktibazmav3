import { GraduationCap } from "lucide-react";

interface MataPelajaran {
  id: number;
  title: string;
  subtitle: string;
}

const mataPelajaranData: MataPelajaran[] = [
  { id: 1, title: "Profil Sekolah", subtitle: "Kenali SMK TI BAZMA lebih dekat" },
  { id: 2, title: "Profil Sekolah", subtitle: "Kenali SMK TI BAZMA lebih dekat" },
  { id: 3, title: "Profil Sekolah", subtitle: "Kenali SMK TI BAZMA lebih dekat" },
  { id: 4, title: "Profil Sekolah", subtitle: "Kenali SMK TI BAZMA lebih dekat" },
  { id: 5, title: "Profil Sekolah", subtitle: "Kenali SMK TI BAZMA lebih dekat" },
  { id: 6, title: "Profil Sekolah", subtitle: "Kenali SMK TI BAZMA lebih dekat" },
  { id: 7, title: "Profil Sekolah", subtitle: "Kenali SMK TI BAZMA lebih dekat" },
  { id: 8, title: "Profil Sekolah", subtitle: "Kenali SMK TI BAZMA lebih dekat" },
  { id: 9, title: "Profil Sekolah", subtitle: "Kenali SMK TI BAZMA lebih dekat" },
];

export function MataPelajaranGrid() {
  return (
    <section className="w-full max-w-[1111px] mx-auto pt-8 sm:pt-12 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8">
      <div className="p-6 sm:p-10">
        <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-900 mb-8 leading-tight">
          Mata pelajaran
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {mataPelajaranData.map((item) => (
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
    </section>
  );
}