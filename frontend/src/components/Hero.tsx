import { useEffect, useState } from 'react';
import { useBackgroundSettings } from '../hooks/useBackgroundSettings';
import { useContentSettings } from '../hooks/useContentSettings';

const Hero = () => {
  const [offset, setOffset] = useState(0);
  const { getBackgroundStyle, getOverlayStyle } = useBackgroundSettings();
  const { settings } = useContentSettings();
  const videoUrl = settings?.heroSection?.videoUrl;

  useEffect(() => {
    const onScroll = () => setOffset(window.scrollY * 0.25);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const getParallaxStyle = () => {
    const baseStyle = getBackgroundStyle();

    return {
      ...baseStyle,
      backgroundPosition: `center calc(50% + ${offset}px)`,
      backgroundAttachment: 'fixed'
    };
  };

  return (
    <section className="relative h-[88vh] flex items-center justify-center bg-cover bg-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-fixed"
        style={getParallaxStyle()}
        // @ts-ignore
        fetchpriority="high"
      >
      </div>

      {/* Overlay */}
      <div
        className="absolute inset-0"
        style={getOverlayStyle()}
      />

      <div className="relative z-10 px-4 text-center">
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/20 dark:border-gray-800 px-12 md:px-20 py-12 shadow-2xl transition-all duration-500 hover:scale-[1.02] rounded-3xl group">
          <h1 className="text-4xl md:text-6xl editorial-title mb-6 tracking-tight text-gray-900 dark:text-gray-100 transform transition-transform group-hover:translate-y-[-2px]">
            {settings?.heroSection?.title || 'THE BIBLE LOVER'}
          </h1>
          <div className="w-24 h-1 bg-amber-600/30 mx-auto mb-6 rounded-full overflow-hidden">
            <div className="w-1/2 h-full bg-amber-600 animate-shimmer-fast"></div>
          </div>
          <p className="text-xs md:text-sm font-medium tracking-[0.4em] uppercase text-amber-700 dark:text-amber-500">
            {settings?.heroSection?.content || 'WALK IN THE LIGHT OF HIS WORD'}
          </p>
        </div>
      </div>

      {/* Hero Video - Aligned with Logo */}
      {videoUrl && (
        <div className="absolute inset-x-0 bottom-0 z-20 pointer-events-none">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 pb-6 md:pb-10">
            <div className="w-40 md:w-52 rounded-lg overflow-hidden shadow-2xl pointer-events-auto">
              <div className="aspect-video relative">
                <video
                  src={videoUrl}
                  autoPlay
                  muted
                  loop
                  playsInline
                  controls
                  preload="metadata"
                  webkit-playsinline="true"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Hero;