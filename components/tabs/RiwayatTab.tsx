"use client";

import { useState, type FormEvent } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useForm } from "@/components/form-context";
import { FormStatusAlert } from "@/components/form-status-alert";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { format, parseISO } from "date-fns";
import { id } from "date-fns/locale";
import { saveRiwayatSiswaAction } from "@/app/actions/ppdb-form";

type Entry = { id: string;[key: string]: string };
const makeEntry = (fields: string[]): Entry => ({ id: crypto.randomUUID(), ...Object.fromEntries(fields.map((field) => [field, ""])) });

export default function RiwayatTab() {
  const { formData, updateField, updateFields } = useForm();
  const [files, setFiles] = useState<Record<string, File>>({});
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({ riwayatPrestasiItems: true });
  const [status, setStatus] = useState<{ message: string; type: "info" | "success" | "error" } | null>(null);
  const awards = formData.riwayatPrestasiItems ?? [];
  const organizations = formData.riwayatOrganisasiItems ?? [];
  const languages = formData.riwayatBahasaItems ?? [];

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData();
    data.set("riwayatPrestasiItems", JSON.stringify(awards));
    data.set("riwayatOrganisasiItems", JSON.stringify(organizations));
    data.set("riwayatBahasaItems", JSON.stringify(languages));
    Object.entries(files).forEach(([id, file]) => data.set(`bukti-${id}`, file));
    setStatus({ message: "Menyimpan riwayat…", type: "info" });
    const result = await saveRiwayatSiswaAction(data);
    if (result.success && result.data) {
      updateFields("Riwayat", result.data as Record<string, unknown>);
      setFiles({});
      setStatus({ message: "Riwayat berhasil disimpan.", type: "success" });
    } else setStatus({ message: result.error ?? "Riwayat gagal disimpan.", type: "error" });
  };

  const field = (entry: Entry, key: string, label: string, list: Entry[], fieldName: string) => <label className="block min-w-0 text-sm font-medium text-gray-700" key={key}>{label}<Input className="mt-1" value={entry[key] ?? ""} onChange={(e) => updateField("Riwayat", fieldName, list.map((item) => item.id === entry.id ? { ...item, [key]: e.target.value } : item))} /></label>;
  const section = (title: string, list: Entry[], fieldName: string, fields: [string, string][], values: string[]) => {
    const isOpen = openSections[fieldName] ?? false;
    const panelId = `${fieldName}-panel`;
    return <section className="border-b border-[#CFCFCF] pb-3" key={fieldName}>
      <div className="flex items-center gap-3">
        <button type="button" aria-expanded={isOpen} aria-controls={panelId} onClick={() => setOpenSections(current => ({ ...current, [fieldName]: !isOpen }))} className="group flex min-h-14 flex-1 items-center gap-3 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#37497A]">
          <span className="font-semibold text-gray-900 group-hover:text-[#132b6d]">{title}</span>
        </button>
        <button type="button" className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-[#132b6d]" onClick={() => { updateField("Riwayat", fieldName, [...list, makeEntry(values)]); setOpenSections(current => ({ ...current, [fieldName]: true })); }}><Plus className="size-4" />Tambah</button>
      </div>
      <div id={panelId} role="region" aria-label={title} aria-hidden={!isOpen} className={`grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
        <div className="min-h-0 overflow-hidden"><div className="space-y-3 pt-1">{list.map((entry, index) => <article key={entry.id} className="grid gap-3 rounded-lg border border-gray-200 p-4 sm:grid-cols-2"><div className="flex items-center justify-between sm:col-span-2"><h3 className="text-sm font-medium">{title} {index + 1}</h3><button type="button" aria-label={`Hapus ${title} ${index + 1}`} onClick={() => { updateField("Riwayat", fieldName, list.filter(x => x.id !== entry.id)); setFiles(current => { const next = { ...current }; delete next[entry.id]; return next; }); if (list.length === 1) setOpenSections(current => ({ ...current, [fieldName]: false })); }}><Trash2 className="size-4 text-gray-500" /></button></div>{fields.map(([key, label]) => field(entry, key, label, list, fieldName))}{fieldName === "riwayatPrestasiItems" && <><label className="text-sm font-medium">Tingkat prestasi<Select value={entry.tingkat} onValueChange={value => updateField("Riwayat", fieldName, list.map(x => x.id === entry.id ? { ...x, tingkat: String(value ?? "") } : x))}><SelectTrigger className="mt-1"><SelectValue placeholder="Pilih tingkat prestasi" /></SelectTrigger><SelectContent>{["Sekolah", "Kecamatan", "Kabupaten/Kota", "Provinsi", "Nasional", "Internasional"].map(x => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent></Select></label><label className="text-sm font-medium">Tanggal prestasi<Popover><PopoverTrigger render={<Button type="button" variant="outline" className="mt-1 h-10 w-full justify-start gap-2 rounded-md border-gray-300 font-normal">{entry.tanggal ? format(parseISO(entry.tanggal), "d MMMM yyyy", { locale: id }) : "Pilih tanggal"}</Button>} /><PopoverContent className="w-auto overflow-hidden p-0" align="start"><Calendar mode="single" selected={entry.tanggal ? parseISO(entry.tanggal) : undefined} defaultMonth={entry.tanggal ? parseISO(entry.tanggal) : undefined} captionLayout="dropdown" locale={id} onSelect={date => updateField("Riwayat", fieldName, list.map(x => x.id === entry.id ? { ...x, tanggal: date ? format(date, "yyyy-MM-dd") : "" } : x))} autoFocus /></PopoverContent></Popover></label><label className="text-sm font-medium text-gray-700">Bukti prestasi (gambar atau PDF)<Input className="mt-1" type="file" accept="image/*,.pdf,application/pdf" onChange={e => { const file = e.target.files?.[0]; if (file) setFiles(current => ({ ...current, [entry.id]: file })); }} />{files[entry.id]?.name ?? (entry.buktiUrl ? <a href={entry.buktiUrl} target="_blank" className="text-xs text-blue-800">Bukti tersimpan</a> : <span className="text-xs text-gray-500">Opsional, maks. 10 MB</span>)}</label></>}{fieldName === "riwayatBahasaItems" && <label className="text-sm font-medium">Tingkat penguasaan bahasa<Select value={entry.tingkat} onValueChange={value => updateField("Riwayat", fieldName, list.map(x => x.id === entry.id ? { ...x, tingkat: String(value ?? "") } : x))}><SelectTrigger className="mt-1"><SelectValue placeholder="Pilih tingkat penguasaan bahasa" /></SelectTrigger><SelectContent>{["Dasar", "Menengah", "Mahir", "Fasih"].map(x => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent></Select></label>}</article>)}</div></div>
      </div>
    </section>;
  };

  const updateEntry = (fieldName: string, list: Entry[], id: string, key: string, value: string) => updateField("Riwayat", fieldName, list.map((item) => item.id === id ? { ...item, [key]: value } : item));
  return <form onSubmit={submit} className="space-y-5"><header><h1 className="text-lg font-semibold">Riwayat Siswa</h1><p className="mt-1 text-sm text-gray-600">Tambahkan prestasi, organisasi, dan bahasa yang dikuasai.</p></header>
    {section("Prestasi", awards, "riwayatPrestasiItems", [["nama", "Nama prestasi"], ["penyelenggara", "Penyelenggara"]], ["nama", "tingkat", "penyelenggara", "tanggal"])}
    {section("Organisasi", organizations, "riwayatOrganisasiItems", [["nama", "Nama organisasi"], ["jabatan", "Jabatan"], ["periode", "Periode"]], ["nama", "jabatan", "periode"])}
    {section("Bahasa yang dikuasai", languages, "riwayatBahasaItems", [["nama", "Bahasa"]], ["nama", "tingkat"])}
    <div className="flex justify-end gap-3">{status && <FormStatusAlert {...status} onDismiss={() => setStatus(null)} />}<button className="rounded-md bg-[#132b6d] px-5 py-2.5 text-sm font-semibold text-white">Simpan riwayat</button></div></form>;
}



