import { useState, useEffect, useCallback } from 'react';
import { settingsAPI } from '../services/api';

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
  const [logoSettings, setLogoSettings] = useState<LogoSettings>(defaultLogoSettings);
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await settingsAPI.getSettingCategory('logoSettings');
      if (response.success && response.data?.settings) {
        const fetchedSettings = response.data.settings;
        setLogoSettings({ ...defaultLogoSettings, ...fetchedSettings });
        // Still keep as backup/cache
        localStorage.setItem('logoSettings', JSON.stringify(fetchedSettings));
      }
    } catch (error) {
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
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const saveLogoSettings = async (settings: Partial<LogoSettings>) => {
    const newSettings = { ...logoSettings, ...settings };
    setLogoSettings(newSettings);
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
