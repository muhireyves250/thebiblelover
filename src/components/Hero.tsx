import React, { useEffect, useState } from 'react';
import { useBackgroundSettings } from '../hooks/useBackgroundSettings';

const Hero = () => {
  const [offset, setOffset] = useState(0);
  const { backgroundSettings, getBackgroundStyle, getOverlayStyle } = useBackgroundSettings();
  
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
    <section className="relative h-[520px] bg-cover bg-center overflow-hidden">
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
      
      <div className="relative z-10 flex items-center justify-center h-full px-4">
        <div className="bg-white border border-gray-200 px-10 md:px-16 py-10 text-center">
          <h1 className="text-3xl md:text-5xl font-serif mb-4 tracking-wider text-gray-900">
            THE BIBLE LOVER
          </h1>
          <p className="text-xs md:text-sm font-light tracking-[0.35em] uppercase text-gray-700">
            READ ALL ABOUT IT
          </p>
        </div>
      </div>
    </section>
  );
};

export default Hero;