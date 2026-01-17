import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import About from './pages/About';
import BlogPost from './pages/BlogPost';
import Donate from './pages/Donate';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';
import Posts from './pages/Posts';
import Search from './pages/Search';
import WhatsAppWidget from './components/WhatsAppWidget';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white">
        <Routes>
          <Route path="/" element={
            <>
              <Header />
              <Home />
              <Footer />
            </>
          } />
          <Route path="/about" element={
            <>
              <Header />
              <About />
              <Footer />
            </>
          } />
          <Route path="/blog/:slug" element={
            <>
              <Header />
              <BlogPost />
              <Footer />
            </>
          } />
          <Route path="/donate" element={
            <>
              <Header />
              <Donate />
              <Footer />
            </>
          } />
          <Route path="/posts" element={
            <>
              <Header />
              <Posts />
              <Footer />
            </>
          } />
          <Route path="/search" element={
            <>
              <Header />
              <Search />
              <Footer />
            </>
          } />
          <Route path="/contact" element={
            <>
              <Header />
              <Contact />
              <Footer />
            </>
          } />

          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="*" element={
            <>
              <Header />
              <NotFound />
              <Footer />
            </>
          } />
        </Routes>
        <WhatsAppWidget />
      </div>
    </Router>
  );
}

export default App;