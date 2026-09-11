import { useContentSettings } from '../hooks/useContentSettings';
import PageHeader from '../components/PageHeader';
import SEO from '../components/SEO';

const SectionHeader = ({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) => (
  <>
    <div className="absolute inset-0 bg-black/25 transition-colors duration-300 group-hover:bg-black/35" />
    <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-black/85 via-black/55 to-transparent px-5 pb-16 pt-5">
      <div className="flex items-center gap-2 mb-2">
        <span className="w-4 h-[2px] bg-amber-500" />
        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-400">{eyebrow}</span>
      </div>
      <h2 className="font-serif text-3xl md:text-4xl font-semibold tracking-tight text-white drop-shadow-sm">
        {title}
      </h2>
      <p className="text-sm font-light text-gray-200 mt-2 tracking-wide">{subtitle}</p>
    </div>
  </>
);

const About = () => {
  const { settings, loading } = useContentSettings();
  const { aboutSection, storySection, missionSection } = settings;

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-700"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="About Us"
        description="Discover the story and mission of The Bible Lover. Our goal is to provide a spiritual home for everyone seeking wisdom through the Holy Scriptures."
      />
      <PageHeader title="ABOUT" subtitle="WHO WE ARE" />

      {/* Who We Are */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white border border-gray-300 rounded-lg shadow-sm overflow-hidden p-6 md:p-10">
            <div className="group relative float-left w-1/2 h-64 md:h-80 mr-6 md:mr-8 mb-4 rounded-lg overflow-hidden border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-300">
              <img
                src={aboutSection?.imageUrl || '/images/about.png'}
                alt={aboutSection?.title || 'About Us'}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <SectionHeader eyebrow="About Us" title="Who We Are" subtitle="A community built around God's Word" />
            </div>
            <div className="space-y-5 text-gray-700 leading-relaxed">
              <p className="whitespace-pre-line">
                {aboutSection?.content ||
                  'Welcome to Bible Lovers, a place where God’s Word comes alive and transforms hearts.'}
              </p>
              <p>
                We started as a small group of believers who kept coming back to the same question: what
                would it look like if Scripture wasn't something we visited once a week, but something we
                lived inside of every day? That question became a habit of reading together, praying
                together, and holding each other accountable to the truths we were discovering — and that
                habit slowly became a community.
              </p>
              <p>
                Today, Bible Lovers is home to readers at every stage of their walk: people opening a Bible
                for the first time, longtime believers looking to go deeper, and everyone in between. We
                publish daily reflections, morning and evening audio devotionals, and a verse of the day,
                because we believe consistency — not intensity — is what actually shapes a life.
              </p>
              <p>
                What ties it all together is a simple conviction: the Bible was never meant to be read
                alone, and it was never meant to stay on the page. It's meant to be discussed, tested against
                real life, and lived out loud. That's the community we're building, and there's a place in it
                for you.
              </p>
            </div>
            <div className="clear-both" />
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white border border-gray-300 rounded-lg shadow-sm overflow-hidden p-6 md:p-10">
            <div className="group relative float-right w-1/2 h-64 md:h-80 ml-6 md:ml-8 mb-4 rounded-lg overflow-hidden border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-300">
              <img
                src={storySection?.imageUrl || '/images/story.png'}
                alt={storySection?.title || 'Our Story'}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <SectionHeader eyebrow="Our Journey" title="Our Story" subtitle="How a simple calling became a community" />
            </div>
            <div className="space-y-5 text-gray-700 leading-relaxed">
              <p className="whitespace-pre-line">
                {storySection?.content ||
                  'Our story began with a passion for God’s Word and a desire to help others experience its life-changing power.'}
              </p>
              <p>
                It started without a website, a logo, or a plan — just a handful of people meeting to talk
                through a chapter of Scripture and admitting, honestly, where it was hard to live out. Those
                conversations were often messier than they were polished, and that turned out to be the
                point: real faith grows in the honest middle, not just in the highlight reel.
              </p>
              <p>
                As more people asked to join, we started writing down what we were learning — short
                reflections, then longer studies, then a verse each morning to anchor the day before it got
                loud. What had been a private habit became something we could share, and sharing it made it
                stronger, not weaker.
              </p>
              <p>
                Along the way we've walked with people through seasons of doubt, grief, celebration, and
                quiet, ordinary faithfulness — the kind that rarely makes headlines but is exactly what the
                Christian life is mostly made of. Every feature we've since built, from daily devotionals to
                a place for prayer requests, grew out of an actual need someone in this community brought to
                us. We're still building that way: one honest conversation at a time.
              </p>
            </div>
            <div className="clear-both" />
          </div>
        </div>
      </section>

      {/* Our Mission */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white border border-gray-300 rounded-lg shadow-sm overflow-hidden p-6 md:p-10">
            <div className="group relative float-left w-1/2 h-64 md:h-80 mr-6 md:mr-8 mb-4 rounded-lg overflow-hidden border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-300">
              <img
                src={missionSection?.imageUrl || '/images/mission.png'}
                alt={missionSection?.title || 'Our Mission'}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <SectionHeader eyebrow="Our Purpose" title="Our Mission" subtitle="What we're committed to, every single day" />
            </div>
            <div className="space-y-5 text-gray-700 leading-relaxed">
              <p className="whitespace-pre-line">
                {missionSection?.content ||
                  'Our mission is to inspire and equip believers to grow deeper in their faith.'}
              </p>
              <p>
                In practice, that mission rests on four commitments we return to constantly. First,
                <strong className="text-gray-900"> teaching</strong> — making Scripture clear and
                accessible, whether that's a five-minute morning devotional or a deeper study of a whole
                book of the Bible. Second, <strong className="text-gray-900">daily rhythm</strong> —
                helping people build a habit of meeting God every morning and closing every evening in His
                presence, rather than treating faith as a once-a-week event.
              </p>
              <p>
                Third, <strong className="text-gray-900">community</strong> — because Scripture keeps
                telling us not to do this alone. Comments, shared reflections, and prayer requests exist so
                that encouragement and accountability are always within reach. Fourth,
                <strong className="text-gray-900"> transformation</strong> — our measure of success was
                never page views. It's changed lives: patience where there used to be anger, generosity
                where there used to be fear, hope where there used to be despair.
              </p>
              <p>
                We take seriously the words of James 1:22 — to be doers of the Word, and not hearers only.
                Everything we build, from the verse of the day to the morning and evening devotionals, is
                aimed at that one outcome: helping you not just know God's truth, but live it out, with
                purpose and with victory.
              </p>
            </div>
            <div className="clear-both" />
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
