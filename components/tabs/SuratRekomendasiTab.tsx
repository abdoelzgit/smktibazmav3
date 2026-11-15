"use client";

import React, { useState } from "react";
import { saveRekomendasiAction } from "@/app/actions/ppdb-form";
import { useForm } from "@/components/form-context";
import { compressUploadImage, formatFileSize } from "@/lib/compress-upload-image";
import { FormStatusAlert } from "@/components/form-status-alert";
import { DocumentPreviewDialog } from "@/components/ppdb-document-preview";
import { Button } from "@/components/ui/button";
import { Check, Eye, FileText } from "lucide-react";
import { useId } from "react";
import { PhoneInput01 } from "@/components/shadcn-studio/phone-input/phone-input-01";
import { toPhoneInputValue } from "@/lib/phone-input-value";

export default function SuratRekomendasiTab({ action }: { action?: unknown } = {}) {
  const { formData, updateField, updateFields } = useForm();
  const [status, setStatus] = useState<{ message: string; type: "info" | "success" | "error" | "warning" } | null>(null);
  const [recommendationFile, setRecommendationFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<{ file: File | string; title: string } | null>(null);
  const [isPreparingFile, setIsPreparingFile] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const uploadInputId = useId();
  const existingUrl = typeof formData.suratRekomendasiUrl === "string" ? formData.suratRekomendasiUrl : "";

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
          <label htmlFor="noHpPemberiRekomendasi" className="block text-sm font-bold text-gray-800 mb-1">
            No HP Pemberi Rekomendasi
          </label>
          <PhoneInput01
            id="noHpPemberiRekomendasi"
            name="noHpPemberiRekomendasi"
            defaultCountry="ID"
            international
            value={toPhoneInputValue(formData.noHpPemberiRekomendasi)}
            onChange={(value) => updateField("Surat Rekomendasi", "noHpPemberiRekomendasi", value)}
            placeholder="Masukkan nomor handphone"
            className="w-full"
            inputClassName="h-10 rounded-r-lg border-gray-400 px-3 py-2 text-sm text-gray-700 focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500"
            triggerClassName="h-10 border-gray-400"
          />
        </div>

        <div className="min-w-0">
          <article className="flex min-w-0 flex-col rounded-lg border border-gray-200 bg-white p-3.5 transition-colors hover:border-gray-300 sm:p-4">
            <div className="flex min-w-0 items-start gap-2">
              <div className="min-w-0 flex-1">
                <label htmlFor={uploadInputId} className="block text-[13px] font-semibold leading-5 text-gray-900">
                  Surat Rekomendasi
                </label>
                <p className="mt-0.5 text-[11px] text-gray-500">PDF atau gambar</p>
              </div>
              {existingUrl && !recommendationFile && (
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-medium text-emerald-800">
                  <Check className="size-3" aria-hidden="true" /> Tersimpan
                </span>
              )}
            </div>
            <div className="relative mt-3">
              <input
                id={uploadInputId}
                name="suratRekomendasiUrl"
                type="file"
                accept=".pdf,image/*"
                disabled={isPreparingFile || isSaving}
                onChange={(event) => void handleFileChange(event.target.files?.[0])}
                aria-label="Pilih surat rekomendasi"
                className="peer absolute inset-0 z-10 h-11 w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
              />
              {recommendationFile ? (
                <div className="flex min-h-11 min-w-0 items-center gap-2 rounded-md bg-gray-50 px-2.5 py-2 peer-hover:bg-gray-100 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#132b6d]">
                  <FileText className="size-4 shrink-0 text-[#132b6d]" aria-hidden="true" />
                  <span className="min-w-0 flex-1 truncate text-xs font-medium text-gray-800">{recommendationFile.name}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="relative z-20 h-8 shrink-0 px-2"
                    onClick={() => setPreview({ file: recommendationFile, title: "Surat Rekomendasi" })}
                  >
                    <Eye aria-hidden="true" />
                    Preview
                  </Button>
                </div>
              ) : existingUrl ? (
                <div className="flex min-h-11 min-w-0 items-center gap-2 rounded-md bg-emerald-50/70 px-2.5 py-2 text-xs text-emerald-900 peer-hover:bg-emerald-50 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#132b6d]">
                  <FileText className="size-4 shrink-0" aria-hidden="true" />
                  <span className="min-w-0 flex-1 truncate">Berkas tersimpan</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="relative z-20 h-8 shrink-0 px-2 text-emerald-900"
                    onClick={() => setPreview({ file: existingUrl, title: "Surat Rekomendasi" })}
                  >
                    <Eye aria-hidden="true" />
                    Preview
                  </Button>
                </div>
              ) : (
                <span className="flex min-h-11 items-center justify-center rounded-md border border-gray-200 bg-gray-50 px-3 text-xs font-medium text-gray-700 transition-colors peer-hover:bg-gray-100 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#132b6d]">
                  {isPreparingFile ? "Menyiapkan berkas..." : "Pilih dokumen"}
                </span>
              )}
            </div>
          </article>
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
      <DocumentPreviewDialog
        open={Boolean(preview)}
        file={preview?.file ?? null}
        title={preview?.title ?? "Surat Rekomendasi"}
        onOpenChange={(open) => { if (!open) setPreview(null); }}
      />
    </form>
  );
}
