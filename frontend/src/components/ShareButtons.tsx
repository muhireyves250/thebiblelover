import React, { useState, useRef, useEffect } from 'react';
import { Share2, Facebook, Twitter, MessageSquare, Link as LinkIcon, Check } from 'lucide-react';

interface ShareButtonsProps {
    title: string;
    url?: string;
}

const ShareButtons: React.FC<ShareButtonsProps> = ({ title, url = window.location.href }) => {
    const [open, setOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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
        <div className="relative" ref={wrapperRef}>
            <button
                onClick={() => setOpen(!open)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-full text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
                <Share2 className="w-4 h-4" /> Share
            </button>

            {open && (
                <div className="absolute right-0 top-full mt-2 z-20 bg-white border border-gray-200 rounded-lg shadow-lg p-2 flex items-center gap-1 whitespace-nowrap">
                    <a
                        href={shareLinks.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Share on Facebook"
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                    >
                        <Facebook className="w-4 h-4" />
                    </a>
                    <a
                        href={shareLinks.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Share on Twitter"
                        className="p-2 text-sky-600 hover:bg-sky-50 rounded-md transition-colors"
                    >
                        <Twitter className="w-4 h-4" />
                    </a>
                    <a
                        href={shareLinks.whatsapp}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Share on WhatsApp"
                        className="p-2 text-green-600 hover:bg-green-50 rounded-md transition-colors"
                    >
                        <MessageSquare className="w-4 h-4" />
                    </a>
                    <span className="w-px h-5 bg-gray-200 mx-0.5" />
                    <button
                        onClick={copyToClipboard}
                        title="Copy link"
                        className="flex items-center gap-1.5 px-2.5 py-2 text-amber-700 hover:bg-amber-50 rounded-md transition-colors text-xs font-bold"
                    >
                        {copied ? <Check className="w-4 h-4" /> : <LinkIcon className="w-4 h-4" />}
                        {copied ? 'Copied!' : 'Copy Link'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default ShareButtons;
