"use client";

import React, { useState } from "react";
import DataDiriTab from "@/components/tabs/DataDiriTab";
import DataOrangTuaTab from "@/components/tabs/DataOrangTuaTab";
import BerkasTab from "@/components/tabs/BerkasTab";
import SuratRekomendasiTab from "@/components/tabs/SuratRekomendasiTab";
import DataSekolahAsalTab from "@/components/tabs/DataSekolahAsalTab";

export default function PendaftaranPpdb() {
  // 1. State untuk menyimpan tab yang aktif
  const [activeTab, setActiveTab] = useState<string>("Data Diri");

  const navTabs = [
    "Data Diri",
    "Data orang Tua",
    "Berkas",
    "Surat Rekomendasi",
    "Data sekolah Asal",
  ];

  // 2. Fungsi render dinamis sesuai tab aktif
  const renderTabContent = () => {
    switch (activeTab) {
      case "Data Diri":
        return <DataDiriTab />;
      case "Data orang Tua":
        return <DataOrangTuaTab />;
      case "Berkas":
        return <BerkasTab />;
      case "Surat Rekomendasi":
        return <SuratRekomendasiTab />;
      case "Data sekolah Asal":
        return <DataSekolahAsalTab />;
      default:
        return <DataDiriTab />;
    }
  };

  return (
    <div className="flex-1 bg-white p-8 overflow-y-auto min-h-screen">
      {/* Navigation Tabs Header */}
      <div className="flex items-center gap-8 border-b pb-2 mb-6 text-sm font-semibold text-gray-500 ">
        {navTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2 transition-all relative ${
              activeTab === tab
                ? "text-blue-900 font-bold border-b-2 border-blue-900"
                : "hover:text-gray-800"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Konten Dinamis yang Berubah Sesuai Tab */}
      <div className="mt-4">
        {renderTabContent()}
      </div>
    </div>
  );
}