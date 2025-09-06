import { useState, useEffect } from 'react';

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

  useEffect(() => {
    // Load settings from localStorage on mount
    const savedSettings = localStorage.getItem('logoSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setLogoSettings({ ...defaultLogoSettings, ...parsed });
      } catch (error) {
        console.error('Error loading logo settings:', error);
      }
    }
  }, []);

  const saveLogoSettings = (settings: Partial<LogoSettings>) => {
    const newSettings = { ...logoSettings, ...settings };
    setLogoSettings(newSettings);
    localStorage.setItem('logoSettings', JSON.stringify(newSettings));
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

  const resetToDefault = () => {
    setLogoSettings(defaultLogoSettings);
    localStorage.setItem('logoSettings', JSON.stringify(defaultLogoSettings));
  };

  return {
    logoSettings,
    saveLogoSettings,
    getLogoDisplay,
    resetToDefault
  };
};
