"use client";

import React, { useState } from "react";
import { uploadBerkasAction } from "@/app/actions/ppdb-form";
import { useForm } from "@/components/form-context";

export default function BerkasTab({ action }: { action?: unknown } = {}) {
  const { formData, updateFields } = useForm();
  const [selectedFiles, setSelectedFiles] = useState<Record<string, File | null>>({});
  const [status, setStatus] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("Menyimpan...");
    const formElement = e.currentTarget;
    const data = new FormData(formElement);

    const result = await uploadBerkasAction(data);
    if (result.success) {
      if (result.data && typeof result.data === "object") {
        updateFields("Berkas", result.data as Record<string, unknown>);
      }
      setStatus("Berkas berhasil disimpan.");
    } else {
      setStatus(result.error ?? "Berkas gagal disimpan.");
    }
  };

  const handleFileChange = (fileKey: string, file: File | undefined) => {
    setSelectedFiles((currentFiles) => ({
      ...currentFiles,
      [fileKey]: file ?? null,
    }));
  };

  const renderUploadField = (key: keyof typeof formData, label: string) => {
    const existingUrl = formData[key] as string | undefined;

    return (
      <div key={key} className="rounded-xl border border-gray-300 bg-white p-4 shadow-sm flex flex-col justify-between">
        <div>
          <label className="block text-sm font-bold text-gray-800 mb-2">{label}</label>
          <div className="w-full rounded-lg border border-dashed border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-700">
            <input
              name={key}
              type="file"
              accept=".pdf,image/*"
              onChange={(event) => handleFileChange(key, event.target.files?.[0])}
              className="w-full cursor-pointer file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-blue-900 hover:file:bg-blue-100"
            />
            {selectedFiles[key] && (
              <p className="mt-2 truncate text-xs text-blue-700">File dipilih: {selectedFiles[key]?.name}</p>
            )}
          </div>
        </div>

        {existingUrl && (
          <div className="mt-3 pt-2 border-t border-gray-100 text-xs text-green-700 flex items-center justify-between font-medium">
            <span>✓ File Terunggah</span>
            <a
              href={existingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline hover:text-blue-800"
            >
              Lihat Document
            </a>
          </div>
        )}
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="mb-6">
        <span className="bg-[#1e3a8a] text-white px-5 py-2 rounded-lg font-semibold text-base shadow-sm inline-block">
          Upload Berkas
        </span>
      </div>

      <div className="space-y-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {[
            ["kkUrl", "Kartu Keluarga (KK)"],
            ["ktpOrangTuaUrl", "KTP Orang Tua / Wali Murid"],
            ["kipUrl", "KIP/KIS/KPS/PHK/SKTM"],
            ["akteUrl", "Akte Kelahiran / Surat Keterangan Lahir"],
            ["ijazahUrl", "Ijazah / SKL"],
            ["raporUrl", "Rapor Semester 3-6"],
            ["prestasiUrl", "Piagam Penghargaan / Prestasi (Jika ada)"],
          ].map(([key, label]) => renderUploadField(key as keyof typeof formData, label))}
        </div>

        <div className="rounded-2xl border border-gray-300 bg-gray-50 p-4 shadow-sm">
          <h3 className="mb-4 text-base font-bold text-gray-800">Upload Foto Rumah Yang Ditempati</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {[
              ["tampakDepanRumahUrl", "Tampak Depan Rumah"],
              ["tampakSampingRumahUrl", "Tampak Samping Rumah"],
              ["kamarTidurUrl", "Kamar Tidur"],
              ["ruangTamuUrl", "Ruang Tamu"],
            ].map(([key, label]) => renderUploadField(key as keyof typeof formData, label))}
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        {status && <p className="mr-4 self-center text-sm text-gray-600" role="status">{status}</p>}
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-xl bg-[#1e3a8a] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#172d6e] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Simpan Berkas
        </button>
      </div>
    </form>
  );
}