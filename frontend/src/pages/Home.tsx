import { Bell, Star, Calendar } from 'lucide-react';
import HomeFeed from '../components/HomeFeed';
import PlayerDesk from '../components/PlayerDesk';
import VerseDesk from '../components/VerseDesk';
import Announcements from '../components/Announcements';
import AboutDesk from '../components/AboutDesk';
import SEO from '../components/SEO';
import { useBackgroundSettings } from '../hooks/useBackgroundSettings';

const todayLabel = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

const Home = () => {
  const { getBackgroundStyle } = useBackgroundSettings();

  return (
    <>
      <SEO
        title="Home"
        description="A haven for those who seek the wisdom, comfort, and inspiration of the Holy Bible. Explore reflections and spiritual growth resources."
      />
      <div className="md:hidden px-4 pt-4">
        <div className="relative isolate overflow-hidden rounded-3xl border border-gray-300 shadow-sm min-h-[150px] flex flex-col">
          <div className="absolute inset-0 bg-cover bg-center" style={getBackgroundStyle()} />
          <div className="absolute inset-0 bg-gradient-to-b from-gray-950/40 via-gray-950/60 to-gray-950/90" />

          <div className="relative flex items-center justify-between px-4 pt-4">
            <span className="px-3 py-1 bg-emerald-500 rounded-full text-[10px] font-black uppercase tracking-widest text-white">
              Welcome
            </span>
            <span className="w-7 h-7 rounded-full bg-black/40 backdrop-blur flex items-center justify-center">
              <Bell className="w-3.5 h-3.5 text-white" />
            </span>
          </div>

          <div className="relative mt-auto px-4 pb-4">
            <h2 className="font-sans text-lg font-black text-white tracking-tight">Welcome back, friend</h2>
            <div className="flex items-center gap-3 mt-1">
              <span className="flex items-center gap-1 text-xs font-bold text-amber-400">
                <Star className="w-3.5 h-3.5 fill-amber-400" /> Daily Inspiration
              </span>
              <span className="flex items-center gap-1 text-xs text-gray-300">
                <Calendar className="w-3 h-3" /> {todayLabel}
              </span>
            </div>
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