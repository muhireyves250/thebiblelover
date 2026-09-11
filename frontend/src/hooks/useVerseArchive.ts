import { useCachedFetch } from './useAPI';
import { bibleVersesAPI } from '../services/api';
import type { VerseArchiveItem } from '../services/api.d';

export type { VerseArchiveItem };

interface VerseArchiveData {
  featured: VerseArchiveItem | null;
  items: VerseArchiveItem[];
}

export const useVerseArchive = (limit = 13) => {
  const { data, loading, error, refetch } = useCachedFetch<VerseArchiveData>(
    `verseArchive:v3:${limit}`,
    async () => {
      const response = await bibleVersesAPI.getArchive(limit);
      if (!response.success) throw new Error(response.message || 'Failed to load verse archive');
      return response.data || { featured: null, items: [] };
    },
    { ttl: 5 * 60 * 1000 }
  );

  return {
    featured: data?.featured || null,
    items: data?.items || [],
    hasLoaded: data !== null,
    loading,
    error,
    refetch
  };
};
