import HomeFeed from '../components/HomeFeed';
import PlayerDesk from '../components/PlayerDesk';
import VerseDesk from '../components/VerseDesk';
import Announcements from '../components/Announcements';
import AboutDesk from '../components/AboutDesk';
import SEO from '../components/SEO';

const Home = () => {
  return (
    <>
      <SEO
        title="Home"
        description="A haven for those who seek the wisdom, comfort, and inspiration of the Holy Bible. Explore reflections and spiritual growth resources."
      />
      <div className="md:hidden bg-white px-4 pt-4">
        <p className="text-sm text-gray-500">
          Welcome back, <span className="font-bold text-gray-900">friend</span> — here's what's new today.
        </p>
      </div>
      <HomeFeed />
      <div className="hidden md:block">
        <PlayerDesk />
        <VerseDesk />
        <AboutDesk />
      </div>

      <div className="hidden md:block"><Announcements /></div>
    </>
  );
};

export default Home;