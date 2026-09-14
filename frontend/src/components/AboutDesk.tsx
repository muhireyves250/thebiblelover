import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useContentSettings } from '../hooks/useContentSettings';
import AutoText from './AutoText';

const AUTO_ROTATE_MS = 7000;

const AboutDesk: React.FC = () => {
  const { settings } = useContentSettings();
  const { aboutSection, storySection, missionSection } = settings;

  const panels = [
    { key: 'about', ...aboutSection, image: aboutSection.imageUrl || '/images/about.png' },
    { key: 'story', ...storySection, image: storySection.imageUrl || '/images/story.png' },
    { key: 'mission', ...missionSection, image: missionSection.imageUrl || '/images/mission.png' }
  ];

  const [index, setIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    if (isHovering) return;
    const interval = setInterval(() => {
      setIndex(i => (i + 1) % panels.length);
    }, AUTO_ROTATE_MS);
    return () => clearInterval(interval);
  }, [isHovering, panels.length]);

  const goTo = (i: number) => setIndex((i + panels.length) % panels.length);
  const active = panels[index];

  // Mobile: swipe left/right to change panels (app-style), instead of
  // the desktop's arrow buttons.
  const touchStartX = React.useRef<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 40) {
      goTo(delta < 0 ? index + 1 : index - 1);
    }
    touchStartX.current = null;
  };

  return (
    <section className="py-6 md:py-20 bg-white dark:bg-transparent isolate">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-start justify-between gap-4 md:gap-6 mb-4 md:mb-8 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1.5 md:mb-2">
              <span className="w-1 h-4 bg-amber-700 rounded-sm" />
              <AutoText as="span" className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-amber-700">About Us</AutoText>
            </div>
            <AutoText as="h2" className="text-xl md:text-4xl font-black uppercase tracking-tight text-gray-900 dark:text-white">Our Story &amp; Mission</AutoText>
            <p className="hidden md:block text-sm text-gray-500 dark:text-gray-400 mt-2">Who we are, where we started, and what we&apos;re building together</p>
          </div>
          <div className="hidden md:flex items-center gap-1.5 md:gap-2 shrink-0">
            <button
              onClick={() => goTo(index - 1)}
              aria-label="Previous"
              className="w-7 h-7 md:w-9 md:h-9 flex items-center justify-center rounded-full border border-gray-300 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </button>
            <button
              onClick={() => goTo(index + 1)}
              aria-label="Next"
              className="w-7 h-7 md:w-9 md:h-9 flex items-center justify-center rounded-full border border-gray-300 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-50 transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </button>
          </div>
        </div>

        <div
          className="relative bg-white dark:bg-[#141417] border border-gray-300 dark:border-white/10 rounded-lg shadow-sm dark:bg-[#141417] dark:border-white/10 overflow-hidden"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={active.key}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-12 items-center p-4 md:p-10"
            >
              <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-white/10">
                <img
                  src={active.image}
                  alt={active.title}
                  className="w-full h-40 sm:h-64 md:h-80 object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div>
                <h3 className="text-base md:text-2xl font-black uppercase tracking-tight text-gray-900 dark:text-white mb-2 md:mb-4">{active.title}</h3>
                <p className="text-sm md:text-base text-gray-700 dark:text-gray-200 leading-relaxed whitespace-pre-line mb-4 md:mb-6 line-clamp-4 md:line-clamp-[8]">
                  {active.content}
                </p>
                <Link
                  to="/about"
                  className="inline-flex items-center gap-2 px-4 py-2 md:px-5 md:py-2.5 rounded-md bg-amber-700 text-white text-[11px] md:text-xs font-bold uppercase tracking-widest hover:bg-amber-800 transition-colors"
                >
                  Learn More
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-center gap-2 mt-4 md:mt-6">
          {panels.map((p, i) => (
            <button
              key={p.key}
              onClick={() => goTo(i)}
              aria-label={`Go to ${p.title}`}
              className={`h-1.5 rounded-full transition-all ${i === index ? 'w-8 bg-amber-700' : 'w-1.5 bg-gray-300 dark:bg-white/10'}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutDesk;
