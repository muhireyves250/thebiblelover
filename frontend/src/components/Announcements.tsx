import React, { useMemo } from 'react';
import { Megaphone } from 'lucide-react';
import { useContentSettings } from '../hooks/useContentSettings';

const Announcements: React.FC = () => {
  const { settings } = useContentSettings();
  const { announcementsSection } = settings;

  const items = useMemo(
    () => (announcementsSection?.content || '').split('\n').map(line => line.trim()).filter(Boolean),
    [announcementsSection?.content]
  );

  if (items.length === 0) return null;

  const Track = ({ hidden = false }: { hidden?: boolean }) => (
    <span className="pr-6 md:pr-10" aria-hidden={hidden || undefined}>
      {items.map((item, i) => (
        <span key={i}>
          <span className="font-sans text-sm md:text-xl font-black uppercase tracking-wider text-white">{item}</span>
          {i < items.length - 1 && <span className="text-amber-500 font-black mx-3 md:mx-6">&bull;</span>}
        </span>
      ))}
    </span>
  );

  return (
    <section className="bg-gray-950 py-2 md:py-8 isolate overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 md:gap-5">
          <span className="flex items-center gap-1.5 md:gap-2.5 font-sans text-xs md:text-sm font-black uppercase tracking-[0.2em] text-amber-500 shrink-0">
            <Megaphone className="w-5 h-5 md:w-8 md:h-8 animate-ring-wiggle" />
            <span className="animate-vibrate hidden sm:inline-block">{announcementsSection?.title || 'Announcements'}</span>
          </span>
          <span className="hidden sm:block w-px h-6 bg-gray-800 shrink-0" />
          <div className="relative flex-1 overflow-hidden">
            <div className="flex whitespace-nowrap animate-marquee">
              <Track />
              <Track hidden />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Announcements;
