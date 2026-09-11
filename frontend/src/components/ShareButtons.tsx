import React, { useState } from 'react';
import { Share2, Check } from 'lucide-react';

interface ShareButtonsProps {
    title: string;
    url?: string;
}

const ShareButtons: React.FC<ShareButtonsProps> = ({ title, url = window.location.href }) => {
    const [copied, setCopied] = useState(false);

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({ title, url });
            } catch {
                // user cancelled or share failed — no-op
            }
            return;
        }
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-amber-700 transition-colors"
        >
            {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Share'}
        </button>
    );
};

export default ShareButtons;
