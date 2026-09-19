"use client";

import React, { useState } from "react";
import { saveRekomendasiAction } from "@/app/actions/ppdb-form";

export default function SuratRekomendasiTab() {
  const [status, setStatus] = useState<string | null>(null);

  const handleSubmit = async (formData: FormData) => {
    setStatus("Menyimpan...");
    const result = await saveRekomendasiAction(formData);
    setStatus(result.success ? "Surat rekomendasi berhasil disimpan." : result.error ?? "Surat rekomendasi gagal disimpan.");
  };

  return (
    <form action={handleSubmit} className="space-y-6">
      <div className="mb-6">
        <span className="bg-[#1e3a8a] text-white px-5 py-2 rounded-lg font-semibold text-base shadow-sm inline-block">
          Surat Rekomendasi
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        <div>
          <label className="block text-sm font-bold text-gray-800 mb-1">
            Nama Pemberi Rekomendasi
          </label>
          <input
            name="namaPemberiRekomendasi"
            type="text"
            required
            placeholder="Masukkan nama lengkap pemberi rekomendasi"
            className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-800 mb-1">
            Jabatan / Instansi
          </label>
          <input
            name="jabatanInstansi"
            type="text"
            placeholder="Contoh: Kepala Sekolah / Tokoh Masyarakat"
            className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-800 mb-1">
            No HP Pemberi Rekomendasi
          </label>
          <input
            name="noHpPemberiRekomendasi"
            type="text"
            placeholder="+62..."
            className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-800 mb-1">
            Upload Surat Rekomendasi (PDF/Image)
          </label>
          <input
            name="suratRekomendasiUrl"
            type="file"
            accept=".pdf,image/*"
            className="w-full border border-gray-400 rounded-lg px-3 py-1.5 text-sm text-gray-700 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-900 hover:file:bg-blue-100 cursor-pointer"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-bold text-gray-800 mb-1">
            Catatan / Keterangan Rekomendasi (Opsional)
          </label>
          <textarea
            name="catatanRekomendasi"
            rows={3}
            placeholder="Tuliskan catatan tambahan jika ada..."
            className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex justify-end">
        {status && <p className="mr-4 self-center text-sm text-gray-600" role="status">{status}</p>}
        <button type="submit" className="inline-flex items-center justify-center rounded-xl bg-[#1e3a8a] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#172d6e] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
          Simpan Surat Rekomendasi
        </button>
      </div>
    </form>
  );
}