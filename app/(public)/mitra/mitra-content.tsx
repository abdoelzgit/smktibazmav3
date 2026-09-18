export function MitraContent() {
  return (
    // GANTI py-16 sm:py-24 menjadi pt-16 sm:pt-24 pb-4 
    // (pt = padding top, pb = padding bottom. Ubah pb-4 jadi pb-0 jika ingin benar-benar mepet)
    <section className="w-full max-w-[1111px] mx-auto pt-16 sm:pt-24 pb-4 px-4 sm:px-6 lg:px-8">
      
      <div className="p-6 sm:p-10">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-900 mb-6 leading-tight">
          Kemitraan SMK TI BAZMA
        </h2>

        <div className="space-y-4 text-lg sm:text-xl text-gray-600 leading-loose text-justify">
          <p>
            SMK TI BAZMA didukung oleh berbagai mitra strategis yang berperan dalam
            mendukung pengembangan pendidikan, teknologi, dan kompetensi siswa.
            Kolaborasi bersama Pertamina Group dan BAZMA menjadi bagian penting dalam
            menciptakan lingkungan pendidikan yang berorientasi pada teknologi,
            karakter, dan kesiapan menghadapi dunia industri.
          </p>
        </div>
      </div>
      
    </section>
  );
}