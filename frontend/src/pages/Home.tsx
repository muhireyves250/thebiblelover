import Hero from '../components/Hero';
import BlogGrid from '../components/BlogGrid';
import Newsletter from '../components/Newsletter';
import BibleVerseShareModal from '../components/BibleVerseShareModal';
import { Link } from 'react-router-dom';
import { useBibleVerse } from '../hooks/useBibleVerse';
import { useContentSettings } from '../hooks/useContentSettings';
import { useState } from 'react';

const Home = () => {
  const { verse, loading, error, shareVerse } = useBibleVerse();
  const { settings } = useContentSettings();
  const { aboutSection, storySection, missionSection } = settings;
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareData, setShareData] = useState<any>(null);
  const [isSharing, setIsSharing] = useState(false);

  const handleShare = async () => {
    if (verse) {
      try {
        setIsSharing(true);
        const result = await shareVerse(verse.id, 'COPY_LINK');
        if (result.success && result.data) {
          setShareData(result.data);
          setIsShareModalOpen(true);
        } else {
          console.error('Failed to share verse:', result.error);
          alert('Failed to prepare sharing. Please try again.');
        }
      } catch (err) {
        console.error('Error sharing verse:', err);
        alert('An unexpected error occurred. Please try again.');
      } finally {
        setIsSharing(false);
      }
    }
  };

  return (
    <>
      <Hero />
      <BlogGrid limit={6} showViewAll />

      {/* Bible Verse Section */}
      <section className="py-20 bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 relative overflow-hidden" style={{ backgroundImage: "url('https://images.pexels.com/photos/3182763/pexels-photo-3182763.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')", backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed" }}>
        {/* Overlay for readability */}
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 items-center">
            {/* Left side - Professional image with verse overlay */}
            <div className="relative group">
              <div className="relative overflow-hidden rounded-lg shadow-2xl hover:shadow-3xl transition-all duration-700 ease-out group-hover:scale-[1.02] bible-verse-photo">
                {/* Professional mountain background image */}
                <div
                  className="h-96 bg-cover bg-center bg-no-repeat relative overflow-hidden transition-all duration-700 ease-out group-hover:scale-110"
                  style={{
                    backgroundImage: verse?.image
                      ? `url('${verse.image}?t=${Date.now()}')`
                      : "url('https://images.pexels.com/photos/3182763/pexels-photo-3182763.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')"
                  }}
                >
                  {/* Professional overlay effect */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out"></div>

                  {/* Subtle shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>

                  {/* Subtle vignette on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-600 ease-out"></div>
                </div>
              </div>
            </div>

            {/* Right side - White card */}
            <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-500 ease-out group-hover:scale-[1.01]">
              <div className="flex items-center mb-6 group/header">
                <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center mr-3 group-hover/header:scale-110 group-hover/header:rotate-12 transition-all duration-300 ease-out">
                  <svg className="w-4 h-4 text-yellow-600 group-hover/header:text-yellow-700 transition-colors duration-300 ease-out" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-800 group-hover/header:text-gray-700 transition-colors duration-300 ease-out">VERSE OF THE DAY</h2>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-700"></div>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Unable to load Bible verse</p>
                </div>
              ) : verse ? (
                <>
                  <blockquote className="text-gray-700 text-lg leading-relaxed mb-4">
                    "{verse.verse}"
                  </blockquote>

                  <p className="text-sm text-gray-500 mb-6">{verse.reference} ({verse.translation})</p>

                  {/* Centered share button */}
                  <div className="flex justify-center">
                    <button
                      onClick={handleShare}
                      disabled={isSharing}
                      className={`group relative flex items-center px-6 py-3 bg-gray-900 text-white rounded-full shadow-lg hover:bg-gray-800 hover:shadow-xl hover:shadow-gray-900/25 transition-all duration-300 font-medium overflow-hidden hover:scale-105 transform ${isSharing ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      {/* Animated background gradient */}
                      <div className="absolute inset-0 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out rounded-full"></div>

                      {/* Icon with rotation effect */}
                      <svg className={`w-5 h-5 mr-2 relative z-10 group-hover:rotate-12 transition-transform duration-300 ease-out ${isSharing ? 'animate-spin' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                        {isSharing ? (
                          <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 110 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                        ) : (
                          <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3 3 0 000-1.38l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                        )}
                      </svg>

                      {/* Text with subtle animation */}
                      <span className="relative z-10 group-hover:translate-x-0.5 transition-transform duration-300 ease-out">
                        {isSharing ? 'Sharing...' : 'Share'}
                      </span>

                      {/* Ripple effect on click */}
                      <div className="absolute inset-0 rounded-full bg-white opacity-0 group-active:opacity-20 group-active:scale-150 transition-all duration-150 ease-out"></div>
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No Bible verse available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* About snippet */}
      <section className="py-20 bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 relative overflow-hidden">
        {/* Professional hexagonal pattern */}
        <div className="absolute inset-0 opacity-6">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2280%22%20height%3D%2280%22%20viewBox%3D%220%200%2080%2080%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23374151%22%20fill-opacity%3D%220.08%22%3E%3Cpath%20d%3D%22M40%2040c0-11.046-8.954-20-20-20s-20%208.954-20%2020%208.954%2020%2020%2020%2020-8.954%2020-20zm20%200c0-11.046-8.954-20-20-20s-20%208.954-20%2020%208.954%2020%2020%2020%2020-8.954%2020-20z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
        </div>
        {/* Subtle accent elements */}
        <div className="absolute top-8 right-8 w-32 h-32 bg-gradient-to-br from-slate-200 to-gray-300 rounded-full opacity-10 blur-2xl"></div>
        <div className="absolute bottom-8 left-8 w-24 h-24 bg-gradient-to-br from-gray-200 to-slate-300 rounded-full opacity-15 blur-xl"></div>
        <div className="absolute top-1/3 left-1/4 w-16 h-16 bg-gradient-to-br from-slate-300 to-gray-400 rounded-full opacity-8 blur-lg"></div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
            <div>
              <h2 className="text-3xl font-serif text-gray-900 mb-3">{aboutSection.title}</h2>
              <p className="text-gray-600 leading-relaxed mb-4 whitespace-pre-line">
                {aboutSection.content}
              </p>
              <Link to="/about" className="inline-block px-5 py-2 rounded-md bg-amber-700 text-white hover:bg-amber-800">Learn More</Link>
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

      {/* Our Story Section */}
      <section className="py-20 bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 relative overflow-hidden" style={{ backgroundImage: "url('https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')", backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed" }}>
        {/* Overlay for readability */}
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
            <div className="rounded overflow-hidden order-2 md:order-1">
              <img
                src={storySection.imageUrl || "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"}
                alt={storySection.title}
                className="w-full h-auto object-cover"
              />
            </div>
            <div className="order-1 md:order-2">
              <h2 className="text-3xl font-serif text-gray-900 mb-4">{storySection.title}</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                {storySection.content}
              </p>
              <Link to="/about" className="inline-block mt-6 px-5 py-2 rounded-md bg-amber-700 text-white hover:bg-amber-800">Learn More</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Values Section */}
      <section className="py-20 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 relative overflow-hidden">
        {/* Professional hexagonal pattern */}
        <div className="absolute inset-0 opacity-6">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2280%22%20height%3D%2280%22%20viewBox%3D%220%200%2080%2080%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23059669%22%20fill-opacity%3D%220.08%22%3E%3Cpath%20d%3D%22M40%2040c0-11.046-8.954-20-20-20s-20%208.954-20%2020%208.954%2020%2020%2020%2020-8.954%2020-20zm20%200c0-11.046-8.954-20-20-20s-20%208.954-20%2020%208.954%2020%2020%2020%2020-8.954%2020-20z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
        </div>
        {/* Floating organic shapes */}
        <div className="absolute top-12 right-12 w-32 h-32 bg-gradient-to-br from-emerald-200 to-teal-200 rounded-full opacity-12 blur-2xl"></div>
        <div className="absolute bottom-12 left-12 w-24 h-24 bg-gradient-to-br from-cyan-200 to-emerald-200 rounded-full opacity-18 blur-xl"></div>
        <div className="absolute top-1/3 left-1/3 w-18 h-18 bg-gradient-to-br from-teal-200 to-cyan-200 rounded-full opacity-10 blur-lg"></div>
        <div className="absolute top-2/3 right-1/4 w-12 h-12 bg-gradient-to-br from-emerald-200 to-teal-200 rounded-full opacity-15 blur-md"></div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
            <div>
              <h2 className="text-3xl font-serif text-gray-900 mb-4">{missionSection.title}</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                {missionSection.content}
              </p>
              <Link to="/about" className="inline-block mt-6 px-5 py-2 rounded-md bg-amber-700 text-white hover:bg-amber-800">Learn More</Link>
            </div>
            <div className="rounded overflow-hidden">
              <img
                src={missionSection.imageUrl || "https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"}
                alt={missionSection.title}
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <Newsletter />

      {/* Bible Verse Share Modal */}
      {verse && (
        <BibleVerseShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          verse={{
            id: verse.id,
            verse: verse.verse,
            reference: verse.reference,
            translation: verse.translation,
            image: verse.image
          }}
          shareData={shareData}
        />
      )}
    </>
  );
};

export default Home;