"use client";

import Image from "next/image";
import {
  ProgressSlider,
  SliderContent,
  SliderWrapper,
  SliderBtnGroup,
  SliderBtn,
} from "@/components/ui/progressive-carousel";

// Komponen Logo Mitra (SVG yang kamu berikan)
const PartnerLogo = () => (
  <svg
    className="w-8 h-8 md:w-10 md:h-10 text-[#033CCE] flex-shrink-0"
    viewBox="0 0 268 40"
    xmlns="http://www.w3.org/2000/svg"
    fill="currentColor"
  >
    <g id="logotype">
      <path d="M258.058 30.0948V17.2065C258.058 16.8351 257.723 16.5008 257.352 16.5008H256.869C256.572 16.5008 256.312 16.6865 256.2 16.9465L251.706 27.5692C251.075 29.1291 249.552 30.0948 247.881 30.0948C246.209 30.0948 244.724 29.1291 244.092 27.5692L239.561 16.9465C239.487 16.6865 239.227 16.5008 238.929 16.5008H238.447C238.075 16.5008 237.741 16.8351 237.741 17.2065V30.0948H233.544V17.2065C233.544 14.4952 235.735 12.2666 238.447 12.2666H238.929C240.898 12.2666 242.681 13.4552 243.461 15.3123L247.881 25.7863L252.301 15.3123C253.081 13.4552 254.863 12.2666 256.869 12.2666H257.352C260.063 12.2666 262.255 14.4952 262.255 17.2065V30.0948H258.058ZM214.388 30.0948C210.117 30.0948 206.662 26.6406 206.662 22.3693V12.2666H210.859V22.3693C210.859 24.3007 212.456 25.8978 214.388 25.8978H223.302C225.233 25.8978 226.83 24.3007 226.83 22.3693V12.2666H231.027V22.3693C231.027 26.6406 227.573 30.0948 223.302 30.0948H214.388ZM198.93 25.8978C199.636 25.8978 200.23 25.3035 200.23 24.5978C200.23 23.8921 199.673 23.335 199.004 23.2978H189.087C186.042 23.2978 183.59 20.8465 183.59 17.8008C183.59 14.7552 186.042 12.2666 189.087 12.2666H204.464V16.5008H189.087C188.382 16.5008 187.787 17.0951 187.787 17.8008C187.787 18.5065 188.382 19.1008 189.087 19.1008H199.078C202.05 19.1751 204.464 21.5893 204.464 24.5978C204.464 27.6434 201.976 30.0948 198.93 30.0948H183.59V25.8978H198.93ZM160.022 30.0948V17.2065C160.022 14.4952 162.213 12.2666 164.924 12.2666H175.733C179.224 12.2666 182.047 15.1266 182.047 18.6179C182.047 22.1093 179.224 24.9692 175.733 24.9692H164.219V30.0948H160.022ZM164.219 17.2065V20.735H175.733C176.884 20.735 177.85 19.7693 177.85 18.6179C177.85 17.4665 176.884 16.5008 175.733 16.5008H164.924C164.553 16.5008 164.219 16.8351 164.219 17.2065ZM152.952 12.2666H157.149V30.0948H152.952V12.2666ZM141.833 25.8978C144.433 25.8978 146.55 23.7807 146.55 21.1807C146.55 18.6179 144.433 16.5008 141.833 16.5008H135.296C132.696 16.5008 130.579 18.6179 130.579 21.1807C130.579 23.7807 132.696 25.8978 135.296 25.8978H141.833ZM141.833 12.2666C146.773 12.2666 150.747 16.278 150.747 21.1807C150.747 26.1206 146.773 30.0948 141.833 30.0948H135.296C130.356 30.0948 126.382 26.1206 126.382 21.1807C126.382 16.278 130.356 12.2666 135.296 12.2666H141.833ZM110.051 30.0948C105.112 30.0948 101.137 26.1206 101.137 21.1807C101.137 16.278 105.112 12.2666 110.051 12.2666H122.94V16.5008H110.051C107.451 16.5008 105.334 18.6179 105.334 21.1807C105.334 23.7807 107.451 25.8978 110.051 25.8978H119.523C120.228 25.8978 120.823 25.3035 120.823 24.5978C120.823 23.8921 120.228 23.2978 119.523 23.2978H109.346V19.1008H119.523C122.568 19.1008 125.057 21.5522 125.057 24.5978C125.057 27.6434 122.568 30.0948 119.523 30.0948H110.051ZM90.8356 25.8978C93.4355 25.8978 95.5526 23.7807 95.5526 21.1807C95.5526 18.6179 93.4355 16.5008 90.8356 16.5008H84.2986C81.6986 16.5008 79.5816 18.6179 79.5816 21.1807C79.5816 23.7807 81.6986 25.8978 84.2986 25.8978H90.8356ZM90.8356 12.2666C95.7755 12.2666 99.7497 16.278 99.7497 21.1807C99.7497 26.1206 95.7755 30.0948 90.8356 30.0948H84.2986C79.3587 30.0948 75.3845 26.1206 75.3845 21.1807C75.3845 16.278 79.3587 12.2666 84.2986 12.2666H90.8356ZM58.1971 25.192C58.1971 25.5635 58.5313 25.8977 58.9027 25.8977H74.6138V30.0948H58.9027C56.1914 30.0948 54 27.9034 54 25.192V12.1552H58.1971V25.192ZM267.365 12.1552C267.365 13.3455 266.4 14.3104 265.21 14.3104C264.02 14.3104 263.055 13.3455 263.055 12.1552C263.055 10.9649 264.02 10 265.21 10C266.4 10 267.365 10.9649 267.365 12.1552Z" />
    </g>
    <g id="logomark">
      <path d="M16.3662 34.0674C16.7359 35.7784 18.2495 37 20 37C21.7505 37 23.2641 35.7784 23.6338 34.0674L23.8643 33H35.1982C31.5301 37.2844 26.0824 40 20 40C13.9176 40 8.46992 37.2844 4.80176 33H16.1357L16.3662 34.0674Z" />
      <path d="M14.8389 27H25.1611L26.2412 22H39.9004C39.6525 24.4971 38.9451 26.8588 37.8643 29H2.13574C1.05487 26.8588 0.347551 24.4971 0.0996094 22H13.7588L14.8389 27Z" />
      <path d="M12.4619 16H27.5381L28.6182 11H40V18H0V11H11.3818L12.4619 16Z" />
      <path d="M0.738281 0C4.29632 0.213097 7.45893 2.11968 9.33789 5H30.708C32.6244 2.11683 35.8152 0.212879 39.3994 0H40V7H0V0H0.738281Z" />
    </g>
  </svg>
);

