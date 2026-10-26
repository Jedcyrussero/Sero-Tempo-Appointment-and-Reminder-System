type CacheEntry = {
  data: unknown;
  expiresAt: number;
};

const cache = new Map<string, CacheEntry>();
const pending = new Map<string, Promise<unknown>>();

export function invalidateCache(prefix?: string) {
  if (!prefix) {
    cache.clear();
    pending.clear();
    return;
  }

  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) {
      cache.delete(key);
    }
  }
}

export async function fetchJson<T>(
  url: string,
  options: { ttl?: number; force?: boolean } = {}
): Promise<T> {
  const ttl = options.ttl ?? 30_000;
  const now = Date.now();

  if (!options.force) {
    const cached = cache.get(url);
    if (cached && cached.expiresAt > now) {
      return cached.data as T;
    }

    const inFlight = pending.get(url);
    if (inFlight) {
      return inFlight as Promise<T>;
    }
  }

  const request = fetch(url, { headers: { Accept: 'application/json' } })
    .then(async (res) => {
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || `Request failed (${res.status})`);
      }
      return res.json() as Promise<T>;
    })
    .then((data) => {
      cache.set(url, { data, expiresAt: Date.now() + ttl });
      return data;
    })
    .finally(() => {
      pending.delete(url);
    });

  pending.set(url, request);
  return request;
}
