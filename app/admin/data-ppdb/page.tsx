"use client";

import { useEffect, useState, useTransition } from "react";
import StatCard from "@/components/stat-card";
import DataTable from "@/components/data-table";
import { Peserta } from "@/components/types";
import {
  Users,
  CheckCircle2,
  Clock,
  Download,
  RefreshCw,
  Loader2,
  ChevronDown,
  FileSpreadsheet,
  FileText,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  getPendaftaranPpdbListAction,
  deletePendaftaranAction,
} from "@/app/actions/ppdb-admin";

const CSV_HEADERS = [
  // 1. Data Registrasi
  "No. Pendaftaran",
  "Status Pendaftaran",
  "Tanggal Pendaftaran",
  "Nama Akun Pengguna",
  "Email Akun Pengguna",

  // 2. Data Diri Siswa
  "Nama Lengkap Siswa",
  "NISN",
  "NIK Siswa",
  "Email Siswa",
  "No. WhatsApp Siswa",
  "Tempat Lahir",
  "Tanggal Lahir",
  "Kewarganegaraan",
  "Anak Ke",
  "Jumlah Saudara",
  "Status Keluarga",
  "Tinggal Bersama",
  "Alamat Lengkap",
  "Media Sosial",
  "Bahasa Asing",
  "Riwayat Prestasi",
  "Riwayat Organisasi",
  "Berat Badan (kg)",
  "Tinggi Badan (cm)",
  "Riwayat Penyakit",
  "Status Merokok",
  "Status Buta Warna",
  "Penyakit Menular",
  "Pernyataan Siswa",

  // 3. Data Orang Tua
  "Keadaan Orang Tua",
  "Nama Ayah",
  "Pekerjaan Ayah",
  "Alamat Domisili Ayah",
  "Nama Ibu",
  "Pekerjaan Ibu",
  "No. HP/WA Orang Tua",
  "Penghasilan Orang Tua",
  "Pernyataan Orang Tua",

  // 4. Data Sekolah Asal
  "Nama Sekolah Asal",
  "NPSN Sekolah",
  "Status Sekolah",
  "Tahun Lulus",
  "Alamat Sekolah Asal",

  // 5. Surat Rekomendasi
  "Nama Pemberi Rekomendasi",
  "Jabatan/Instansi Rekomendasi",
  "No. HP Pemberi Rekomendasi",
  "Catatan Rekomendasi",


];

// Helper: Format tanggal Indonesia (contoh: 15 Mei 2008)
function formatDateIndo(dateVal?: string | null): string {
  if (!dateVal || dateVal === "-" || dateVal === "null") return "-";
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return String(dateVal);
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(d);
  } catch {
    return String(dateVal);
  }
}

