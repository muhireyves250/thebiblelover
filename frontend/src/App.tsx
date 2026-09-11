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

import Header from './components/Header';
import Footer from './components/Footer';
import Announcements from './components/Announcements';
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

// Loading component for Suspense
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
  </div>
);

function AppContent() {
  const location = useLocation();
  // Key by pathname so navigating between different pages replays the page
  // transition - EXCEPT for /blog/:slug, where keying by the full pathname
  // would remount the entire BlogPost page (sidebar included) every time the
  // slug changes, defeating its sticky sidebar / cached-loading behavior.
  const routeKey = location.pathname.startsWith('/blog/') ? '/blog/:slug' : location.pathname;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
      <Suspense fallback={<PageLoader />}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={routeKey}>
            <Route path="/" element={
              <PageTransition>
                <Header />
                <Home />
                <Footer />
              </PageTransition>
            } />
            <Route path="/about" element={
              <PageTransition>
                <Header />
                <About />
                <Footer />
              </PageTransition>
            } />
            <Route path="/blog/:slug" element={
              <PageTransition>
                <Header />
                <Announcements />
                <BlogPost />
                <Footer />
              </PageTransition>
            } />
            <Route path="/donate" element={
              <PageTransition>
                <Header />
                <Announcements />
                <Donate />
                <Footer />
              </PageTransition>
            } />
            <Route path="/posts" element={
              <PageTransition>
                <Header />
                <Announcements />
                <Posts />
                <Footer />
              </PageTransition>
            } />
            <Route path="/players" element={
              <PageTransition>
                <Header />
                <Announcements />
                <Players />
                <Footer />
              </PageTransition>
            } />
            <Route path="/players/:id" element={
              <PageTransition>
                <Header />
                <Announcements />
                <PlayerDetail />
                <Footer />
              </PageTransition>
            } />
            <Route path="/verses" element={
              <PageTransition>
                <Header />
                <Announcements />
                <Verses />
                <Footer />
              </PageTransition>
            } />
            <Route path="/verses/:id" element={
              <PageTransition>
                <Header />
                <Announcements />
                <VerseDetail />
                <Footer />
              </PageTransition>
            } />
            <Route path="/search" element={
              <PageTransition>
                <Header />
                <Announcements />
                <Search />
                <Footer />
              </PageTransition>
            } />
            <Route path="/contact" element={
              <PageTransition>
                <Header />
                <Announcements />
                <Contact />
                <Footer />
              </PageTransition>
            } />
            <Route path="/prayer-wall" element={
              <PageTransition>
                <Header />
                <Announcements />
                <PrayerWall />
                <Footer />
              </PageTransition>
            } />

            <Route path="/events" element={
              <PageTransition>
                <Header />
                <Announcements />
                <Events />
                <Footer />
              </PageTransition>
            } />
            <Route path="/events/:id" element={
              <PageTransition>
                <Header />
                <Announcements />
                <EventDetail />
                <Footer />
              </PageTransition>
            } />

            <Route path="/login" element={
              <PageTransition>
                <Header />
                <Announcements />
                <Login />
                <Footer />
              </PageTransition>
            } />
            <Route path="/register" element={
              <PageTransition>
                <Register />
              </PageTransition>
            } />
            <Route path="/forgot-password" element={
              <PageTransition>
                <ForgotPassword />
              </PageTransition>
            } />
            <Route path="/reset-password" element={
              <PageTransition>
                <ResetPassword />
              </PageTransition>
            } />
            <Route path="/terms" element={
              <PageTransition>
                <Header />
                <Announcements />
                <Terms />
                <Footer />
              </PageTransition>
            } />
            <Route path="/privacy" element={
              <PageTransition>
                <Header />
                <Announcements />
                <Privacy />
                <Footer />
              </PageTransition>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <PageTransition>
                  <Dashboard />
                </PageTransition>
              </ProtectedRoute>
            } />
            <Route path="/member-dashboard" element={
              <ProtectedRoute>
                <PageTransition>
                  <Header />
                  <Announcements />
                  <MemberDashboard />
                  <Footer />
                </PageTransition>
              </ProtectedRoute>
            } />
            <Route path="*" element={
              <PageTransition>
                <Header />
                <Announcements />
                <NotFound />
                <Footer />
              </PageTransition>
            } />
          </Routes>
        </AnimatePresence>
      </Suspense>
      <WhatsAppWidget />
    </div>
  );
}

function App() {
  return (
    <Router>
      <PageViewTracker />
      <AppContent />
    </Router>
  );
}

export default App;