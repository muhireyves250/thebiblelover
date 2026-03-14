import React, { useState, useRef } from 'react';
import { BIBLE_VERSE_REGEX, getVerseLink } from '../utils/BibleUtils';
import { bibleVersesAPI } from '../services/api';
import { BookOpen, ExternalLink, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BibleReferenceProps {
  children: React.ReactNode;
}

const BibleReference: React.FC<BibleReferenceProps> = ({ children }) => {
  const [tooltip, setTooltip] = useState<{
    text: string;
    reference: string;
    book: string;
    chapter: number;
    verse: number;
    endVerse?: number;
    x: number;
    y: number;
    loading: boolean;
  } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  const [translations, setTranslations] = useState<any[]>([]);
  const [activeTranslation, setActiveTranslation] = useState('KJV');
  const [isComparing, setIsComparing] = useState(false);

  const fetchVersions = async (book: string, chapter: number, verse: number) => {
    try {
      const response = await bibleVersesAPI.getVerses({ 
        book, 
        chapter: chapter.toString(), 
        verse: verse.toString() 
      });

      if (response.success && response.data?.verses) {
        setTranslations(response.data.verses);
        const kjv = response.data.verses.find((v: any) => v.translation === 'KJV') || response.data.verses[0];
        return kjv;
      }
      return null;
    } catch (err) {
      console.error('Error fetching versions:', err);
      return null;
    }
  };

  const handleRefClick = async (e: React.MouseEvent, book: string, chapter: string, verse: string, endVerse?: string) => {
    e.preventDefault();
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    
    setTooltip({
      text: '',
      reference: `${book} ${chapter}:${verse}${endVerse ? `-${endVerse}` : ''}`,
      book,
      chapter: parseInt(chapter),
      verse: parseInt(verse),
      endVerse: endVerse ? parseInt(endVerse) : undefined,
      x: rect.left + window.scrollX,
      y: rect.top + window.scrollY - 10,
      loading: true
    });

    setIsComparing(false);
    const verseData = await fetchVersions(book, parseInt(chapter), parseInt(verse));
    if (verseData) {
      setTooltip(prev => prev ? { ...prev, text: verseData.text, loading: false } : null);
      setActiveTranslation(verseData.translation);
    } else {
      setTooltip(prev => prev ? { ...prev, text: 'Verse not found.', loading: false } : null);
    }
  };

  const closeTooltip = () => {
    setTooltip(null);
    setTranslations([]);
  };

  const processNodes = (node: React.ReactNode): React.ReactNode => {
    if (typeof node === 'string') {
      const parts = node.split(BIBLE_VERSE_REGEX);
      if (parts.length === 1) return node;

      return parts.map((part, i) => {
        BIBLE_VERSE_REGEX.lastIndex = 0; // Reset regex state
        const match = BIBLE_VERSE_REGEX.exec(part);
        
        if (match || (i % 2 !== 0 && part.trim())) { // Assuming captured groups are at odd indices in split
          // The split regex might need careful handling depending on how BIBLE_VERSE_REGEX is defined
          // Let's use a safer approach for text replacement
          
          return (
            <span
              key={i}
              onClick={(e) => {
                // Approximate matching for simplicity since split might not capture exact groups directly if not crafted perfectly
                // For a robust implementation, matchAll is better
              }}
              className="text-amber-700 font-medium hover:text-amber-800 border-b border-amber-200 hover:border-amber-400 border-dotted transition-colors cursor-pointer"
            >
              {part}
            </span>
          );
        }
        return part;
      });
    }

    if (React.isValidElement(node)) {
      if (node.type === 'a' || node.type === 'button') {
        return node;
      }
      return React.cloneElement(
        node as React.ReactElement,
        {},
        processNodes((node.props as any).children)
      );
    }

    if (Array.isArray(node)) {
      return node.map((n, i) => <React.Fragment key={i}>{processNodes(n)}</React.Fragment>);
    }

    return node;
  };

  // A more robust text processing function using matchAll if we want to extract exact book/chapter/verse
  const processText = (text: string) => {
    if (!text) return text;
    
    const elements: React.ReactNode[] = [];
    let lastIndex = 0;
    
    // Create a local copy of regex to ensure it has 'g' flag for matchAll
    const regex = new RegExp(BIBLE_VERSE_REGEX.source, 'g');
    
    let match;
    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        elements.push(text.substring(lastIndex, match.index));
      }
      
      const fullMatch = match[0];
      const book = match[1] || match[6];
      const chapter = match[2] || match[7];
      const verse = match[3] || match[8];
      const endVerse = match[5] || match[10];
      
      elements.push(
        <span
          key={`verse-${match.index}`}
          onClick={(e) => handleRefClick(e, book, chapter, verse, endVerse)}
          className="text-amber-700 font-medium hover:text-amber-800 hover:bg-amber-50 rounded px-1 transition-colors cursor-pointer inline-flex items-center gap-1 group"
        >
          {fullMatch}
          <BookOpen size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
        </span>
      );
      
      lastIndex = match.index + fullMatch.length;
    }
    
    if (lastIndex < text.length) {
      elements.push(text.substring(lastIndex));
    }
    
    return elements.length > 0 ? elements : text;
  };

  const processNodesSafely = (node: React.ReactNode): React.ReactNode => {
    if (typeof node === 'string') {
      return processText(node);
    }
    if (React.isValidElement(node)) {
      if (node.type === 'a' || node.type === 'button' || node.type === 'code' || node.type === 'pre') {
        return node;
      }
      return React.cloneElement(
        node as React.ReactElement,
        {},
        processNodesSafely((node.props as any).children)
      );
    }
    if (Array.isArray(node)) {
      return node.map((n, i) => <React.Fragment key={i}>{processNodesSafely(n)}</React.Fragment>);
    }
    return node;
  };

  return (
    <div ref={containerRef} className="relative">
      {processNodesSafely(children)}

      <AnimatePresence>
        {tooltip && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            style={{ 
              position: 'absolute', 
              left: tooltip.x, 
              top: tooltip.y, 
              transform: 'translate(-50%, -100%)',
              zIndex: 50,
              width: isComparing ? '450px' : '320px'
            }}
            className="pointer-events-auto transition-all duration-300"
          >
            <div className="bg-white rounded-2xl shadow-2xl border border-amber-100 overflow-hidden transform -translate-x-1/2 -mt-2">
              <div className="bg-amber-50 px-4 py-2 flex items-center justify-between border-b border-amber-100">
                <span className="text-amber-900 font-bold text-sm flex items-center gap-1.5">
                  <BookOpen size={14} /> {tooltip.reference}
                </span>
                <div className="flex items-center space-x-2">
                   {translations.length > 1 && (
                     <button 
                       onClick={() => setIsComparing(!isComparing)}
                       className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-all ${isComparing ? 'bg-amber-600 text-white border-amber-600' : 'text-amber-600 border-amber-200 hover:bg-amber-100'}`}
                     >
                       {isComparing ? 'CLOSE COMPARE' : 'COMPARE'}
                     </button>
                   )}
                   <button onClick={closeTooltip} className="text-amber-400 hover:text-amber-700 transition-colors">
                     <X size={14} />
                   </button>
                </div>
              </div>
              <div className="p-4 max-h-[400px] overflow-y-auto custom-scrollbar">
                {tooltip.loading ? (
                  <div className="flex justify-center py-8">
                    <div className="w-8 h-8 border-3 border-amber-200 border-t-amber-600 rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <>
                    {!isComparing ? (
                      <div>
                        {translations.length > 1 && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {translations.map(t => (
                              <button
                                key={t.id}
                                onClick={() => setActiveTranslation(t.translation)}
                                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${activeTranslation === t.translation ? 'bg-amber-100 text-amber-800' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                              >
                                {t.translation}
                              </button>
                            ))}
                          </div>
                        )}
                        <p className="text-gray-700 italic text-sm leading-relaxed mb-4">
                          "{translations.find(t => t.translation === activeTranslation)?.text || tooltip.text}"
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {translations.map(t => (
                          <div key={t.id} className="border-b border-amber-50 pb-3 last:border-0">
                            <div className="text-[10px] font-bold text-amber-600 mb-1">{t.translation}</div>
                            <p className="text-gray-700 text-sm leading-relaxed italic">"{t.text}"</p>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-amber-50">
                      <a 
                        href={getVerseLink(tooltip.book, tooltip.chapter, tooltip.verse, tooltip.endVerse)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] uppercase tracking-widest font-bold text-amber-600 hover:text-amber-800 flex items-center gap-1 transition-colors"
                      >
                        Read full chapter <ExternalLink size={10} />
                      </a>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(`${translations.find(t => t.translation === activeTranslation)?.text} - ${tooltip.reference} (${activeTranslation})`);
                        }}
                        className="text-[10px] font-bold text-gray-400 hover:text-amber-600 flex items-center gap-1 transition-colors"
                      >
                        Copy Reference
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
            {/* Tooltip Arrow */}
            <div className="w-3 h-3 bg-white border-r border-b border-amber-100 transform rotate-45 mx-auto -mt-1.5 shadow-sm"></div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BibleReference;