const partners = [
  {
    id: "pertamina-group",
    name: "Pertamina Group",
    desc: "Kolaborasi strategis dalam pengembangan energi terbarukan dan program magang bersertifikat untuk mempersiapkan talenta digital masa depan.",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "ptc",
    name: "Pertamina Training & Consulting",
    desc: "Pengembangan kurikulum berbasis industri dan pelatihan sertifikasi kompetensi yang diakui secara nasional dan internasional.",
    image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "pertamina-retail",
    name: "Pertamina Retail",
    desc: "Implementasi sistem manajemen ritel modern dan program kewirausahaan bagi siswa untuk mengasah jiwa bisnis sejak dini.",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "shared-services",
    name: "Shared Services",
    desc: "Integrasi teknologi informasi dan pusat layanan bersama untuk optimalisasi operasional dan digitalisasi proses belajar mengajar.",
    image: "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=1200&q=80",
  },
];

export function MitraShowcase() {
  return (
    <section className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-4">
          Kolaborasi Nyata
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Lihat bagaimana kemitraan kami membentuk ekosistem pendidikan yang relevan dengan kebutuhan industri saat ini.
        </p>
      </div>

      <ProgressSlider 
        vertical={false} 
        activeSlider={partners[0].id}
        duration={6000} // 6 detik per slide
        className="w-full"
      >
        <SliderContent className="relative w-full aspect-[16/9] md:aspect-[21/9] rounded-2xl overflow-hidden shadow-2xl bg-gray-100">
          {partners.map((partner) => (
            <SliderWrapper key={partner.id} value={partner.id}>
              <div className="relative w-full h-full">
                <Image
                  src={partner.image}
                  alt={partner.name}
                  fill
                  className="object-cover"
                  priority
                />
                {/* Gradient Overlay agar teks terbaca */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                {/* Teks di atas gambar (Opsional, untuk efek overlapping yang lebih dramatis) */}
                <div className="absolute bottom-0 left-0 p-6 md:p-10 text-white max-w-2xl">
                  <div className="flex items-center gap-3 mb-3">
                    <PartnerLogo />
                    <h3 className="text-2xl md:text-3xl font-bold">{partner.name}</h3>
                  </div>
                  <p className="text-gray-200 text-sm md:text-base leading-relaxed line-clamp-2 md:line-clamp-none">
                    {partner.desc}
                  </p>
                </div>
              </div>
            </SliderWrapper>
          ))}
        </SliderContent>

        {/* Navigasi / Progress Bar di Bawah */}
        <SliderBtnGroup className="mt-6">
          {partners.map((partner) => (
            <SliderBtn
              key={partner.id}
              value={partner.id}
              className="h-auto"
              progressBarClass="bg-blue-900/20 h-full"
            >
              <div className="flex items-center gap-3 mb-2">
                <PartnerLogo />
                <span className="font-bold text-gray-900 text-sm md:text-base line-clamp-1">
                  {partner.name}
                </span>
              </div>
              <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                {partner.desc}
              </p>
            </SliderBtn>
          ))}
        </SliderBtnGroup>
      </ProgressSlider>
    </section>
  );
}