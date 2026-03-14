import { useState } from 'react';
import { useContentSettings } from '../hooks/useContentSettings';
import PageHeader from '../components/PageHeader';
import Newsletter from '../components/Newsletter';
import SEO from '../components/SEO';
import { ChevronDown, ChevronUp } from 'lucide-react';

const About = () => {
  const { settings, loading } = useContentSettings();
  const { aboutSection, storySection, missionSection } = settings;

  const [isMissionExpanded, setIsMissionExpanded] = useState(false);
  const [isStoryExpanded, setIsStoryExpanded] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-700"></div>
      </div>
    );
  }

  // Helper function to truncate text
  const renderTruncatedContent = (content: string, isExpanded: boolean, onToggle: () => void, maxLength = 150) => {
    if (!content) return null;
    
    // If the content is short enough, just return it without a button
    if (content.length <= maxLength) {
      return <p className="text-gray-700 leading-relaxed whitespace-pre-line">{content}</p>;
    }

    const displayText = isExpanded ? content : `${content.slice(0, maxLength)}...`;

    return (
      <div className="space-y-4">
        <p className="text-gray-700 leading-relaxed whitespace-pre-line transition-all duration-300">
          {displayText}
        </p>
        <button 
          onClick={onToggle}
          className="inline-flex items-center gap-2 text-amber-700 font-medium hover:text-amber-800 transition-colors"
        >
          {isExpanded ? (
            <>Read Less <ChevronUp className="w-4 h-4" /></>
          ) : (
            <>Learn More <ChevronDown className="w-4 h-4" /></>
          )}
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      <SEO 
        title="About Us" 
        description="Discover the story and mission of The Bible Lover. Our goal is to provide a spiritual home for everyone seeking wisdom through the Holy Scriptures."
      />
      <PageHeader title="ABOUT" subtitle="WHO WE ARE" />
      {/* Soft background accents */}
      <div className="pointer-events-none absolute -top-24 -right-24 w-[520px] h-[520px] rounded-full bg-gradient-to-br from-amber-200 via-pink-100 to-transparent opacity-60 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 -left-24 w-[460px] h-[460px] rounded-full bg-gradient-to-tr from-indigo-100 via-teal-50 to-transparent opacity-60 blur-3xl" />
      
      {/* Intro Section */}
      <section className="bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-serif text-gray-900 mb-4">{aboutSection?.title || 'Our Story'}</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {aboutSection?.content}
              </p>
            </div>
            <div className="rounded overflow-hidden shadow-lg border border-gray-100/50">
              <img
                src={aboutSection?.imageUrl || "/images/about.png"}
                alt={aboutSection?.title || 'About Us'}
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="bg-amber-50/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
            <div className="rounded overflow-hidden shadow-lg border border-gray-100/50 order-2 md:order-1">
              <img
                src={missionSection?.imageUrl || "/images/mission.png"}
                alt={missionSection?.title || 'Our Mission'}
                className="w-full h-auto object-cover"
              />
            </div>
            <div className="order-1 md:order-2">
              <h3 className="text-2xl md:text-3xl font-serif text-gray-900 mb-4">{missionSection?.title || 'Our Mission'}</h3>
              {renderTruncatedContent(
                missionSection?.content || '', 
                isMissionExpanded, 
                () => setIsMissionExpanded(!isMissionExpanded)
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
            <div>
              <h3 className="text-2xl md:text-3xl font-serif text-gray-900 mb-4">{storySection?.title || 'Our Heritage'}</h3>
              {renderTruncatedContent(
                storySection?.content || '', 
                isStoryExpanded, 
                () => setIsStoryExpanded(!isStoryExpanded)
              )}
            </div>
            <div className="rounded overflow-hidden shadow-lg border border-gray-100/50">
              <img
                src={storySection?.imageUrl || "/images/story.png"}
                alt={storySection?.title || 'Our Story'}
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