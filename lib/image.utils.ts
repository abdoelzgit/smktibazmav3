import sharp from 'sharp';

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

export function isImageFile(file: File): boolean {
  if (file.type && file.type.startsWith('image/')) return true;
  const ext = file.name ? file.name.split('.').pop()?.toLowerCase() : '';
  return ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'heic', 'svg'].includes(ext || '');
}

export async function convertImageToWebp(file: File): Promise<Buffer> {
  if (!isImageFile(file)) {
    throw new Error('File bukan gambar');
  }

  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error('Ukuran gambar melebihi batas 10 MB');
  }

  return sharp(Buffer.from(await file.arrayBuffer()))
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

