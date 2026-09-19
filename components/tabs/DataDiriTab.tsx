"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";

export default function DataDiriTab() {
  const [gender, setGender] = useState("Laki-laki");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setPhotoPreview((currentPreview) => {
      if (currentPreview) {
        URL.revokeObjectURL(currentPreview);
      }

      return URL.createObjectURL(file);
    });
  };

  return (
    <div>
      <div className="mb-6">
        <span className="bg-[#1e3a8a] text-white px-5 py-2 rounded-lg font-semibold text-base shadow-sm inline-block">
          Data Diri
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Upload Foto */}
        <div className="lg:col-span-4 border border-gray-300 rounded-2xl p-6 flex flex-col items-center justify-center bg-white shadow-sm">
          <h3 className="font-bold text-gray-800 text-lg mb-4">Foto Formal</h3>
          <div className="relative w-40 h-48 bg-gray-200 rounded-md overflow-hidden mb-6 flex items-center justify-center border">
            {photoPreview ? (
              <Image src={photoPreview} alt="Preview foto formal" fill unoptimized className="object-cover" />
            ) : (
              <span className="text-gray-400 text-sm">Preview Foto</span>
            )}
          </div>
          <label className="border-2 border-gray-800 text-gray-800 font-semibold px-6 py-2 rounded-full cursor-pointer hover:bg-gray-100 transition-colors text-sm">
            Unggah Foto
            <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
          </label>
        </div>

        {/* Input Form Data Diri */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">Nama Lengkap</label>
            <input type="text" placeholder="Masukkan nama lengkap" className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">Email</label>
            <input type="email" placeholder="Masukkan email" className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">Tempat lahir</label>
            <input type="text" placeholder="Masukkan tempat lahir" className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">No Hp</label>
            <input type="text" placeholder="Masukkan nomor handphone" className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">Tanggal Lahir</label>
            <input type="text" placeholder="Masukkan tanggal lahir" className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">No HP Orang Tua</label>
            <input type="text" placeholder="Masukkan nomor handphone orang tua" className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">Jenis kelamin</label>
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="gender" value="Laki-laki" checked={gender === "Laki-laki"} onChange={() => setGender("Laki-laki")} className="w-4 h-4 text-blue-900 border-gray-400" />
                <span>Laki-laki</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="gender" value="Perempuan" checked={gender === "Perempuan"} onChange={() => setGender("Perempuan")} className="w-4 h-4 text-blue-900 border-gray-400" />
                <span>Perempuan</span>
              </label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">NIK</label>
            <input type="text" placeholder="Masukkan NIK" className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
      </div>
    </div>
  );
}