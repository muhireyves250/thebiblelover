import { useEffect, useState } from 'react';
import { useBackgroundSettings } from '../hooks/useBackgroundSettings';
import { useContentSettings } from '../hooks/useContentSettings';
import { optimizeCloudinaryUrl } from '../utils/media';

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
    const heroImage = settings?.heroSection?.imageUrl;
    const optimizedImage = optimizeCloudinaryUrl(heroImage, { width: 1920 });

    return {
      ...baseStyle,
      backgroundImage: heroImage ? `url(${optimizedImage})` : baseStyle.backgroundImage,
      // If we have a custom hero image, we might want it to be more visible than the default background
      opacity: heroImage ? 1 : baseStyle.opacity,
      backgroundPosition: `center calc(50% + ${offset}px)`,
      backgroundAttachment: 'fixed'
    };
  };

  return (
    <section className="relative h-[88vh] flex items-center justify-center bg-cover bg-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-fixed"
        style={getParallaxStyle()}
      >
      </div>

      {/* Overlay */}
      <div
        className="absolute inset-0"
        style={getOverlayStyle()}
      />

      <div className="relative z-10 px-4 text-center">
        <div className="bg-white border border-gray-200 px-10 md:px-16 py-10 shadow-sm">
          <h1 className="text-3xl md:text-5xl font-serif mb-4 tracking-wider text-gray-900">
            {settings?.heroSection?.title || 'THE BIBLE LOVER'}
          </h1>
          <p className="text-xs md:text-sm font-light tracking-[0.35em] uppercase text-gray-700">
            {settings?.heroSection?.content || 'READ ALL ABOUT IT'}
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