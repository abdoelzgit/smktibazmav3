"use client";

import React, { useState } from "react";
import { saveRekomendasiAction } from "@/app/actions/ppdb-form";
import { useForm } from "@/components/form-context";
import { compressUploadImage, formatFileSize } from "@/lib/compress-upload-image";
import { FormStatusAlert } from "@/components/form-status-alert";

export default function SuratRekomendasiTab({ action }: { action?: unknown } = {}) {
  const { formData, updateField, updateFields } = useForm();
  const [status, setStatus] = useState<{ message: string; type: "info" | "success" | "error" | "warning" } | null>(null);
  const [recommendationFile, setRecommendationFile] = useState<File | null>(null);
  const [isPreparingFile, setIsPreparingFile] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isPreparingFile || isSaving) return;
    const formElement = e.currentTarget;
    const data = new FormData(formElement);
    if (recommendationFile) {
      data.set("suratRekomendasiUrl", recommendationFile, recommendationFile.name);
    }

    setIsSaving(true);
    setStatus({ message: "Menyimpan surat rekomendasi...", type: "info" });
    try {
      const result = await saveRekomendasiAction(data);
      if (result.success) {
        if (result.data && typeof result.data === "object") {
          updateFields("Surat Rekomendasi", result.data as Record<string, unknown>);
        }
        setRecommendationFile(null);
        formElement.reset();
        setStatus({ message: "Surat rekomendasi berhasil disimpan.", type: "success" });
      } else {
        setStatus({ message: result.error ?? "Surat rekomendasi gagal disimpan.", type: "error" });
      }
    } catch {
      setStatus({ message: "Surat rekomendasi gagal disimpan. Coba lagi.", type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileChange = async (file: File | undefined) => {
    if (!file) {
      setRecommendationFile(null);
      setStatus(null);
      return;
    }

    setIsPreparingFile(true);
    setStatus({ message: "Menyiapkan berkas rekomendasi...", type: "info" });
    try {
      const preparedFile = await compressUploadImage(file);
      setRecommendationFile(preparedFile);
      setStatus({
        message: preparedFile.size < file.size
          ? `Berkas siap diunggah (${formatFileSize(file.size)} menjadi ${formatFileSize(preparedFile.size)}).`
          : `Berkas siap diunggah (${formatFileSize(file.size)}).`,
        type: "info",
      });
    } catch {
      setRecommendationFile(file);
      setStatus({ message: "Berkas asli akan diunggah tanpa kompresi.", type: "warning" });
    } finally {
      setIsPreparingFile(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
            value={formData.namaPemberiRekomendasi ?? ""}
            onChange={(e) => updateField("Surat Rekomendasi", "namaPemberiRekomendasi", e.target.value)}
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
            value={formData.jabatanInstansi ?? ""}
            onChange={(e) => updateField("Surat Rekomendasi", "jabatanInstansi", e.target.value)}
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
            value={formData.noHpPemberiRekomendasi ?? ""}
            onChange={(e) => updateField("Surat Rekomendasi", "noHpPemberiRekomendasi", e.target.value)}
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
            disabled={isPreparingFile || isSaving}
            onChange={(event) => void handleFileChange(event.target.files?.[0])}
            className="w-full border border-gray-400 rounded-lg px-3 py-1.5 text-sm text-gray-700 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-900 hover:file:bg-blue-100 cursor-pointer"
          />
          {formData.suratRekomendasiUrl && (
            <a href={formData.suratRekomendasiUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex text-sm font-medium text-[#132b6d] underline underline-offset-2 hover:text-[#0f2257]">
              Lihat berkas yang tersimpan
            </a>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-bold text-gray-800 mb-1">
            Catatan / Keterangan Rekomendasi (Opsional)
          </label>
          <textarea
            name="catatanRekomendasi"
            rows={3}
            value={formData.catatanRekomendasi ?? ""}
            onChange={(e) => updateField("Surat Rekomendasi", "catatanRekomendasi", e.target.value)}
            placeholder="Tuliskan catatan tambahan jika ada..."
            className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-end">
        {status && <FormStatusAlert {...status} onDismiss={() => setStatus(null)} />}
        <button
          type="submit"
          disabled={isPreparingFile || isSaving}
          className="inline-flex items-center justify-center rounded-xl bg-[#1e3a8a] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#172d6e] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSaving ? "Menyimpan..." : "Simpan Surat Rekomendasi"}
        </button>
      </div>
    </form>
  );
}
