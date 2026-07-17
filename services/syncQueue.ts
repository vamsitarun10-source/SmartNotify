import AsyncStorage from "@react-native-async-storage/async-storage";

const QUEUE_KEY = "sync_queue";
const MAX_ITEMS = 50;

export interface QueueItem {
  id: string;
  method: string;
  endpoint: string;
  body: any;
  timestamp: number;
  retries: number;
}

let listeners: (() => void)[] = [];

export function onQueueChange(cb: () => void) {
  listeners.push(cb);
  return () => { listeners = listeners.filter((l) => l !== cb); };
}

function notify() {
  listeners.forEach((l) => l());
}

async function readQueue(): Promise<QueueItem[]> {
  try {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

async function writeQueue(queue: QueueItem[]) {
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue.slice(-MAX_ITEMS)));
  notify();
}

export async function enqueueRequest(method: string, endpoint: string, body: any): Promise<string> {
  const id = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const queue = await readQueue();
  queue.push({ id, method, endpoint, body, timestamp: Date.now(), retries: 0 });
  await writeQueue(queue);
  return id;
}

export async function processQueue(api: any): Promise<{ processed: number; failed: number }> {
  const queue = await readQueue();
  if (queue.length === 0) return { processed: 0, failed: 0 };

  let processed = 0;
  let failed = 0;
  const remaining: QueueItem[] = [];

  for (const item of queue) {
    try {
      const config = {
        method: item.method,
        url: item.endpoint,
        data: item.body,
        timeout: 15000,
      };
      await api(config);
      processed++;
    } catch {
      if (item.retries < 3) {
        remaining.push({ ...item, retries: item.retries + 1 });
      }
      failed++;
    }
  }

  await writeQueue(remaining);
  return { processed, failed };
}

export async function getQueueLength(): Promise<number> {
  const queue = await readQueue();
  return queue.length;
}

export async function clearQueue() {
  await writeQueue([]);
}

export async function getQueueItems(): Promise<QueueItem[]> {
  return readQueue();
}
