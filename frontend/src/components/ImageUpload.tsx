import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { uploadAPI } from '../services/api';

interface ImageUploadProps {
  value?: string;
  onChange: (imageUrl: string) => void;
  onError?: (error: string) => void;
  className?: string;
  disabled?: boolean;
  isBibleVerseImage?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  onError,
  className = '',
  disabled = false,
  isBibleVerseImage = false
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      const errorMsg = 'Please select an image file';
      setError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      const errorMsg = 'File size must be less than 5MB';
      setError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const data = await uploadAPI.uploadImage(file, isBibleVerseImage);

      if (data.success) {
        onChange(data.data.fullUrl);
        setError(null);
      } else {
        throw new Error(data.message || 'Upload failed');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMsg);
      onError?.(errorMsg);
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleRemoveImage = () => {
    onChange('');
    setError(null);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        Image Upload
      </label>
      
      {value ? (
        <div className="relative">
          <img
            src={`${value}?t=${Date.now()}`}
            alt="Uploaded image"
            className="w-full h-32 object-cover rounded-md border"
            crossOrigin="anonymous"
            onError={(e) => {
              console.error('Image load error:', e);
              setError('Failed to load image. Please check if the server is running and CORS is configured properly.');
            }}
          />
          <button
            type="button"
            onClick={handleRemoveImage}
            disabled={disabled}
            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          className={`relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            dragActive
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={disabled ? undefined : openFileDialog}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={disabled}
          />
          
          {uploading ? (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
              <p className="text-sm text-gray-600">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-600">
                <span className="text-blue-600 font-medium">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PNG, JPG, GIF up to 5MB
              </p>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="flex items-center space-x-2 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
