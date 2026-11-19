type QueueJob = {
  signal: AbortSignal;
  start: () => void;
  cancel: () => void;
};

const MAX_PARALLEL_UPLOADS = 2;
let activeUploads = 0;
const waitingUploads: QueueJob[] = [];

function drainQueue() {
  while (activeUploads < MAX_PARALLEL_UPLOADS && waitingUploads.length > 0) {
    const job = waitingUploads.shift();
    job?.start();
  }
}

export function runWithUploadSlot<T>(
  task: () => Promise<T>,
  signal: AbortSignal,
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const job: QueueJob = {
      signal,
      cancel: () => {
        const index = waitingUploads.indexOf(job);
        if (index !== -1) waitingUploads.splice(index, 1);
        reject(new DOMException('Upload dibatalkan', 'AbortError'));
        drainQueue();
      },
      start: () => {
        signal.removeEventListener('abort', job.cancel);
        if (signal.aborted) {
          job.cancel();
          drainQueue();
          return;
        }

        activeUploads += 1;
        void task()
          .then(resolve, reject)
          .finally(() => {
            activeUploads -= 1;
            drainQueue();
          });
      },
    };

    if (signal.aborted) {
      reject(new DOMException('Upload dibatalkan', 'AbortError'));
      return;
    }

    signal.addEventListener('abort', job.cancel, { once: true });
    waitingUploads.push(job);
    drainQueue();
  });
}
