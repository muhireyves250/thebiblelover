import { useCachedFetch } from './useAPI';
import { homeFeedAPI } from '../services/api';
import type { HomeFeedItem } from '../services/api.d';

export type { HomeFeedItem };

interface HomeFeedData {
  featured: HomeFeedItem | null;
  items: HomeFeedItem[];
}

// Short TTL — a live broadcast can start or end at any time, so this
// shouldn't sit stale in cache as long as most other homepage content does.
const LIVE_AWARE_TTL = 60 * 1000;

export const useHomeFeed = (limit = 6) => {
  const { data, loading, error, refetch } = useCachedFetch<HomeFeedData>(
    `homeFeed:v2:${limit}`,
    async () => {
      const response = await homeFeedAPI.getFeed(limit);
      // A failed request must not be silently treated as "successfully
      // empty" — that would get cached and read back as real content,
      // making the section look genuinely empty instead of momentarily
      // unavailable. Throwing here keeps `data` at null until a request
      // actually succeeds.
      if (!response.success) throw new Error(response.message || 'Failed to load home feed');
      return response.data || { featured: null, items: [] };
    },
    { ttl: LIVE_AWARE_TTL }
  );

  return {
    featured: data?.featured || null,
    items: data?.items || [],
    // True only once we have an actual result (from cache or a successful
    // fetch) — distinct from `loading`, whose exact timing shouldn't be
    // what decides whether the section renders a skeleton or nothing.
    hasLoaded: data !== null,
    loading,
    error,
    refetch
  };
};
