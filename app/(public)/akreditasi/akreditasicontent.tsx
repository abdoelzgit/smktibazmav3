export function AkreditasiContent() {
  return (
    <section className="w-full max-w-[1111px] mx-auto py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
      <div className="space-y-12">
        <div className="p-6 sm:p-10">
          
          {/* Ukuran font dan spacing heading disamakan dengan Summary */}
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-900 mb-6 leading-tight">
            Akreditasi
          </h2>

          {/* Ukuran font, line-height, dan spacing paragraf disamakan dengan Summary */}
          <div className="space-y-4 text-lg sm:text-xl text-gray-600 leading-loose text-justify">
            <p>
              SMK TI Bazma dengan bangga telah meraih Akreditasi &quot;A&quot; (Unggul) dari
              Badan Akreditasi Nasional Sekolah/Madrasah (BAN-S/M). Pencapaian ini
              menjadi bukti nyata komitmen kami dalam menghadirkan pendidikan
              berkualitas, berstandar nasional, dan berorientasi pada pengembangan
              karakter serta kompetensi peserta didik.
            </p>
            <p>
              Akreditasi &quot;A&quot; menunjukkan bahwa seluruh aspek sekolah – mulai dari
              kurikulum, tenaga pendidik, sarana prasarana, manajemen, hingga capaian
              lulusan – telah memenuhi kriteria mutu tertinggi. Kami terus berinovasi
              untuk mempertahankan dan meningkatkan kualitas layanan pendidikan, agar
              dapat mencetak lulusan yang kompeten, berakhlak mulia, dan siap bersaing
              di dunia kerja maupun perguruan tinggi.
            </p>
          </div>

          {/* Ukuran font blockquote disesuaikan agar seimbang dengan paragraf */}
          <blockquote className="border-l-4 border-blue-900 pl-4 italic text-blue-900/80 mt-8 text-lg sm:text-xl leading-loose">
            &quot;Predikat Akreditasi A bukan akhir dari perjalanan, tetapi langkah awal
            untuk terus berbenah menuju sekolah unggulan berkelas nasional dan
            global.&quot;
          </blockquote>

        </div>
      </div>
    </section>
  );
}