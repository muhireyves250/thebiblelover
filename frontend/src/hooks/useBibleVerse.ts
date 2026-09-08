import { useState, useEffect, useCallback } from 'react';
import { bibleVersesAPI } from '../services/api';
import { getCached, setCached, dedupedFetch } from '../lib/dataCache';

const CACHE_KEY = 'featuredVerse';
const TTL = 5 * 60 * 1000; // 5 minutes

// Type definitions
interface BibleVerse {
  id: string; // Changed from number to string to match backend (cuid)
  verse: string;
  reference: string;
  translation: string;
  image?: string;
  shareCount?: number;
}

interface UseBibleVerseReturn {
  verse: BibleVerse | null;
  loading: boolean;
  error: string | null;
  shareVerse: (verseId: string, shareType?: string, platform?: string) => Promise<{ success: boolean; data?: any; error?: string }>;
  getAllVerses: (page?: number, limit?: number, featured?: boolean) => Promise<any>;
  refetch: () => Promise<void>;
}

export const useBibleVerse = (): UseBibleVerseReturn => {
  const cached = getCached<BibleVerse>(CACHE_KEY);
  const [verse, setVerse] = useState<BibleVerse | null>(cached?.data || null);
  const [loading, setLoading] = useState<boolean>(!cached);
  const [error, setError] = useState<string | null>(null);

  const fetchFeaturedVerse = useCallback(async (silent = false): Promise<void> => {
    try {
      if (!silent) {
        setLoading(true);
        setError(null);
      }
      const response = await dedupedFetch(CACHE_KEY, () => (bibleVersesAPI as any).getFeaturedVerse());

      if (response.success && response.data?.verse) {
        setVerse(response.data.verse);
        setCached(CACHE_KEY, response.data.verse);
      } else if (!silent) {
        setError('No featured verse found');
      }
    } catch (err: any) {
      if (!silent) setError(err?.message || 'Failed to fetch Bible verse');
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  const shareVerse = async (verseId: string, shareType: string = 'COPY_LINK', platform?: string): Promise<{ success: boolean; data?: any; error?: string }> => {
    try {
      const response = await (bibleVersesAPI as any).shareVerse(verseId, {
        shareType,
        platform
      });

      if (response.success) {
        // Update local share count if the featured verse is the one shared
        if (verse && verse.id === verseId && response.data.shareCount !== undefined) {
          setVerse(prev => {
            const next = prev ? { ...prev, shareCount: response.data.shareCount } : null;
            if (next) setCached(CACHE_KEY, next);
            return next;
          });
        }
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.message || 'Failed to share verse' };
      }
    } catch (err: any) {
      console.error('Failed to share verse:', err);
      return { success: false, error: err?.message || 'Failed to share verse' };
    }
  };

  const getAllVerses = async (page: number = 1, limit: number = 10, featured: boolean = false): Promise<any> => {
    try {
      const params = {
        page: page.toString(),
        limit: limit.toString(),
        ...(featured && { featured: 'true' })
      };

      const response = await bibleVersesAPI.getVerses(params);
      return response.success ? response.data : null;
    } catch (err) {
      console.error('Failed to fetch Bible verses:', err);
      return null;
    }
  };

  useEffect(() => {
    const entry = getCached<BibleVerse>(CACHE_KEY);
    if (entry) {
      setVerse(entry.data);
      setLoading(false);
      if (Date.now() - entry.timestamp > TTL) {
        fetchFeaturedVerse(true); // stale — refresh quietly in the background
      }
    } else {
      fetchFeaturedVerse(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    verse,
    loading,
    error,
    shareVerse,
    getAllVerses,
    refetch: fetchFeaturedVerse
  };
};
