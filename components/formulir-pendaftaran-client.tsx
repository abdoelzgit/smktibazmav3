"use client";

import React, { useState, useSyncExternalStore } from "react";
import { FileText, Files, School, Trophy, UserRound, UsersRound, BadgeCheck } from "lucide-react";
import { FormProvider } from "@/components/form-context";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DataDiriTab from "@/components/tabs/DataDiriTab";
import DataOrangTuaTab from "@/components/tabs/DataOrangTuaTab";
import BerkasTab from "@/components/tabs/BerkasTab";
import SuratRekomendasiTab from "@/components/tabs/SuratRekomendasiTab";
import DataSekolahAsalTab from "@/components/tabs/DataSekolahAsalTab";
import RiwayatTab from "@/components/tabs/RiwayatTab";
import FinalisasiTab from "@/components/tabs/FinalisasiTab";
import { saveDataDiriAction, saveDataOrangTuaAction, saveDataSekolahAction, saveRekomendasiAction, saveRiwayatSiswaAction, submitPendaftaranAction } from "@/app/actions/ppdb-form";
import type { AllFormData, TabName } from "@/lib/validations/ppdb-form";

interface PendaftaranPpdbClientProps {
  initialData: AllFormData | null;
  isFinalized: boolean;
  savedTabs: Partial<Record<TabName, boolean>>;
}

const steps: { id: TabName; title: string; description: string; icon: typeof UserRound }[] = [
  { id: "Data Diri", title: "Data Diri", description: "Identitas dan informasi pribadi", icon: UserRound },
  { id: "Riwayat", title: "Riwayat", description: "Prestasi, organisasi, dan bahasa", icon: Trophy },
  { id: "Data orang Tua", title: "Data Orang Tua", description: "Informasi orang tua atau wali", icon: UsersRound },
  { id: "Data sekolah Asal", title: "Sekolah Asal", description: "Informasi pendidikan sebelumnya", icon: School },
  { id: "Berkas", title: "Dokumen", description: "Berkas pendukung pendaftaran", icon: Files },
  { id: "Surat Rekomendasi", title: "Surat Rekomendasi", description: "Informasi pemberi rekomendasi", icon: FileText },
  { id: "Finalisasi", title: "Finalisasi", description: "Periksa dan kunci formulir", icon: BadgeCheck },
];

const subscribeToHydration = () => () => {};
const getHydrationSnapshot = () => true;
const getServerHydrationSnapshot = () => false;

export function PendaftaranPpdbClient({ initialData, isFinalized, savedTabs }: PendaftaranPpdbClientProps) {
  const [isLocked, setIsLocked] = useState(isFinalized);
  const [activeTab, setActiveTab] = useState<TabName>(() => {
    if (typeof window === "undefined") return "Data Diri";
    const tab = new URLSearchParams(window.location.search).get("tab");
    return steps.find((step) => step.id === tab)?.id ?? "Data Diri";
  });
  const mounted = useSyncExternalStore(subscribeToHydration, getHydrationSnapshot, getServerHydrationSnapshot);
  const activeStep = steps.find((step) => step.id === activeTab) ?? steps[0];
  const ActiveStepIcon = activeStep.icon;

  const renderTabContent = () => {
    switch (activeTab) {
      case "Data Diri":
        return <DataDiriTab action={saveDataDiriAction} />;
      case "Riwayat":
        return <RiwayatTab action={saveRiwayatSiswaAction} />;
      case "Finalisasi":
        return <FinalisasiTab isFinalized={isLocked} onFinalized={() => setIsLocked(true)} action={submitPendaftaranAction} />;
      case "Data orang Tua":
        return <DataOrangTuaTab action={saveDataOrangTuaAction} />;
      case "Berkas":
        return <BerkasTab />;
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
      <div className="min-h-[28rem]  flex-1 rounded-xl border border-gray-200 bg-white p-6">
        <div className="h-5 w-36 animate-pulse rounded bg-gray-100" />
        <div className="mt-3 h-3 w-64 max-w-full animate-pulse rounded bg-gray-100" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="h-24 animate-pulse rounded-lg bg-gray-50" />
          <div className="h-24 animate-pulse rounded-lg bg-gray-50" />
        </div>
      </div>
    );
  }

  return (
    <FormProvider initialData={initialData} initialSavedTabs={savedTabs}>
      <div className="ppdb-form-layout flex min-h-[calc(100dvh-8rem)]  flex-1 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white">
        <nav aria-label="Langkah formulir pendaftaran" className="border-b border-gray-200 bg-white px-3 sm:px-5 lg:px-7">
          <div className="py-3 md:hidden">
            <label htmlFor="mobile-form-step" className="mb-1.5 block text-xs font-medium text-gray-600">
              Langkah {steps.findIndex((step) => step.id === activeTab) + 1} dari {steps.length}
            </label>
            <Select
              value={activeTab}
              onValueChange={(value) => {
                const selectedStep = steps.find((step) => step.id === value);
                if (selectedStep) setActiveTab(selectedStep.id);
              }}
            >
              <SelectTrigger id="mobile-form-step" className="h-11 w-full text-sm font-semibold text-[#132b6d]">
                <SelectValue>
                  <span className="flex min-w-0 items-center gap-2">
                    <ActiveStepIcon className="size-4 shrink-0" aria-hidden="true" />
                    <span className="truncate">{activeStep.title}</span>
                  </span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent align="start">
                {steps.map((step) => {
                  const Icon = step.icon;
                  return (
                    <SelectItem key={step.id} value={step.id}>
                      <Icon className="size-4" aria-hidden="true" />
                      {step.title}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          <ol className="mx-auto hidden max-w-5xl overflow-x-auto md:flex">
            {steps.map((step, index) => {
              const isActive = activeTab === step.id;
              const Icon = step.icon;
              return (
                <li key={step.id} className="relative min-w-0 flex-1">
                  {index < steps.length - 1 && (
                    <span aria-hidden="true" className="absolute left-1/2 right-[-50%] top-[30px] border-t border-dashed border-gray-300" />
                  )}
                  <button
                    type="button"
                    aria-current={isActive ? "step" : undefined}
                    onClick={() => setActiveTab(step.id)}
                    className={`relative z-10 mx-auto flex min-h-[5.5rem] w-full flex-col items-center justify-center gap-2 px-2 py-2 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#132b6d] ${isActive ? "text-[#132b6d]" : "text-gray-600 hover:text-gray-900"}`}
                  >
                    <span className={`flex size-10 shrink-0 items-center justify-center rounded-full border bg-white ${isActive ? "border-blue-800 text-blue-800" : "border-gray-300 text-gray-500"}`}>
                      {isActive ? <Icon className="size-3.5" aria-hidden="true" /> : <span className="text-[11px] font-medium">{index + 1}</span>}
                    </span>
                    <span className={`max-w-full truncate text-sm leading-5 ${isActive ? "font-semibold" : "font-medium"}`}>{step.title}</span>
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>

        <section className="min-w-0 flex-1 bg-white">
          

          <div className="mx-auto max-w-5xl px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-7">
            
            <fieldset disabled={isLocked} className="contents">{renderTabContent()}</fieldset>
          </div>
        </section>
      </div>
    </FormProvider>
  );
}
