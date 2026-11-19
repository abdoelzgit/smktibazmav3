"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Eye, FileText, RotateCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";
import { DocumentPreviewDialog } from "@/components/ppdb-document-preview";
import { compressUploadImage } from "@/lib/compress-upload-image";
import { formatFileSize } from "@/lib/compress-upload-image";
import type { BerkasKey } from "@/lib/ppdb-upload.config";
import { runWithUploadSlot } from "@/components/spmb/upload-queue";

const MAX_UPLOAD_FILE_SIZE = 5 * 1024 * 1024;

type UploadReply = {
  success: boolean;
  data?: { key: BerkasKey; url: string };
  error?: string;
};

type UploadState = "idle" | "compressing" | "uploading" | "saved" | "failed";

class UploadFailure extends Error {
  constructor(message: string, readonly retryable: boolean) {
    super(message);
  }
}

function sendUpload(
  file: File,
  key: BerkasKey,
  signal: AbortSignal,
  onProgress: (progress: number) => void,
  onXhr: (xhr: XMLHttpRequest) => void,
): Promise<UploadReply['data']> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    onXhr(xhr);
    xhr.open("POST", "/api/ppdb/upload");
    xhr.timeout = 120_000;
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress(Math.min(100, Math.round((event.loaded / event.total) * 100)));
      }
    };
    xhr.onload = () => {
      let reply: UploadReply;
      try {
        reply = JSON.parse(xhr.responseText) as UploadReply;
      } catch {
        reject(new UploadFailure("Server mengirim respons yang tidak terbaca.", xhr.status >= 500));
        return;
      }

      if (xhr.status >= 200 && xhr.status < 300 && reply.success && reply.data) {
        resolve(reply.data);
        return;
      }

      reject(new UploadFailure(reply.error ?? "Berkas gagal diunggah.", xhr.status >= 500));
    };
    xhr.onerror = () => reject(new UploadFailure("Koneksi terputus saat mengunggah.", true));
    xhr.ontimeout = () => reject(new UploadFailure("Upload terlalu lama. Periksa koneksi lalu coba lagi.", true));
    xhr.onabort = () => reject(new DOMException("Upload dibatalkan", "AbortError"));
    signal.addEventListener("abort", () => xhr.abort(), { once: true });

    const body = new FormData();
    body.append("key", key);
    body.append("file", file, file.name);
    xhr.send(body);
  });
}

function waitBeforeRetry(delay: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException("Upload dibatalkan", "AbortError"));
      return;
    }

    const timeout = window.setTimeout(() => {
      signal.removeEventListener("abort", cancel);
      resolve();
    }, delay);
    const cancel = () => {
      window.clearTimeout(timeout);
      reject(new DOMException("Upload dibatalkan", "AbortError"));
    };
    signal.addEventListener("abort", cancel, { once: true });
  });
}

async function sendWithRetry(
  file: File,
  key: BerkasKey,
  signal: AbortSignal,
  onProgress: (progress: number) => void,
  onXhr: (xhr: XMLHttpRequest) => void,
) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await sendUpload(file, key, signal, onProgress, onXhr);
    } catch (error) {
      if (!(error instanceof UploadFailure) || !error.retryable || attempt === 2) throw error;
      await waitBeforeRetry(400 * 2 ** attempt, signal);
    }
  }

  throw new Error("Upload gagal setelah dicoba ulang.");
}

interface FileUploadFieldProps {
  fieldKey: BerkasKey;
  label: string;
  initialUrl?: string | null;
  isLocked?: boolean;
  templateUrl?: string;
  onChange?: (url: string) => void;
  onUploadActivity?: (active: boolean) => void;
}

