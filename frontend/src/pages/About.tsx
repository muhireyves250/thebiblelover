import { useContentSettings } from '../hooks/useContentSettings';
import PageHeader from '../components/PageHeader';
import Newsletter from '../components/Newsletter';

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
    <div className="min-h-screen bg-white relative overflow-hidden">
      <PageHeader title="ABOUT" subtitle="WHO WE ARE" />
      {/* Soft background accents */}
      <div className="pointer-events-none absolute -top-24 -right-24 w-[520px] h-[520px] rounded-full bg-gradient-to-br from-amber-200 via-pink-100 to-transparent opacity-60 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 -left-24 w-[460px] h-[460px] rounded-full bg-gradient-to-tr from-indigo-100 via-teal-50 to-transparent opacity-60 blur-3xl" />
      {/* Intro Section */}
      <section className="bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-serif text-gray-900 mb-4">{aboutSection.title}</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                {aboutSection.content}
              </p>
            </div>
            <div className="rounded overflow-hidden">
              <img
                src={aboutSection.imageUrl || "https://images.pexels.com/photos/3182763/pexels-photo-3182763.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"}
                alt={aboutSection.title}
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
                src={missionSection.imageUrl || "https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"}
                alt={missionSection.title}
                className="w-full h-auto object-cover"
              />
            </div>
            <div className="order-1 md:order-2">
              <h3 className="text-2xl md:text-3xl font-serif text-gray-900 mb-3">{missionSection.title}</h3>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                {missionSection.content}
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
              <h3 className="text-2xl md:text-3xl font-serif text-gray-900 mb-4">{storySection.title}</h3>
              <div className="space-y-4 text-gray-600 leading-relaxed whitespace-pre-line">
                <p>
                  {storySection.content}
                </p>
              </div>
            </div>
            <div className="rounded overflow-hidden">
              <img
                src={storySection.imageUrl || "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"}
                alt={storySection.title}
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