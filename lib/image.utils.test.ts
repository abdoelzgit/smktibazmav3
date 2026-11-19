import assert from 'node:assert/strict';
import { test } from 'node:test';
import { detectAndValidate } from './image.utils';

test('detects supported document signatures without trusting the declared MIME', async () => {
  const pdf = new File(['%PDF-1.7\nbody'], 'document.bin', { type: 'text/plain' });
  const jpeg = new File([Uint8Array.from([0xff, 0xd8, 0xff, 0x00])], 'photo.bin');
  const png = new File([Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])], 'photo.bin');
  const webp = new File([new Uint8Array([...Buffer.from('RIFF'), 0, 0, 0, 0, ...Buffer.from('WEBP')])], 'photo.bin');

  assert.equal(await detectAndValidate(pdf), 'application/pdf');
  assert.equal(await detectAndValidate(jpeg), 'image/jpeg');
  assert.equal(await detectAndValidate(png), 'image/png');
  assert.equal(await detectAndValidate(webp), 'image/webp');
});

test('rejects a non-document even when its filename and MIME claim PDF', async () => {
  const renamedExecutable = new File(['not a PDF'], 'proof.pdf', { type: 'application/pdf' });
  await assert.rejects(detectAndValidate(renamedExecutable), /harus berupa PDF atau gambar/);
});
