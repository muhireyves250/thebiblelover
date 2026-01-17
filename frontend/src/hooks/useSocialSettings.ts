import { useState, useEffect } from 'react';

interface SocialSettings {
  facebook: string;
  twitter: string;
  instagram: string;
  linkedin: string;
  youtube: string;
  tiktok: string;
}

const defaultSocialSettings: SocialSettings = {
  facebook: '',
  twitter: '',
  instagram: '',
  linkedin: '',
  youtube: '',
  tiktok: ''
};

export const useSocialSettings = () => {
  const [socialSettings, setSocialSettings] = useState<SocialSettings>(defaultSocialSettings);

  useEffect(() => {
    // Load settings from localStorage on mount
    const savedSettings = localStorage.getItem('socialSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSocialSettings({ ...defaultSocialSettings, ...parsed });
      } catch (error) {
        console.error('Error loading social settings:', error);
      }
    }
  }, []);

  const saveSocialSettings = (settings: Partial<SocialSettings>) => {
    const newSettings = { ...socialSettings, ...settings };
    setSocialSettings(newSettings);
    localStorage.setItem('socialSettings', JSON.stringify(newSettings));
  };

  const getSocialLinks = () => {
    return {
      facebook: socialSettings.facebook || '#',
      twitter: socialSettings.twitter || '#',
      instagram: socialSettings.instagram || '#',
      linkedin: socialSettings.linkedin || '#',
      youtube: socialSettings.youtube || '#',
      tiktok: socialSettings.tiktok || '#'
    };
  };

  const resetToDefault = () => {
    setSocialSettings(defaultSocialSettings);
    localStorage.setItem('socialSettings', JSON.stringify(defaultSocialSettings));
  };

  return {
    socialSettings,
    saveSocialSettings,
    getSocialLinks,
    resetToDefault
  };
};
