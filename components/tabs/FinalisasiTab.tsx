"use client";

import { useState } from "react";
import { BadgeCheck, CircleAlert } from "lucide-react";
import { useForm } from "@/components/form-context";
import { FormStatusAlert } from "@/components/form-status-alert";

type FinalisasiAction = () => Promise<{ success: boolean; error?: string }>;

export default function FinalisasiTab({ isFinalized, onFinalized, action }: { isFinalized: boolean; onFinalized: () => void; action: FinalisasiAction }) {
  const { formData, savedTabs, setActiveTab } = useForm();
  const [confirmed, setConfirmed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ message: string; type: "info" | "success" | "error" } | null>(null);
  const filled = (...values: (string | boolean | null | undefined)[]) => values.every((value) => typeof value === "boolean" || (typeof value === "string" && value.trim().length > 0));
  const completeHistory =
    (formData.riwayatPrestasiItems ?? []).every((item) => filled(item.nama, item.tingkat, item.tanggal, item.buktiUrl)) &&
    (formData.riwayatOrganisasiItems ?? []).every((item) => filled(item.nama, item.jabatan, item.periode)) &&
    (formData.riwayatBahasaItems ?? []).every((item) => filled(item.nama, item.tingkat));
  const rows = [
    { label: "Data Diri", tab: "Data Diri", saved: savedTabs["Data Diri"], complete: filled(formData.namaLengkap, formData.email, formData.tempatLahir, formData.tanggalLahir, formData.nik, formData.nisn, formData.kewarganegaraan, formData.anakKe, formData.jumlahSaudara, formData.statusKeluarga, formData.tinggalBersama, formData.alamatLengkap, formData.noHpWhatsapp, formData.mediaSosial, formData.linkPengumpulanVideo, formData.beratBadan, formData.tinggiBadan, formData.riwayatPenyakit, formData.isMerokok, formData.isButaWarna, formData.hasPenyakitMenular, formData.pernyataanSiswa, formData.fotoFormalUrl) },
    { label: "Riwayat", tab: "Riwayat", saved: savedTabs.Riwayat, complete: completeHistory },
    { label: "Data Orang Tua", tab: "Data orang Tua", saved: savedTabs["Data orang Tua"], complete: filled(formData.namaAyah, formData.pekerjaanAyah, formData.namaIbu, formData.pekerjaanIbu, formData.noHpOi, formData.keadaanOrangTua, formData.penghasilanOrangTua, formData.alamatDomisiliAyah, formData.pernyataanOrangTua) },
    { label: "Sekolah Asal", tab: "Data sekolah Asal", saved: savedTabs["Data sekolah Asal"], complete: filled(formData.namaSekolahAsal, formData.npsnSekolah, formData.statusSekolah, formData.tahunLulus, formData.alamatSekolah) },
    { label: "Dokumen", tab: "Berkas", saved: savedTabs.Berkas, complete: filled(formData.kkUrl, formData.ktpOrangTuaUrl, formData.kipUrl, formData.akteUrl, formData.ijazahUrl, formData.raporUrl, formData.bpjsUrl, formData.sktmUrl, formData.suratPernyataanWaliUrl, formData.suratPernyataanCpdbUrl, formData.suratTidakMerokokUrl, formData.tampakDepanRumahUrl, formData.tampakSampingRumahUrl, formData.kamarTidurUrl, formData.kamarMandiUrl, formData.ruangTamuUrl) },
    { label: "Surat Rekomendasi", tab: "Surat Rekomendasi", saved: savedTabs["Surat Rekomendasi"], complete: filled(formData.namaPemberiRekomendasi, formData.jabatanInstansi, formData.noHpPemberiRekomendasi, formData.suratRekomendasiUrl, formData.catatanRekomendasi) },
  ];
  const allVerified = rows.every((row) => row.saved && row.complete);
  const finalize = async () => {
    setSaving(true);
    setStatus({ message: "Memfinalisasi pendaftaran…", type: "info" });
    const result = await action();
    if (result.success) onFinalized();
    setStatus(result.success ? { message: "Pendaftaran berhasil difinalisasi.", type: "success" } : { message: result.error ?? "Pendaftaran gagal difinalisasi.", type: "error" });
    setSaving(false);
  };

  return <section className="mx-auto max-w-3xl space-y-6">
    <header><h1 className="text-xl font-semibold text-gray-900">Finalisasi Pendaftaran</h1><p className="mt-1 text-sm text-gray-600">Periksa ringkasan kelengkapan sebelum mengunci formulir.</p></header>
    <ul className="divide-y divide-gray-200 rounded-lg border border-gray-200">
      {rows.map(({ label, tab, saved, complete }) => {
        const verified = saved && complete;
        return <li key={label} className="flex flex-wrap items-center justify-between gap-3 p-4">
          <span className="text-sm font-medium text-gray-800">{label}</span>
          <span className={`inline-flex items-center gap-1.5 text-sm ${verified ? "text-emerald-700" : "text-amber-700"}`}>{verified ? <BadgeCheck className="size-4" aria-hidden="true" /> : <CircleAlert className="size-4" aria-hidden="true" />}{verified ? "Tersimpan & lengkap" : !saved ? "Belum disimpan" : "Belum lengkap"}</span></li>;
      })}
    </ul>
    {isFinalized ? <p className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">Formulir sudah difinalisasi dan dikunci. Semua tab tetap dapat dibuka untuk ditinjau.</p> : <>
      <label className="flex cursor-pointer items-start gap-3 text-sm text-gray-700"><input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} className="mt-0.5 size-4 accent-[#132b6d]" />Saya sudah memeriksa data dan dokumen. Setelah difinalisasi, formulir tidak dapat diubah lagi.</label>
      <div className="flex justify-end"><button type="button" disabled={!confirmed || !allVerified || saving} onClick={finalize} className="min-h-10 rounded-md bg-[#132b6d] px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">{saving ? "Memfinalisasi…" : "Finalisasi dan kunci formulir"}</button></div>
    </>}
    {status && <FormStatusAlert {...status} onDismiss={() => setStatus(null)} />}
  </section>;
}
