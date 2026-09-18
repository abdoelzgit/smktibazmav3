"use client";

import React from "react";

export default function SuratRekomendasiTab() {
  return (
    <div>
      {/* Title Badge */}
      <div className="mb-6">
        <span className="bg-[#1e3a8a] text-white px-5 py-2 rounded-lg font-semibold text-base shadow-sm inline-block">
          Surat Rekomendasi
        </span>
      </div>

      {/* Form Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        {/* Nama Pemberi Rekomendasi */}
        <div>
          <label className="block text-sm font-bold text-gray-800 mb-1">
            Nama Pemberi Rekomendasi
          </label>
          <input
            type="text"
            placeholder="Masukkan nama lengkap pemberi rekomendasi"
            className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Jabatan / Instansi */}
        <div>
          <label className="block text-sm font-bold text-gray-800 mb-1">
            Jabatan / Instansi
          </label>
          <input
            type="text"
            placeholder="Contoh: Kepala Sekolah / Tokoh Masyarakat"
            className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* No HP / Kontak Pemberi Rekomendasi */}
        <div>
          <label className="block text-sm font-bold text-gray-800 mb-1">
            No HP Pemberi Rekomendasi
          </label>
          <input
            type="text"
            placeholder="+62..."
            className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Upload Dokumen Surat Rekomendasi */}
        <div>
          <label className="block text-sm font-bold text-gray-800 mb-1">
            Upload Surat Rekomendasi (PDF/Image)
          </label>
          <input
            type="file"
            accept=".pdf,image/*"
            className="w-full border border-gray-400 rounded-lg px-3 py-[6px] text-sm text-gray-700 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-900 hover:file:bg-blue-100 cursor-pointer"
          />
        </div>

        {/* Catatan / Keterangan Tambahan */}
        <div className="md:col-span-2">
          <label className="block text-sm font-bold text-gray-800 mb-1">
            Catatan / Keterangan Rekomendasi (Opsional)
          </label>
          <textarea
            rows={3}
            placeholder="Tuliskan catatan tambahan jika ada..."
            className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
}