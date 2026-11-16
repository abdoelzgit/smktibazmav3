"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { format, isValid, parseISO } from "date-fns";
import { id } from "date-fns/locale";
import { CalendarDays, ImagePlus, Pencil, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { saveDataDiriAction } from "@/app/actions/ppdb-form";
import { useForm } from "@/components/form-context";
import { PhotoCropDialog } from "@/components/ppdb-photo-crop-dialog";
import { calculateAgeInYears, MAX_APPLICANT_AGE } from "@/lib/calculate-age";
import Link from "next/link";
import { FormStatusAlert } from "@/components/form-status-alert";
import { PhoneInput01 } from "@/components/shadcn-studio/phone-input/phone-input-01";
import { toPhoneInputValue } from "@/lib/phone-input-value";

export default function DataDiriTab({ action }: { action?: unknown } = {}) {
  void action;
  const { formData, updateField, updateFields } = useForm();
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [pendingPhotoUrl, setPendingPhotoUrl] = useState<string | null>(null);
  const [pendingPhotoName, setPendingPhotoName] = useState("");
  const [croppedPhoto, setCroppedPhoto] = useState<File | null>(null);
  const [isPhotoCropOpen, setIsPhotoCropOpen] = useState(false);
  const [isPreparingPhotoEdit, setIsPreparingPhotoEdit] = useState(false);
  const [isBirthCalendarOpen, setIsBirthCalendarOpen] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [status, setStatus] = useState<{ message: string; type: "info" | "success" | "error" } | null>(null);
  const [showPhotoActions, setShowPhotoActions] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const displayPhoto = photoPreview || formData.fotoFormalUrl || null;
  const dateOfBirthValue = formData.tanggalLahir
    ? typeof formData.tanggalLahir === "string"
      ? formData.tanggalLahir.split("T")[0]
      : format(formData.tanggalLahir, "yyyy-MM-dd")
    : "";
  const parsedDateOfBirth = dateOfBirthValue ? parseISO(dateOfBirthValue) : undefined;
  const dateOfBirth = parsedDateOfBirth && isValid(parsedDateOfBirth) ? parsedDateOfBirth : undefined;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (formData.setujuPanduanVideo !== true) {
      setStatus({ message: "Centang persetujuan bahwa Anda sudah membaca panduan video.", type: "error" });
      return;
    }
    if (formData.pernyataanSiswa !== true) {
      setStatus({ message: "Pilih Ya pada pernyataan calon siswa sebelum menyimpan.", type: "error" });
      return;
    }

    const age = calculateAgeInYears(dateOfBirthValue);
    if (!dateOfBirthValue || age === null) {
      setStatus({ message: "Masukkan tanggal lahir yang valid.", type: "error" });
      return;
    }
    if (age > MAX_APPLICANT_AGE) {
      setStatus({ message: `Usia maksimal pendaftar adalah ${MAX_APPLICANT_AGE} tahun.`, type: "error" });
      return;
    }

    if (!croppedPhoto && !formData.fotoFormalUrl) {
      setPhotoError("Unggah dan sesuaikan foto formal sebelum menyimpan.");
      return;
    }

    setStatus({ message: "Menyimpan data diri...", type: "info" });
    const formElement = e.currentTarget;
    const data = new FormData(formElement);
    if (croppedPhoto) data.set("fotoFormalUrl", croppedPhoto);

    const result = await saveDataDiriAction(data);
    if (result.success) {
      if (result.data && typeof result.data === "object") {
        const resData = result.data as Record<string, unknown>;
        const formatted: Record<string, unknown> = {};
        Object.entries(resData).forEach(([k, v]) => {
          if (v !== null && v !== undefined) {
            formatted[k] = v instanceof Date ? v.toISOString().split("T")[0] : v;
          }
        });
        updateFields("Data Diri", formatted);
      }
      setCroppedPhoto(null);
      setPhotoError(null);
      setStatus({ message: "Data diri berhasil disimpan.", type: "success" });
    } else {
      setStatus({ message: result.error ?? "Data diri gagal disimpan.", type: "error" });
    }
  };

  useEffect(() => {
    return () => {
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  useEffect(() => {
    return () => {
      if (pendingPhotoUrl) URL.revokeObjectURL(pendingPhotoUrl);
    };
  }, [pendingPhotoUrl]);

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    input.value = "";
    if (!file) return;

    setPhotoError(null);
    setPendingPhotoName(file.name);
    setPendingPhotoUrl(URL.createObjectURL(file));
    setIsPhotoCropOpen(true);
  };

  const handleEditPhoto = async () => {
    if (!displayPhoto) return;

    setPhotoError(null);
    setIsPreparingPhotoEdit(true);
    setShowPhotoActions(false);
    try {
      const response = await fetch(displayPhoto);
      if (!response.ok) throw new Error("Foto tidak dapat dibuka.");

      const blob = await response.blob();
      const sourceFile = new File([blob], croppedPhoto?.name ?? "foto-formal.jpg", {
        type: blob.type || "image/jpeg",
      });
      setPendingPhotoName(sourceFile.name);
      setPendingPhotoUrl(URL.createObjectURL(sourceFile));
      setIsPhotoCropOpen(true);
    } catch {
      setPhotoError("Foto gagal dibuka untuk diedit. Silakan unggah ulang foto.");
    } finally {
      setIsPreparingPhotoEdit(false);
    }
  };

  const cancelPhotoCrop = () => {
    setIsPhotoCropOpen(false);
    setPendingPhotoUrl(null);
    setPendingPhotoName("");
  };

  const acceptCroppedPhoto = (file: File) => {
    setPhotoPreview(URL.createObjectURL(file));
    setCroppedPhoto(file);
    setPhotoError(null);
    setIsPhotoCropOpen(false);
    setPendingPhotoUrl(null);
    setPendingPhotoName("");
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6">
      <div className="mb-6">
        <span className="bg-[#1e3a8a] text-white px-5 py-2 rounded-lg font-semibold text-base shadow-sm inline-block">
          Data Diri
        </span>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-12 xl:gap-8">
        <div className="order-2 min-w-0 xl:order-1 xl:col-span-8 grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">Nama Lengkap</label>
            <Input
              name="namaLengkap"
              type="text"
              value={formData.namaLengkap ?? ""}
              onChange={(e) => updateField("Data Diri", "namaLengkap", e.target.value)}
              placeholder="Masukkan nama lengkap"
              className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">Email</label>
            <Input
              name="email"
              type="email"
              value={formData.email ?? ""}
              onChange={(e) => updateField("Data Diri", "email", e.target.value)}
              placeholder="Masukkan email"
              className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">Tempat lahir</label>
            <Input
              name="tempatLahir"
              type="text"
              value={formData.tempatLahir ?? ""}
              onChange={(e) => updateField("Data Diri", "tempatLahir", e.target.value)}
              placeholder="Masukkan tempat lahir"
              className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="anakKe" className="mb-1 block text-sm font-bold text-gray-800">Anak Ke</label>
              <Input
                id="anakKe"
                name="anakKe"
                type="number"
                min="1"
                step="1"
                value={formData.anakKe ?? ""}
                onChange={(e) => updateField("Data Diri", "anakKe", e.target.value)}
                placeholder="Contoh: 2"
                className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="jumlahSaudara" className="mb-1 block text-sm font-bold text-gray-800">Jumlah Saudara</label>
              <Input
                id="jumlahSaudara"
                name="jumlahSaudara"
                type="number"
                min="0"
                step="1"
                value={formData.jumlahSaudara ?? ""}
                onChange={(e) => updateField("Data Diri", "jumlahSaudara", e.target.value)}
                placeholder="Contoh: 3"
                className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">Status Dalam Keluarga</label>
            <Select
              name="statusKeluarga"
              value={formData.statusKeluarga ?? "ANAK_KANDUNG"}
              onValueChange={(value) => updateField("Data Diri", "statusKeluarga", String(value ?? ""))}
            >
              <SelectTrigger id="statusKeluarga"><SelectValue>{formData.statusKeluarga === "ANAK_TIRI" ? "Anak Tiri" : formData.statusKeluarga === "ANAK_ANGKAT" ? "Anak Angkat" : "Anak Kandung"}</SelectValue></SelectTrigger>
              <SelectContent>
                <SelectItem value="ANAK_KANDUNG">Anak Kandung</SelectItem>
                <SelectItem value="ANAK_TIRI">Anak Tiri</SelectItem>
                <SelectItem value="ANAK_ANGKAT">Anak Angkat</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label htmlFor="noHpWhatsapp" className="block text-sm font-bold text-gray-800 mb-1">No Hp</label>
            <PhoneInput01
              id="noHpWhatsapp"
              name="noHpWhatsapp"
              defaultCountry="ID"
              international
              value={toPhoneInputValue(formData.noHpWhatsapp)}
              onChange={(value) => updateField("Data Diri", "noHpWhatsapp", value)}
              placeholder="Masukkan nomor handphone"
              className="w-full"
              inputClassName="h-10 rounded-r-lg border-gray-400 px-3 py-2 text-sm text-gray-700 focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500"
              triggerClassName="h-10 border-gray-400"
            />
          </div>

          <Field className="gap-1">
            <FieldLabel htmlFor="tanggalLahir" className="text-sm font-bold text-gray-800">Tanggal Lahir</FieldLabel>
            <input type="hidden" name="tanggalLahir" value={dateOfBirthValue} />
            <Popover open={isBirthCalendarOpen} onOpenChange={setIsBirthCalendarOpen}>
              <PopoverTrigger
                render={
                  <Button variant="outline" id="tanggalLahir" className="h-10 w-full justify-start gap-2 rounded-md border-gray-300 font-normal">
                    <CalendarDays aria-hidden="true" className="size-4 text-gray-500" />
                    {dateOfBirth ? format(dateOfBirth, "d MMMM yyyy", { locale: id }) : "Pilih tanggal"}
                  </Button>
                }
              />
              <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateOfBirth}
                  defaultMonth={dateOfBirth}
                  captionLayout="dropdown"
                  locale={id}
                  onSelect={(date) => {
                    updateField("Data Diri", "tanggalLahir", date ? format(date, "yyyy-MM-dd") : "");
                    setStatus(null);
                    setIsBirthCalendarOpen(false);
                  }}
                  autoFocus
                />
              </PopoverContent>
            </Popover>
          </Field>

          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">Saat Ini Tinggal Bersama</label>
            <Input
              name="tinggalBersama"
              type="text"
              value={formData.tinggalBersama ?? ""}
              onChange={(e) => updateField("Data Diri", "tinggalBersama", e.target.value)}
              placeholder="Masukkan Tinggal Bersama"
              className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">Kewarganegaraan</label>
            <Input
              name="kewarganegaraan"
              type="text"
              value={formData.kewarganegaraan ?? "Indonesia"}
              onChange={(e) => updateField("Data Diri", "kewarganegaraan", e.target.value)}
              placeholder="Masukkan kewarganegaraan"
              className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>



          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">NIK</label>
            <Input
              name="nik"
              type="number"
              min="0"
              step="1"
              value={formData.nik ?? ""}
              onChange={(e) => updateField("Data Diri", "nik", e.target.value)}
              placeholder="Masukkan NIK"
              className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">NISN</label>
            <Input
              name="nisn"
              type="number"
              min="0"
              step="1"
              value={formData.nisn ?? ""}
              onChange={(e) => updateField("Data Diri", "nisn", e.target.value)}
              placeholder="Masukkan NISN"
              className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-800 mb-1">Alamat Saat ini</label>
            <Input
              name="alamatLengkap"
              type="text"
              value={formData.alamatLengkap ?? ""}
              onChange={(e) => {
                updateField("Data Diri", "alamatLengkap", e.target.value);
                if (formData.alamatAyahSamaDenganSiswa) {
                  updateField("Data orang Tua", "alamatDomisiliAyah", e.target.value);
                }
              }}
              placeholder="Masukkan alamat saat ini"
              className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>







          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">Berat Badan (KG)</label>
            <Input
              name="beratBadan"
              type="number"
              min="0"
              step="any"
              value={formData.beratBadan ?? ""}
              onChange={(e) => updateField("Data Diri", "beratBadan", e.target.value)}
              placeholder="Masukkan Berat Badan"
              className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">Tinggi Badan (CM)</label>
            <Input
              name="tinggiBadan"
              type="number"
              min="0"
              step="any"
              value={formData.tinggiBadan ?? ""}
              onChange={(e) => updateField("Data Diri", "tinggiBadan", e.target.value)}
              placeholder="Masukkan Tinggi Badan"
              className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">Riwayat Penyakit</label>
            <Input
              name="riwayatPenyakit"
              type="text"
              value={formData.riwayatPenyakit ?? ""}
              onChange={(e) => updateField("Data Diri", "riwayatPenyakit", e.target.value)}
              placeholder="Masukkan Riwayat Penyakit"
              className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">Apakah Anda Pernah Merokok?</label>
            <Select
              name="isMerokok"
              value={String(Boolean(formData.isMerokok))}
              onValueChange={(value) => updateField("Data Diri", "isMerokok", value === "true")}
            >
              <SelectTrigger id="isMerokok"><SelectValue>{formData.isMerokok ? "Ya" : "Tidak"}</SelectValue></SelectTrigger>
              <SelectContent><SelectItem value="false">Tidak</SelectItem><SelectItem value="true">Ya</SelectItem></SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">Apakah Anda Buta Warna?</label>
            <Select
              name="isButaWarna"
              value={String(Boolean(formData.isButaWarna))}
              onValueChange={(value) => updateField("Data Diri", "isButaWarna", value === "true")}
            >
              <SelectTrigger id="isButaWarna"><SelectValue>{formData.isButaWarna ? "Ya" : "Tidak"}</SelectValue></SelectTrigger>
              <SelectContent><SelectItem value="false">Tidak</SelectItem><SelectItem value="true">Ya</SelectItem></SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1"> Memiliki Riwayat Penyakit Menular?</label>
            <Select
              name="hasPenyakitMenular"
              value={String(Boolean(formData.hasPenyakitMenular))}
              onValueChange={(value) => updateField("Data Diri", "hasPenyakitMenular", value === "true")}
            >
              <SelectTrigger id="hasPenyakitMenular"><SelectValue>{formData.hasPenyakitMenular ? "Ya" : "Tidak"}</SelectValue></SelectTrigger>
              <SelectContent><SelectItem value="false">Tidak</SelectItem><SelectItem value="true">Ya</SelectItem></SelectContent>
            </Select>
          </div>


          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">Akun Media Sosial</label>
            <Input
              name="mediaSosial"
              type="text"
              value={formData.mediaSosial ?? ""}
              onChange={(e) => updateField("Data Diri", "mediaSosial", e.target.value)}
              placeholder="Masukkan Akun Media Sosial"
              className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <div className="flex justify-between">

              <label className="block text-sm font-bold text-gray-800 mb-1">Link Pengumpulan Video</label>
              <Link target="_blank" href="https://drive.google.com/file/d/1P9VYozQSnMj7KhnUi0VP3ItBtGb7Cdf6/view?usp=sharing" className="block text-sm font-md text-blue-950 mb-1 underline hover:text-blue-800 ">Panduan</Link>
            </div>
            <Input
              name="linkPengumpulanVideo"
              type="text"
              value={formData.linkPengumpulanVideo ?? ""}
              onChange={(e) => updateField("Data Diri", "linkPengumpulanVideo", e.target.value)}
              placeholder="Masukkan Link Pengumpulan Video"
              disabled={!formData.setujuPanduanVideo}
              className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <label className="mt-2 flex cursor-pointer items-center gap-2 text-xs text-gray-700">
              <input
                type="checkbox"
                name="setujuPanduanVideo"
                checked={Boolean(formData.setujuPanduanVideo)}
                onChange={(event) => updateField("Data Diri", "setujuPanduanVideo", event.target.checked)}
                aria-describedby={formData.setujuPanduanVideo !== true ? "panduan-video-hint" : undefined}
                className="size-4 accent-[#132b6d] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#132b6d]"
              />
              Saya sudah membaca panduan
            </label>
        
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-800 mb-1">Pernyataan Calon Siswa</label>
            <p className="text-xs text-gray-500 mb-2">1. Seluruh pernyataan data dan informasi beserta seluruh dokumen yang saya lampirkan dalam berkas SPMB SMK TI BAZMA Tahun Ajaran 2027/2028 adalah benar.</p>
            <p className="text-xs text-gray-500 mb-2">2. Apabila diperlukan, saya bersedia memberikan informasi lebih lanjut untuk melengkapi dokumen pendaftaran ini.</p>
            <Select
              name="pernyataanSiswa"
              value={String(Boolean(formData.pernyataanSiswa))}
              onValueChange={(value) => updateField("Data Diri", "pernyataanSiswa", value === "true")}
            >
              <SelectTrigger id="pernyataanSiswa" aria-describedby={formData.pernyataanSiswa !== true ? "pernyataan-siswa-hint" : undefined}><SelectValue>{formData.pernyataanSiswa ? "Ya" : "Tidak"}</SelectValue></SelectTrigger>
              <SelectContent><SelectItem value="true">Ya</SelectItem><SelectItem value="false">Tidak</SelectItem></SelectContent>
            </Select>
            
          </div>


        </div>

        <aside aria-labelledby="formal-photo-heading" className="order-1 min-w-0 xl:order-2 xl:col-span-4">
          <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-5">
            <h2 id="formal-photo-heading" className="text-sm font-semibold text-gray-900">Foto formal</h2>
            <div className="group relative mx-auto mt-4 aspect-[4/5] w-full max-w-[240px] overflow-hidden rounded-md border border-gray-200 bg-gray-50">
              {displayPhoto ? (
                <Image src={displayPhoto} alt="Preview foto formal" fill unoptimized className="object-cover" />
              ) : (
                <div className="flex size-full items-center justify-center">
                  <UserRound className="size-14 text-gray-300" strokeWidth={1.25} aria-hidden="true" />
                </div>
              )}
              {showPhotoActions && <div aria-hidden="true" className="absolute inset-0 z-10 bg-black/45" />}
              <Button
                type="button"
                variant="secondary"
                size="icon"
                aria-label={showPhotoActions ? "Tutup menu foto" : "Buka menu foto"}
                aria-expanded={showPhotoActions}
                onClick={() => setShowPhotoActions((visible) => !visible)}
                disabled={isPhotoCropOpen}
                className="absolute right-2 top-2 z-20 size-11 rounded-full border border-white/60 bg-white/50 text-gray-900 shadow-md backdrop-blur-md hover:bg-white/90 active:bg-white/80"
              >
                <Pencil aria-hidden="true" />
              </Button>
              {showPhotoActions && (
                <div role="group" aria-label="Aksi foto formal" className="absolute inset-x-3 bottom-3 z-20 flex flex-col gap-2">
                  {displayPhoto && (
                    <Button
                      type="button"
                      variant="secondary"
                      className="h-11 w-full justify-start gap-2 border border-white/60 bg-white/50 px-3 text-gray-900 shadow-md backdrop-blur-md hover:bg-white/90 active:bg-white/80"
                      onClick={handleEditPhoto}
                      disabled={isPreparingPhotoEdit}
                    >
                      <Pencil aria-hidden="true" />
                      Edit foto
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="secondary"
                    className="h-11 w-full justify-start gap-2 border border-white/60 bg-white/50 px-3 text-gray-900 shadow-md backdrop-blur-md hover:bg-white/90 active:bg-white/80"
                    onClick={() => {
                      setShowPhotoActions(false);
                      photoInputRef.current?.click();
                    }}
                  >
                    <ImagePlus aria-hidden="true" />
                    Ganti foto
                  </Button>
                </div>
              )}
            </div>
            <Input
              ref={photoInputRef}
              id="fotoFormalUrl"
              name="fotoFormalUrl"
              type="file"
              accept="image/*"
              aria-label="Pilih foto formal"
              onChange={handlePhotoChange}
              className="hidden"
            />

          </div>
        </aside>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={formData.setujuPanduanVideo !== true || formData.pernyataanSiswa !== true}
          aria-describedby={formData.setujuPanduanVideo !== true && formData.pernyataanSiswa !== true ? "panduan-video-hint pernyataan-siswa-hint" : formData.setujuPanduanVideo !== true ? "panduan-video-hint" : formData.pernyataanSiswa !== true ? "pernyataan-siswa-hint" : undefined}
          className="inline-flex items-center justify-center rounded-xl bg-[#1e3a8a] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#172d6e] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Simpan Data Diri
        </button>
      </div>
      {status && <FormStatusAlert {...status} onDismiss={() => setStatus(null)} />}
      {photoError && <FormStatusAlert message={photoError} type="error" onDismiss={() => setPhotoError(null)} />}
      <PhotoCropDialog
        key={pendingPhotoUrl ?? "closed"}
        open={isPhotoCropOpen}
        imageUrl={pendingPhotoUrl}
        fileName={pendingPhotoName}
        onCancel={cancelPhotoCrop}
        onCrop={acceptCroppedPhoto}
        onError={setPhotoError}
      />
    </form>
  );
}
