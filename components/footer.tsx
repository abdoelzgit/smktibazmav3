'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { MessageCircle, MapPin, Phone, Mail } from 'lucide-react';
import { BlurFade } from './ui/blur-fade';

type FooterLink = {
  label: string;
  href: string;
  external?: boolean;
};

type FooterColumn = {
  title: string;
  links: FooterLink[];
};

const footerColumns: FooterColumn[] = [
  {
    title: 'Beranda',
    links: [
      { label: 'Sambutan', href: '/#sambutan' },
      { label: 'Jurusan', href: '/#jurusan' },
      { label: 'Prestasi', href: '/#prestasi' },
      { label: 'Galeri', href: '/#galeri' },
      { label: 'Mitra', href: '/#mitra' },
    ],
  },
  {
    title: 'Tentang Kami',
    links: [
      { label: 'Profil Sekolah', href: '/about' },
      { label: 'Akreditasi', href: '/akreditasi' },
      { label: 'Kontak', href: '/kontak' },
    ],
  },
  {
    title: 'Berita',
    links: [
      { label: 'Terbaru', href: '/berita/terbaru' },
      { label: 'Terpopuler', href: '/berita/terpopuler' },
    ],
  },
  {
    title: 'Portofolio',
    links: [
      { label: 'Catalog Talent', href: 'https://best.smktibazma.com/', external: true },
      { label: 'Smart PKL', href: 'https://smartpkl.smktibazma.com', external: true },
      { label: 'Sesama', href: '/portofolio/sesama' },
    ],
  },
  {
    title: 'SPMB',
    links: [
      { label: 'Alur Pendaftaran', href: '/spmb/alur' },
      { label: 'Formulir', href: '/spmb/formulir' },
      { label: 'Jadwal', href: '/spmb/jadwal' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="w-full overflow-hidden bg-[#102a63] text-white">
      <BlurFade delay={0.25 * 2} inView>
        <div className="mx-auto w-full max-w-[1600px] px-4 py-9 sm:px-6 md:px-8 lg:px-16">
          {/* Bagian atas */}
          <div className="flex flex-col md:flex-row justify-between gap-8">
            {/* Logo + info */}
            <div className="mb-4 md:mb-0 max-w-sm">
              <Image src="/logo.png" width={150} height={48} alt="Logo" loading="lazy" />
              <h1 className="text-lg font-bold mb-3 mt-2">ENERGI MASA DEPAN INDONESIA</h1>
              <ul className="flex flex-col gap-2">
                <li className="flex items-center gap-2">
                  <MapPin size={18} />
                  <span className="text-white font-light text-[14px]">Jl. Raya Cikampak Cicadas</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone size={18} />
                  <span className="text-white font-light text-[14px]">+62 821 2183 1439</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail size={18} />
                  <span className="text-white font-light text-[14px]">infosmktibazma@gmail.com</span>
                </li>
              </ul>
            </div>

            {/* Link sections */}
            <div className="flex flex-wrap gap-10 md:gap-16">
              {footerColumns.map((column) => (
                <div key={column.title}>
                  <h2 className="text-lg font-semibold mb-3">{column.title}</h2>
                  <ul className="flex flex-col gap-3">
                    {column.links.map((link) => (
                      <li key={link.label}>
                        <Link
                          href={link.href}
                          target={link.external ? '_blank' : undefined}
                          rel={link.external ? 'noopener noreferrer' : undefined}
                          className="text-white font-light text-[14px] hover:text-gray-400 transition-colors"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Divider (shadcn/ui Separator) */}
          <Separator className="my-6 bg-white/20" />

          {/* Bagian bawah */}
          <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left pb-9">
            <p className="text-sm">&copy; {new Date().getFullYear()} SMK TI BAZMA. All rights reserved.</p>
            <div className="flex gap-4">
              <Link href="https://wa.me/6282121831439" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
                <MessageCircle color="white" size={20} />
              </Link>
              
            </div>
          </div>
        </div>
      </BlurFade>
      <div className="grid h-5 w-full grid-cols-3">
        <div className="bg-[#102a63]"></div>
        <div className="bg-[#7cb342]"></div>
        <div className="bg-[#d94b3d]"></div>
      </div>
    </footer>
  );
}
