import { useState, useEffect, useCallback } from 'react';
import { settingsAPI } from '../services/api';
import { getCached, setCached, dedupedFetch } from '../lib/dataCache';

const CACHE_KEY = 'backgroundSettings';
const TTL = 5 * 60 * 1000; // 5 minutes

interface BackgroundSettings {
  imageUrl: string;
  opacity: number;
  overlayColor: string;
  overlayOpacity: number;
}

const defaultBackgroundSettings: BackgroundSettings = {
  imageUrl: 'https://res.cloudinary.com/dbuuqmq1j/image/upload/v1789050662/images/site-hero-background.jpg',
  opacity: 0.4,
  overlayColor: '#000000',
  overlayOpacity: 0
};

export const useBackgroundSettings = () => {
  const cached = getCached<BackgroundSettings>(CACHE_KEY);
  const [backgroundSettings, setBackgroundSettings] = useState<BackgroundSettings>(
    cached?.data || defaultBackgroundSettings
  );
  const [loading, setLoading] = useState(!cached);

  const fetchBackgroundSettings = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const response = await dedupedFetch(CACHE_KEY, () => settingsAPI.getSettingCategory('backgroundSettings'));
      if (response.success && response.data.settings) {
        const merged = { ...defaultBackgroundSettings, ...response.data.settings };
        setBackgroundSettings(merged);
        setCached(CACHE_KEY, merged);
        localStorage.setItem('backgroundSettings', JSON.stringify(merged));
      } else if (!silent) {
        // Fallback to localStorage if API fails but returns success: false
        const savedSettings = localStorage.getItem('backgroundSettings');
        if (savedSettings) {
          setBackgroundSettings({ ...defaultBackgroundSettings, ...JSON.parse(savedSettings) });
        }
      }
    } catch (error) {
      console.error('Error loading background settings from API:', error);
      if (!silent) {
        // Final fallback to localStorage
        const savedSettings = localStorage.getItem('backgroundSettings');
        if (savedSettings) {
          setBackgroundSettings({ ...defaultBackgroundSettings, ...JSON.parse(savedSettings) });
        }
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const entry = getCached<BackgroundSettings>(CACHE_KEY);
    if (entry) {
      setBackgroundSettings(entry.data);
      setLoading(false);
      if (Date.now() - entry.timestamp > TTL) {
        fetchBackgroundSettings(true); // stale — refresh quietly in the background
      }
    } else {
      fetchBackgroundSettings(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveBackgroundSettings = async (settings: Partial<BackgroundSettings>) => {
    const newSettings = { ...backgroundSettings, ...settings };
    setBackgroundSettings(newSettings);
    setCached(CACHE_KEY, newSettings);
    localStorage.setItem('backgroundSettings', JSON.stringify(newSettings));

    try {
      await settingsAPI.updateSettings('backgroundSettings', newSettings);
    } catch (error) {
      console.error('Error saving background settings to API:', error);
    }
  };

  const getBackgroundStyle = () => {
    return {
      backgroundImage: `url(${backgroundSettings.imageUrl})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      opacity: backgroundSettings.opacity
    };
  };

  const getOverlayStyle = () => {
    return {
      backgroundColor: backgroundSettings.overlayColor,
      opacity: backgroundSettings.overlayOpacity
    };
  };

  const resetToDefault = async () => {
    setBackgroundSettings(defaultBackgroundSettings);
    setCached(CACHE_KEY, defaultBackgroundSettings);
    localStorage.setItem('backgroundSettings', JSON.stringify(defaultBackgroundSettings));
    try {
      await settingsAPI.updateSettings('backgroundSettings', defaultBackgroundSettings);
    } catch (error) {
      console.error('Error resetting background settings on API:', error);
    }
  };

  return {
    backgroundSettings,
    saveBackgroundSettings,
    getBackgroundStyle,
    getOverlayStyle,
    resetToDefault,
    loading,
    refreshSettings: fetchBackgroundSettings
  };
};
