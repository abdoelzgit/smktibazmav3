import Image from "next/image";
import { MapPin, Phone, Mail } from "lucide-react";
import { PortalLink } from "@/components/portal-transition";

type FooterLink = {
  label: string;
  href: string;
  external?: boolean;
};

type FooterColumn = {
  title: string;
  href?: string;
  links?: FooterLink[];
};

const footerColumns: FooterColumn[] = [

  {
    title: "Tentang",
    links: [
      { label: "Profil Sekolah", href: "/sekolah" },
      { label: "Profil Jurusan", href: "/profil-jurusan" },
      { label: "Akreditasi", href: "/akreditasi" },
      { label: "Asrama", href: "/asrama" },
    ],
  },
  {
    title: "Program",
    links: [
      { label: "Ekstrakurikuler", href: "/ekstrakulikuler" },
      { label: "Mitra", href: "/mitra" },
    ],
  },
  {
    title: "Informasi",
    links: [
      { label: "Berita", href: "/berita" },
      { label: "Jejak Karya", href: "/jejak-karya" },
    ],
  },
  {
    title: "Portofolio",
    links: [
      { label: "Catalog Talent", href: "https://best.smktibazma.com/", external: true },
      { label: "Smart PKL", href: "https://smartpkl.smktibazma.com", external: true },
      { label: "Sesama", href: "/#karya" },
    ],
  },
  {
    title: "SPMB",
    href: "/spmb",
  },
];

export default function Footer() {
  return (
    <footer className="w-full overflow-hidden bg-[#132B6D] text-white">
      <div className="mx-auto w-full max-w-[1920px] px-6 pt-14 pb-10 sm:px-10 lg:px-16 lg:pt-16 xl:px-24">
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_auto] lg:gap-16">
          {/* Left Side: Logo, Tagline & Contact */}
          <div className="max-w-md">
            <PortalLink href="/" label="SMK TI BAZMA" className="inline-block cursor-pointer">
              <Image
                src="/images/logo-secondary.png"
                width={240}
                height={70}
                alt="SMK TI BAZMA"
                priority
                className="h-14 w-auto object-contain"
              />
            </PortalLink>

            <h2 className="mt-8 text-2xl font-bold tracking-wider text-white sm:text-3xl">
              ENERGI MASA DEPAN INDONESIA
            </h2>

            <ul className="mt-8 space-y-3.5 text-sm font-normal text-white/85">
              <li className="flex items-center gap-3">
                <MapPin size={18} className="shrink-0 text-white/90" />
                <span>Jl. Raya Cikampak Cicadas</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="shrink-0 text-white/90" />
                <span>+62 821 2183 1439</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="shrink-0 text-white/90" />
                <span>infosmktibazma@gmail.com</span>
              </li>
            </ul>
          </div>

          {/* Right Side: Navigation Columns */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5 lg:gap-10 xl:gap-14">
            {footerColumns.map((column) => (
              <div key={column.title}>
                {column.href ? (
                  <PortalLink
                    href={column.href}
                    label={column.title}
                    className="font-sans text-base font-bold text-white hover:text-white/80 transition-colors cursor-pointer"
                  >
                    {column.title}
                  </PortalLink>
                ) : (
                  <h3 className="font-sans text-base font-bold text-white">
                    {column.title}
                  </h3>
                )}

                {column.links && column.links.length > 0 && (
                  <ul className="mt-4 space-y-3">
                    {column.links.map((link) => (
                      <li key={link.label}>
                        {link.external ? (
                          <a
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-sans text-sm font-normal text-white/80 hover:text-white transition-colors duration-200"
                          >
                            {link.label}
                          </a>
                        ) : (
                          <PortalLink
                            href={link.href}
                            label={link.label}
                            className="font-sans text-sm font-normal text-white/80 hover:text-white transition-colors duration-200 cursor-pointer"
                          >
                            {link.label}
                          </PortalLink>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar: Copyright & Divider Line */}
        <div className="mt-14 flex flex-col items-start gap-4 pt-6 md:flex-row md:items-center">
          <p className="shrink-0 font-sans text-xs font-normal text-white/80 sm:text-sm">
            &copy; {new Date().getFullYear()} SMK TI BAZMA. All rights reserved.
          </p>
          <div className="h-px w-full bg-white/20" />
        </div>
      </div>

      {/* Bottom Color Accent Strip (Matching Brand colors: Blue, Lime Green, Red) */}
      <div className="grid h-3.5 w-full grid-cols-3">
        <div className="bg-[#0088ce]" />
        <div className="bg-[#99cc33]" />
        <div className="bg-[#ed1c24]" />
      </div>
    </footer>
  );
}
