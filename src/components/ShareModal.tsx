import React, { useState } from 'react';
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Share This Post</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Post Info */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">{post.title}</h3>
            <p className="text-sm text-gray-600">{shareDescription}</p>
          </div>

          {/* Share Options */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-700">Share on Social Media</h4>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleShare('facebook')}
                className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Facebook className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-900">Facebook</span>
              </button>
              
              <button
                onClick={() => handleShare('twitter')}
                className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Twitter className="h-5 w-5 text-blue-400" />
                <span className="text-sm font-medium text-gray-900">Twitter</span>
              </button>
              
              <button
                onClick={() => handleShare('linkedin')}
                className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Linkedin className="h-5 w-5 text-blue-700" />
                <span className="text-sm font-medium text-gray-900">LinkedIn</span>
              </button>
              
              <button
                onClick={() => handleShare('email')}
                className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Mail className="h-5 w-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-900">Email</span>
              </button>
            </div>
          </div>

          {/* Copy Link */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Copy Link</h4>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={postUrl}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50"
              />
              <button
                onClick={copyToClipboard}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                  copied 
                    ? 'bg-green-100 text-green-700 border border-green-300' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
          <div className="flex justify-end mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
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
