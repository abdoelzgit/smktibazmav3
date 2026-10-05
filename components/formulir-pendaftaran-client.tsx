"use client";

import React, { useEffect, useState } from "react";
import { FormProvider } from "@/components/form-context";
import DataDiriTab from "@/components/tabs/DataDiriTab";
import DataOrangTuaTab from "@/components/tabs/DataOrangTuaTab";
import BerkasTab from "@/components/tabs/BerkasTab";
import SuratRekomendasiTab from "@/components/tabs/SuratRekomendasiTab";
import DataSekolahAsalTab from "@/components/tabs/DataSekolahAsalTab";
import { saveDataDiriAction } from "@/app/actions/ppdb-form";
import { saveDataOrangTuaAction } from "@/app/actions/ppdb-form";
import { saveDataSekolahAction } from "@/app/actions/ppdb-form";
import { saveRekomendasiAction } from "@/app/actions/ppdb-form";
import { uploadBerkasAction } from "@/app/actions/ppdb-form";
import type { AllFormData } from "@/lib/validations/ppdb-form";

interface PendaftaranPpdbClientProps {
  initialData: AllFormData | null;
}

export function PendaftaranPpdbClient({ initialData }: PendaftaranPpdbClientProps) {
  const [activeTab, setActiveTab] = useState<string>("Data Diri");
  const [mounted, setMounted] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setMounted(true);
    const tab = new URLSearchParams(window.location.search).get("tab");
    const allowedTabs = [
      "Data Diri",
      "Data orang Tua",
      "Berkas",
      "Surat Rekomendasi",
      "Data sekolah Asal",
    ];

    if (tab && allowedTabs.includes(tab)) {
      setActiveTab(tab);
    }
  }, []);

  const navTabs = [
    "Data Diri",
    "Data orang Tua",
    "Berkas",
    "Surat Rekomendasi",
    "Data sekolah Asal",
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "Data Diri":
        return <DataDiriTab action={saveDataDiriAction} />;
      case "Data orang Tua":
        return <DataOrangTuaTab action={saveDataOrangTuaAction} />;
      case "Berkas":
        return <BerkasTab action={uploadBerkasAction} />;
      case "Surat Rekomendasi":
        return <SuratRekomendasiTab action={saveRekomendasiAction} />;
      case "Data sekolah Asal":
        return <DataSekolahAsalTab action={saveDataSekolahAction} />;
      default:
        return <DataDiriTab action={saveDataDiriAction} />;
    }
  };

  if (!mounted) {
    return (
      <div className="flex-1 bg-white p-8 overflow-y-auto min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900" />
        </div>
      </div>
    );
  }

  return (
    <FormProvider initialData={initialData}>
      <div className="flex-1 bg-white p-8 overflow-y-auto min-h-screen">
        {/* Navigation Tabs Header */}
        <div className="flex items-center gap-8 border-b pb-2 mb-6 text-sm font-semibold text-gray-500 ">
          {navTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 transition-all relative ${activeTab === tab
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
    </FormProvider>
  );
}