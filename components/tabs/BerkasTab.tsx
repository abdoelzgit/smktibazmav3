"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Check, Eye, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DocumentPreviewDialog } from "@/components/ppdb-document-preview";
import { uploadBerkasAction } from "@/app/actions/ppdb-form";
import { useForm } from "@/components/form-context";
import { FormStatusAlert } from "@/components/form-status-alert";

const documentFields = [
  ["kkUrl", "Kartu Keluarga (KK)"],
  ["ktpOrangTuaUrl", "KTP Orang Tua / Wali"],
  ["kipUrl", "KIP/KIS/KPS/PHK"],
  ["akteUrl", "Akta Kelahiran / Surat Keterangan Lahir"],
  ["ijazahUrl", "Ijazah / SKL"],
  ["raporUrl", "Rapor Semester 3–6"],
  ["prestasiUrl", "Piagam Prestasi (jika ada)"],
  ["bpjsUrl", "Kartu BPJS"],
  ["sktmUrl", "Surat Keterangan Tidak Mampu (SKTM)"],
  ["suratPernyataanWaliUrl", "Surat Pernyataan Wali"],
  ["suratPernyataanCpdbUrl", "Surat Pernyataan CPDB"],
  ["suratTidakMerokokUrl", "Surat Pernyataan Tidak Merokok"],
] as const;

const documentTemplateLinks: Record<string, string> = {
  sktmUrl: "https://drive.google.com/file/d/1YSb-ZQtKtEE6h6NoKxDJI2b5x4tk5Guy/view?usp=sharing",
  suratPernyataanWaliUrl: "https://drive.google.com/file/d/1aa3HOOsNoJCtpQjK9nn7cmppETE3YgZR/view?usp=sharing",
  suratPernyataanCpdbUrl: "https://drive.google.com/file/d/14ERi2f9a3E6hLrv3V12MS0eM1Tl2KJpv/view?usp=sharing",
  suratTidakMerokokUrl: "https://drive.google.com/file/d/1Is7cUnbV7SjEIOlvfTaGAJFpGK1Pyghl/view?usp=sharing",
};

const homePhotoFields = [
  ["tampakDepanRumahUrl", "Tampak Depan Rumah"],
  ["tampakSampingRumahUrl", "Tampak Samping Rumah"],
  ["kamarTidurUrl", "Kamar Tidur"],
  ["kamarMandiUrl", "Foto Kamar Mandi"],
  ["ruangTamuUrl", "Ruang Tamu"],
] as const;

