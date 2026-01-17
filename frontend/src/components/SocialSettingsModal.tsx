import React, { useState, useEffect } from 'react';
import { X, RotateCcw, ExternalLink, Facebook, Twitter, Instagram, Linkedin, Youtube } from 'lucide-react';

interface SocialSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: any) => void;
}

const SocialSettingsModal: React.FC<SocialSettingsModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave
}) => {
  const [settings, setSettings] = useState({
    facebook: '',
    twitter: '',
    instagram: '',
    linkedin: '',
    youtube: '',
    tiktok: ''
  });

  useEffect(() => {
    if (isOpen) {
      // Load current settings from localStorage
      const savedSettings = localStorage.getItem('socialSettings');
      if (savedSettings) {
        try {
          const parsed = JSON.parse(savedSettings);
          setSettings(prev => ({ ...prev, ...parsed }));
        } catch (error) {
          console.error('Error loading social settings:', error);
        }
      }
    }
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(settings);
    onClose();
  };

  const resetToDefault = () => {
    const defaultSettings = {
      facebook: '',
      twitter: '',
      instagram: '',
      linkedin: '',
      youtube: '',
      tiktok: ''
    };
    setSettings(defaultSettings);
  };

  const socialPlatforms = [
    {
      name: 'facebook',
      label: 'Facebook',
      icon: Facebook,
      placeholder: 'https://facebook.com/yourpage',
      color: 'text-blue-600'
    },
    {
      name: 'twitter',
      label: 'Twitter',
      icon: Twitter,
      placeholder: 'https://twitter.com/yourhandle',
      color: 'text-blue-400'
    },
    {
      name: 'instagram',
      label: 'Instagram',
      icon: Instagram,
      placeholder: 'https://instagram.com/yourhandle',
      color: 'text-pink-600'
    },
    {
      name: 'linkedin',
      label: 'LinkedIn',
      icon: Linkedin,
      placeholder: 'https://linkedin.com/in/yourprofile',
      color: 'text-blue-700'
    },
    {
      name: 'youtube',
      label: 'YouTube',
      icon: Youtube,
      placeholder: 'https://youtube.com/yourchannel',
      color: 'text-red-600'
    },
    {
      name: 'tiktok',
      label: 'TikTok',
      icon: () => (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
        </svg>
      ),
      placeholder: 'https://tiktok.com/@yourhandle',
      color: 'text-black'
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Social Media Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="mb-6">
              <p className="text-sm text-gray-600">
                Add your social media links below. These will be connected to the social media icons on your website.
                Leave fields empty to hide the corresponding icons.
              </p>
            </div>

            <div className="space-y-4">
              {socialPlatforms.map((platform) => {
                const IconComponent = platform.icon;
                return (
                  <div key={platform.name} className="flex items-center space-x-4">
                    <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center">
                      <IconComponent className={`w-5 h-5 ${platform.color}`} />
                    </div>
                    <div className="flex-1">
                      <label htmlFor={platform.name} className="block text-sm font-medium text-gray-700 mb-1">
                        {platform.label}
                      </label>
                      <div className="relative">
                        <input
                          type="url"
                          id={platform.name}
                          name={platform.name}
                          value={settings[platform.name as keyof typeof settings]}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-amber-500 focus:border-transparent"
                          placeholder={platform.placeholder}
                        />
                        {settings[platform.name as keyof typeof settings] && (
                          <a
                            href={settings[platform.name as keyof typeof settings]}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Preview Section */}
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Preview</h3>
              <div className="flex items-center space-x-4">
                {socialPlatforms.map((platform) => {
                  const IconComponent = platform.icon;
                  const hasLink = settings[platform.name as keyof typeof settings];
                  
                  if (!hasLink) return null;
                  
                  return (
                    <a
                      key={platform.name}
                      href={hasLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`p-2 rounded focus:outline-none focus:ring-2 focus:ring-amber-600 ${platform.color} hover:opacity-80 transition-opacity`}
                      title={platform.label}
                    >
                      <IconComponent className="h-5 w-5" />
                    </a>
                  );
                })}
                {Object.values(settings).every(value => !value) && (
                  <p className="text-sm text-gray-500">No social links added yet</p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={resetToDefault}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Reset to Default</span>
              </button>
              
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-700 text-white rounded-md hover:bg-amber-800 transition-colors"
                >
                  Save Settings
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SocialSettingsModal;
