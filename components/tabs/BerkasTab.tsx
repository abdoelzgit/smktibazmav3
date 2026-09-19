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
            Akte Kelahiran
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
      </div>
    </div>
  );
}