"use client";

import React, { useState } from "react";
import { ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { saveDataSekolahAction } from "@/app/actions/ppdb-form";
import { useForm } from "@/components/form-context";
import { FormStatusAlert } from "@/components/form-status-alert";

export default function DataSekolahAsalTab({ action }: { action?: unknown } = {}) {
  const { formData, updateField, updateFields } = useForm();
  const [status, setStatus] = useState<{ message: string; type: "info" | "success" | "error" } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus({ message: "Menyimpan data sekolah asal...", type: "info" });
    const formElement = e.currentTarget;
    const data = new FormData(formElement);

    const result = await saveDataSekolahAction(data);
    if (result.success) {
      if (result.data && typeof result.data === "object") {
        updateFields("Data sekolah Asal", result.data as Record<string, unknown>);
      }
      setStatus({ message: "Data sekolah asal berhasil disimpan.", type: "success" });
    } else {
      setStatus({ message: result.error ?? "Data sekolah gagal disimpan.", type: "error" });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full min-w-0 space-y-6">
      <div className="mb-6">
        <span className="bg-[#1e3a8a] text-white px-5 py-2 rounded-lg font-semibold text-base shadow-sm inline-block">
          Data Sekolah Asal
        </span>
      </div>

      <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
        <div>
          <label htmlFor="namaSekolahAsal" className="mb-1.5 block text-sm font-semibold text-gray-800">
            Nama Sekolah Asal (SMP / MTs)
          </label>
          <Input
            id="namaSekolahAsal"
            name="namaSekolahAsal"
            type="text"
            value={formData.namaSekolahAsal ?? ""}
            onChange={(e) => updateField("Data sekolah Asal", "namaSekolahAsal", e.target.value)}
            placeholder="Contoh: SMP Negeri 1 Ciomas"
            className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <div className="mb-1.5 flex h-5 items-center justify-between gap-3">
            <label htmlFor="npsnSekolah" className="block text-sm font-semibold leading-5 text-gray-800">NPSN Sekolah</label>
            <a
              href="https://sekolah.data.kemendikdasmen.go.id/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Cari NPSN di situs Data Sekolah"
              className="inline-flex shrink-0 items-center gap-1 rounded text-xs leading-5 font-medium text-[#132b6d] underline underline-offset-2 hover:text-[#0f2257] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#132b6d]"
            >
              Cari NPSN <ExternalLink className="size-3" aria-hidden="true" />
            </a>
          </div>

          <Input
            id="npsnSekolah"
            name="npsnSekolah"
            type="text"
            value={formData.npsnSekolah ?? ""}
            onChange={(e) => updateField("Data sekolah Asal", "npsnSekolah", e.target.value)}
            placeholder="Masukkan NPSN Sekolah"
            className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="statusSekolah" className="mb-1.5 block text-sm font-semibold text-gray-800">
            Status Sekolah
          </label>
          <Select
            name="statusSekolah"
            value={formData.statusSekolah ?? "NEGERI"}
            onValueChange={(value) => updateField("Data sekolah Asal", "statusSekolah", String(value ?? ""))}
          >
            <SelectTrigger id="statusSekolah"><SelectValue>{formData.statusSekolah === "SWASTA" ? "Swasta" : "Negeri"}</SelectValue></SelectTrigger>
            <SelectContent><SelectItem value="NEGERI">Negeri</SelectItem><SelectItem value="SWASTA">Swasta</SelectItem></SelectContent>
          </Select>
        </div>

        <div>
          <label htmlFor="tahunLulus" className="mb-1.5 block text-sm font-semibold text-gray-800">
            Tahun Lulus
          </label>
          <Input
            id="tahunLulus"
            name="tahunLulus"
            type="text"
            value={formData.tahunLulus ?? ""}
            onChange={(e) => updateField("Data sekolah Asal", "tahunLulus", e.target.value)}
            placeholder="Contoh: 2025"
            className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="alamatSekolah" className="mb-1.5 block text-sm font-semibold text-gray-800">
            Alamat Lengkap Sekolah Asal
          </label>
          <Textarea
            id="alamatSekolah"
            name="alamatSekolah"
            rows={2}
            value={formData.alamatSekolah ?? ""}
            onChange={(e) => updateField("Data sekolah Asal", "alamatSekolah", e.target.value)}
            placeholder="Masukkan jalan, kecamatan, kabupaten/kota..."
            className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-gray-200 pt-4 sm:flex-row sm:items-center sm:justify-end">
        {status && <FormStatusAlert {...status} onDismiss={() => setStatus(null)} />}
        <button
          type="submit"
          className="inline-flex min-h-11 items-center justify-center rounded-md bg-[#132b6d] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#0f2257] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#132b6d] focus-visible:ring-offset-2"
        >
          Simpan Data Sekolah Asal
        </button>
      </div>
    </form>
  );
}
