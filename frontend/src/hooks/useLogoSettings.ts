import { useState, useEffect, useCallback } from 'react';
import { settingsAPI } from '../services/api';
import { getCached, setCached, dedupedFetch } from '../lib/dataCache';

const CACHE_KEY = 'logoSettings';
const TTL = 5 * 60 * 1000; // 5 minutes

interface LogoSettings {
  logoUrl: string;
  logoText: string;
  showText: boolean;
}

const defaultLogoSettings: LogoSettings = {
  logoUrl: '',
  logoText: 'The Bible Lover',
  showText: true
};

export const useLogoSettings = () => {
  const cached = getCached<LogoSettings>(CACHE_KEY);
  const [logoSettings, setLogoSettings] = useState<LogoSettings>(cached?.data || defaultLogoSettings);
  const [loading, setLoading] = useState(!cached);

  const fetchSettings = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const response = await dedupedFetch(CACHE_KEY, () => settingsAPI.getSettingCategory('logoSettings'));
      if (response.success && response.data?.settings) {
        const fetchedSettings = response.data.settings;
        const merged = { ...defaultLogoSettings, ...fetchedSettings };
        setLogoSettings(merged);
        setCached(CACHE_KEY, merged);
        // Still keep as backup/cache
        localStorage.setItem('logoSettings', JSON.stringify(fetchedSettings));
      }
    } catch (error) {
      if (!silent) {
        console.error('Error fetching logo settings:', error);
        // Fallback to localStorage if API fails
        const savedSettings = localStorage.getItem('logoSettings');
        if (savedSettings) {
          try {
            setLogoSettings(JSON.parse(savedSettings));
          } catch (e) {
            console.error('Error parsing localStorage settings:', e);
          }
        }
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const entry = getCached<LogoSettings>(CACHE_KEY);
    if (entry) {
      setLogoSettings(entry.data);
      setLoading(false);
      if (Date.now() - entry.timestamp > TTL) {
        fetchSettings(true); // stale — refresh quietly in the background
      }
    } else {
      fetchSettings(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveLogoSettings = async (settings: Partial<LogoSettings>) => {
    const newSettings = { ...logoSettings, ...settings };
    setLogoSettings(newSettings);
    setCached(CACHE_KEY, newSettings);
    localStorage.setItem('logoSettings', JSON.stringify(newSettings));

    try {
      await settingsAPI.updateSettings('logoSettings', newSettings);
    } catch (error) {
      console.error('Error saving logo settings to API:', error);
    }
  };

  const getLogoDisplay = () => {
    if (logoSettings.logoUrl && logoSettings.showText) {
      return {
        type: 'both' as const,
        logoUrl: logoSettings.logoUrl,
        text: logoSettings.logoText
      };
    } else if (logoSettings.logoUrl) {
      return {
        type: 'image' as const,
        logoUrl: logoSettings.logoUrl
      };
    } else {
      return {
        type: 'text' as const,
        text: logoSettings.logoText
      };
    }
  };

  const resetToDefault = async () => {
    setLogoSettings(defaultLogoSettings);
    setCached(CACHE_KEY, defaultLogoSettings);
    localStorage.setItem('logoSettings', JSON.stringify(defaultLogoSettings));
    try {
      // In a real app we might have a specific reset category, 
      // but here we just update with defaults
      await settingsAPI.updateSettings('logoSettings', defaultLogoSettings);
    } catch (error) {
      console.error('Error resetting logo settings:', error);
    }
  };

  return {
    logoSettings,
    loading,
    saveLogoSettings,
    getLogoDisplay,
    resetToDefault,
    refresh: fetchSettings
  };
};
