import React, { useEffect, useState } from 'react';
import { X, Copy, Check, Facebook, Twitter, Linkedin, Mail, Share2 } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: {
    title: string;
    slug: string;
    excerpt?: string;
  };
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, post }) => {
  const [copied, setCopied] = useState(false);
  
  const currentUrl = window.location.origin;
  const postUrl = `${currentUrl}/blog/${post.slug}`;
  const shareText = `${post.title} - The Bible Lover`;
  const shareDescription = post.excerpt || 'Check out this blog post from The Bible Lover';

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(postUrl)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`,
    email: `mailto:?subject=${encodeURIComponent(shareText)}&body=${encodeURIComponent(`${shareDescription}\n\nRead more: ${postUrl}`)}`
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(postUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const handleShare = (platform: string) => {
    const url = shareLinks[platform as keyof typeof shareLinks];
    if (url) {
      window.open(url, '_blank', 'width=600,height=400');
    }
  };

  // Lock body scroll while the sheet/modal is open.
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
      <div
        className="absolute inset-0"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-t-2xl sm:rounded-lg max-w-md w-full max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom sm:zoom-in-95 duration-300 pb-[env(safe-area-inset-bottom)]">
        <div className="flex justify-between items-center px-4 py-3 sm:p-6 border-b border-gray-200">
          <h2 className="text-base sm:text-xl font-semibold text-gray-900">Share This Post</h2>
          <button
            onClick={onClose}
            className="p-1.5 -mr-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>

        <div className="p-4 sm:p-6">
          {/* Post Info */}
          <div className="mb-4 sm:mb-6">
            <h3 className="text-sm sm:text-lg font-medium text-gray-900 mb-1 sm:mb-2 line-clamp-2">{post.title}</h3>
            <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">{shareDescription}</p>
          </div>

          {/* Share Options */}
          <div className="space-y-2.5 sm:space-y-4">
            <h4 className="text-xs sm:text-sm font-medium text-gray-700">Share on Social Media</h4>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <button
                onClick={() => handleShare('facebook')}
                className="flex items-center space-x-2 sm:space-x-3 p-2.5 sm:p-3 border border-gray-200 rounded-lg active:bg-gray-100 sm:hover:bg-gray-50 transition-colors"
              >
                <Facebook className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 shrink-0" />
                <span className="text-xs sm:text-sm font-medium text-gray-900">Facebook</span>
              </button>

              <button
                onClick={() => handleShare('twitter')}
                className="flex items-center space-x-2 sm:space-x-3 p-2.5 sm:p-3 border border-gray-200 rounded-lg active:bg-gray-100 sm:hover:bg-gray-50 transition-colors"
              >
                <Twitter className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400 shrink-0" />
                <span className="text-xs sm:text-sm font-medium text-gray-900">Twitter</span>
              </button>

              <button
                onClick={() => handleShare('linkedin')}
                className="flex items-center space-x-2 sm:space-x-3 p-2.5 sm:p-3 border border-gray-200 rounded-lg active:bg-gray-100 sm:hover:bg-gray-50 transition-colors"
              >
                <Linkedin className="h-4 w-4 sm:h-5 sm:w-5 text-blue-700 shrink-0" />
                <span className="text-xs sm:text-sm font-medium text-gray-900">LinkedIn</span>
              </button>

              <button
                onClick={() => handleShare('email')}
                className="flex items-center space-x-2 sm:space-x-3 p-2.5 sm:p-3 border border-gray-200 rounded-lg active:bg-gray-100 sm:hover:bg-gray-50 transition-colors"
              >
                <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 shrink-0" />
                <span className="text-xs sm:text-sm font-medium text-gray-900">Email</span>
              </button>
            </div>
          </div>

          {/* Copy Link */}
          <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
            <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">Copy Link</h4>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                type="text"
                value={postUrl}
                readOnly
                className="min-w-0 flex-1 px-3 py-2 border border-gray-300 rounded-md text-xs sm:text-sm bg-gray-50 truncate"
              />
              <button
                onClick={copyToClipboard}
                className={`flex items-center justify-center space-x-2 px-4 py-2.5 sm:py-2 rounded-md transition-colors shrink-0 ${
                  copied
                    ? 'bg-green-100 text-green-700 border border-green-300'
                    : 'bg-gray-100 text-gray-700 active:bg-gray-200 sm:hover:bg-gray-200'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4" />
                    <span className="text-sm">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    <span className="text-sm">Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end mt-5 sm:mt-6">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 sm:py-2 text-gray-700 bg-gray-100 rounded-md active:bg-gray-200 sm:hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
