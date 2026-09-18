"use client";

import React from "react";

export default function BerkasTab() {
  return (
    <div>
      <div className="mb-6">
        <span className="bg-[#1e3a8a] text-white px-5 py-2 rounded-lg font-semibold text-base shadow-sm inline-block">
          Upload Berkas
        </span>
      </div>

      <div className="space-y-4">
        <div className="border p-4 rounded-lg flex items-center justify-between">
          <span>Kartu Keluarga (KK)</span>
          <input type="file" className="text-sm" />
        </div>
        <div className="border p-4 rounded-lg flex items-center justify-between">
          <span>Akte Kelahiran</span>
          <input type="file" className="text-sm" />
        </div>
        <div className="border p-4 rounded-lg flex items-center justify-between">
          <span>Ijazah / SKL</span>
          <input type="file" className="text-sm" />
        </div>
      </div>
    </div>
  );
}