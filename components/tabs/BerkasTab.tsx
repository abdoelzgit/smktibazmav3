"use client";

import React, { useEffect, useState } from "react";
import { FileUploadField } from "@/components/spmb/FileUploadField";
import { useForm } from "@/components/form-context";
import type { BerkasKey } from "@/lib/ppdb-upload.config";

const documentFields = [
  ["kkUrl", "Kartu Keluarga (KK)"],
  ["ktpOrangTuaUrl", "KTP Orang Tua / Wali"],
  ["kipUrl", "KIP/KIS/KPS/PHK"],
  ["akteUrl", "Akta Kelahiran / Surat Keterangan Lahir"],
  ["ijazahUrl", "Ijazah / Surat Keterangan Lulus"],
  ["raporUrl", "Rapor Semester 1-4"],
  ["bpjsUrl", "Kartu BPJS (Opsional)"],
  ["sktmUrl", "Surat Keterangan Tidak Mampu (SKTM)"],
  ["suratPernyataanCpdbUrl", "Surat Pernyataan CMB"],
  ["suratTidakMerokokUrl", "Surat Pernyataan Tidak Merokok"],
] as const satisfies readonly (readonly [BerkasKey, string])[];

const documentTemplateLinks: Partial<Record<BerkasKey, string>> = {
  sktmUrl: "https://drive.google.com/file/d/1M4t5Ah80w3FK2rWUydxkTmgc-99DfBLk/view?usp=sharing",
  suratPernyataanCpdbUrl: "https://drive.google.com/file/d/16c9Sqb7wxdYQn_m78n7v636P1quXNWpF/view?usp=sharing",
  suratTidakMerokokUrl: "https://drive.google.com/file/d/1UjBk4qD0K0RtOmQ4Z1_3b7RRHXC5GLj_/view?usp=sharing",
};

const homePhotoFields = [
  ["tampakDepanRumahUrl", "Tampak Depan Rumah"],
  ["tampakSampingRumahUrl", "Tampak Samping Rumah"],
  ["kamarTidurUrl", "Kamar Tidur"],
  ["kamarMandiUrl", "Foto Kamar Mandi"],
  ["ruangTamuUrl", "Ruang Tamu"],
] as const satisfies readonly (readonly [BerkasKey, string])[];

const uploadFieldKeys: BerkasKey[] = [...documentFields, ...homePhotoFields].map(([key]) => key);

export default function BerkasTab({ isLocked = false }: { isLocked?: boolean } = {}) {
  const { formData, updateFields } = useForm();
  const [activeUploadKeys, setActiveUploadKeys] = useState<Set<BerkasKey>>(() => new Set());
  const savedCount = uploadFieldKeys.filter((key) => Boolean(formData[key])).length;

  useEffect(() => {
    if (activeUploadKeys.size === 0) return;

    const warnBeforeLeaving = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", warnBeforeLeaving);
    return () => window.removeEventListener("beforeunload", warnBeforeLeaving);
  }, [activeUploadKeys.size]);

  const renderField = ([fieldKey, label]: readonly [BerkasKey, string]) => (
    <FileUploadField
      key={fieldKey}
      fieldKey={fieldKey}
      label={label}
      initialUrl={formData[fieldKey] as string | null | undefined}
      isLocked={isLocked}
      templateUrl={documentTemplateLinks[fieldKey]}
      onChange={(url) => updateFields("Berkas", { [fieldKey]: url })}
      onUploadActivity={(active) => {
        setActiveUploadKeys((current) => {
          const next = new Set(current);
          if (active) next.add(fieldKey);
          else next.delete(fieldKey);
          return next;
        });
      }}
    />
  );

  return (
    <div className="w-full min-w-0 space-y-6">
      <div className="flex flex-col gap-1 border-b border-gray-200 pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">Berkas pendaftaran</h2>
          <p className="mt-1 text-xs leading-5 text-gray-600">
            Setiap berkas diunggah sendiri setelah dipilih. Anda tidak perlu menunggu atau mengirim semua berkas sekaligus.
          </p>
        </div>
        <p className="shrink-0 text-xs font-medium text-gray-700" aria-live="polite">
          {savedCount} dari {uploadFieldKeys.length} berkas tersimpan
        </p>
      </div>

      <section aria-labelledby="required-documents-heading">
        <div className="mb-3">
          <h3 id="required-documents-heading" className="text-xs font-semibold text-gray-800">Berkas pendukung</h3>
          <p className="mt-1 text-xs text-gray-600">Format PDF, JPG, PNG, atau WebP. Maksimal 5 MB per berkas.</p>
        </div>
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:gap-3.5">
          {documentFields.map(renderField)}
        </div>
      </section>

      <section aria-labelledby="home-photos-heading" className="border-t border-gray-200 pt-5">
        <div className="mb-3">
          <h3 id="home-photos-heading" className="text-xs font-semibold text-gray-800">Foto rumah yang ditempati</h3>
          <p className="mt-1 text-xs text-gray-600">Pilih dan unggah tiap foto secara terpisah.</p>
        </div>
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:gap-3.5">
          {homePhotoFields.map(renderField)}
        </div>
      </section>

      <p className="text-xs text-gray-600">
        Template surat dapat diunduh dari tautan pada masing-masing berkas.
        {isLocked && <span> Formulir ini hanya dapat dilihat.</span>}
      </p>
    </div>
  );
}
