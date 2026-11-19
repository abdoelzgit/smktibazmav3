import assert from 'node:assert/strict';
import { test } from 'node:test';
import { runWithUploadSlot } from './upload-queue';

test('keeps no more than two uploads active at once', async () => {
  let active = 0;
  let maximumActive = 0;
  const tasks = Array.from({ length: 8 }, (_, index) => {
    const controller = new AbortController();
    return runWithUploadSlot(async () => {
      active += 1;
      maximumActive = Math.max(maximumActive, active);
      await new Promise((resolve) => setTimeout(resolve, 5));
      active -= 1;
      return index;
    }, controller.signal);
  });

  assert.deepEqual(await Promise.all(tasks), [0, 1, 2, 3, 4, 5, 6, 7]);
  assert.equal(maximumActive, 2);
});

test('removes an upload canceled while waiting in the queue', async () => {
  const started: number[] = [];
  let releaseBlockers: (() => void) | undefined;
  const blockers = new Promise<void>((resolve) => { releaseBlockers = resolve; });
  const firstController = new AbortController();
  const secondController = new AbortController();
  const queuedController = new AbortController();

  const first = runWithUploadSlot(async () => {
    started.push(1);
    await blockers;
  }, firstController.signal);
  const second = runWithUploadSlot(async () => {
    started.push(2);
    await blockers;
  }, secondController.signal);
  const queued = runWithUploadSlot(async () => {
    started.push(3);
  }, queuedController.signal);

  await new Promise((resolve) => setTimeout(resolve, 0));
  queuedController.abort();
  await assert.rejects(queued, { name: 'AbortError' });
  releaseBlockers?.();
  await Promise.all([first, second]);
  assert.deepEqual(started, [1, 2]);
});
