import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, Search, Facebook, Twitter, Menu, X } from 'lucide-react';
import { useLogoSettings } from '../hooks/useLogoSettings';
import { useSocialSettings } from '../hooks/useSocialSettings';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { logoSettings } = useLogoSettings();
  const { getSocialLinks } = useSocialSettings();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const socialLinks = getSocialLinks();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setIsMenuOpen(false);
    }
  };

  return (
    <header className="bg-white sticky top-0 z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Link to="/" className="flex items-center space-x-2">
              {logoSettings.logoUrl && logoSettings.showText ? (
                <>
                  <img
                    src={logoSettings.logoUrl}
                    alt="Logo"
                    className="h-7 w-7 md:h-8 md:w-8 object-contain"
                  />
                  <span className="text-xl md:text-2xl font-serif text-gray-900 tracking-wide">{logoSettings.logoText}</span>
                </>
              ) : logoSettings.logoUrl ? (
                <img
                  src={logoSettings.logoUrl}
                  alt="Logo"
                  className="h-8 md:h-10 object-contain"
                />
              ) : (
                <>
                  <BookOpen className="h-7 w-7 md:h-8 md:w-8 text-amber-700" />
                  <span className="text-xl md:text-2xl font-serif text-gray-900 tracking-wide">{logoSettings.logoText}</span>
                </>
              )}
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8 md:space-x-10">
            <Link
              to="/"
              className={`text-sm md:text-base tracking-wide transition-colors ${location.pathname === '/' ? 'text-amber-700' : 'text-gray-700 hover:text-amber-700'
                }`}
            >
              Home
            </Link>
            <Link
              to="/about"
              className={`text-sm md:text-base tracking-wide transition-colors ${location.pathname === '/about' ? 'text-amber-700' : 'text-gray-700 hover:text-amber-700'
                }`}
            >
              About
            </Link>
            <Link
              to="/donate"
              className={`text-sm md:text-base tracking-wide transition-colors ${location.pathname === '/donate' ? 'text-amber-700' : 'text-gray-700 hover:text-amber-700'
                }`}
            >
              Donate
            </Link>
            <Link
              to="/contact"
              className={`text-sm md:text-base tracking-wide transition-colors ${location.pathname === '/contact' ? 'text-amber-700' : 'text-gray-700 hover:text-amber-700'
                }`}
            >
              Contact
            </Link>
          </nav>

          {/* Search and Social */}
          <div className="hidden md:flex items-center space-x-5">
            <form onSubmit={handleSearch} className="relative" role="search">
              <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-amber-500 focus:border-transparent w-40 md:w-56"
                aria-label="Search"
              />
            </form>
            {socialLinks.facebook !== '#' && (
              <a
                href={socialLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 rounded focus:outline-none focus:ring-2 focus:ring-amber-600"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5 text-gray-700 hover:text-amber-700 transition-colors" />
              </a>
            )}
            {socialLinks.twitter !== '#' && (
              <a
                href={socialLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 rounded focus:outline-none focus:ring-2 focus:ring-amber-600"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5 text-gray-700 hover:text-amber-700 transition-colors" />
              </a>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 focus:outline-none focus:ring-2 focus:ring-amber-600 rounded"
            aria-label="Toggle navigation menu"
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col space-y-4">
              <Link to="/" className="text-gray-700 hover:text-amber-700 transition-colors text-sm">Home</Link>
              <Link to="/about" className="text-gray-700 hover:text-amber-700 transition-colors text-sm">About</Link>
              <Link to="/donate" className="text-gray-700 hover:text-amber-700 transition-colors text-sm">Donate</Link>
              <Link to="/contact" className="text-gray-700 hover:text-amber-700 transition-colors text-sm">Contact</Link>
              <div className="flex items-center space-x-4 pt-4">
                {socialLinks.facebook !== '#' && (
                  <a
                    href={socialLinks.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-amber-700 transition-colors"
                    aria-label="Facebook"
                  >
                    <Facebook className="h-4 w-4" />
                  </a>
                )}
                {socialLinks.twitter !== '#' && (
                  <a
                    href={socialLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-amber-700 transition-colors"
                    aria-label="Twitter"
                  >
                    <Twitter className="h-4 w-4" />
                  </a>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;