export function FileUploadField({
  fieldKey,
  label,
  initialUrl,
  isLocked = false,
  templateUrl,
  onChange,
  onUploadActivity,
}: FileUploadFieldProps) {
  const inputId = `upload-${fieldKey}`;
  const [uploadState, setUploadState] = useState<UploadState>(initialUrl ? "saved" : "idle");
  const [savedUrl, setSavedUrl] = useState(initialUrl ?? "");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preparedFile, setPreparedFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [preview, setPreview] = useState<File | string | null>(null);
  const abortController = useRef<AbortController | null>(null);
  const activeXhr = useRef<XMLHttpRequest | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      abortController.current?.abort();
      activeXhr.current?.abort();
    };
  }, []);

  const upload = async (file: File) => {
    const controller = new AbortController();
    abortController.current = controller;
    onUploadActivity?.(true);
    setUploadState("uploading");
    setProgress(0);
    setErrorMessage("");

    try {
      const result = await runWithUploadSlot(
        () => sendWithRetry(
          file,
          fieldKey,
          controller.signal,
          setProgress,
          (xhr) => { activeXhr.current = xhr; },
        ),
        controller.signal,
      );

      if (!result || !mounted.current) return;
      setSavedUrl(result.url);
      setSelectedFile(null);
      setPreparedFile(null);
      setUploadState("saved");
      onChange?.(result.url);
    } catch (error) {
      if (!mounted.current || (error instanceof DOMException && error.name === "AbortError")) return;
      setUploadState("failed");
      setErrorMessage(error instanceof Error ? error.message : "Berkas gagal diunggah.");
    } finally {
      activeXhr.current = null;
      if (abortController.current === controller) abortController.current = null;
      onUploadActivity?.(false);
    }
  };

  const handleFileChange = async (file: File | undefined) => {
    if (!file) return;
    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    const isImage = file.type.startsWith("image/") || /\.(jpe?g|png|webp)$/i.test(file.name);
    if (!isPdf && !isImage) {
      setUploadState("failed");
      setErrorMessage("Pilih file PDF, JPG, PNG, atau WebP.");
      return;
    }
    if (file.size === 0) {
      setUploadState("failed");
      setErrorMessage("File kosong tidak dapat diunggah.");
      return;
    }
    if (file.size > MAX_UPLOAD_FILE_SIZE) {
      setUploadState("failed");
      setErrorMessage("Ukuran file maksimal 5 MB.");
      return;
    }

    setSelectedFile(file);
    setErrorMessage("");
    let uploadFile = file;
    if (isImage) {
      setUploadState("compressing");
      try {
        uploadFile = await compressUploadImage(file);
      } catch {
        uploadFile = file;
      }
    }

    if (uploadFile.size > MAX_UPLOAD_FILE_SIZE) {
      setPreparedFile(uploadFile);
      setUploadState("failed");
      setErrorMessage("Foto masih melebihi batas 5 MB setelah diperkecil.");
      return;
    }

    setPreparedFile(uploadFile);
    await upload(uploadFile);
  };

  const handleRetry = () => {
    if (preparedFile) void upload(preparedFile);
  };

  const handleCancel = () => {
    abortController.current?.abort();
    activeXhr.current?.abort();
    setSelectedFile(null);
    setPreparedFile(null);
    setProgress(0);
    setErrorMessage("");
    setUploadState(savedUrl ? "saved" : "idle");
  };

  const isBusy = uploadState === "compressing" || uploadState === "uploading";
  const visibleUrl = savedUrl || initialUrl || "";

  return (
    <article className="flex min-w-0 flex-col rounded-lg border border-gray-200 bg-white p-3.5 sm:p-4">
      <div className="flex min-w-0 items-start gap-2">
        <div className="min-w-0 flex-1">
          <label htmlFor={inputId} className="block text-[13px] font-semibold leading-5 text-gray-900">
            {label}
          </label>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[11px] text-gray-600">
            <span>PDF atau gambar · maksimal 5 MB</span>
            {templateUrl && (
              <a href={templateUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-800 underline underline-offset-2 hover:text-blue-950">
                Unduh template
              </a>
            )}
          </div>
        </div>
        {visibleUrl && uploadState === "saved" && (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-medium text-emerald-800">
            <Check className="size-3" aria-hidden="true" /> Tersimpan
          </span>
        )}
      </div>

      <div className="my-3 border-t border-gray-100" />

      <div className="flex min-w-0 items-center gap-2">
        <FileText className="size-4 shrink-0 text-[#132b6d]" aria-hidden="true" />
        <span className="min-w-0 flex-1 truncate text-xs font-medium text-gray-800">
          {selectedFile?.name ?? (visibleUrl ? "Berkas tersimpan" : "Belum ada berkas")}
        </span>
        {selectedFile && uploadState !== "uploading" && (
          <span className="shrink-0 text-[11px] text-gray-600">{formatFileSize(selectedFile.size)}</span>
        )}
        {selectedFile && (
          <Button type="button" variant="ghost" size="sm" className="h-8 shrink-0 px-2" onClick={() => setPreview(selectedFile)}>
            <Eye aria-hidden="true" /> Pratinjau
          </Button>
        )}
        {visibleUrl && !selectedFile && (
          <Button type="button" variant="ghost" size="sm" className="h-8 shrink-0 px-2 text-emerald-900" onClick={() => setPreview(visibleUrl)}>
            <Eye aria-hidden="true" /> Pratinjau
          </Button>
        )}
      </div>

      {uploadState === "compressing" && (
        <p role="status" className="mt-2 text-xs text-gray-700">Menyiapkan foto sebelum diunggah...</p>
      )}
      {uploadState === "uploading" && (
        <div className="mt-3 space-y-1.5" role="status" aria-live="polite">
          <div className="flex justify-between text-xs text-gray-700">
            <span>Mengunggah dokumen ini</span>
            <span>{progress}%</span>
          </div>
          <div
            role="progressbar"
            aria-label={`Progres upload ${label}`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
            className="h-1.5 overflow-hidden rounded-sm bg-gray-200"
          >
            <div className="h-full bg-[#132b6d] transition-[width]" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}
      {uploadState === "failed" && (
        <p role="alert" className="mt-2 text-xs font-medium text-red-800">{errorMessage}</p>
      )}

      {!isLocked && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <div className="relative inline-flex">
            <Input
              id={inputId}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp"
              disabled={isBusy}
              onChange={(event) => {
                void handleFileChange(event.target.files?.[0]);
                event.currentTarget.value = "";
              }}
              aria-label={`${visibleUrl ? "Ganti" : "Pilih"} ${label}`}
              className="peer absolute inset-0 z-10 h-10 w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
            />
            <span className="pointer-events-none inline-flex min-h-10 items-center rounded-md border border-gray-300 bg-white px-3 text-xs font-medium text-gray-800 peer-hover:bg-gray-50 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#132b6d]">
              {visibleUrl ? "Ganti berkas" : "Pilih berkas"}
            </span>
          </div>
          {uploadState === "failed" && preparedFile && (
            <Button type="button" variant="outline" size="sm" onClick={handleRetry}>
              <RotateCw aria-hidden="true" /> Coba lagi
            </Button>
          )}
          {isBusy && (
            <Button type="button" variant="ghost" size="sm" onClick={handleCancel}>
              <X aria-hidden="true" /> Batal
            </Button>
          )}
        </div>
      )}

      <DocumentPreviewDialog
        open={Boolean(preview)}
        file={preview}
        title={label}
        onOpenChange={(open) => { if (!open) setPreview(null); }}
      />
    </article>
  );
}
