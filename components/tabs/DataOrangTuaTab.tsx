"use client";

import React from "react";

export default function DataOrangTuaTab() {
  return (
    <div>
      <div className="mb-6">
        <span className="bg-[#1e3a8a] text-white px-5 py-2 rounded-lg font-semibold text-base shadow-sm inline-block">
          Data Orang Tua
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        <div>
          <label className="block text-sm font-bold text-gray-800 mb-1">Nama Ayah</label>
          <input type="text" placeholder="Masukkan nama ayah" className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-800 mb-1">Pekerjaan Ayah</label>
          <input type="text" placeholder="Masukkan pekerjaan ayah" className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-800 mb-1">Nama Ibu</label>
          <input type="text" placeholder="Masukkan nama ibu" className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-800 mb-1">Pekerjaan Ibu</label>
          <input type="text" placeholder="Masukkan pekerjaan ibu" className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-800 mb-1">No HP Orang Tua</label>
          <input type="text" placeholder="+62..." className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        
         <div>
          <label className="block text-sm font-bold text-gray-800 mb-1">
            Keadaan Orang Tua
          </label>
          <select className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
            <option value="Orang Tua Saya Lengkap">Orang Tua Saya Lengkap</option>
            <option value="Saya Yatim">Saya Yatim</option>
            <option value="Saya Piatu">Saya Piatu</option>
            <option value="Saya Yatim Piatu">Saya Yatim Piatu</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-800 mb-1">Penghasilan Ayah/Ibu</label>
          <input type="text" placeholder="Masukan Penghasilan Orang Tua" className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        
        <div>
          <label className="block text-sm font-bold text-gray-800 mb-1">Alamat Domisili Ayah</label>
          <input type="text" placeholder="Alamat Domisili Ayah" className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

                    <div>
          <label className="block text-sm font-bold text-gray-800 mb-1">
            Pernyataan Orang Tua / Wali Calon Siswa <br />
            Saya dengan sungguh-sungguh menyatakan bahwa :
          </label>
          <p className="text-xs text-gray-500 mb-2">
           1. Seluruh pernyataan data dan informasi beserta seluruh dokumen yang dilampirkan dalam berkas pendaftaran PPDB SMK TI BAZMA ΤΑ 2021-2022 adalah benar;
          </p>
          <p className="text-xs text-gray-500 mb-2">
           2. Saya mendukung dan memberi izin anak/tanggungan saya dalam mengikuti keseluruhan proses seleksi PPDB SMK TI BAZMA;
          </p>
          <p className="text-xs text-gray-500 mb-2">
          3. Jika nantinya anak/tanggungan saya dinyatakan lolos seleksi maka saya memberi izin untuknya bertempat tinggal di asrama selama masa pendidikan berlangsung.
          </p>
          <select className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
            <option value="Ya">Ya</option>
            <option value="Tidak">Tidak</option>
          </select>
        </div>
      </div>
    </div>
  );
}