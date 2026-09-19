"use client";

import React, { useState } from "react";

export default function BerkasTab() {
  const [selectedFiles, setSelectedFiles] = useState<Record<string, File | null>>({});

  const handleFileChange = (fileKey: string, file: File | undefined) => {
    setSelectedFiles((currentFiles) => ({
      ...currentFiles,
      [fileKey]: file ?? null,
    }));
  };

  const renderUploadField = (key: string, label: string) => (
    <div key={key} className="rounded-xl border border-gray-300 bg-white p-4 shadow-sm">
      <label className="block text-sm font-bold text-gray-800 mb-2">{label}</label>
      <div className="w-full rounded-lg border border-dashed border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-700">
        <input
          type="file"
          accept=".pdf,image/*"
          onChange={(event) => handleFileChange(key, event.target.files?.[0])}
          className="w-full cursor-pointer file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-blue-900 hover:file:bg-blue-100"
        />
        {selectedFiles[key] && (
          <p className="mt-2 truncate text-xs text-green-700">File dipilih: {selectedFiles[key]?.name}</p>
        )}
      </div>
    </div>
  );

  return (
    <div>
      <div className="mb-6">
        <span className="bg-[#1e3a8a] text-white px-5 py-2 rounded-lg font-semibold text-base shadow-sm inline-block">
          Upload Berkas
        </span>
      </div>

      <div className="space-y-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {[
            ["kk", "Kartu Keluarga (KK)"],
            ["ktpOrangTua", "KTP Orang Tua / Wali Murid"],
            ["kip", "KIP/KIS/KPS/PHK/SKTM"],
            ["akte", "Akte Kelahiran / Surat Keterangan Lahir"],
            ["ijazah", "Ijazah / SKL"],
            ["rapor", "Rapor Semester 3-6"],
            ["prestasi", "Piagam Penghargaan / Prestasi (Jika ada)"],
          ].map(([key, label]) => renderUploadField(key, label))}
        </div>

        <div className="rounded-2xl border border-gray-300 bg-gray-50 p-4 shadow-sm">
          <h3 className="mb-4 text-base font-bold text-gray-800">Upload Foto Rumah Yang Ditempati</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {[
              ["tampakDepanRumah", "Tampak Depan Rumah"],
              ["tampakSampingRumah", "Tampak Samping Rumah"],
              ["kamarTidur", "Kamar Tidur"],
              ["ruangTamu", "Ruang Tamu"],
            ].map(([key, label]) => renderUploadField(key, label))}
          </div>
        </div>
      </div>
    </div>
  );
}