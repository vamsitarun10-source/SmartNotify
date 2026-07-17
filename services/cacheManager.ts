import AsyncStorage from "@react-native-async-storage/async-storage";

const DEFAULT_TTL = 30 * 60 * 1000; // 30 minutes

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export async function cacheData<T>(key: string, data: T, ttl: number = DEFAULT_TTL): Promise<void> {
  try {
    const entry: CacheEntry<T> = { data, timestamp: Date.now(), ttl };
    await AsyncStorage.setItem(`cache_${key}`, JSON.stringify(entry));
  } catch {
    // Storage full or corrupted — clear old caches and retry
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter((k) => k.startsWith("cache_") && k !== `cache_${key}`);
      if (cacheKeys.length > 3) {
        await AsyncStorage.multiRemove(cacheKeys.slice(0, 2));
      }
      const entry: CacheEntry<T> = { data, timestamp: Date.now(), ttl };
      await AsyncStorage.setItem(`cache_${key}`, JSON.stringify(entry));
    } catch {}
  }
}

export async function readCache<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(`cache_${key}`);
    if (!raw) return null;

    // Validate JSON before parsing
    if (!raw.startsWith("{")) {
      await AsyncStorage.removeItem(`cache_${key}`);
      return null;
    }

    const entry: CacheEntry<T> = JSON.parse(raw);

    // Validate structure
    if (!entry.data || !entry.timestamp || !entry.ttl) {
      await AsyncStorage.removeItem(`cache_${key}`);
      return null;
    }

    // Check TTL
    if (Date.now() - entry.timestamp > entry.ttl) {
      await AsyncStorage.removeItem(`cache_${key}`);
      return null;
    }
    return entry.data;
  } catch {
    // Corrupted JSON — auto-clear
    try { await AsyncStorage.removeItem(`cache_${key}`); } catch {}
    return null;
  }
}

export async function isCacheValid(key: string): Promise<boolean> {
  const data = await readCache(key);
  return data !== null;
}

export async function invalidateCache(key: string): Promise<void> {
  await AsyncStorage.removeItem(`cache_${key}`);
}

export async function clearAllCache(): Promise<void> {
  const keys = await AsyncStorage.getAllKeys();
  const cacheKeys = keys.filter((k) => k.startsWith("cache_"));
  await AsyncStorage.multiRemove(cacheKeys);
}

// Validate JSON string before parsing
export function safeJsonParse<T>(raw: string, fallback: T): T {
  try {
    if (!raw || !raw.trim().startsWith("{") && !raw.trim().startsWith("[")) {
      return fallback;
    }
    const result = JSON.parse(raw);
    if (result === null || result === undefined) return fallback;
    return result;
  } catch {
    return fallback;
  }
}
