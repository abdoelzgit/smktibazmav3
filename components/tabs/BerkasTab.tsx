"use client";

import React, { useState } from "react";

export default function BerkasTab() {
  const [selectedFiles, setSelectedFiles] = useState<Record<string, File | null>>({});

  const handleFileChange = (fileKey: string, file: File | undefined) => {
    setSelectedFiles((currentFiles) => ({
      ...currentFiles,
      [fileKey]: file ?? null,
    }));
  };

  return (
    <div>
      <div className="mb-6">
        <span className="bg-[#1e3a8a] text-white px-5 py-2 rounded-lg font-semibold text-base shadow-sm inline-block">
          Upload Berkas
        </span>
      </div>

      <div className="space-y-4">

        <div>
          <label className="block text-sm font-bold text-gray-800 mb-1">
            Kartu Keluarga (KK)
          </label>
          <div className="w-full border border-gray-400 rounded-lg px-3 py-1.5 text-sm text-gray-700">
            <input
              type="file"
              accept=".pdf,image/*"
              onChange={(event) => handleFileChange("kk", event.target.files?.[0])}
              className="w-full file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-900 hover:file:bg-blue-100 cursor-pointer"
            />
            {selectedFiles.kk && (
              <p className="mt-2 truncate text-xs text-green-700">File dipilih: {selectedFiles.kk.name}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-800 mb-1">
            Ktp Orang Tua/Wali Murid
          </label>
          <div className="w-full border border-gray-400 rounded-lg px-3 py-1.5 text-sm text-gray-700">
            <input
              type="file"
              accept=".pdf,image/*"
              onChange={(event) => handleFileChange("ktpwalimurid", event.target.files?.[0])}
              className="w-full file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-900 hover:file:bg-blue-100 cursor-pointer"
            />
            {selectedFiles.ktpwalimurid && (
              <p className="mt-2 truncate text-xs text-green-700">File dipilih: {selectedFiles.ktpwalimurid.name}</p>
            )}
          </div>
        </div>        

        <div>
          <label className="block text-sm font-bold text-gray-800 mb-1">
            KIP/KIS/KPS/PHK/SKTM
          </label>
          <div className="w-full border border-gray-400 rounded-lg px-3 py-1.5 text-sm text-gray-700">
            <input
              type="file"
              accept=".pdf,image/*"
              onChange={(event) => handleFileChange("ktpwalimurid", event.target.files?.[0])}
              className="w-full file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-900 hover:file:bg-blue-100 cursor-pointer"
            />
            {selectedFiles.ktpwalimurid && (
              <p className="mt-2 truncate text-xs text-green-700">File dipilih: {selectedFiles.ktpwalimurid.name}</p>
            )}
          </div>
        </div>        

        <div>
          <label className="block text-sm font-bold text-gray-800 mb-1">
            Akte Kelahiran/Surat Keterangan Lahir
          </label>
          <div className="w-full border border-gray-400 rounded-lg px-3 py-1.5 text-sm text-gray-700">
            <input
              type="file"
              accept=".pdf,image/*"
              onChange={(event) => handleFileChange("akte", event.target.files?.[0])}
              className="w-full file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-900 hover:file:bg-blue-100 cursor-pointer"
            />
            {selectedFiles.akte && (
              <p className="mt-2 truncate text-xs text-green-700">File dipilih: {selectedFiles.akte.name}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-800 mb-1">
            Ijazah / SKL
          </label>
          <div className="w-full border border-gray-400 rounded-lg px-3 py-1.5 text-sm text-gray-700">
            <input
              type="file"
              accept=".pdf,image/*"
              onChange={(event) => handleFileChange("ijazah", event.target.files?.[0])}
              className="w-full file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-900 hover:file:bg-blue-100 cursor-pointer"
            />
            {selectedFiles.ijazah && (
              <p className="mt-2 truncate text-xs text-green-700">File dipilih: {selectedFiles.ijazah.name}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-800 mb-1">
            Rapor Semerter 3-6
          </label>
          <div className="w-full border border-gray-400 rounded-lg px-3 py-1.5 text-sm text-gray-700">
            <input
              type="file"
              accept=".pdf,image/*"
              onChange={(event) => handleFileChange("Rapor", event.target.files?.[0])}
              className="w-full file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-900 hover:file:bg-blue-100 cursor-pointer"
            />
            {selectedFiles.Rapor && (
              <p className="mt-2 truncate text-xs text-green-700">File dipilih: {selectedFiles.Rapor.name}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-800 mb-1">
            Piagam Penghargaan / Prestasi (Jika ada)
          </label>
          <div className="w-full border border-gray-400 rounded-lg px-3 py-1.5 text-sm text-gray-700">
            <input
              type="file"
              accept=".pdf,image/*"
              onChange={(event) => handleFileChange("PiagamPenghargaan", event.target.files?.[0])}
              className="w-full file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-900 hover:file:bg-blue-100 cursor-pointer"
            />
            {selectedFiles.PiagamPenghargaan && (
              <p className="mt-2 truncate text-xs text-green-700">File dipilih: {selectedFiles.PiagamPenghargaan.name}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block text-sm font-bold text-gray-800 mb-1">
            Upload Foto Rumah Yang Ditempati  
          </label>
          <div className="w-full border border-gray-400 rounded-lg px-3 py-1.5 text-sm text-gray-700">
          <label className="block text-sm font-bold text-gray-800 mb-1">
            Tampak Depan Rumah
          </label>
            <input
              type="file"
              accept=".pdf,image/*"
              onChange={(event) => handleFileChange("TampakDepanRumah", event.target.files?.[0])}
              className="w-full file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-900 hover:file:bg-blue-100 cursor-pointer"
            />
            {selectedFiles.TampakDepanRumah && (
              <p className="mt-2 truncate text-xs text-green-700">File dipilih: {selectedFiles.TampakDepanRumah.name}</p>
            )}
          </div>
          
          <div className="w-full border border-gray-400 rounded-lg px-3 py-1.5 text-sm text-gray-700">
          <label className="block text-sm font-bold text-gray-800 mb-1">
            Tampak samping Rumah
          </label>
            <input
              type="file"
              accept=".pdf,image/*"
              onChange={(event) => handleFileChange("TampakSampingRumah", event.target.files?.[0])}
              className="w-full file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-900 hover:file:bg-blue-100 cursor-pointer"
            />
            {selectedFiles.TampakSampingRumah && (
              <p className="mt-2 truncate text-xs text-green-700">File dipilih: {selectedFiles.TampakSampingRumah.name}</p>
            )}
          </div>
         
          <div className="w-full border border-gray-400 rounded-lg px-3 py-1.5 text-sm text-gray-700">
          <label className="block text-sm font-bold text-gray-800 mb-1">
            Kamar Tidur
          </label>
            <input
              type="file"
              accept=".pdf,image/*"
              onChange={(event) => handleFileChange("KamarTidur", event.target.files?.[0])}
              className="w-full file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-900 hover:file:bg-blue-100 cursor-pointer"
            />
            {selectedFiles.KamarTidur && (
              <p className="mt-2 truncate text-xs text-green-700">File dipilih: {selectedFiles.KamarTidur.name}</p>
            )}
          </div>

          <div className="w-full border border-gray-400 rounded-lg px-3 py-1.5 text-sm text-gray-700">
          <label className="block text-sm font-bold text-gray-800 mb-1">
            Ruang Tamu
          </label>
            <input
              type="file"
              accept=".pdf,image/*"
              onChange={(event) => handleFileChange("RuangTamu", event.target.files?.[0])}
              className="w-full file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-900 hover:file:bg-blue-100 cursor-pointer"
            />
            {selectedFiles.RuangTamu && (
              <p className="mt-2 truncate text-xs text-green-700">File dipilih: {selectedFiles.RuangTamu.name}</p>
            )}
          </div>
        </div>


      </div>
    </div>
  );
}