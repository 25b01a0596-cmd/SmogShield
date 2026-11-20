interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const responseCache = new Map<string, CacheEntry<unknown>>();
const DEFAULT_TTL_MS = 10 * 60 * 1000; // 10 minutes

export function getCachedPlan<T>(key: string): T | null {
  const entry = responseCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    responseCache.delete(key);
    return null;
  }
  return entry.data as T;
}

export function setCachedPlan<T>(key: string, data: T, ttlMs = DEFAULT_TTL_MS): void {
  responseCache.set(key, {
    data,
    expiresAt: Date.now() + ttlMs,
  });
}
