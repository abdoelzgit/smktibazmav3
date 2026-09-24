import Image from "next/image";
import { StaffMember } from "./types";

interface StaffCardProps {
  member: StaffMember;
}

export function StaffCard({ member }: StaffCardProps) {
  return (
    <div className="flex flex-col w-full max-w-[320px] select-none">
      {/* Container Foto Portrait */}
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-slate-100">
        {member.image ? (
          <Image
            src={member.image}
            alt={member.name}
            fill
            sizes="(max-width: 768px) 100vw, 400px"
            className="object-cover object-center"
            priority={false}
          />
        ) : (
          /* Neutral professional portrait placeholder silhouette */
          <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-b from-slate-100 via-slate-200 to-slate-300 text-slate-400">
            <svg
              className="h-24 w-24 sm:h-28 sm:w-28 text-slate-300 drop-shadow-sm"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}

        {/* Gradient halus biru tua transparan hanya di bagian bawah foto */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#132B6D]/50 via-[#132B6D]/15 to-transparent"
          aria-hidden="true"
        />
      </div>

      {/* Informasi Nama & Jabatan tepat di bawah foto */}
      <div className="mt-4 sm:mt-5 flex flex-col">
        <h4 className="line-clamp-1 text-lg sm:text-xl font-bold text-[#132B6D] tracking-tight">
          {member.name}
        </h4>
        <p className="mt-1.5 sm:mt-2 line-clamp-2 text-sm sm:text-base font-normal text-slate-500 leading-snug">
          {member.role}
        </p>
      </div>
    </div>
  );
}
