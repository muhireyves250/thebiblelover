import { useState, useEffect } from 'react';
import { bibleVersesAPI } from '../services/api';

// Type definitions
interface BibleVerse {
  id: number;
  verse: string;
  reference: string;
  translation: string;
  image?: string;
}

interface UseBibleVerseReturn {
  verse: BibleVerse | null;
  loading: boolean;
  error: string | null;
  shareVerse: (verseId: number, shareType?: string, platform?: string) => Promise<{ success: boolean; data?: any; error?: string }>;
  getAllVerses: (page?: number, limit?: number, featured?: boolean) => Promise<any>;
  refetch: () => Promise<void>;
}

export const useBibleVerse = (): UseBibleVerseReturn => {
  const [verse, setVerse] = useState<BibleVerse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFeaturedVerse = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const response = await (bibleVersesAPI as any).getFeaturedVerse();
      
      if (response.success) {
        setVerse(response.data.verse);
      } else {
        setError('Failed to fetch Bible verse');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch Bible verse');
    } finally {
      setLoading(false);
    }
  };

  const shareVerse = async (verseId: number, shareType: string = 'COPY_LINK', platform?: string): Promise<{ success: boolean; data?: any; error?: string }> => {
    try {
      const response = await (bibleVersesAPI as any).shareVerse(verseId, {
        shareType,
        platform
      });
      
      if (response.success) {
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
    fetchFeaturedVerse();
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
