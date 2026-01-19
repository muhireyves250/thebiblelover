import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Trash2, RotateCcw, Eye, EyeOff } from 'lucide-react';

interface BackgroundSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: any) => void;
  currentBackground?: string;
}

const BackgroundSettingsModal: React.FC<BackgroundSettingsModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentBackground
}) => {
  const [settings, setSettings] = useState({
    imageUrl: '',
    opacity: 0.4,
    overlayColor: '#000000',
    overlayOpacity: 0.3
  });

  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Load current settings from localStorage
      const savedSettings = localStorage.getItem('backgroundSettings');
      if (savedSettings) {
        try {
          const parsed = JSON.parse(savedSettings);
          setSettings(prev => ({ ...prev, ...parsed }));
        } catch (error) {
          console.error('Error loading background settings:', error);
        }
      } else if (currentBackground) {
        setSettings(prev => ({ ...prev, imageUrl: currentBackground }));
      }
    }
  }, [isOpen, currentBackground]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'range' ? parseFloat(value) : value
    }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setUploadedImageUrl(result);
        setSettings(prev => ({ ...prev, imageUrl: result }));
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
    setSettings(prev => ({
      ...prev,
      imageUrl: 'https://images.pexels.com/photos/1370295/pexels-photo-1370295.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(settings);
      onClose();
    } catch (error) {
      console.error('Error saving background settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const resetToDefault = () => {
    const defaultSettings = {
      imageUrl: 'https://images.pexels.com/photos/1370295/pexels-photo-1370295.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      opacity: 0.4,
      overlayColor: '#000000',
      overlayOpacity: 0.3
    };
    setSettings(defaultSettings);
    setUploadedImageUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getPreviewStyle = () => {
    return {
      backgroundImage: `url(${settings.imageUrl})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      opacity: settings.opacity
    };
  };

  const getPreviewOverlayStyle = () => {
    return {
      backgroundColor: settings.overlayColor,
      opacity: settings.overlayOpacity
    };
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Background Settings</h2>
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
                {/* Image URL */}
                <div>
                  <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-2">
                    Background Image URL
                  </label>
                  <input
                    type="url"
                    id="imageUrl"
                    name="imageUrl"
                    value={settings.imageUrl}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-amber-500 focus:border-transparent"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                {/* File Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Or Upload Image
                  </label>
                  <div className="flex items-center space-x-4">
                    <button
                      type="button"
                      onClick={handleUploadClick}
                      disabled={isUploading || isSaving}
                      className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:ring-1 focus:ring-amber-500 focus:border-transparent disabled:opacity-50"
                    >
                      <Upload className="h-4 w-4" />
                      <span>{isUploading ? 'Uploading...' : 'Upload Image'}</span>
                    </button>
                    {uploadedImageUrl && (
                      <button
                        type="button"
                        onClick={removeUploadedImage}
                        disabled={isSaving}
                        className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:text-red-800 disabled:opacity-50"
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
                </div>

                {/* Image Opacity */}
                <div>
                  <label htmlFor="opacity" className="block text-sm font-medium text-gray-700 mb-2">
                    Image Opacity: {Math.round(settings.opacity * 100)}%
                  </label>
                  <input
                    type="range"
                    id="opacity"
                    name="opacity"
                    min="0"
                    max="1"
                    step="0.1"
                    value={settings.opacity}
                    onChange={handleChange}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Overlay Color */}
                <div>
                  <label htmlFor="overlayColor" className="block text-sm font-medium text-gray-700 mb-2">
                    Overlay Color
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      id="overlayColor"
                      name="overlayColor"
                      value={settings.overlayColor}
                      onChange={handleChange}
                      className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={settings.overlayColor}
                      onChange={handleChange}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Overlay Opacity */}
                <div>
                  <label htmlFor="overlayOpacity" className="block text-sm font-medium text-gray-700 mb-2">
                    Overlay Opacity: {Math.round(settings.overlayOpacity * 100)}%
                  </label>
                  <input
                    type="range"
                    id="overlayOpacity"
                    name="overlayOpacity"
                    min="0"
                    max="1"
                    step="0.1"
                    value={settings.overlayOpacity}
                    onChange={handleChange}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={resetToDefault}
                    disabled={isSaving}
                    className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span>Reset to Default</span>
                  </button>

                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={onClose}
                      disabled={isSaving}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="px-4 py-2 bg-amber-700 text-white rounded-md hover:bg-amber-800 transition-colors disabled:opacity-50 flex items-center space-x-2"
                    >
                      {isSaving && (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      )}
                      <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
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
                <div className="relative h-64 rounded-lg overflow-hidden border border-gray-200">
                  <div
                    className="absolute inset-0"
                    style={getPreviewStyle()}
                  />
                  <div
                    className="absolute inset-0"
                    style={getPreviewOverlayStyle()}
                  />
                  <div className="relative z-10 flex items-center justify-center h-full">
                    <div className="bg-white bg-opacity-90 px-6 py-4 rounded-lg">
                      <h4 className="text-lg font-serif text-gray-900">Sample Title</h4>
                      <p className="text-gray-600">This is how your background will look</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Current Image Preview */}
              {settings.imageUrl && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Current Image</h4>
                  <img
                    src={settings.imageUrl}
                    alt="Background preview"
                    className="w-full h-32 object-cover rounded-lg border border-gray-200"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackgroundSettingsModal;
