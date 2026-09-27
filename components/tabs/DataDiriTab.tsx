"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { saveDataDiriAction } from "@/app/actions/ppdb-form";
import { useForm } from "@/components/form-context";

export default function DataDiriTab({ action }: { action?: unknown } = {}) {
  const { formData, updateField, updateFields } = useForm();
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("Menyimpan...");
    const formElement = e.currentTarget;
    const data = new FormData(formElement);

    const result = await saveDataDiriAction(data);
    if (result.success) {
      if (result.data && typeof result.data === "object") {
        const resData = result.data as Record<string, unknown>;
        const formatted: Record<string, unknown> = {};
        Object.entries(resData).forEach(([k, v]) => {
          if (v !== null && v !== undefined) {
            formatted[k] = v instanceof Date ? v.toISOString().split("T")[0] : v;
          }
        });
        updateFields("Data Diri", formatted);
      }
      setStatus("Data diri berhasil disimpan.");
    } else {
      setStatus(result.error ?? "Data diri gagal disimpan.");
    }
  };

  useEffect(() => {
    return () => {
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setPhotoPreview((currentPreview) => {
      if (currentPreview) {
        URL.revokeObjectURL(currentPreview);
      }
      return URL.createObjectURL(file);
    });
  };

  const displayPhoto = photoPreview || formData.fotoFormalUrl || null;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="mb-6">
        <span className="bg-[#1e3a8a] text-white px-5 py-2 rounded-lg font-semibold text-base shadow-sm inline-block">
          Data Diri
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Upload Foto */}
        <div className="lg:col-span-4 border border-gray-300 rounded-2xl p-6 flex flex-col items-center justify-center bg-white shadow-sm">
          <h3 className="font-bold text-gray-800 text-lg mb-4">Foto Formal</h3>
          <div className="relative w-40 h-48 bg-gray-200 rounded-md overflow-hidden mb-6 flex items-center justify-center border">
            {displayPhoto ? (
              <Image src={displayPhoto} alt="Preview foto formal" fill unoptimized className="object-cover" />
            ) : (
              <span className="text-gray-400 text-sm">Preview Foto</span>
            )}
          </div>
          <label className="border-2 border-gray-800 text-gray-800 font-semibold px-6 py-2 rounded-full cursor-pointer hover:bg-gray-100 transition-colors text-sm">
            {formData.fotoFormalUrl ? "Ganti Foto" : "Unggah Foto"}
            <input
              name="fotoFormalUrl"
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
              required={!formData.fotoFormalUrl && !photoPreview}
            />
          </label>
        </div>

        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">Nama Lengkap</label>
            <input
              name="namaLengkap"
              type="text"
              value={formData.namaLengkap ?? ""}
              onChange={(e) => updateField("Data Diri", "namaLengkap", e.target.value)}
              placeholder="Masukkan nama lengkap"
              className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">Email</label>
            <input
              name="email"
              type="email"
              value={formData.email ?? ""}
              onChange={(e) => updateField("Data Diri", "email", e.target.value)}
              placeholder="Masukkan email"
              className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">Tempat lahir</label>
            <input
              name="tempatLahir"
              type="text"
              value={formData.tempatLahir ?? ""}
              onChange={(e) => updateField("Data Diri", "tempatLahir", e.target.value)}
              placeholder="Masukkan tempat lahir"
              className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">Anak Ke / Jumlah Saudara</label>
            <input
              name="anakKe"
              type="text"
              value={formData.anakKe ?? ""}
              onChange={(e) => updateField("Data Diri", "anakKe", e.target.value)}
              placeholder="Contoh: 2 / 3"
              className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">No Hp</label>
            <input
              name="noHpWhatsapp"
              type="text"
              value={formData.noHpWhatsapp ?? ""}
              onChange={(e) => updateField("Data Diri", "noHpWhatsapp", e.target.value)}
              placeholder="Masukkan nomor handphone"
              className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">Tanggal Lahir</label>
            <input
              name="tanggalLahir"
              type="date"
              value={
                formData.tanggalLahir
                  ? typeof formData.tanggalLahir === "string"
                    ? formData.tanggalLahir.split("T")[0]
                    : new Date(formData.tanggalLahir).toISOString().split("T")[0]
                  : ""
              }
              onChange={(e) => updateField("Data Diri", "tanggalLahir", e.target.value)}
              className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">Kewarganegaraan</label>
            <input
              name="kewarganegaraan"
              type="text"
              value={formData.kewarganegaraan ?? "Indonesia"}
              onChange={(e) => updateField("Data Diri", "kewarganegaraan", e.target.value)}
              placeholder="Masukkan kewarganegaraan"
              className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">NIK</label>
            <input
              name="nik"
              type="text"
              value={formData.nik ?? ""}
              onChange={(e) => updateField("Data Diri", "nik", e.target.value)}
              placeholder="Masukkan NIK"
              className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">NISN</label>
            <input
              name="nisn"
              type="text"
              value={formData.nisn ?? ""}
              onChange={(e) => updateField("Data Diri", "nisn", e.target.value)}
              placeholder="Masukkan NISN"
              className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-800 mb-1">Alamat Saat ini</label>
            <input
              name="alamatLengkap"
              type="text"
              value={formData.alamatLengkap ?? ""}
              onChange={(e) => updateField("Data Diri", "alamatLengkap", e.target.value)}
              placeholder="Masukkan alamat saat ini"
              className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">Akun Media Sosial</label>
            <input
              name="mediaSosial"
              type="text"
              value={formData.mediaSosial ?? ""}
              onChange={(e) => updateField("Data Diri", "mediaSosial", e.target.value)}
              placeholder="Masukkan Akun Media Sosial"
              className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">Status Dalam Keluarga</label>
            <select
              name="statusKeluarga"
              value={formData.statusKeluarga ?? "ANAK_KANDUNG"}
              onChange={(e) => updateField("Data Diri", "statusKeluarga", e.target.value)}
              className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="ANAK_KANDUNG">Anak Kandung</option>
              <option value="ANAK_TIRI">Anak Tiri</option>
              <option value="ANAK_ANGKAT">Anak Angkat</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">Saat Ini Tinggal Bersama</label>
            <input
              name="tinggalBersama"
              type="text"
              value={formData.tinggalBersama ?? ""}
              onChange={(e) => updateField("Data Diri", "tinggalBersama", e.target.value)}
              placeholder="Masukkan Tinggal Bersama"
              className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">Bahasa Asing</label>
            <input
              name="bahasaAsing"
              type="text"
              value={formData.bahasaAsing ?? ""}
              onChange={(e) => updateField("Data Diri", "bahasaAsing", e.target.value)}
              placeholder="Masukkan Bahasa Asing Yang Dikuasai"
              className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">Riwayat Prestasi</label>
            <p className="text-xs text-gray-500 mb-2">Contoh: Jenis Prestasi-tingkat-nama prestasi-tahun penyelenggaraan</p>
            <input
              name="riwayatPrestasi"
              type="text"
              value={formData.riwayatPrestasi ?? ""}
              onChange={(e) => updateField("Data Diri", "riwayatPrestasi", e.target.value)}
              placeholder="Masukan Prestasi"
              className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">Riwayat Organisasi</label>
            <p className="text-xs text-gray-500 mb-2">Contoh: bidang organisasi-tingkat-nama organisasi-tahun kepengurusan</p>
            <input
              name="riwayatOrganisasi"
              type="text"
              value={formData.riwayatOrganisasi ?? ""}
              onChange={(e) => updateField("Data Diri", "riwayatOrganisasi", e.target.value)}
              placeholder="Masukkan Riwayat Organisasi"
              className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">Berat Badan (KG)</label>
            <input
              name="beratBadan"
              type="text"
              value={formData.beratBadan ?? ""}
              onChange={(e) => updateField("Data Diri", "beratBadan", e.target.value)}
              placeholder="Masukkan Berat Badan"
              className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">Tinggi Badan (CM)</label>
            <input
              name="tinggiBadan"
              type="text"
              value={formData.tinggiBadan ?? ""}
              onChange={(e) => updateField("Data Diri", "tinggiBadan", e.target.value)}
              placeholder="Masukkan Tinggi Badan"
              className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">Riwayat Penyakit</label>
            <input
              name="riwayatPenyakit"
              type="text"
              value={formData.riwayatPenyakit ?? ""}
              onChange={(e) => updateField("Data Diri", "riwayatPenyakit", e.target.value)}
              placeholder="Masukkan Riwayat Penyakit"
              className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">Apakah Anda Pernah Merokok?</label>
            <select
              name="isMerokok"
              value={String(Boolean(formData.isMerokok))}
              onChange={(e) => updateField("Data Diri", "isMerokok", e.target.value === "true")}
              className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="false">Tidak</option>
              <option value="true">Ya</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">Apakah Anda Buta Warna?</label>
            <select
              name="isButaWarna"
              value={String(Boolean(formData.isButaWarna))}
              onChange={(e) => updateField("Data Diri", "isButaWarna", e.target.value === "true")}
              className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="false">Tidak</option>
              <option value="true">Ya</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-800 mb-1">Pernyataan Calon Siswa</label>
            <p className="text-xs text-gray-500 mb-2">1. Seluruh pernyataan data dan informasi beserta seluruh dokumen yang saya lampirkan dalam berkas pendaftaran PPDB SMK TI BAZMA TA 2021-2022 adalah benar.</p>
            <p className="text-xs text-gray-500 mb-2">2. Apabila diperlukan, saya bersedia memberikan informasi lebih lanjut untuk melengkapi dokumen pendaftaran ini.</p>
            <select
              name="pernyataanSiswa"
              value={String(Boolean(formData.pernyataanSiswa))}
              onChange={(e) => updateField("Data Diri", "pernyataanSiswa", e.target.value === "true")}
              className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="true">Ya</option>
              <option value="false">Tidak</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">Apakah Anda Memiliki Riwayat Penyakit Menular?</label>
            <select
              name="hasPenyakitMenular"
              value={String(Boolean(formData.hasPenyakitMenular))}
              onChange={(e) => updateField("Data Diri", "hasPenyakitMenular", e.target.value === "true")}
              className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="false">Tidak</option>
              <option value="true">Ya</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        {status && <p className="mr-4 self-center text-sm text-gray-600" role="status">{status}</p>}
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-xl bg-[#1e3a8a] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#172d6e] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Simpan Data Diri
        </button>
      </div>
    </form>
  );
}