export default function BerkasTab({ action }: { action?: unknown } = {}) {
  void action;
  const { formData, updateFields } = useForm();
  const [selectedFiles, setSelectedFiles] = useState<Record<string, File | null>>({});
  const [status, setStatus] = useState<{ message: string; type: "info" | "success" | "error" } | null>(null);
  const [preview, setPreview] = useState<{ file: File | string; title: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus({ message: "Menyimpan berkas...", type: "info" });
    const data = new FormData(e.currentTarget);

    const result = await uploadBerkasAction(data);
    if (result.success) {
      if (result.data && typeof result.data === "object") {
        updateFields("Berkas", result.data as Record<string, unknown>);
      }
      setSelectedFiles({});
      setStatus({ message: "Berkas berhasil disimpan.", type: "success" });
    } else {
      setStatus({ message: result.error ?? "Berkas gagal disimpan.", type: "error" });
    }
  };

  const handleFileChange = (fileKey: string, file: File | undefined) => {
    setSelectedFiles((currentFiles) => ({ ...currentFiles, [fileKey]: file ?? null }));
    setStatus(null);
  };

  const renderUploadField = (key: keyof typeof formData, label: string) => {
    const inputId = `upload-${key}`;
    const existingUrl = formData[key] as string | undefined;
    const selectedFile = selectedFiles[key];

    return (
      <article key={key} className="flex min-w-0 flex-col rounded-lg border border-gray-200 bg-white p-3.5 transition-colors hover:border-gray-300 sm:p-4">
        <div className="flex min-w-0 items-start gap-2">
          <div className="min-w-0 flex-1">
            <label htmlFor={inputId} className="block text-[13px] font-semibold leading-5 text-gray-900">{label}</label>
            <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[11px] text-gray-500">
              <span>PDF atau gambar</span>
              {documentTemplateLinks[key] && (
                <Link href={documentTemplateLinks[key]} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-800 underline underline-offset-2 hover:text-blue-950">
                  Unduh template
                </Link>
              )}
            </div>
          </div>
          {existingUrl && !selectedFile && (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-medium text-emerald-800">
              <Check className="size-3" aria-hidden="true" /> Tersimpan
            </span>
          )}
        </div>

        <div className="my-3 border-t border-gray-100" />

        <div className="relative">
          <Input
            id={inputId}
            name={key}
            type="file"
            accept=".pdf,image/*"
            onChange={(event) => handleFileChange(key, event.target.files?.[0])}
            aria-label={`Pilih ${label}`}
            className="peer absolute inset-0 z-10 h-11 w-full cursor-pointer opacity-0"
          />
          {selectedFile ? (
            <div className="flex min-h-11 min-w-0 items-center gap-2 rounded-md bg-gray-50 px-2.5 py-2 peer-hover:bg-gray-100 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#132b6d]">
              <FileText className="size-4 shrink-0 text-[#132b6d]" aria-hidden="true" />
              <span className="min-w-0 flex-1 truncate text-xs font-medium text-gray-800">{selectedFile.name}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="relative z-20 h-8 shrink-0 px-2"
                onClick={() => setPreview({ file: selectedFile, title: label })}
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
                onClick={() => setPreview({ file: existingUrl, title: label })}
              >
                <Eye aria-hidden="true" />
                Preview
              </Button>
            </div>
          ) : (
            <span className="flex min-h-11 items-center justify-center rounded-md border border-gray-200 bg-gray-50 px-3 text-xs font-medium text-gray-700 transition-colors peer-hover:bg-gray-100 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#132b6d]">
              Pilih dokumen
            </span>
          )}
        </div>
      </article>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="w-full min-w-0 space-y-6">
      <section aria-labelledby="required-documents-heading">
        <div className="mb-3">
          <h2 id="required-documents-heading" className="text-xs font-semibold text-gray-800">Berkas pendukung</h2>
          <p className="mt-1 text-xs text-gray-500">Pilih dokumen yang diminta. Perubahan tersimpan setelah Anda menekan tombol simpan.</p>
        </div>
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:gap-3.5">
          {documentFields.map(([key, label]) => renderUploadField(key as keyof typeof formData, label))}
        </div>
      </section>

      <section aria-labelledby="home-photos-heading" className="border-t border-gray-200 pt-5">
        <div className="mb-3">
          <h2 id="home-photos-heading" className="text-xs font-semibold text-gray-800">Foto rumah yang ditempati</h2>
          <p className="mt-1 text-xs text-gray-500">Tambahkan foto sesuai sudut yang diminta.</p>
        </div>
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:gap-3.5">
          {homePhotoFields.map(([key, label]) => renderUploadField(key as keyof typeof formData, label))}
        </div>
      </section>

      <div className="flex flex-col gap-3 border-t border-gray-200 pt-4 sm:flex-row sm:items-center sm:justify-end">
        {status && <FormStatusAlert {...status} onDismiss={() => setStatus(null)} />}
        <button type="submit" className="inline-flex min-h-11 items-center justify-center rounded-md bg-[#132b6d] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0f2257] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#132b6d] focus-visible:ring-offset-2">
          Simpan berkas
        </button>
      </div>
      <DocumentPreviewDialog
        open={Boolean(preview)}
        file={preview?.file ?? null}
        title={preview?.title ?? "berkas"}
        onOpenChange={(open) => { if (!open) setPreview(null); }}
      />
    </form>
  );
}
