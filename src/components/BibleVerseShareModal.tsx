import React, { useState } from 'react';
import { X, Copy, Mail, MessageCircle, Send, Share2 } from 'lucide-react';

interface BibleVerseShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  verse: {
    id: number;
    verse: string;
    reference: string;
    translation: string;
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

  if (!isOpen) return null;

  const handleShare = (platform: string, url?: string) => {
    if (url) {
      window.open(url, '_blank', 'width=600,height=400');
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
      color: 'bg-blue-600 hover:bg-blue-700',
      url: shareData?.platformUrls?.facebook,
      platform: 'facebook'
    },
    {
      name: 'Twitter',
      icon: '🐦',
      color: 'bg-sky-500 hover:bg-sky-600',
      url: shareData?.platformUrls?.twitter,
      platform: 'twitter'
    },
    {
      name: 'LinkedIn',
      icon: '💼',
      color: 'bg-blue-700 hover:bg-blue-800',
      url: shareData?.platformUrls?.linkedin,
      platform: 'linkedin'
    },
    {
      name: 'WhatsApp',
      icon: '💬',
      color: 'bg-green-500 hover:bg-green-600',
      url: shareData?.platformUrls?.whatsapp,
      platform: 'whatsapp'
    },
    {
      name: 'Telegram',
      icon: '✈️',
      color: 'bg-blue-500 hover:bg-blue-600',
      url: shareData?.platformUrls?.telegram,
      platform: 'telegram'
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-serif text-gray-900 flex items-center">
            <Share2 className="w-5 h-5 mr-2 text-amber-600" />
            Share Bible Verse
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Verse Content */}
        <div className="p-6 border-b border-gray-200">
          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
            <blockquote className="text-gray-700 text-lg leading-relaxed mb-3 italic">
              "{verse.verse}"
            </blockquote>
            <p className="text-sm text-amber-700 font-medium">
              {verse.reference} ({verse.translation})
            </p>
          </div>
        </div>

        {/* Share Options */}
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Share on Social Media</h3>
          
          {/* Social Media Buttons */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {shareButtons.map((button) => (
              <button
                key={button.name}
                onClick={() => handleShare(button.platform, button.url)}
                className={`${button.color} text-white p-3 rounded-lg flex items-center justify-center space-x-2 transition-all duration-200 hover:scale-105 transform`}
              >
                <span className="text-lg">{button.icon}</span>
                <span className="font-medium">{button.name}</span>
              </button>
            ))}
          </div>

          {/* Copy Link */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">Copy Link</h3>
            <div className="flex space-x-2">
              <input
                type="text"
                value={shareData?.shareUrl || ''}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50"
              />
              <button
                onClick={() => copyToClipboard(shareData?.shareUrl || '')}
                className={`px-4 py-2 rounded-md flex items-center space-x-2 transition-all duration-200 ${
                  copied 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-900 text-white hover:bg-gray-800'
                }`}
              >
                {copied ? (
                  <>
                    <span className="text-sm">✓</span>
                    <span className="text-sm">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span className="text-sm">Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Email Share */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Share via Email</h3>
            <div className="flex space-x-2">
              <input
                type="text"
                value={shareData?.shareText || ''}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50"
              />
              <button
                onClick={() => copyToClipboard(shareData?.shareText || '', 'email')}
                className={`px-4 py-2 rounded-md flex items-center space-x-2 transition-all duration-200 ${
                  emailCopied 
                    ? 'bg-green-600 text-white' 
                    : 'bg-amber-600 text-white hover:bg-amber-700'
                }`}
              >
                {emailCopied ? (
                  <>
                    <span className="text-sm">✓</span>
                    <span className="text-sm">Copied!</span>
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4" />
                    <span className="text-sm">Copy Text</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Email Action */}
          {shareData?.platformUrls?.email && (
            <div className="mt-4">
              <button
                onClick={() => window.open(shareData.platformUrls.email, '_self')}
                className="w-full bg-amber-600 text-white py-3 px-4 rounded-lg flex items-center justify-center space-x-2 hover:bg-amber-700 transition-colors duration-200"
              >
                <Send className="w-4 h-4" />
                <span>Open Email Client</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 rounded-b-lg">
          <p className="text-xs text-gray-500 text-center">
            Share this inspiring verse to spread God's word
          </p>
        </div>
      </div>
    </div>
  );
};

export default BibleVerseShareModal;
