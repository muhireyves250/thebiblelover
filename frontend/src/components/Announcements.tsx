import React, { useEffect, useMemo, useState } from 'react';
import { Megaphone } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useContentSettings } from '../hooks/useContentSettings';

const Announcements: React.FC = () => {
  const { settings } = useContentSettings();
  const { announcementsSection } = settings;

  const items = useMemo(
    () => (announcementsSection?.content || '').split('\n').map(line => line.trim()).filter(Boolean),
    [announcementsSection?.content]
  );

  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [items.length]);

  useEffect(() => {
    if (items.length < 2) return;
    // Give longer announcements more time on screen so they're
    // comfortably readable before rotating to the next one.
    const current = items[index] || '';
    const displayMs = Math.max(4000, current.length * 90);
    const timer = setTimeout(() => {
      setIndex(prev => (prev + 1) % items.length);
    }, displayMs);
    return () => clearTimeout(timer);
  }, [index, items]);

  if (items.length === 0) return null;

  return (
    <section className="bg-gray-950 py-2 md:py-8 isolate overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 md:gap-5">
          <span className="flex items-center gap-1.5 md:gap-2.5 font-sans text-xs md:text-sm font-black uppercase tracking-[0.2em] text-amber-500 shrink-0">
            <Megaphone className="w-5 h-5 md:w-8 md:h-8 animate-ring-wiggle" />
            <span className="animate-vibrate hidden sm:inline-block">{announcementsSection?.title || 'Announcements'}</span>
          </span>
          <span className="hidden sm:block w-px h-6 bg-gray-800 shrink-0" />
          <div className="relative flex-1 min-w-0 h-6 md:h-8 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.p
                key={index}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="absolute inset-0 flex items-center font-sans text-sm md:text-xl font-black uppercase tracking-wider text-white truncate"
              >
                {items[index]}
              </motion.p>
            </AnimatePresence>
          </div>
          {items.length > 1 && (
            <span className="hidden md:flex items-center gap-1 shrink-0">
              {items.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${i === index ? 'w-4 bg-amber-500' : 'w-1.5 bg-gray-700'
                    }`}
                />
              ))}
            </span>
          )}
        </div>
      </div>
    </section>
  );
};

export default Announcements;
