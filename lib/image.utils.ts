import sharp from 'sharp';
import { ALLOWED_MIME, UPLOAD_MAX_BYTES } from '@/lib/ppdb-upload.config';

const MAX_IMAGE_PIXELS = 40_000_000;

export function isImageFile(file: File): boolean {
  if (file.type && file.type.startsWith('image/')) return true;
  const ext = file.name ? file.name.split('.').pop()?.toLowerCase() : '';
  return ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'heic', 'svg'].includes(ext || '');
}

export type AllowedMime = (typeof ALLOWED_MIME)[number];

export async function detectAndValidate(file: File): Promise<AllowedMime> {
  const bytes = new Uint8Array(await file.slice(0, 4100).arrayBuffer());
  let detectedMime: string | null = null;

  if (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46 && bytes[4] === 0x2d) {
    detectedMime = 'application/pdf';
  } else if (
    bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
  ) {
    detectedMime = 'image/jpeg';
  } else if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 &&
    bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a
  ) {
    detectedMime = 'image/png';
  } else if (
    bytes.length >= 12 &&
    String.fromCharCode(...bytes.subarray(0, 4)) === 'RIFF' &&
    String.fromCharCode(...bytes.subarray(8, 12)) === 'WEBP'
  ) {
    detectedMime = 'image/webp';
  }

  if (!detectedMime || !ALLOWED_MIME.includes(detectedMime as AllowedMime)) {
    throw new Error('Berkas harus berupa PDF atau gambar JPEG, PNG, atau WebP yang valid');
  }

  return detectedMime as AllowedMime;
}

export async function convertImageToWebp(file: File): Promise<Buffer> {
  const mime = await detectAndValidate(file);
  if (!mime.startsWith('image/')) {
    throw new Error('File bukan gambar');
  }

  if (file.size > UPLOAD_MAX_BYTES) {
    throw new Error(`Ukuran gambar melebihi batas ${Math.floor(UPLOAD_MAX_BYTES / (1024 * 1024))} MB`);
  }

  return sharp(Buffer.from(await file.arrayBuffer()), {
    limitInputPixels: MAX_IMAGE_PIXELS,
  })
    .rotate()
    .webp({ quality: 80, effort: 4 })
    .toBuffer();
}

export function isAllowedDocument(file: File): boolean {
  if (isImageFile(file)) return true;
  if (file.type === 'application/pdf') return true;
  const ext = file.name ? file.name.split('.').pop()?.toLowerCase() : '';
  return ext === 'pdf';
}

