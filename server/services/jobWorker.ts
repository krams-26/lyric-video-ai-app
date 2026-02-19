import { processPendingJobs } from './jobQueue';

let workerInterval: NodeJS.Timeout | null = null;

export function startJobWorker(intervalMs: number = 5000) {
  if (workerInterval) {
    console.log('[Job Worker] Already running');
    return;
  }

  console.log(`[Job Worker] Started with interval ${intervalMs}ms`);

  workerInterval = setInterval(async () => {
    try {
      await processPendingJobs();
    } catch (error) {
      console.error('[Job Worker] Error processing jobs:', error);
    }
  }, intervalMs);
}

export function stopJobWorker() {
  if (workerInterval) {
    clearInterval(workerInterval);
    workerInterval = null;
    console.log('[Job Worker] Stopped');
  }
}
