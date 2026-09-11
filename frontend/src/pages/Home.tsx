import Hero from '../components/Hero';
import HomeFeed from '../components/HomeFeed';
import PlayerDesk from '../components/PlayerDesk';
import VerseDesk from '../components/VerseDesk';
import Newsletter from '../components/Newsletter';
import { Link } from 'react-router-dom';
import { useContentSettings } from '../hooks/useContentSettings';
import SEO from '../components/SEO';

const Home = () => {
  const { settings } = useContentSettings();
  const { aboutSection, storySection, missionSection } = settings;

  return (
    <>
      <SEO
        title="Home"
        description="A haven for those who seek the wisdom, comfort, and inspiration of the Holy Bible. Explore reflections and spiritual growth resources."
      />
      <Hero />
      <HomeFeed />
      <PlayerDesk />
      <VerseDesk />

      {/* About snippet */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
            <div>
              <h2 className="text-3xl font-serif text-gray-900 mb-3">{aboutSection.title}</h2>
              <p className="text-gray-700 leading-relaxed mb-4 whitespace-pre-line">
                {aboutSection.content}
              </p>
              <Link to="/about" className="inline-block px-5 py-2 rounded-md bg-amber-700 text-white hover:bg-amber-800">Learn More</Link>
            </div>
            <div className="rounded overflow-hidden">
              <img
                src={aboutSection.imageUrl || "/images/about.png"}
                alt={aboutSection.title}
                className="w-full h-auto object-cover"
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
            <div className="rounded overflow-hidden order-2 md:order-1">
              <img
                src={storySection.imageUrl || "/images/story.png"}
                alt={storySection.title}
                className="w-full h-auto object-cover"
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="order-1 md:order-2">
              <h2 className="text-3xl font-serif text-gray-900 mb-4">{storySection.title}</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {storySection.content}
              </p>
              <Link to="/about" className="inline-block mt-6 px-5 py-2 rounded-md bg-amber-700 text-white hover:bg-amber-800">Learn More</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Values Section */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
            <div>
              <h2 className="text-3xl font-serif text-gray-900 mb-4">{missionSection.title}</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {missionSection.content}
              </p>
              <Link to="/about" className="inline-block mt-6 px-5 py-2 rounded-md bg-amber-700 text-white hover:bg-amber-800">Learn More</Link>
            </div>
            <div className="rounded overflow-hidden">
              <img
                src={missionSection.imageUrl || "/images/mission.png"}
                alt={missionSection.title}
                className="w-full h-auto object-cover"
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>
        </div>
      </section>

      <Newsletter />
    </>
  );
};

export default Home;