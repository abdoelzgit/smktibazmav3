"use client";

import React, { useState } from "react";
import { saveDataSekolahAction } from "@/app/actions/ppdb-form";
import { useForm } from "@/components/form-context";

export default function DataSekolahAsalTab({ action }: { action?: unknown } = {}) {
  const { formData, updateField, updateFields } = useForm();
  const [status, setStatus] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("Menyimpan...");
    const formElement = e.currentTarget;
    const data = new FormData(formElement);

    const result = await saveDataSekolahAction(data);
    if (result.success) {
      if (result.data && typeof result.data === "object") {
        updateFields("Data sekolah Asal", result.data as Record<string, unknown>);
      }
      setStatus("Data sekolah berhasil disimpan.");
    } else {
      setStatus(result.error ?? "Data sekolah gagal disimpan.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="mb-6">
        <span className="bg-[#1e3a8a] text-white px-5 py-2 rounded-lg font-semibold text-base shadow-sm inline-block">
          Data Sekolah Asal
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        <div>
          <label className="block text-sm font-bold text-gray-800 mb-1">
            Nama Sekolah Asal (SMP / MTs)
          </label>
          <input
            name="namaSekolahAsal"
            type="text"
            value={formData.namaSekolahAsal ?? ""}
            onChange={(e) => updateField("Data sekolah Asal", "namaSekolahAsal", e.target.value)}
            placeholder="Contoh: SMP Negeri 1 Ciomas"
            className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-800 mb-1">
            NPSN Sekolah
          </label>
          <a
            href="https://referensi.data.kemdikbud.go.id/index11.php"
            target="_blank"
            rel="noopener noreferrer"
            className="mb-1 block text-sm text-blue-500 underline"
          >
            https://referensi.data.kemdikbud.go.id/index11.php
          </a>

          <input
            name="npsnSekolah"
            type="text"
            value={formData.npsnSekolah ?? ""}
            onChange={(e) => updateField("Data sekolah Asal", "npsnSekolah", e.target.value)}
            placeholder="Masukkan NPSN Sekolah"
            className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-800 mb-1">
            Status Sekolah
          </label>
          <select
            name="statusSekolah"
            value={formData.statusSekolah ?? "NEGERI"}
            onChange={(e) => updateField("Data sekolah Asal", "statusSekolah", e.target.value)}
            className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="NEGERI">Negeri</option>
            <option value="SWASTA">Swasta</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-800 mb-1">
            Tahun Lulus
          </label>
          <input
            name="tahunLulus"
            type="text"
            value={formData.tahunLulus ?? ""}
            onChange={(e) => updateField("Data sekolah Asal", "tahunLulus", e.target.value)}
            placeholder="Contoh: 2025"
            className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-bold text-gray-800 mb-1">
            Alamat Lengkap Sekolah Asal
          </label>
          <textarea
            name="alamatSekolah"
            rows={2}
            value={formData.alamatSekolah ?? ""}
            onChange={(e) => updateField("Data sekolah Asal", "alamatSekolah", e.target.value)}
            placeholder="Masukkan jalan, kecamatan, kabupaten/kota..."
            className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex justify-end">
        {status && <p className="mr-4 self-center text-sm text-gray-600" role="status">{status}</p>}
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-xl bg-[#1e3a8a] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#172d6e] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Simpan Data Sekolah Asal
        </button>
      </div>
    </form>
  );
}