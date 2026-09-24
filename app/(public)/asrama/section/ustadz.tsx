"use client";

import React, { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface Pembina {
    id: number;
    name: string;
    role: string;
    image: string;
}

// ⚠️ DATA PLACEHOLDER — WAJIB DIGANTI!
// Nama asli, jabatan lengkap, dan path foto belum ada di instruksi kamu.
// Jangan sampai ke-deploy dengan nama "[Isi Nama...]" masih nongol.
const pembina: Pembina[] = [
    {
        id: 1,
        name: "Ahmad Rifai",
        role: "Penyelia I",
        image: "/images/asrama/penyelia/1.webp",
    },
    {
        id: 2,
        name: "Achmad Fauzi, S.Ap",
        role: "Wali Asrama",
        image: "/images/asrama/penyelia/wali.webp",
    },
    {
        id: 3,
        name: "Ratno Wijaya",
        role: "Penyelia II",
        image: "/images/asrama/penyelia/2.webp",
    },
];

const FALLBACK_IMAGE = "/images/foto.webp";

function ProfileCard({
    person,
    isMain,
}: {
    person: Pembina;
    isMain: boolean;
}) {
    const [imgSrc, setImgSrc] = useState(person.image);

    return (
        <div
            className={cn(
                "flex flex-col items-center text-center w-full",
                // Offset vertikal HANYA di desktop, dihilangkan di mobile (sesuai instruksi)
                isMain && "lg:-translate-y-9"
            )}
        >
            <div
                className={cn(
                    "group relative w-full max-w-[220px] sm:max-w-[240px] overflow-hidden rounded-2xl bg-slate-100",
                    "aspect-[3/4]", // rasio portrait seragam
                    isMain && "lg:max-w-[260px]" // sedikit lebih besar, subtle
                )}
            >
                <Image
                    src={imgSrc}
                    alt={person.name}
                    fill
                    onError={() => {
                        if (imgSrc !== FALLBACK_IMAGE) setImgSrc(FALLBACK_IMAGE);
                    }}
                    sizes="(max-width: 1024px) 40vw, 260px"
                    className="object-cover grayscale-[15%] transition-all duration-500 ease-out group-hover:grayscale-0 group-hover:scale-105"
                />
            </div>

            <h3 className="mt-4 text-base sm:text-lg font-bold text-[#132B6D] font-heading">
                {person.name}
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-slate-500">{person.role}</p>
        </div>
    );
}

export default function Ustadz() {
    return (
        <section
            id="pembina-asrama"
            data-nav-theme="light"
            className="relative w-full bg-white py-12 sm:py-16 px-4 sm:px-6 lg:px-8"
        >
            <div className="mx-auto max-w-5xl w-full">
                {/* Judul */}
                <div className="text-center mb-8 sm:mb-12">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#132B6D] font-heading">
                        Tim Asrama
                    </h2>
                    <p className="mt-3 text-sm sm:text-base text-slate-500 max-w-md mx-auto">
                        Membimbing, mendampingi, dan membentuk karakter santri.
                    </p>
                </div>

                {/* Grid profil:
            - Desktop (lg+): 3 kolom horizontal, item tengah punya offset -translate-y
            - Mobile/tablet: grid rapi tanpa offset, sesuai instruksi responsivitas */}
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-6 lg:gap-x-8 items-start lg:items-end">
                    {/* Penyelia 1 */}
                    <div className="col-span-1">
                        <ProfileCard person={pembina[0]} isMain={false} />
                    </div>

                    {/* Wali Asrama — di mobile ditaruh full width baris pertama biar jadi fokus,
              di desktop otomatis ke tengah karena urutan grid 3 kolom */}
                    <div className="col-span-2 lg:col-span-1 lg:order-none order-first">
                        <ProfileCard person={pembina[1]} isMain={true} />
                    </div>

                    {/* Penyelia 2 */}
                    <div className="col-span-1">
                        <ProfileCard person={pembina[2]} isMain={false} />
                    </div>
                </div>
            </div>
        </section>
    );
}