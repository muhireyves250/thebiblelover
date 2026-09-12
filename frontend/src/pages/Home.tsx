import HomeFeed from '../components/HomeFeed';
import PlayerDesk from '../components/PlayerDesk';
import VerseDesk from '../components/VerseDesk';
import Announcements from '../components/Announcements';
import AboutDesk from '../components/AboutDesk';
import SEO from '../components/SEO';
import { useBackgroundSettings } from '../hooks/useBackgroundSettings';

const Home = () => {
  const { getBackgroundStyle } = useBackgroundSettings();

  return (
    <>
      <SEO
        title="Home"
        description="A haven for those who seek the wisdom, comfort, and inspiration of the Holy Bible. Explore reflections and spiritual growth resources."
      />
      <div className="md:hidden px-4 pt-4">
        <div className="relative isolate overflow-hidden rounded-2xl border border-gray-300 shadow-sm px-5 py-8">
          <div className="absolute inset-0 bg-cover bg-center" style={getBackgroundStyle()} />
          <div className="absolute inset-0 bg-gray-950/70" />
          <div className="relative">
            <span className="block w-10 h-[2px] bg-amber-500 mb-3" />
            <p className="text-[11px] font-black uppercase tracking-[0.3em] text-amber-400 mb-1">Welcome back</p>
            <h2 className="font-serif text-xl font-semibold text-white tracking-tight">
              Here's what's new today, friend.
            </h2>
          </div>
        </div>
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