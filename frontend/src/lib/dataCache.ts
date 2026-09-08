// Shared client-side cache for API GET data. Backed by an in-memory map (survives
// SPA navigation instantly) and mirrored to sessionStorage (survives a page reload
// within the same tab/session).

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const STORAGE_PREFIX = 'tbl_cache_v1:';

const memoryCache = new Map<string, CacheEntry<any>>();
const inFlight = new Map<string, Promise<any>>();

function readFromStorage<T>(key: string): CacheEntry<T> | undefined {
  try {
    const raw = sessionStorage.getItem(STORAGE_PREFIX + key);
    return raw ? JSON.parse(raw) : undefined;
  } catch {
    return undefined;
  }
}

function writeToStorage<T>(key: string, entry: CacheEntry<T>) {
  try {
    sessionStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(entry));
  } catch {
    // storage full/unavailable (private mode etc.) — memory cache still works
  }
}

export function getCached<T = any>(key: string): CacheEntry<T> | undefined {
  let entry = memoryCache.get(key);
  if (!entry) {
    entry = readFromStorage<T>(key);
    if (entry) memoryCache.set(key, entry);
  }
  return entry;
}

export function setCached<T = any>(key: string, data: T): void {
  const entry: CacheEntry<T> = { data, timestamp: Date.now() };
  memoryCache.set(key, entry);
  writeToStorage(key, entry);
}

export function clearCached(key: string): void {
  memoryCache.delete(key);
  try {
    sessionStorage.removeItem(STORAGE_PREFIX + key);
  } catch {
    // ignore
  }
}

// Ensures only one network request is in flight per cache key at a time —
// if two components ask for the same data simultaneously, the second one
// just waits on the first's promise instead of firing a duplicate request.
export function dedupedFetch<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  const existing = inFlight.get(key);
  if (existing) return existing;

  const promise = fetcher().finally(() => {
    inFlight.delete(key);
  });
  inFlight.set(key, promise);
  return promise;
}
