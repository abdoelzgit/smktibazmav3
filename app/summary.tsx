import { Button } from "@/components/ui/button";
import { TextReveal } from "@/components/ui/text-reveal";
import { ArrowRight } from "lucide-react";
import LogoMarquee, { type Logo } from "@/components/marquee";
import { AnimatedCounter } from "@/components/animated-counter";

// ─── Types ──────────────────────────────────────────────────────────────────
type Stat = {
  value: string;
  label: string;
};

export type SambutanProps = {
  label?: string;
  quote?: string;
  author?: string;
  tagline?: string;
  description?: string;
  ctaLabel?: string;
  onCtaClick?: () => void;
};

export type InfoSekilasProps = {
  image?: string;
  title?: string;
  subtitle?: string;
  stats?: Stat[];
  partnerLogos?: Logo[];
};

const defaultPartnerLogos: Logo[] = [
  { src: "/images/logo.png", alt: "SMK TI BAZMA", width: 150, height: 48 },
  {
    src: "/images/logo-secondary.png",
    alt: "SMK TI BAZMA Secondary",
    width: 150,
    height: 48,
  },
  {
    src: "/images/logo.png",
    alt: "BAZMA Learning Ecosystem",
    width: 150,
    height: 48,
  },
  {
    src: "/images/logo-secondary.png",
    alt: "BAZMA Boarding School",
    width: 150,
    height: 48,
  },
];

// ─── Section: Sambutan Kepala Sekolah ──────────────────────────────────────
export function Sambutan({
  label = "Sambutan Kepala Sekolah",
  quote = `SMK TI BAZMA adalah Islamic Boarding School berbasis teknologi yang memadukan pendidikan IT, tahfidzul Qur'an, dan pembentukan karakter.`,
  author = "Ahmad Dahlan S.Ag., S.Q",
  tagline = `#Energi masa depan Indonesia,\n jago IT pinter ngaji`,
  description = "Program pendidikan 4 tahun dengan beasiswa 100% bagi dhuafa, dirancang untuk membekali siswa dengan kompetensi teknologi, dan karakter islami.",
  ctaLabel = "Lebih lengkap",
  onCtaClick,
}: SambutanProps) {
  return (
    <section data-nav-theme="light" className="relative w-full">
      <div className="mx-auto w-full max-w-[1920px] px-6 py-16 sm:px-10 sm:py-20 lg:px-16 xl:px-24">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[180px_1fr] lg:gap-12">
          <div className="lg:pt-2">
            <p className="text-sm font-heading font-bold leading-snug tracking-wide text-blue-950">
              {label}
            </p>
          </div>

          <div className="">
            <blockquote className="text-3xl font-medium leading-tight text-neutral-800 sm:text-4xl lg:text-[2.75rem]">
              <TextReveal textClassName="p-0 text-3xl font-medium leading-tight text-neutral-800 sm:text-4xl lg:text-[2.75rem]">
                {quote}
              </TextReveal>
            </blockquote>
            <p className="mt-6 text-base text-neutral-500">— {author}</p>
          </div>
        </div>

        <div className="mt-14 border-t border-blue-950/15" />

        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[180px_1fr] lg:gap-12">
          <div />

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_auto] lg:items-start lg:gap-16">
            <p className="whitespace-pre-line text-sm uppercase font-medium leading-snug text-foreground/40 sm:text-md">
              {tagline}
            </p>

            <div className="max-w-xs">
              <p className="text-sm leading-relaxed text-justify text-neutral-500">
                {description}
              </p>
              <Button
                variant="outline"
                onClick={onCtaClick}
                className="mt-5 rounded-full border-blue-950 text-blue-950 hover:bg-blue-950 hover:text-white"
              >
                {ctaLabel}
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Section: Info Sekilas + Partner Logos (digabung) ─────────────────────
export function InfoSekilas({
  image = "/images/info-cover.webp",
  title = "Informasi Sekilas",
  subtitle = "Jumlah Siswa & Guru",
  stats = [
    { value: "100", label: "Jumlah Seluruh Siswa" },
    { value: "30", label: "Jumlah Seluruh Tendik" },
    { value: "6", label: "Jumlah Angkatan" },
  ],
  partnerLogos = defaultPartnerLogos,
}: InfoSekilasProps) {
  return (
    <section className="relative w-full">
      {/* Container 1: kartu gambar + statistik */}
      <div className="mx-auto w-full max-w-[1920px] px-6 sm:px-10 lg:px-16 xl:px-24">
        <div className="relative overflow-hidden rounded-3xl">
          <img
            src={image}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-[#0a0e27]/80" />

          <div className="relative px-8 py-10 sm:px-12 sm:py-16">
            <h3 className="mb-4 text-xl font-semibold text-white sm:text-2xl">
              {title}
            </h3>
            <p className="py-4 mt-1 text-sm text-white/70">{subtitle}</p>

            <div className="mt-10 grid grid-cols-3 gap-6">
              {stats.map((stat, index) => (
                <div key={`${stat.label}-${index}`}>
                  <p className="text-3xl font-semibold text-white sm:text-4xl">
                    <AnimatedCounter value={stat.value} />
                  </p>
                  <p className="mt-1 text-xs text-white/70 sm:text-sm">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 h-px w-full bg-gradient-to-r from-lime-400 to-yellow-300" />
          </div>
        </div>
      </div>

      {/* Container 2: logo marquee, terpisah dari kartu gambar */}
      <div className="mt-10 px-24 overflow-hidden py-5">
        <LogoMarquee logos={partnerLogos} className="max-w-none py-1" />
      </div>
    </section>
  );
}
