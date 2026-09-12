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

  const socialButtons = [
    { key: 'facebook', label: 'Facebook', Icon: Facebook, bg: 'bg-[#1877F2]' },
    { key: 'twitter', label: 'Twitter', Icon: Twitter, bg: 'bg-[#1DA1F2]' },
    { key: 'linkedin', label: 'LinkedIn', Icon: Linkedin, bg: 'bg-[#0A66C2]' },
    { key: 'email', label: 'Email', Icon: Mail, bg: 'bg-gray-500' },
  ] as const;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative bg-white rounded-t-3xl sm:rounded-2xl max-w-md w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-gray-200 animate-in slide-in-from-bottom sm:zoom-in-95 duration-300 pb-[env(safe-area-inset-bottom)]">
        {/* Drag handle - mobile only */}
        <div className="sm:hidden flex justify-center pt-2.5 pb-1">
          <span className="w-10 h-1 rounded-full bg-gray-300" />
        </div>

        <div className="flex justify-between items-start gap-3 px-5 pt-2 pb-4 sm:p-6 sm:pb-4">
          <div className="min-w-0">
            <span className="flex items-center gap-1.5 text-[10px] sm:text-xs font-black uppercase tracking-widest text-amber-700 mb-1">
              <Share2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Share This Post
            </span>
            <h3 className="text-sm sm:text-lg font-bold text-gray-900 leading-snug line-clamp-2">{post.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="hidden sm:flex shrink-0 p-1.5 -mr-1.5 -mt-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-5 pb-5 sm:px-6 sm:pb-6">
          {/* Share Options */}
          <div className="grid grid-cols-4 gap-2 sm:gap-3">
            {socialButtons.map(({ key, label, Icon, bg }) => (
              <button
                key={key}
                onClick={() => handleShare(key)}
                className="flex flex-col items-center gap-1.5 group"
              >
                <span className={`flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full ${bg} shadow-sm transition-transform group-active:scale-90 sm:group-hover:scale-105`}>
                  <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </span>
                <span className="text-[10px] sm:text-xs font-semibold text-gray-700">{label}</span>
              </button>
            ))}
          </div>

          {/* Copy Link */}
          <div className="mt-5 sm:mt-6">
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full pl-4 pr-1.5 py-1.5">
              <span className="min-w-0 flex-1 text-xs sm:text-sm text-gray-500 truncate">{postUrl}</span>
              <button
                onClick={copyToClipboard}
                className={`flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-full text-xs sm:text-sm font-bold transition-colors shrink-0 ${
                  copied
                    ? 'bg-green-100 text-green-700'
                    : 'bg-amber-700 text-white active:bg-amber-800 sm:hover:bg-amber-800'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" /> Copy
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
