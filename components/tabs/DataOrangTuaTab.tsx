"use client";

import React, { useState } from "react";
import { saveDataOrangTuaAction } from "@/app/actions/ppdb-form";

export default function DataOrangTuaTab() {
  const [status, setStatus] = useState<string | null>(null);

  const handleSubmit = async (formData: FormData) => {
    setStatus("Menyimpan...");
    const result = await saveDataOrangTuaAction(formData);
    setStatus(result.success ? "Data orang tua berhasil disimpan." : result.error ?? "Data orang tua gagal disimpan.");
  };

  return (
    <form action={handleSubmit} className="space-y-6">
      <div className="mb-6">
        <span className="bg-[#1e3a8a] text-white px-5 py-2 rounded-lg font-semibold text-base shadow-sm inline-block">
          Data Orang Tua
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        <div>
          <label className="block text-sm font-bold text-gray-800 mb-1">Nama Ayah</label>
          <input name="namaAyah" type="text" placeholder="Masukkan nama ayah" className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-800 mb-1">Pekerjaan Ayah</label>
          <input name="pekerjaanAyah" type="text" placeholder="Masukkan pekerjaan ayah" className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-800 mb-1">Nama Ibu</label>
          <input name="namaIbu" type="text" placeholder="Masukkan nama ibu" className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-800 mb-1">Pekerjaan Ibu</label>
          <input name="pekerjaanIbu" type="text" placeholder="Masukkan pekerjaan ibu" className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-800 mb-1">No HP Orang Tua</label>
          <input name="noHpOi" type="text" placeholder="+62..." className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-800 mb-1">Keadaan Orang Tua</label>
          <select name="keadaanOrangTua" className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
            <option value="LENGKAP">Orang Tua Saya Lengkap</option>
            <option value="YATIM">Saya Yatim</option>
            <option value="PIATU">Saya Piatu</option>
            <option value="YATIM_PIATU">Saya Yatim Piatu</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-800 mb-1">Penghasilan Ayah/Ibu</label>
          <input name="penghasilanOrangTua" type="text" placeholder="Masukan Penghasilan Orang Tua" className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-800 mb-1">Alamat Domisili Ayah</label>
          <input name="alamatDomisiliAyah" type="text" placeholder="Alamat Domisili Ayah" className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" />
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
          <select name="pernyataanOrangTua" className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
            <option value="true">Ya</option>
            <option value="false">Tidak</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end">
        {status && <p className="mr-4 self-center text-sm text-gray-600" role="status">{status}</p>}
        <button type="submit" className="inline-flex items-center justify-center rounded-xl bg-[#1e3a8a] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#172d6e] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
          Simpan Data Orang Tua
        </button>
      </div>
    </form>
  );
}