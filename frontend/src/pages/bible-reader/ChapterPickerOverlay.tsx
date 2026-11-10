import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BIBLE_BOOKS, type BibleBookMeta } from '../../data/bibleBooks';
import type { Lang } from '../../lib/bibleOfflineDb';

type Props = {
  lang: Lang;
  isOpen: boolean;
  onClose: () => void;
};

const ChapterPickerOverlay: React.FC<Props> = ({ lang, isOpen, onClose }) => {
  const navigate = useNavigate();
  const [selectedBook, setSelectedBook] = useState<BibleBookMeta | null>(null);

  useEffect(() => {
    if (isOpen) setSelectedBook(null);
  }, [isOpen]);

  if (!isOpen) return null;

  const oldTestament = BIBLE_BOOKS.filter((b) => b.testament === 'OT');
  const newTestament = BIBLE_BOOKS.filter((b) => b.testament === 'NT');

  const goToChapter = (book: BibleBookMeta, chapter: number) => {
    navigate(`/bible/${lang}/${book.number}/${chapter}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-[#141417] rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto p-5"
        onClick={(e) => e.stopPropagation()}
      >
        {selectedBook ? (
          <>
            <button
              onClick={() => setSelectedBook(null)}
              className="text-xs font-bold uppercase tracking-widest text-amber-700 hover:underline mb-4"
            >
              &larr; All books
            </button>
            <h3 className="text-sm font-black uppercase tracking-tight text-gray-900 dark:text-white mb-3">
              {selectedBook.names[lang]}
            </h3>
            <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
              {Array.from({ length: selectedBook.chapterCount }, (_, i) => i + 1).map((chapterNumber) => (
                <button
                  key={chapterNumber}
                  onClick={() => goToChapter(selectedBook, chapterNumber)}
                  className="h-9 rounded-md bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm text-gray-700 dark:text-gray-300 hover:border-amber-400 transition-colors"
                >
                  {chapterNumber}
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <h3 className="text-sm font-black uppercase tracking-tight text-gray-900 dark:text-white mb-3">Old Testament</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-6">
              {oldTestament.map((book) => (
                <button
                  key={book.number}
                  onClick={() => setSelectedBook(book)}
                  className="px-3 py-2 rounded-md bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm text-gray-700 dark:text-gray-300 hover:border-amber-400 transition-colors text-left"
                >
                  {book.names[lang]}
                </button>
              ))}
            </div>

            <h3 className="text-sm font-black uppercase tracking-tight text-gray-900 dark:text-white mb-3">New Testament</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {newTestament.map((book) => (
                <button
                  key={book.number}
                  onClick={() => setSelectedBook(book)}
                  className="px-3 py-2 rounded-md bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm text-gray-700 dark:text-gray-300 hover:border-amber-400 transition-colors text-left"
                >
                  {book.names[lang]}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ChapterPickerOverlay;
