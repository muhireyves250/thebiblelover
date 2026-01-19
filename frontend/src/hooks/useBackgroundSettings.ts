import { useState, useEffect } from 'react';
import { settingsAPI } from '../services/api';

interface BackgroundSettings {
  imageUrl: string;
  opacity: number;
  overlayColor: string;
  overlayOpacity: number;
}

const defaultBackgroundSettings: BackgroundSettings = {
  imageUrl: 'https://images.pexels.com/photos/1370295/pexels-photo-1370295.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
  opacity: 0.4,
  overlayColor: '#000000',
  overlayOpacity: 0.3
};

export const useBackgroundSettings = () => {
  const [backgroundSettings, setBackgroundSettings] = useState<BackgroundSettings>(defaultBackgroundSettings);
  const [loading, setLoading] = useState(true);

  const fetchBackgroundSettings = async () => {
    try {
      setLoading(true);
      const response = await settingsAPI.getSettingCategory('backgroundSettings');
      if (response.success && response.data.settings) {
        const merged = { ...defaultBackgroundSettings, ...response.data.settings };
        setBackgroundSettings(merged);
        localStorage.setItem('backgroundSettings', JSON.stringify(merged));
      } else {
        // Fallback to localStorage if API fails but returns success: false
        const savedSettings = localStorage.getItem('backgroundSettings');
        if (savedSettings) {
          setBackgroundSettings({ ...defaultBackgroundSettings, ...JSON.parse(savedSettings) });
        }
      }
    } catch (error) {
      console.error('Error loading background settings from API:', error);
      // Final fallback to localStorage
      const savedSettings = localStorage.getItem('backgroundSettings');
      if (savedSettings) {
        setBackgroundSettings({ ...defaultBackgroundSettings, ...JSON.parse(savedSettings) });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBackgroundSettings();
  }, []);

  const saveBackgroundSettings = async (settings: Partial<BackgroundSettings>) => {
    const newSettings = { ...backgroundSettings, ...settings };
    setBackgroundSettings(newSettings);
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
