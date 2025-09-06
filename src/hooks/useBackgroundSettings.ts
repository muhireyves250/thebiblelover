import { useState, useEffect } from 'react';

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

  useEffect(() => {
    // Load settings from localStorage on mount
    const savedSettings = localStorage.getItem('backgroundSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setBackgroundSettings({ ...defaultBackgroundSettings, ...parsed });
      } catch (error) {
        console.error('Error loading background settings:', error);
      }
    }
  }, []);

  const saveBackgroundSettings = (settings: Partial<BackgroundSettings>) => {
    const newSettings = { ...backgroundSettings, ...settings };
    setBackgroundSettings(newSettings);
    localStorage.setItem('backgroundSettings', JSON.stringify(newSettings));
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

  const resetToDefault = () => {
    setBackgroundSettings(defaultBackgroundSettings);
    localStorage.setItem('backgroundSettings', JSON.stringify(defaultBackgroundSettings));
  };

  return {
    backgroundSettings,
    saveBackgroundSettings,
    getBackgroundStyle,
    getOverlayStyle,
    resetToDefault
  };
};
