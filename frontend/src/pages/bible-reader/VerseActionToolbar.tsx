import React from 'react';
import { Bookmark, Highlighter, MessageSquare, Share2, X } from 'lucide-react';

type Props = {
  isBookmarked: boolean;
  isHighlighted: boolean;
  onBookmark: () => void;
  onHighlight: () => void;
  onNote: () => void;
  onShare: () => void;
  onClose: () => void;
};

const VerseActionToolbar: React.FC<Props> = ({
  isBookmarked, isHighlighted, onBookmark, onHighlight, onNote, onShare, onClose,
}) => (
  <div className="fixed inset-x-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-40 flex justify-center">
    <div className="flex items-center gap-1 bg-[#111113] rounded-full px-2 py-2 shadow-2xl">
      <button
        onClick={onBookmark}
        aria-label="Bookmark"
        className={`p-2.5 rounded-full transition-colors ${isBookmarked ? 'text-amber-400' : 'text-white/70 hover:text-white'}`}
      >
        <Bookmark className="w-5 h-5" fill={isBookmarked ? 'currentColor' : 'none'} />
      </button>
      <button
        onClick={onHighlight}
        aria-label="Highlight"
        className={`p-2.5 rounded-full transition-colors ${isHighlighted ? 'text-amber-400' : 'text-white/70 hover:text-white'}`}
      >
        <Highlighter className="w-5 h-5" fill={isHighlighted ? 'currentColor' : 'none'} />
      </button>
      <button onClick={onNote} aria-label="Note" className="p-2.5 rounded-full text-white/70 hover:text-white transition-colors">
        <MessageSquare className="w-5 h-5" />
      </button>
      <button onClick={onShare} aria-label="Share" className="p-2.5 rounded-full text-white/70 hover:text-white transition-colors">
        <Share2 className="w-5 h-5" />
      </button>
      <span className="w-px h-5 bg-white/20 mx-1" />
      <button onClick={onClose} aria-label="Close" className="p-2.5 rounded-full text-white/50 hover:text-white transition-colors">
        <X className="w-5 h-5" />
      </button>
    </div>
  </div>
);

export default VerseActionToolbar;
