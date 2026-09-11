import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useContentSettings } from '../hooks/useContentSettings';

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

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-start justify-between gap-6 mb-8 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1 h-4 bg-amber-700 rounded-sm" />
              <span className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">About Us</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-gray-900">Our Story &amp; Mission</h2>
            <p className="text-sm text-gray-500 mt-2">Who we are, where we started, and what we&apos;re building together</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => goTo(index - 1)}
              aria-label="Previous"
              className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => goTo(index + 1)}
              aria-label="Next"
              className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div
          className="relative bg-white border border-gray-300 rounded-lg shadow-sm overflow-hidden"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={active.key}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center p-6 md:p-10"
            >
              <div className="rounded-lg overflow-hidden border border-gray-200">
                <img
                  src={active.image}
                  alt={active.title}
                  className="w-full h-64 md:h-80 object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div>
                <h3 className="text-2xl font-black uppercase tracking-tight text-gray-900 mb-4">{active.title}</h3>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line mb-6 line-clamp-[8]">
                  {active.content}
                </p>
                <Link
                  to="/about"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-amber-700 text-white text-xs font-bold uppercase tracking-widest hover:bg-amber-800 transition-colors"
                >
                  Learn More
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-center gap-2 mt-6">
          {panels.map((p, i) => (
            <button
              key={p.key}
              onClick={() => goTo(i)}
              aria-label={`Go to ${p.title}`}
              className={`h-1.5 rounded-full transition-all ${i === index ? 'w-8 bg-amber-700' : 'w-1.5 bg-gray-300'}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutDesk;
