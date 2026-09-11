import React, { useState, useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Megaphone } from 'lucide-react';
import { useContentSettings } from '../hooks/useContentSettings';

const AUTO_ROTATE_MS = 5000;

const Announcements: React.FC = () => {
  const { settings } = useContentSettings();
  const { announcementsSection } = settings;

  const items = useMemo(
    () => (announcementsSection?.content || '').split('\n').map(line => line.trim()).filter(Boolean),
    [announcementsSection?.content]
  );

  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (items.length <= 1) return;
    const interval = setInterval(() => {
      setIndex(i => (i + 1) % items.length);
    }, AUTO_ROTATE_MS);
    return () => clearInterval(interval);
  }, [items.length]);

  if (items.length === 0) return null;

  return (
    <section className="bg-gray-950 py-4 isolate">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-amber-500 shrink-0">
            <Megaphone className="w-4 h-4" />
            {announcementsSection?.title || 'Announcements'}
          </span>
          <span className="hidden sm:block w-px h-4 bg-gray-800 shrink-0" />
          <div className="relative flex-1 h-5 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.p
                key={index}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="absolute inset-0 text-sm text-gray-200 whitespace-nowrap overflow-hidden text-ellipsis"
              >
                {items[index]}
              </motion.p>
            </AnimatePresence>
          </div>
          {items.length > 1 && (
            <div className="hidden sm:flex items-center gap-1.5 shrink-0">
              {items.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIndex(i)}
                  aria-label={`Go to announcement ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all ${i === index ? 'w-5 bg-amber-500' : 'w-1.5 bg-gray-700'}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Announcements;
