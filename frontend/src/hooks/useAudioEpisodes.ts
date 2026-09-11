import { useCachedFetch } from './useAPI';
import { audioEpisodesAPI } from '../services/api';
import type { AudioEpisode } from '../services/api.d';

export type { AudioEpisode };

export const useAudioEpisodes = (limit = 20) => {
  const { data, loading, error, refetch } = useCachedFetch<AudioEpisode[]>(
    `audioEpisodes:v1:${limit}`,
    async () => {
      const response = await audioEpisodesAPI.getEpisodes({ limit });
      if (!response.success) throw new Error(response.message || 'Failed to load audio episodes');
      return response.data?.episodes || [];
    },
    { ttl: 5 * 60 * 1000 }
  );

  return {
    episodes: data || [],
    hasLoaded: data !== null,
    loading,
    error,
    refetch
  };
};
