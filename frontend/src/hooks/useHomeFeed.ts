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
    `homeFeed:${limit}`,
    async () => {
      const response = await homeFeedAPI.getFeed(limit);
      return response.data || { featured: null, items: [] };
    },
    { ttl: LIVE_AWARE_TTL }
  );

  return {
    featured: data?.featured || null,
    items: data?.items || [],
    loading,
    error,
    refetch
  };
};
