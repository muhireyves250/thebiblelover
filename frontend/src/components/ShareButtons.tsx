import React, { useState } from 'react';
import { Share2, Facebook, Twitter, Link as LinkIcon, Check, MessageSquare } from 'lucide-react';

interface ShareButtonsProps {
    title: string;
    url?: string;
}

const ShareButtons: React.FC<ShareButtonsProps> = ({ title, url = window.location.href }) => {
    const [copied, setCopied] = useState(false);

    const shareLinks = {
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
        twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
        whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(title + ' ' + url)}`
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex flex-wrap items-center gap-4 py-6 border-t border-b border-gray-100 dark:border-gray-800 my-8">
            <span className="flex items-center gap-2 text-sm font-bold text-gray-400 uppercase tracking-widest">
                <Share2 className="w-4 h-4" /> Share
            </span>

            <div className="flex items-center gap-2">
                <a
                    href={shareLinks.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-xl transition-all"
                    title="Share on Facebook"
                >
                    <Facebook className="w-5 h-5" />
                </a>

                <a
                    href={shareLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-sky-900/40 rounded-xl transition-all"
                    title="Share on Twitter"
                >
                    <Twitter className="w-5 h-5" />
                </a>

                <a
                    href={shareLinks.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40 rounded-xl transition-all"
                    title="Share on WhatsApp"
                >
                    <MessageSquare className="w-5 h-5" />
                </a>

                <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40 rounded-xl transition-all font-bold text-sm"
                    title="Copy Link"
                >
                    {copied ? <Check className="w-4 h-4" /> : <LinkIcon className="w-4 h-4" />}
                    {copied ? 'Copied!' : 'Copy Link'}
                </button>
            </div>
        </div>
    );
};

export default ShareButtons;
