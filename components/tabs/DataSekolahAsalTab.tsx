"use client";

import React from "react";

export default function DataSekolahAsalTab() {
  return (
    <div>
      {/* Title Badge */}
      <div className="mb-6">
        <span className="bg-[#1e3a8a] text-white px-5 py-2 rounded-lg font-semibold text-base shadow-sm inline-block">
          Data Sekolah Asal
        </span>
      </div>

      {/* Form Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        {/* Nama Sekolah */}
        <div>
          <label className="block text-sm font-bold text-gray-800 mb-1">
            Nama Sekolah Asal (SMP / MTs)
          </label>
          <input
            type="text"
            placeholder="Contoh: SMP Negeri 1 Ciomas"
            className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* NPSN Sekolah */}
        <div>
          <label className="block text-sm font-bold text-gray-800 mb-1">
            NPSN Sekolah
          </label>
           <a href="https://referensi.data.kemdikbud.go.id/index11.php" target="_blank" rel="noopener noreferrer" className="text-blue-500 text-sm underline">
            https://referensi.data.kemdikbud.go.id/index11.php</a>
        
          <input
            type="text"
            placeholder="Masukkan NPSN Sekolah"
            className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Status Sekolah */}
        <div>
          <label className="block text-sm font-bold text-gray-800 mb-1">
            Status Sekolah
          </label>
          <select className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
            <option value="Negeri">Negeri</option>
            <option value="Swasta">Swasta</option>
          </select>
        </div>

        {/* Tahun Lulus */}
        <div>
          <label className="block text-sm font-bold text-gray-800 mb-1">
            Tahun Lulus
          </label>
          <input
            type="text"
            placeholder="Contoh: 2025"
            className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Alamat Sekolah */}
        <div className="md:col-span-2">
          <label className="block text-sm font-bold text-gray-800 mb-1">
            Alamat Lengkap Sekolah Asal
          </label>
          <textarea
            rows={2}
            placeholder="Masukkan jalan, kecamatan, kabupaten/kota..."
            className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
}