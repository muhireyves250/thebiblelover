import React, { useState, useRef } from 'react';
import { Upload, X, Mic, Square, AlertCircle } from 'lucide-react';
import { uploadAPI } from '../services/api';

interface AudioUploadProps {
  value?: string;
  onChange: (audioUrl: string) => void;
  onError?: (error: string) => void;
  className?: string;
  disabled?: boolean;
}

const AudioUpload: React.FC<AudioUploadProps> = ({
  value,
  onChange,
  onError,
  className = '',
  disabled = false
}) => {
  const [mode, setMode] = useState<'upload' | 'record'>('upload');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const doUpload = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const data = await uploadAPI.uploadAudio(file);
      if (data.success && data.data) {
        onChange(data.data.fullUrl);
      } else {
        throw new Error(data.message || 'Upload failed');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Upload failed';
      setError(msg);
      onError?.(msg);
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('audio/')) {
      const msg = 'Please select an audio file';
      setError(msg);
      onError?.(msg);
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      const msg = 'File size must be less than 50MB';
      setError(msg);
      onError?.(msg);
      return;
    }
    doUpload(file);
  };

  const startRecording = async () => {
    if (isStarting || isRecording) return;
    setIsStarting(true);
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const file = new File([blob], `recording-${Date.now()}.webm`, { type: 'audio/webm' });
        streamRef.current?.getTracks().forEach(track => track.stop());
        doUpload(file);
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
    } catch (err) {
      const msg = 'Microphone access was denied or is unavailable';
      setError(msg);
      onError?.(msg);
    } finally {
      setIsStarting(false);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const openFileDialog = () => fileInputRef.current?.click();

  const handleRemove = () => {
    onChange('');
    setError(null);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">Audio</label>

      <div className="flex gap-2 mb-2">
        <button
          type="button"
          onClick={() => setMode('upload')}
          disabled={disabled || isRecording || isStarting}
          className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wide border ${
            mode === 'upload' ? 'bg-amber-700 text-white border-amber-700' : 'bg-white text-gray-600 border-gray-300'
          }`}
        >
          Upload
        </button>
        <button
          type="button"
          onClick={() => setMode('record')}
          disabled={disabled || isRecording || isStarting}
          className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wide border ${
            mode === 'record' ? 'bg-amber-700 text-white border-amber-700' : 'bg-white text-gray-600 border-gray-300'
          }`}
        >
          Record
        </button>
      </div>

      {value && (
        <div className="flex items-center gap-3 mb-2">
          <audio controls src={value} className="flex-1 h-10" />
          <button
            type="button"
            onClick={handleRemove}
            disabled={disabled}
            className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {mode === 'upload' ? (
        <div
          className={`relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors border-gray-300 hover:border-gray-400 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={disabled ? undefined : openFileDialog}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={disabled}
          />
          {uploading ? (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-700 mb-2"></div>
              <p className="text-sm text-gray-600">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-600">
                <span className="text-amber-700 font-medium">Click to upload</span> an audio file
              </p>
              <p className="text-xs text-gray-500 mt-1">MP3, WAV, OGG, M4A up to 50MB</p>
            </div>
          )}
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          {uploading ? (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-700 mb-2"></div>
              <p className="text-sm text-gray-600">Uploading recording...</p>
            </div>
          ) : (
            <button
              type="button"
              onClick={isRecording ? stopRecording : startRecording}
              disabled={disabled || isStarting}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-sm font-bold ${
                isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-700 hover:bg-amber-800'
              }`}
            >
              {isRecording ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              {isStarting ? 'Starting...' : isRecording ? 'Stop Recording' : 'Start Recording'}
            </button>
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

export default AudioUpload;
