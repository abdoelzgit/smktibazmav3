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
      </div>
    </div>
  );
}