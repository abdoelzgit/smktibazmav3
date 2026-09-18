"use client";

import React, { useState } from "react";

export default function DataDiriTab() {
  const [gender, setGender] = useState("Laki-laki");

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
          <div className="w-40 h-48 bg-gray-200 rounded-md overflow-hidden mb-6 flex items-center justify-center border">
            <span className="text-gray-400 text-sm">Preview Foto</span>
          </div>
          <label className="border-2 border-gray-800 text-gray-800 font-semibold px-6 py-2 rounded-full cursor-pointer hover:bg-gray-100 transition-colors text-sm">
            Unggah Foto
            <input type="file" accept="image/*" className="hidden" />
          </label>
        </div>

        {/* Input Form Data Diri */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">Nama Lengkap</label>
            <input type="text" defaultValue="Muhammad Taqyg Abdurahman Khirom" className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">Email</label>
            <input type="email" defaultValue="taqy@gmail.com" className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">Tempat lahir</label>
            <input type="text" defaultValue="Ciomas, Bogor" className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">No Hp</label>
            <input type="text" defaultValue="+6281314515626" className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">Tanggal Lahir</label>
            <input type="text" defaultValue="18 agustus 2021" className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">No HP Orang Tua</label>
            <input type="text" defaultValue="+6281314515626" className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" />
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
            <input type="text" defaultValue="3483502056767123" className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
      </div>
    </div>
  );
}