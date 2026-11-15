"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { saveDataOrangTuaAction } from "@/app/actions/ppdb-form";
import { useForm } from "@/components/form-context";
import { PhoneInput01 } from "@/components/shadcn-studio/phone-input/phone-input-01";
import { toPhoneInputValue } from "@/lib/phone-input-value";
import { FormStatusAlert } from "@/components/form-status-alert";

export default function DataOrangTuaTab({ action }: { action?: unknown } = {}) {
  const { formData, updateField, updateFields } = useForm();
  const [status, setStatus] = useState<{ message: string; type: "info" | "success" | "error" } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus({ message: "Menyimpan data orang tua...", type: "info" });
    const formElement = e.currentTarget;
    const data = new FormData(formElement);

    const result = await saveDataOrangTuaAction(data);
    if (result.success) {
      if (result.data && typeof result.data === "object") {
        updateFields("Data orang Tua", result.data as Record<string, unknown>);
      }
      setStatus({ message: "Data orang tua berhasil disimpan.", type: "success" });
    } else {
      setStatus({ message: result.error ?? "Data orang tua gagal disimpan.", type: "error" });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full min-w-0 space-y-6">
      <div className="mb-6">
        <span className="bg-[#1e3a8a] text-white px-5 py-2 rounded-lg font-semibold text-base shadow-sm inline-block">
          Data Orang Tua
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        <div>
          <label className="block text-sm font-bold text-gray-800 mb-1">Nama Ayah</label>
          <Input
            name="namaAyah"
            type="text"
            value={formData.namaAyah ?? ""}
            onChange={(e) => updateField("Data orang Tua", "namaAyah", e.target.value)}
            placeholder="Masukkan nama ayah"
            className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-800 mb-1">Pekerjaan Ayah</label>
          <Input
            name="pekerjaanAyah"
            type="text"
            value={formData.pekerjaanAyah ?? ""}
            onChange={(e) => updateField("Data orang Tua", "pekerjaanAyah", e.target.value)}
            placeholder="Masukkan pekerjaan ayah"
            className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-800 mb-1">Nama Ibu</label>
          <Input
            name="namaIbu"
            type="text"
            value={formData.namaIbu ?? ""}
            onChange={(e) => updateField("Data orang Tua", "namaIbu", e.target.value)}
            placeholder="Masukkan nama ibu"
            className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-800 mb-1">Pekerjaan Ibu</label>
          <Input
            name="pekerjaanIbu"
            type="text"
            value={formData.pekerjaanIbu ?? ""}
            onChange={(e) => updateField("Data orang Tua", "pekerjaanIbu", e.target.value)}
            placeholder="Masukkan pekerjaan ibu"
            className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="noHpOi" className="block text-sm font-bold text-gray-800 mb-1">No HP Orang Tua</label>
          <PhoneInput01
            id="noHpOi"
            name="noHpOi"
            defaultCountry="ID"
            international
            value={toPhoneInputValue(formData.noHpOi)}
            onChange={(value) => updateField("Data orang Tua", "noHpOi", value)}
            placeholder="Masukkan nomor handphone"
            className="w-full"
            inputClassName="h-10 rounded-r-lg border-gray-400 px-3 py-2 text-sm text-gray-700 focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500"
            triggerClassName="h-10 border-gray-400"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-800 mb-1">Keadaan Orang Tua</label>
          <Select
            name="keadaanOrangTua"
            value={formData.keadaanOrangTua ?? "LENGKAP"}
            onValueChange={(value) => updateField("Data orang Tua", "keadaanOrangTua", String(value ?? ""))}
          >
            <SelectTrigger id="keadaanOrangTua">
              <SelectValue>{formData.keadaanOrangTua === "YATIM" ? "Saya Yatim" : formData.keadaanOrangTua === "PIATU" ? "Saya Piatu" : formData.keadaanOrangTua === "YATIM_PIATU" ? "Saya Yatim Piatu" : "Orang Tua Saya Lengkap"}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="LENGKAP">Orang Tua Saya Lengkap</SelectItem>
              <SelectItem value="YATIM">Saya Yatim</SelectItem>
              <SelectItem value="PIATU">Saya Piatu</SelectItem>
              <SelectItem value="YATIM_PIATU">Saya Yatim Piatu</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label htmlFor="penghasilanOrangTua" className="block text-sm font-bold text-gray-800 mb-1">Penghasilan Ayah/Ibu</label>
          <Select
            name="penghasilanOrangTua"
            value={formData.penghasilanOrangTua ?? ""}
            onValueChange={(value) => updateField("Data orang Tua", "penghasilanOrangTua", String(value ?? ""))}
          >
            <SelectTrigger id="penghasilanOrangTua" className="w-full">
              <SelectValue placeholder="Pilih rentang penghasilan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Tidak Berpenghasilan">Tidak Berpenghasilan</SelectItem>
              <SelectItem value="0-1jt">0-1jt</SelectItem>
              <SelectItem value="1jt-5jt">1jt-5jt</SelectItem>
              <SelectItem value="5jt-10jt">5jt-10jt</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-800 mb-1">Alamat Domisili Ayah</label>
          <Input
            name="alamatDomisiliAyah"
            type="text"
            value={formData.alamatDomisiliAyah ?? ""}
            onChange={(e) => updateField("Data orang Tua", "alamatDomisiliAyah", e.target.value)}
            placeholder="Alamat Domisili Ayah"
            className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-bold text-gray-800 mb-1">
            Pernyataan Orang Tua / Wali Calon Siswa
          </label>
          <p className="text-xs text-gray-500 mb-2">
            1. Seluruh pernyataan data dan informasi beserta seluruh dokumen yang dilampirkan dalam berkas pendaftaran PPDB SMK TI BAZMA TA 2021-2022 adalah benar;
          </p>
          <p className="text-xs text-gray-500 mb-2">
            2. Saya mendukung dan memberi izin anak/tanggungan saya dalam mengikuti keseluruhan proses seleksi PPDB SMK TI BAZMA;
          </p>
          <p className="text-xs text-gray-500 mb-2">
            3. Jika nantinya anak/tanggungan saya dinyatakan lolos seleksi maka saya memberi izin untuknya bertempat tinggal di asrama selama masa pendidikan berlangsung.
          </p>
          <Select
            name="pernyataanOrangTua"
            value={String(Boolean(formData.pernyataanOrangTua))}
            onValueChange={(value) => updateField("Data orang Tua", "pernyataanOrangTua", value === "true")}
          >
            <SelectTrigger id="pernyataanOrangTua"><SelectValue>{formData.pernyataanOrangTua ? "Ya" : "Tidak"}</SelectValue></SelectTrigger>
            <SelectContent><SelectItem value="true">Ya</SelectItem><SelectItem value="false">Tidak</SelectItem></SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end">
        {status && <FormStatusAlert {...status} onDismiss={() => setStatus(null)} />}
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-xl bg-[#1e3a8a] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#172d6e] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Simpan Data Orang Tua
        </button>
      </div>
    </form>
  );
}
