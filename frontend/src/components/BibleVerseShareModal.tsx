import React, { useState } from 'react';
import { X, Copy, Send, Share2, Download, Share } from 'lucide-react';
import { optimizeCloudinaryUrl } from '../utils/media';

interface BibleVerseShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  verse: {
    id: string; // Changed from number to string to match backend cuid
    verse: string;
    reference: string;
    translation: string;
    image?: string;
  };
  shareData?: {
    shareUrl: string;
    shareText: string;
    shareDescription: string;
    platformUrls: {
      facebook: string;
      twitter: string;
      linkedin: string;
      whatsapp: string;
      telegram: string;
      email: string;
    };
  };
}

const BibleVerseShareModal: React.FC<BibleVerseShareModalProps> = ({
  isOpen,
  onClose,
  verse,
  shareData
}) => {
  const [copied, setCopied] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  if (!isOpen) return null;

  const handleShare = (_platform: string, url?: string) => {
    if (url) {
      window.open(url, '_blank', 'width=600,height=400');
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: `Bible Verse: ${verse.reference}`,
          text: `${verse.verse}\n\n- ${verse.reference} (${verse.translation})`,
          url: shareData?.shareUrl || window.location.href,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    }
  };

  const handleDownload = async () => {
    if (!verse.image) return;

    setIsDownloading(true);
    try {
      // Use the original image for download (high quality)
      const downloadUrl = verse.image;
      const response = await fetch(downloadUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `bible-verse-${verse.reference.replace(/[:\s]/g, '-')}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const copyToClipboard = async (text: string, type: 'url' | 'email' = 'url') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'url') {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        setEmailCopied(true);
        setTimeout(() => setEmailCopied(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const shareButtons = [
    {
      name: 'Facebook',
      icon: '📘',
      color: 'bg-[#1877F2] hover:bg-[#0d65d9]',
      url: shareData?.platformUrls?.facebook,
      platform: 'facebook'
    },
    {
      name: 'Twitter',
      icon: '🐦',
      color: 'bg-[#1DA1F2] hover:bg-[#0c85d0]',
      url: shareData?.platformUrls?.twitter,
      platform: 'twitter'
    },
    {
      name: 'WhatsApp',
      icon: '💬',
      color: 'bg-[#25D366] hover:bg-[#128C7E]',
      url: shareData?.platformUrls?.whatsapp,
      platform: 'whatsapp'
    },
    {
      name: 'Telegram',
      icon: '✈️',
      color: 'bg-[#0088cc] hover:bg-[#0077b5]',
      url: shareData?.platformUrls?.telegram,
      platform: 'telegram'
    }
  ];

  const optimizedPreviewImage = verse.image ? optimizeCloudinaryUrl(verse.image, { width: 800 }) : null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-amber-100">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-amber-50 bg-amber-50/30">
          <div>
            <h2 className="text-2xl font-serif text-gray-900 flex items-center">
              <Share2 className="w-6 h-6 mr-3 text-amber-600" />
              Spread the Word
            </h2>
            <p className="text-xs text-amber-700/70 mt-1 font-medium tracking-wide">Share this blessing with others</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/80 text-gray-400 hover:text-gray-600 transition-all shadow-sm"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Verse Card Preview */}
        <div className="p-8">
          <div className="relative group rounded-xl overflow-hidden shadow-lg border border-amber-200 aspect-[4/3] bg-amber-50">
            {optimizedPreviewImage ? (
              <>
                <img
                  src={optimizedPreviewImage}
                  alt="Bible Verse"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8 text-white">
                  <blockquote className="text-xl md:text-2xl font-serif mb-4 leading-relaxed line-clamp-4">
                    "{verse.verse}"
                  </blockquote>
                  <p className="text-sm font-medium tracking-widest uppercase text-amber-300">
                    {verse.reference} • {verse.translation}
                  </p>
                </div>
                {/* Download Overlay Button */}
                <button
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="absolute top-4 right-4 p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50"
                  title="Download Image"
                >
                  <Download className={`w-5 h-5 ${isDownloading ? 'animate-bounce' : ''}`} />
                </button>
              </>
            ) : (
              <div className="w-full h-full flex flex-col justify-center p-8 text-center bg-white border-2 border-dashed border-amber-200 rounded-xl">
                <blockquote className="text-xl font-serif text-gray-800 mb-4 italic">
                  "{verse.verse}"
                </blockquote>
                <p className="text-sm font-medium text-amber-700">
                  {verse.reference} ({verse.translation})
                </p>
              </div>
            )}
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4">
            {verse.image && (
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="flex items-center justify-center space-x-2 bg-white border-2 border-amber-600 text-amber-600 py-3 rounded-xl font-semibold hover:bg-amber-50 transition-colors disabled:opacity-50"
              >
                <Download className="w-5 h-5" />
                <span>{isDownloading ? 'Saving...' : 'Save as Image'}</span>
              </button>
            )}

            {typeof navigator.share === 'function' && (
              <button
                onClick={handleNativeShare}
                className={`flex items-center justify-center space-x-2 bg-amber-600 text-white py-3 rounded-xl font-semibold hover:bg-amber-700 transition-colors shadow-md ${!verse.image ? 'col-span-2' : ''}`}
              >
                <Share className="w-5 h-5" />
                <span>Share Now</span>
              </button>
            )}
          </div>
        </div>

        {/* Share Options */}
        <div className="px-8 pb-8 space-y-8">
          <div>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">Share to Social</h3>
            <div className="grid grid-cols-4 gap-4">
              {shareButtons.map((button) => (
                <button
                  key={button.name}
                  onClick={() => handleShare(button.platform, button.url)}
                  className={`${button.color} text-white aspect-square rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg`}
                  title={`Share on ${button.name}`}
                >
                  <span className="text-2xl">{button.icon}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-[0.2em]">Quick Copy</h3>
            <div className="flex flex-col space-y-3">
              {/* Copy Link */}
              <div className="group relative flex items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 hover:border-amber-300 transition-colors">
                <input
                  type="text"
                  value={shareData?.shareUrl || ''}
                  readOnly
                  className="flex-1 bg-transparent text-sm text-gray-600 outline-none"
                  placeholder="Sharing link..."
                />
                <button
                  onClick={() => copyToClipboard(shareData?.shareUrl || '')}
                  className={`ml-2 p-2 rounded-lg transition-all ${copied
                    ? 'bg-green-100 text-green-600'
                    : 'text-gray-400 hover:text-amber-600'
                    }`}
                  title="Copy Link"
                >
                  {copied ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>

              {/* Copy Full Text */}
              <div className="group relative flex items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 hover:border-amber-300 transition-colors">
                <input
                  type="text"
                  value={shareData?.shareText || ''}
                  readOnly
                  className="flex-1 bg-transparent text-sm text-gray-600 outline-none truncate"
                  placeholder="Verse text..."
                />
                <button
                  onClick={() => copyToClipboard(shareData?.shareText || '', 'email')}
                  className={`ml-2 p-2 rounded-lg transition-all ${emailCopied
                    ? 'bg-green-100 text-green-600'
                    : 'text-gray-400 hover:text-amber-600'
                    }`}
                  title="Copy Full Text"
                >
                  {emailCopied ? <CheckCircle className="w-5 h-5" /> : <Send className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 bg-amber-50/50 border-t border-amber-50">
          <p className="text-sm text-amber-800/60 text-center italic font-serif">
            "Go into all the world and preach the gospel to all creation."
          </p>
        </div>
      </div>
    </div>
  );
};

// Simple CheckCircle fallback for lucide icons if not imported
const CheckCircle = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export default BibleVerseShareModal;
