import React, { useEffect, useState } from 'react';
import Newsletter from '../components/Newsletter';
import { useBackgroundSettings } from '../hooks/useBackgroundSettings';

const About = () => {
  const [offset, setOffset] = useState(0);
  const { getBackgroundStyle, getOverlayStyle } = useBackgroundSettings();
  
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
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Hero header with background image (same pattern as other pages) */}
      <section className="relative h-[520px] bg-cover bg-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-fixed"
          style={getParallaxStyle()}
        />
        {/* Overlay for readability */}
        <div className="absolute inset-0" style={getOverlayStyle()} />
        {/* Centered card */}
        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="bg-white border border-gray-200 px-10 md:px-16 py-10 text-center shadow-sm">
            <h1 className="text-3xl md:text-5xl font-serif mb-4 tracking-wider text-gray-900">ABOUT</h1>
            <p className="text-xs md:text-sm font-light tracking-[0.35em] uppercase text-gray-700">WHO WE ARE</p>
          </div>
        </div>
      </section>
      {/* Soft background accents */}
      <div className="pointer-events-none absolute -top-24 -right-24 w-[520px] h-[520px] rounded-full bg-gradient-to-br from-amber-200 via-pink-100 to-transparent opacity-60 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 -left-24 w-[460px] h-[460px] rounded-full bg-gradient-to-tr from-indigo-100 via-teal-50 to-transparent opacity-60 blur-3xl" />
      {/* Intro Section */}
      <section className="bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-serif text-gray-900 mb-4">About Us</h2>
              <p className="text-gray-600 leading-relaxed">
                Our company and culture are crafted for a delightful experience. We believe in
                thoughtful design, clear communication, and building products that help people grow.
              </p>
            </div>
            <div className="rounded overflow-hidden">
              <img
                src="https://images.pexels.com/photos/3182763/pexels-photo-3182763.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                alt="Team working"
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
            <div className="rounded overflow-hidden order-2 md:order-1">
              <img
                src="https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                alt="Grow better"
                className="w-full h-auto object-cover"
              />
            </div>
            <div className="order-1 md:order-2">
              <h3 className="text-2xl md:text-3xl font-serif text-gray-900 mb-3">Our Mission: Helping Millions of Organizations Grow Better</h3>
              <p className="text-gray-600 leading-relaxed">
                We believe in growing better—aligning your success with the success of your customers.
                We’re committed to building tools and experiences that deliver real value and lasting impact.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-start">
            <div>
              <h3 className="text-2xl md:text-3xl font-serif text-gray-900 mb-4">Our Story</h3>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  In 2004, we noticed a major shift in how people shop and purchase. Buyers wanted helpful
                  information, not interruptions. That insight led to creating tools that put customers first.
                </p>
                <p>
                  Since then, we’ve expanded beyond marketing into a crafted suite of products that create
                  a frictionless customer experience. Our platform helps teams grow better with an AI‑powered
                  foundation and a focus on long‑term relationships.
                </p>
                <p>
                  Today, we’re proud to support millions of users as they scale with confidence.
                </p>
              </div>
            </div>
            <div className="rounded overflow-hidden">
              <img
                src="https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                alt="Team story"
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <Newsletter />
    </div>
  );
};

export default About;