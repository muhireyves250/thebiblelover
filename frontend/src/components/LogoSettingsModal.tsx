import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Trash2, RotateCcw, Eye, EyeOff, Image, Type } from 'lucide-react';

interface LogoSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: any) => void;
  currentLogo?: string;
}

const LogoSettingsModal: React.FC<LogoSettingsModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  currentLogo 
}) => {
  const [settings, setSettings] = useState({
    logoUrl: '',
    logoText: 'The Bible Lover',
    showText: true
  });

  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Load current settings from localStorage
      const savedSettings = localStorage.getItem('logoSettings');
      if (savedSettings) {
        try {
          const parsed = JSON.parse(savedSettings);
          setSettings(prev => ({ ...prev, ...parsed }));
        } catch (error) {
          console.error('Error loading logo settings:', error);
        }
      } else if (currentLogo) {
        setSettings(prev => ({ ...prev, logoUrl: currentLogo }));
      }
    }
  }, [isOpen, currentLogo]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('File size must be less than 2MB');
      return;
    }

    // Check if it's an image
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setUploadedImageUrl(result);
        setSettings(prev => ({ ...prev, logoUrl: result }));
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading file:', error);
      setIsUploading(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const removeUploadedImage = () => {
    setUploadedImageUrl(null);
    setSettings(prev => ({ ...prev, logoUrl: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(settings);
    onClose();
  };

  const resetToDefault = () => {
    const defaultSettings = {
      logoUrl: '',
      logoText: 'The Bible Lover',
      showText: true
    };
    setSettings(defaultSettings);
    setUploadedImageUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getPreviewLogo = () => {
    if (settings.logoUrl && settings.showText) {
      return (
        <div className="flex items-center space-x-3">
          {settings.logoUrl && (
            <img
              src={settings.logoUrl}
              alt="Logo preview"
              className="w-8 h-8 object-contain"
            />
          )}
          <span className="text-lg font-serif text-gray-900">{settings.logoText}</span>
        </div>
      );
    } else if (settings.logoUrl) {
      return (
        <img
          src={settings.logoUrl}
          alt="Logo preview"
          className="h-8 object-contain"
        />
      );
    } else {
      return (
        <span className="text-lg font-serif text-gray-900">{settings.logoText}</span>
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Logo Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Settings Panel */}
            <div className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Logo Text */}
                <div>
                  <label htmlFor="logoText" className="block text-sm font-medium text-gray-700 mb-2">
                    Logo Text
                  </label>
                  <input
                    type="text"
                    id="logoText"
                    name="logoText"
                    value={settings.logoText}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-amber-500 focus:border-transparent"
                    placeholder="Enter logo text"
                  />
                </div>

                {/* Show Text Checkbox */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="showText"
                    name="showText"
                    checked={settings.showText}
                    onChange={handleChange}
                    className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                  />
                  <label htmlFor="showText" className="ml-2 block text-sm text-gray-900">
                    Show text alongside logo image
                  </label>
                </div>

                {/* Logo Image URL */}
                <div>
                  <label htmlFor="logoUrl" className="block text-sm font-medium text-gray-700 mb-2">
                    Logo Image URL
                  </label>
                  <input
                    type="url"
                    id="logoUrl"
                    name="logoUrl"
                    value={settings.logoUrl}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-amber-500 focus:border-transparent"
                    placeholder="https://example.com/logo.png"
                  />
                </div>

                {/* File Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Or Upload Logo Image
                  </label>
                  <div className="flex items-center space-x-4">
                    <button
                      type="button"
                      onClick={handleUploadClick}
                      disabled={isUploading}
                      className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:ring-1 focus:ring-amber-500 focus:border-transparent disabled:opacity-50"
                    >
                      <Upload className="h-4 w-4" />
                      <span>{isUploading ? 'Uploading...' : 'Upload Logo'}</span>
                    </button>
                    {uploadedImageUrl && (
                      <button
                        type="button"
                        onClick={removeUploadedImage}
                        className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Remove</span>
                      </button>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Recommended: PNG or SVG format, max 2MB
                  </p>
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

            {/* Preview Panel */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Preview</h3>
                <button
                  type="button"
                  onClick={() => setPreviewMode(!previewMode)}
                  className="flex items-center space-x-2 px-3 py-1 text-sm text-gray-600 hover:text-gray-900"
                >
                  {previewMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  <span>{previewMode ? 'Hide' : 'Show'} Preview</span>
                </button>
              </div>
              
              {previewMode && (
                <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                  <div className="flex items-center justify-center h-20">
                    {getPreviewLogo()}
                  </div>
                </div>
              )}
              
              {/* Current Logo Preview */}
              {settings.logoUrl && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Current Logo</h4>
                  <div className="border border-gray-200 rounded-lg p-4 bg-white">
                    <img
                      src={settings.logoUrl}
                      alt="Logo preview"
                      className="max-h-16 object-contain mx-auto"
                    />
                  </div>
                </div>
              )}

              {/* Logo Type Icons */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700">Logo Display Options</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Image className="h-4 w-4" />
                    <span>Image only</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Type className="h-4 w-4" />
                    <span>Text only</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Image className="h-4 w-4" />
                    <Type className="h-4 w-4" />
                    <span>Image + Text</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoSettingsModal;
