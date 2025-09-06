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
    <div className="min-h-screen bg-white">
      {/* Hero Section with Profile Image */}
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
        
        {/* Profile Image - positioned to overlap hero */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 z-10">
          <img 
            src="https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=1"
            alt="Profile"
            className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-white shadow-lg"
          />
        </div>
      </section>

      {/* Content Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-8 pt-16">
            <h1 className="text-4xl md:text-5xl font-serif text-gray-900 tracking-wider">
              ABOUT ME
            </h1>
            <p className="text-gray-700 text-lg leading-relaxed">
              I'm a paragraph. Click here to add your own text and edit me. It's easy. Just click "Edit Text" or double click me 
              to add your own content and make changes to the font. Feel free to drag and drop me anywhere you like on 
              your page. I'm a great place for you to tell a story and let your users know a little more about you.
            </p>
            
            <p className="text-gray-700 text-lg leading-relaxed">
              This is a great space to write a long text about your company and your services. You can use this space to go 
              into a little more detail about your company. Talk about your team and what services you provide. Tell your 
              visitors the story of how you came up with the idea for your business and what makes you different from your 
              competitors. Make your company stand out and show your visitors who you are.
            </p>
          </div>
        </div>
      </section>

      <Newsletter />
    </div>
  );
};

export default About;