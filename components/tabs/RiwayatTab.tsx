"use client";

import { useState, type FormEvent } from "react";
import { Check, Eye, FileText, Plus, Trash2 } from "lucide-react";
import { useForm } from "@/components/form-context";
import { FormStatusAlert } from "@/components/form-status-alert";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { DocumentPreviewDialog } from "@/components/ppdb-document-preview";
import { format, parseISO } from "date-fns";
import { id } from "date-fns/locale";
import { saveRiwayatSiswaAction } from "@/app/actions/ppdb-form";

type Entry = { id: string; [key: string]: string };
const makeEntry = (fields: string[]): Entry => ({ id: crypto.randomUUID(), ...Object.fromEntries(fields.map((field) => [field, ""])) });

export default function RiwayatTab({ isLocked = false, action }: { isLocked?: boolean; action?: unknown } = {}) {
  void action;
  const { formData, updateField, updateFields } = useForm();
  const [files, setFiles] = useState<Record<string, File>>({});
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({ riwayatPrestasiItems: true });
  const [status, setStatus] = useState<{ message: string; type: "info" | "success" | "error" } | null>(null);
  const [preview, setPreview] = useState<{ file: File | string; title: string } | null>(null);
  const awards = formData.riwayatPrestasiItems ?? [];
  const organizations = formData.riwayatOrganisasiItems ?? [];
  const languages = formData.riwayatBahasaItems ?? [];

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData();
    data.set("riwayatPrestasiItems", JSON.stringify(awards));
    data.set("riwayatOrganisasiItems", JSON.stringify(organizations));
    data.set("riwayatBahasaItems", JSON.stringify(languages));
    Object.entries(files).forEach(([entryId, file]) => data.set(`bukti-${entryId}`, file));
    setStatus({ message: "Menyimpan riwayat…", type: "info" });
    const result = await saveRiwayatSiswaAction(data);
    if (result.success && result.data) {
      updateFields("Riwayat", result.data as Record<string, unknown>);
      setFiles({});
      setStatus({ message: "Riwayat berhasil disimpan.", type: "success" });
    } else {
      setStatus({ message: result.error ?? "Riwayat gagal disimpan.", type: "error" });
    }
  };

  const updateEntry = (fieldName: string, list: Entry[], entryId: string, key: string, value: string) =>
    updateField("Riwayat", fieldName, list.map((item) => item.id === entryId ? { ...item, [key]: value } : item));

  const field = (entry: Entry, key: string, label: string, list: Entry[], fieldName: string) => (
    <label className="block min-w-0 text-sm font-medium text-gray-700" key={key}>
      {label}
      <Input className="mt-1" value={entry[key] ?? ""} onChange={(event) => updateEntry(fieldName, list, entry.id, key, event.target.value)} />
    </label>
  );

  const section = (title: string, list: Entry[], fieldName: string, fields: [string, string][], values: string[]) => {
    const isOpen = openSections[fieldName] ?? false;
    const panelId = `${fieldName}-panel`;
    return (
      <section className="border-b border-[#CFCFCF] pb-3" key={fieldName}>
        <div className="flex items-center gap-3">
          <button type="button" aria-expanded={isOpen} aria-controls={panelId} onClick={() => setOpenSections((current) => ({ ...current, [fieldName]: !isOpen }))} className="group flex min-h-14 flex-1 items-center gap-3 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#37497A]">
            <span className="font-semibold text-gray-900 group-hover:text-[#132b6d]">{title}</span>
          </button>
          {!isLocked && <button type="button" className="inline-flex min-h-10 shrink-0 items-center gap-1 text-sm font-medium text-[#132b6d]" onClick={() => { updateField("Riwayat", fieldName, [...list, makeEntry(values)]); setOpenSections((current) => ({ ...current, [fieldName]: true })); }}><Plus className="size-4" />Tambah</button>}
        </div>
        <div id={panelId} role="region" aria-label={title} aria-hidden={!isOpen} className={`grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
          <div className="min-h-0 overflow-hidden">
            <div className="space-y-3 pt-1">
              {list.map((entry, index) => (
                <article key={entry.id} className="grid gap-3 rounded-lg border border-gray-200 p-4 sm:grid-cols-2">
                  <div className="flex items-center justify-between sm:col-span-2">
                    <h3 className="text-sm font-medium">{title} {index + 1}</h3>
                    {!isLocked && <button type="button" aria-label={`Hapus ${title} ${index + 1}`} onClick={() => { updateField("Riwayat", fieldName, list.filter((item) => item.id !== entry.id)); setFiles((current) => { const next = { ...current }; delete next[entry.id]; return next; }); if (list.length === 1) setOpenSections((current) => ({ ...current, [fieldName]: false })); }}><Trash2 className="size-4 text-gray-500" /></button>}
                  </div>
                  {fields.map(([key, label]) => field(entry, key, label, list, fieldName))}
                  {fieldName === "riwayatPrestasiItems" && <>
                    <label className="text-sm font-medium">Tingkat prestasi
                      <Select value={entry.tingkat} onValueChange={(value) => updateEntry(fieldName, list, entry.id, "tingkat", String(value ?? ""))}>
                        <SelectTrigger className="mt-1"><SelectValue placeholder="Pilih tingkat prestasi" /></SelectTrigger>
                        <SelectContent>{["Sekolah", "Kecamatan", "Kabupaten/Kota", "Provinsi", "Nasional", "Internasional"].map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent>
                      </Select>
                    </label>
                    <label className="text-sm font-medium">Tanggal prestasi
                      <Popover><PopoverTrigger render={<Button type="button" variant="outline" className="mt-1 h-10 w-full justify-start gap-2 rounded-md border-gray-300 font-normal">{entry.tanggal ? format(parseISO(entry.tanggal), "d MMMM yyyy", { locale: id }) : "Pilih tanggal"}</Button>} /><PopoverContent className="w-auto overflow-hidden p-0" align="start"><Calendar mode="single" selected={entry.tanggal ? parseISO(entry.tanggal) : undefined} defaultMonth={entry.tanggal ? parseISO(entry.tanggal) : undefined} captionLayout="dropdown" locale={id} onSelect={(date) => updateEntry(fieldName, list, entry.id, "tanggal", date ? format(date, "yyyy-MM-dd") : "")} autoFocus /></PopoverContent></Popover>
                    </label>
                    <div className="min-w-0 text-sm font-medium text-gray-700 sm:col-span-2">
                      <p>Bukti prestasi (gambar atau PDF)</p>
                      <p className="mt-0.5 text-[11px] font-normal text-gray-500">PDF atau gambar · maksimal 10 MB</p>
                      <div className="my-3 border-t border-gray-100" />
                      <div className="relative">
                        {!isLocked && <Input id={`bukti-${entry.id}`} name={`bukti-${entry.id}`} type="file" accept="image/*,.pdf,application/pdf" onChange={(event) => { const file = event.target.files?.[0]; if (file) setFiles((current) => ({ ...current, [entry.id]: file })); }} aria-label="Pilih bukti prestasi" className="peer absolute inset-0 z-10 h-11 w-full cursor-pointer opacity-0" />}
                        {files[entry.id] ? (
                          <div className="flex min-h-11 min-w-0 items-center gap-2 rounded-md bg-gray-50 px-2.5 py-2 peer-hover:bg-gray-100 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#132b6d]">
                            <FileText className="size-4 shrink-0 text-[#132b6d]" aria-hidden="true" />
                            <span className="min-w-0 flex-1 truncate text-xs font-medium text-gray-800">{files[entry.id].name}</span>
                            <Button type="button" variant="ghost" size="sm" className="relative z-20 h-8 shrink-0 px-2" onClick={() => setPreview({ file: files[entry.id], title: "Bukti prestasi" })}><Eye aria-hidden="true" />Preview</Button>
                          </div>
                        ) : entry.buktiUrl ? (
                          <div className="flex min-h-11 min-w-0 items-center gap-2 rounded-md bg-emerald-50/70 px-2.5 py-2 text-xs text-emerald-900 peer-hover:bg-emerald-50 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#132b6d]">
                            <FileText className="size-4 shrink-0" aria-hidden="true" />
                            <span className="min-w-0 flex-1 truncate">Berkas tersimpan</span>
                            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-medium text-emerald-800"><Check className="size-3" aria-hidden="true" />Tersimpan</span>
                            <Button type="button" variant="ghost" size="sm" className="relative z-20 h-8 shrink-0 px-2 text-emerald-900" onClick={() => setPreview({ file: entry.buktiUrl, title: "Bukti prestasi" })}><Eye aria-hidden="true" />Preview</Button>
                          </div>
                        ) : (
                          <span className="flex min-h-11 items-center justify-center rounded-md border border-gray-200 bg-gray-50 px-3 text-xs font-medium text-gray-700 transition-colors peer-hover:bg-gray-100 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#132b6d]">Pilih dokumen</span>
                        )}
                      </div>
                    </div>
                  </>}
                  {fieldName === "riwayatBahasaItems" && <label className="text-sm font-medium">Tingkat penguasaan bahasa
                    <Select value={entry.tingkat} onValueChange={(value) => updateEntry(fieldName, list, entry.id, "tingkat", String(value ?? ""))}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="Pilih tingkat penguasaan bahasa" /></SelectTrigger>
                      <SelectContent>{["Dasar", "Menengah", "Mahir", "Fasih"].map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent>
                    </Select>
                  </label>}
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  };

  return <form onSubmit={submit} className="space-y-5">
    <header><h1 className="text-lg font-semibold">Riwayat Siswa</h1><p className="mt-1 text-sm text-gray-600">Tambahkan prestasi, organisasi, dan bahasa yang dikuasai.</p></header>
    {section("Prestasi", awards, "riwayatPrestasiItems", [["nama", "Nama prestasi"], ["penyelenggara", "Penyelenggara"]], ["nama", "tingkat", "penyelenggara", "tanggal"])}
    {section("Organisasi", organizations, "riwayatOrganisasiItems", [["nama", "Nama organisasi"], ["jabatan", "Jabatan"], ["periode", "Periode"]], ["nama", "jabatan", "periode"])}
    {section("Bahasa yang dikuasai", languages, "riwayatBahasaItems", [["nama", "Bahasa"]], ["nama", "tingkat"])}
    {!isLocked && <div className="flex justify-end gap-3">{status && <FormStatusAlert {...status} onDismiss={() => setStatus(null)} />}<button className="rounded-md bg-[#132b6d] px-5 py-2.5 text-sm font-semibold text-white">Simpan riwayat</button></div>}
    <DocumentPreviewDialog open={Boolean(preview)} file={preview?.file ?? null} title={preview?.title ?? "Bukti prestasi"} onOpenChange={(open) => { if (!open) setPreview(null); }} />
  </form>;
}
