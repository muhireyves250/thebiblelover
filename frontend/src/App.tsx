import { useEffect } from 'react';
import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import PageTransition from './components/PageTransition';

// Simple PageView Tracker
const PageViewTracker = () => {
  const location = useLocation();

  useEffect(() => {
    console.log(`[Analytics] Page View: ${location.pathname + location.search}`);
  }, [location]);

  return null;
};

// Scroll to top on every navigation. Ordinarily a full route remount does
// this implicitly, but detail pages (blog posts, episodes, verses, events)
// intentionally stay mounted when their dynamic param changes (see
// routeKey below) to preserve their sticky sidebar - so without this,
// clicking a related-item link would leave the scroll position wherever
// it was on the previous item instead of jumping back to the top.
const ScrollToTop = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return null;
};

import Header from './components/Header';
import Footer from './components/Footer';
import Hero from './components/Hero';
import PageHeader from './components/PageHeader';
import Announcements from './components/Announcements';
import MobileBottomNav from './components/MobileBottomNav';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';

// Lazy load all other pages
const About = lazy(() => import('./pages/About'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
const Donate = lazy(() => import('./pages/Donate'));
const Contact = lazy(() => import('./pages/Contact'));
const Login = lazy(() => import('./pages/Login'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Players = lazy(() => import('./pages/Players'));
const PlayerDetail = lazy(() => import('./pages/PlayerDetail'));
const Verses = lazy(() => import('./pages/Verses'));
const VerseDetail = lazy(() => import('./pages/VerseDetail'));
const Posts = lazy(() => import('./pages/Posts'));
const Search = lazy(() => import('./pages/Search'));
const PrayerWall = lazy(() => import('./pages/PrayerWall'));
const Events = lazy(() => import('./pages/Events'));
const Videos = lazy(() => import('./pages/Videos'));
const EventDetail = lazy(() => import('./pages/EventDetail'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Terms = lazy(() => import('./pages/Terms'));
const Privacy = lazy(() => import('./pages/Privacy'));
import WhatsAppWidget from './components/WhatsAppWidget';

// Lazy load heavy components
const Dashboard = lazy(() => import('./pages/Dashboard'));
const MemberDashboard = lazy(() => import('./pages/MemberDashboard'));

// Loading component for Suspense - only ever covers the routed content
// area now (Header/Footer are outside this), so a lazy chunk load never
// blanks out the whole page.
const PageLoader = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
  </div>
);

// Routes with no site chrome at all (auth flows, admin dashboard) - every
// other route gets the persistent Header/Footer below.
const BARE_LAYOUT_PATHS = ['/register', '/forgot-password', '/reset-password', '/dashboard'];

// Home and About render their own Announcements inline, positioned inside
// their own content rather than always right above the footer.
const OWN_ANNOUNCEMENTS_PATHS = ['/', '/about'];

// Every page whose hero banner is just a title/subtitle over the site's
// background image - rendered once at the shell level (like Header/Hero/
// Footer) so it never unmounts/refades on navigation between them, only
// the title and subtitle swap.
const PAGE_HEADERS: Record<string, { title: string; subtitle: string }> = {
  '/about': { title: 'ABOUT', subtitle: 'WHO WE ARE' },
  '/donate': { title: 'Support the Word', subtitle: 'FOSTERING FAITH THROUGH YOUR GENEROSITY' },
  '/contact': { title: 'CONTACT', subtitle: 'GET IN TOUCH' },
  '/events': { title: 'Community Calendar', subtitle: 'Join us as we grow together in faith, knowledge, and fellowship.' },
  '/prayer-wall': { title: 'Community Prayer Wall', subtitle: 'A sacred space to share burdens and lift each other up in prayer.' },
  '/watch': { title: 'Watch', subtitle: 'LIVE STREAMS & VIDEOS' },
  '/login': { title: 'Sign In', subtitle: 'WELCOME BACK TO THE COMMUNITY' },
  '/terms': { title: 'Terms of Service', subtitle: 'WALKING TOGETHER IN UNITY' },
  '/privacy': { title: 'Privacy Policy', subtitle: 'PROTECTING YOUR SPIRITUAL DATA' },
};

function AppContent() {
  const location = useLocation();
  // Key by pathname so navigating between different pages replays the page
  // transition - EXCEPT for detail pages with their own sticky sidebar
  // (blog posts, episodes, verses, events), where keying by the full
  // pathname would remount the whole page (sidebar included) every time the
  // dynamic param changes, defeating the sidebar's sticky/in-place behavior.
  const detailRoutePrefixes = ['/blog/', '/players/', '/verses/', '/events/'];
  const matchedDetailPrefix = detailRoutePrefixes.find(prefix => location.pathname.startsWith(prefix));
  const routeKey = matchedDetailPrefix ? `${matchedDetailPrefix}:id` : location.pathname;

  const isBareLayout = BARE_LAYOUT_PATHS.includes(location.pathname);
  const showAnnouncements = !isBareLayout && !OWN_ANNOUNCEMENTS_PATHS.includes(location.pathname);
  const pageHeader = PAGE_HEADERS[location.pathname];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
      {/* Header, Hero (on the homepage) and Footer sit outside the animated/
          keyed route tree so they never unmount on navigation - only the
          routed content below swaps (and shows its own loading skeleton),
          not the whole page. Hero is desktop-only; on mobile the header
          goes straight into page content, and a fixed bottom tab bar
          takes over primary navigation instead of the footer. */}
      {!isBareLayout && <Header />}
      {/* On mobile the ticker always sits directly under the header, on
          every page - desktop keeps its per-page placement (inline on
          Home/About, just above the footer everywhere else). */}
      {!isBareLayout && <div className="md:hidden"><Announcements /></div>}
      {location.pathname === '/' && <div className="hidden md:block"><Hero /></div>}
      {pageHeader && <PageHeader title={pageHeader.title} subtitle={pageHeader.subtitle} />}
      <Suspense fallback={<PageLoader />}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={routeKey}>
            <Route path="/" element={<PageTransition><Home /></PageTransition>} />
            <Route path="/about" element={<PageTransition><About /></PageTransition>} />
            <Route path="/blog/:slug" element={<PageTransition><BlogPost /></PageTransition>} />
            <Route path="/donate" element={<PageTransition><Donate /></PageTransition>} />
            <Route path="/posts" element={<PageTransition><Posts /></PageTransition>} />
            <Route path="/players" element={<PageTransition><Players /></PageTransition>} />
            <Route path="/players/:id" element={<PageTransition><PlayerDetail /></PageTransition>} />
            <Route path="/verses" element={<PageTransition><Verses /></PageTransition>} />
            <Route path="/verses/:id" element={<PageTransition><VerseDetail /></PageTransition>} />
            <Route path="/search" element={<PageTransition><Search /></PageTransition>} />
            <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
            <Route path="/prayer-wall" element={<PageTransition><PrayerWall /></PageTransition>} />
            <Route path="/events" element={<PageTransition><Events /></PageTransition>} />
            <Route path="/events/:id" element={<PageTransition><EventDetail /></PageTransition>} />
            <Route path="/watch" element={<PageTransition><Videos /></PageTransition>} />
            <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
            <Route path="/register" element={<PageTransition><Register /></PageTransition>} />
            <Route path="/forgot-password" element={<PageTransition><ForgotPassword /></PageTransition>} />
            <Route path="/reset-password" element={<PageTransition><ResetPassword /></PageTransition>} />
            <Route path="/terms" element={<PageTransition><Terms /></PageTransition>} />
            <Route path="/privacy" element={<PageTransition><Privacy /></PageTransition>} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <PageTransition><Dashboard /></PageTransition>
              </ProtectedRoute>
            } />
            <Route path="/member-dashboard" element={
              <ProtectedRoute>
                <PageTransition><MemberDashboard /></PageTransition>
              </ProtectedRoute>
            } />
            <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
          </Routes>
        </AnimatePresence>
      </Suspense>
      {showAnnouncements && <div className="hidden md:block"><Announcements /></div>}
      {!isBareLayout && <div className="hidden md:block"><Footer /></div>}
      {!isBareLayout && <div className="md:hidden h-16" aria-hidden="true" />}
      {!isBareLayout && <MobileBottomNav />}
      <WhatsAppWidget />
    </div>
  );
}

function App() {
  return (
    <Router>
      <PageViewTracker />
      <ScrollToTop />
      <AppContent />
    </Router>
  );
}

export default App;