// Helper: Membersihkan teks dari spasi ganda atau newline yang merusak tata letak baris
function formatCleanText(val?: string | null, fallback = "-"): string {
  if (!val || val === "-" || val === "null") return fallback;
  const cleaned = String(val)
    .replace(/\r\n/g, " ")
    .replace(/[\r\n]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned || fallback;
}

// Helper: Standarisasi format nomor HP / WA (jika nomor angka diformat ke 08..., jika teks/keterangan tetap ditampilkan utuh)
function formatPhoneNumber(phone?: string | null): string {
  if (!phone || phone === "-" || phone === "null") return "-";
  const raw = String(phone).trim();
  if (!raw || raw === "-") return "-";

  let digits = raw.replace(/[^\d]/g, "");
  if (digits) {
    if (digits.startsWith("62")) {
      digits = "0" + digits.slice(2);
    } else if (!digits.startsWith("0") && digits.length >= 9) {
      digits = "0" + digits;
    }
    // Jika input murni nomor HP atau nomor dengan format (+62, strip, spasi)
    if (raw.replace(/[\s\-+()]/g, "") === digits || /^\+?\d[\d\s\-()]*$/.test(raw)) {
      return digits;
    }
  }

  // Jika input berupa teks bebas atau catatan, tampilkan teks aslinya
  return formatCleanText(raw);
}

// Helper: Format status keluarga
function formatStatusKeluarga(status?: string | null): string {
  if (!status || status === "-" || status === "null") return "-";
  switch (status.toUpperCase()) {
    case "ANAK_KANDUNG":
      return "Anak Kandung";
    case "ANAK_TIRI":
      return "Anak Tiri";
    case "ANAK_ANGKAT":
      return "Anak Angkat";
    default:
      return status.replace(/_/g, " ");
  }
}

// Helper: Format keadaan orang tua
function formatKeadaanOrangTua(keadaan?: string | null): string {
  if (!keadaan || keadaan === "-" || keadaan === "null") return "-";
  switch (keadaan.toUpperCase()) {
    case "LENGKAP":
      return "Lengkap (Ayah & Ibu)";
    case "YATIM":
      return "Yatim (Ayah Meninggal)";
    case "PIATU":
      return "Piatu (Ibu Meninggal)";
    case "YATIM_PIATU":
      return "Yatim Piatu";
    default:
      return keadaan.replace(/_/g, " ");
  }
}

// Helper: Format status sekolah
function formatStatusSekolah(status?: string | null): string {
  if (!status || status === "-" || status === "null") return "-";
  if (status.toUpperCase() === "NEGERI") return "Negeri";
  if (status.toUpperCase() === "SWASTA") return "Swasta";
  return status;
}



function formatPesertaToRow(p: Peserta): string[] {
  let ak = p.anakKe !== undefined && p.anakKe !== null && String(p.anakKe).trim() !== "" ? String(p.anakKe).trim() : "-";
  let js = p.jumlahSaudara !== undefined && p.jumlahSaudara !== null && String(p.jumlahSaudara).trim() !== "" ? String(p.jumlahSaudara).trim() : "-";

  // Fallback jika format data anakKe berupa "2 / 3" atau "2/3"
  if (js === "-" && ak.includes("/")) {
    const parts = ak.split("/").map((s) => s.trim());
    ak = parts[0] || "-";
    js = parts[1] || "-";
  }

  return [
    // 1. Data Registrasi
    formatCleanText(p.nomorPendaftaran),
    p.status || "Belum Diverifikasi",
    formatCleanText(p.tanggalDaftar),
    formatCleanText(p.namaAkun),
    formatCleanText(p.emailAkun),

    // 2. Data Diri Siswa
    formatCleanText(p.nama),
    formatCleanText(p.nisn),
    formatCleanText(p.nik),
    formatCleanText(p.email),
    formatPhoneNumber(p.noHp),
    formatCleanText(p.tempatLahir),
    formatDateIndo(p.tanggalLahir),
    formatCleanText(p.kewarganegaraan, "Indonesia"),
    ak,
    js,
    formatStatusKeluarga(p.statusKeluarga),
    formatCleanText(p.tinggalBersama),
    formatCleanText(p.alamat),
    formatCleanText(p.mediaSosial, "Tidak Ada"),
    formatCleanText(p.bahasaAsing, "Tidak Ada"),
    formatCleanText(p.riwayatPrestasi, "Tidak Ada"),
    formatCleanText(p.riwayatOrganisasi, "Tidak Ada"),
    p.beratBadan !== undefined && p.beratBadan !== null && String(p.beratBadan).trim() !== "" ? String(p.beratBadan) : "-",
    p.tinggiBadan !== undefined && p.tinggiBadan !== null && String(p.tinggiBadan).trim() !== "" ? String(p.tinggiBadan) : "-",
    formatCleanText(p.riwayatPenyakit, "Tidak Ada"),
    p.isMerokok ? "Merokok" : "Tidak Merokok",
    p.isButaWarna ? "Buta Warna" : "Tidak Buta Warna",
    p.hasPenyakitMenular ? "Ada Riwayat" : "Tidak Ada",
    p.pernyataanSiswa ? "Sudah Menyetujui" : "Belum Menyetujui",

    // 3. Data Orang Tua
    formatKeadaanOrangTua(p.keadaanOrangTua),
    formatCleanText(p.namaAyah),
    formatCleanText(p.pekerjaanAyah),
    formatCleanText(p.alamatDomisiliAyah),
    formatCleanText(p.namaIbu),
    formatCleanText(p.pekerjaanIbu),
    formatPhoneNumber(p.noHpOrangTua),
    formatCleanText(p.penghasilanOrangTua),
    p.pernyataanOrangTua ? "Sudah Menyetujui" : "Belum Menyetujui",

    // 4. Data Sekolah Asal
    formatCleanText(p.sekolahAsal),
    formatCleanText(p.npsnSekolah),
    formatStatusSekolah(p.statusSekolah),
    formatCleanText(p.tahunLulus),
    formatCleanText(p.alamatSekolah),

    // 5. Surat Rekomendasi
    formatCleanText(p.namaPemberiRekomendasi),
    formatCleanText(p.jabatanInstansi),
    formatPhoneNumber(p.noHpPemberiRekomendasi),
    formatCleanText(p.catatanRekomendasi, "Tidak Ada"),
  ];
}

function escapeCsvCell(cell: unknown): string {
  if (cell === null || cell === undefined) return '""';
  if (typeof cell === "boolean") return cell ? '"Ya"' : '"Tidak"';
  const str = String(cell).replace(/\r\n/g, " ").replace(/[\r\n]/g, " ").trim();
  return `"${str.replace(/"/g, '""')}"`;
}

/**
 * Download file CSV dengan penanda `sep=<delimiter>` agar Microsoft Excel otomatis
 * memisahkan data ke masing-masing kolom (Kolom A, B, C...) tanpa menumpuk di 1 kolom.
 */
function downloadCsvFile(filename: string, rows: string[][], delimiter: "," | ";" = ",") {
  const headerLine = CSV_HEADERS.map(escapeCsvCell).join(delimiter);
  const dataLines = rows.map((r) => r.map(escapeCsvCell).join(delimiter));

  // Kunci utama agar Excel Windows otomatis membaca pemisah kolom yang tepat:
  const sepDirective = `sep=${delimiter}`;
  const csvString = [sepDirective, headerLine, ...dataLines].join("\r\n");

  const blob = new Blob(["\uFEFF" + csvString], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Download file Excel Spreadsheet (.xls) format native table XML.
 * 100% dijamin langsung terbuka dengan masing-masing kolom terpisah rapi di Excel,
 * lengkap dengan warna header dan format teks pada NIK/NISN/No HP.
 */
function downloadExcelFile(filename: string, rows: string[][]) {
  const tableHeaders = CSV_HEADERS.map(
    (h) =>
      `<th style="background-color:#1e3a8a;color:#ffffff;font-weight:bold;padding:10px 14px;border:1px solid #cbd5e1;white-space:nowrap;font-size:12px;font-family:sans-serif;">${h}</th>`
  ).join("");

  const tableRows = rows
    .map((r) => {
      const cells = r
        .map(
          (cell) =>
            `<td style="padding:8px 12px;border:1px solid #e2e8f0;font-size:11px;font-family:sans-serif;mso-number-format:'\\@';">${String(
              cell
            )
              .replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")}</td>`
        )
        .join("");
      return `<tr>${cells}</tr>`;
    })
    .join("");

  const excelHtml = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8">
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>Data Peserta PPDB</x:Name>
                <x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
      </head>
      <body>
        <table border="1" cellpadding="0" cellspacing="0">${tableHeaders}${tableRows}</table>
      </body>
    </html>
  `.trim();

  const blob = new Blob(["\uFEFF" + excelHtml], {
    type: "application/vnd.ms-excel;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function DashboardContent() {
  const [pesertaList, setPesertaList] = useState<Peserta[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isPending, startTransition] = useTransition();
  const [notification, setNotification] = useState<string | null>(null);

  const loadDataFromDb = async () => {
    setLoading(true);
    const result = await getPendaftaranPpdbListAction();
    if (result.success && result.data) {
      setPesertaList(result.data);
    } else {
      showToast(result.error || "Gagal memuat data dari database");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadDataFromDb();
  }, []);

  const totalPeserta = pesertaList.length;
  const totalTerverifikasi = pesertaList.filter((p) => p.status === "Sudah Diverifikasi").length;
  const totalBelumTerverifikasi = totalPeserta - totalTerverifikasi;
  const verifikasiPercentage = totalPeserta > 0 ? Math.round((totalTerverifikasi / totalPeserta) * 100) : 0;

  const showToast = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleDelete = (peserta: Peserta) => {
    if (confirm(`Apakah Anda yakin ingin menghapus data pendaftaran ${peserta.nama} dari database?`)) {
      setPesertaList((prev) => prev.filter((p) => p.id !== peserta.id));

      startTransition(async () => {
        const res = await deletePendaftaranAction(peserta.id);
        if (res.success) {
          showToast(`Data peserta ${peserta.nama} berhasil dihapus dari database.`);
        } else {
          loadDataFromDb();
          showToast(res.error || "Gagal menghapus data dari database.");
        }
      });
    }
  };

  // Unduh data tunggal untuk peserta tertentu
  const handleDownloadSingle = (peserta: Peserta) => {
    const row = formatPesertaToRow(peserta);
    const safeName = (peserta.nama || "peserta").replace(/[^a-zA-Z0-9_-]/g, "_");
    const safeNisn = peserta.nisn && peserta.nisn !== "-" ? peserta.nisn : "no_nisn";
    // Gunakan sep=, agar tiap data masuk ke kolom A, B, C... terpisah
    downloadCsvFile(`PPDB_${safeNisn}_${safeName}.csv`, [row], ",");
    showToast(`File data lengkap ${peserta.nama} berhasil diunduh.`);
  };

  // Export seluruh data peserta dengan 2 opsi format: Excel (.xls) dan CSV (Koma)
  const handleExportAll = (formatType: "csv" | "excel") => {
    if (pesertaList.length === 0) {
      showToast("Tidak ada data untuk diexport.");
      return;
    }

    const rows = pesertaList.map(formatPesertaToRow);
    const dateStr = new Date().toISOString().split("T")[0];

    if (formatType === "excel") {
      downloadExcelFile(`PPDB_Semua_Peserta_${dateStr}.xls`, rows);
      showToast("Seluruh data peserta berhasil diexport ke format Excel (.xls).");
    } else {
      downloadCsvFile(`PPDB_Semua_Peserta_${dateStr}.csv`, rows, ",");
      showToast("Seluruh data peserta berhasil diexport ke CSV (Pemisah Koma).");
    }
  };

  return (
    <div className="min-h-screen space-y-6 bg-slate-50/60 p-4 sm:p-6 md:p-8">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-slate-900 px-4 py-3 text-xs font-semibold text-white shadow-lg flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col gap-3.5 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Manajemen Data PPDB (Database)
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Terhubung langsung dengan database PostgreSQL Prisma. Peserta otomatis terverifikasi setelah melengkapi semua informasi.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={loadDataFromDb}
            disabled={loading || isPending}
            className="flex-1 sm:flex-none inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50 disabled:opacity-50 active:bg-slate-100"
            title="Refresh data dari database"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading || isPending ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>

          {/* Export Menu Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex-1 sm:flex-none inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-blue-900 px-4 py-2 text-xs font-semibold text-white shadow-2xs transition hover:bg-blue-950 active:bg-blue-900 cursor-pointer">
              <Download className="h-4 w-4 text-white" />
              <span>Export Data</span>
              <ChevronDown className="h-3.5 w-3.5 opacity-80" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={6} className="w-68 p-1.5">
              <DropdownMenuItem
                onClick={() => handleExportAll("excel")}
                className="cursor-pointer font-medium p-2.5 rounded-md hover:bg-slate-100 transition"
              >
                <FileSpreadsheet className="h-4 w-4 text-emerald-600 mr-2 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-slate-900">Format Excel (.xls)</p>
                  <p className="text-[10.5px] text-slate-500 leading-tight">
                    100% kolom otomatis terpisah rapi di Excel
                  </p>
                </div>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => handleExportAll("csv")}
                className="cursor-pointer font-medium p-2.5 rounded-md hover:bg-slate-100 transition"
              >
                <FileText className="h-4 w-4 text-blue-600 mr-2 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-slate-900">Format CSV (.csv)</p>
                  <p className="text-[10.5px] text-slate-500 leading-tight">
                     untuk auto-kolom CSV
                  </p>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Total Pendaftar"
          value={loading ? "..." : totalPeserta}
          description="Terdaftar di database PostgreSQL"
          icon={Users}
          variant="primary"
        />
        <StatCard
          label="Sudah Diverifikasi"
          value={loading ? "..." : totalTerverifikasi}
          description={`${verifikasiPercentage}% dari total berkas pendaftar`}
          icon={CheckCircle2}
          variant="success"
        />
        <StatCard
          label="Belum Diverifikasi"
          value={loading ? "..." : totalBelumTerverifikasi}
          description="Menunggu kelengkapan data peserta"
          icon={Clock}
          variant="warning"
        />
      </div>

      {/* Loading Indicator */}
      {loading ? (
        <div className="flex h-48 w-full items-center justify-center rounded-xl border border-slate-200 bg-white p-8 shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            <Loader2 className="h-5 w-5 animate-spin text-blue-900" />
            <span>Memuat data pendaftaran dari database...</span>
          </div>
        </div>
      ) : (
        /* Main Data Table */
        <DataTable
          data={pesertaList}
          onDownload={handleDownloadSingle}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
