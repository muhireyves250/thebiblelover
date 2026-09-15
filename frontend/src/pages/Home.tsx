import { Bell, Star } from 'lucide-react';
import HomeFeed from '../components/HomeFeed';
import PlayerDesk from '../components/PlayerDesk';
import VerseDesk from '../components/VerseDesk';
import Announcements from '../components/Announcements';
import AboutDesk from '../components/AboutDesk';
import NewsletterSubscribe from '../components/NewsletterSubscribe';
import InstallPwaCard from '../components/InstallPwaCard';
import SEO from '../components/SEO';
import AutoText from '../components/AutoText';
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
        <div className="relative isolate overflow-hidden rounded-3xl border border-gray-300 dark:border-white/10 shadow-sm min-h-[200px] flex flex-col">
          <div className="absolute inset-0 bg-cover bg-center" style={getBackgroundStyle()} />
          <div className="absolute inset-0 bg-gradient-to-b from-gray-950/40 via-gray-950/60 to-gray-950/90" />

          <div className="relative flex items-center justify-between px-4 pt-4">
            <AutoText as="span" className="px-3 py-1 bg-emerald-500 rounded-full text-[10px] font-black uppercase tracking-widest text-white">
              Welcome
            </AutoText>
            <span className="w-7 h-7 rounded-full bg-black/40 backdrop-blur flex items-center justify-center">
              <Bell className="w-3.5 h-3.5 text-white" />
            </span>
          </div>

          <div className="relative mt-auto px-4 pb-4">
            <h2 className="font-sans text-lg font-black uppercase tracking-tight leading-snug text-white">
              <AutoText as="span">Welcome back,</AutoText> <span className="text-amber-700"><AutoText as="span">friend</AutoText></span>
            </h2>
            <div className="flex items-center gap-3 mt-1">
              <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-[0.3em] text-amber-700">
                <Star className="w-2.5 h-2.5 fill-amber-700 text-amber-700" /> <AutoText as="span">Daily Inspiration</AutoText>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 md:mt-6 max-w-7xl mx-auto md:px-6 lg:px-8">
        <InstallPwaCard />
      </div>

      <HomeFeed />
      <PlayerDesk />
      <VerseDesk />
      <AboutDesk />

      <div className="md:hidden mt-6">
        <NewsletterSubscribe />
      </div>

      <div className="hidden md:block"><Announcements /></div>
    </>
  );
};

export default Home;