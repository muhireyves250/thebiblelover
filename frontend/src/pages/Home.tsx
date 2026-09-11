import Hero from '../components/Hero';
import HomeFeed from '../components/HomeFeed';
import PlayerDesk from '../components/PlayerDesk';
import VerseDesk from '../components/VerseDesk';
import AboutDesk from '../components/AboutDesk';
import SEO from '../components/SEO';

const Home = () => {
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

      <AboutDesk />
    </>
  );
};

export default Home;