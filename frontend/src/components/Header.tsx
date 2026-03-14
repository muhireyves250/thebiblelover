import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, Search, Facebook, Twitter, Menu, X, User as UserIcon, Loader2, FileText, MessageSquare, History } from 'lucide-react';
import { useLogoSettings } from '../hooks/useLogoSettings';
import { useSocialSettings } from '../hooks/useSocialSettings';
import ThemeToggle from './ThemeToggle';
import NotificationCenter from './NotificationCenter';
import { useAuth } from '../hooks/useAPI';
import { authAPI, searchAPI } from '../services/api';

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { logoSettings } = useLogoSettings();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  const { getSocialLinks } = useSocialSettings();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ posts: any[], topics: any[], devotionals: any[] } | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { user, isAuthenticated } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const socialLinks = getSocialLinks();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      setIsSearching(false);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      setShowDropdown(true);
      try {
        const response = await searchAPI.search(searchQuery);
        if (response.success && response.data) {
          setSearchResults(response.data);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setIsMenuOpen(false);
      setShowDropdown(false);
    }
  };

  return (
    <header className={`sticky top-0 z-50 transition-all duration-500 ${
      scrolled 
        ? 'bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border-b border-white/20 dark:border-gray-800 py-1 shadow-2xl' 
        : 'bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 py-3'
    }`}>
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
                  <span className="text-xl md:text-2xl font-serif text-gray-900 dark:text-gray-100 tracking-wide">{logoSettings.logoText}</span>
                </>
              ) : logoSettings.logoUrl ? (
                <img
                  src={logoSettings.logoUrl}
                  alt="Logo"
                  className="h-8 md:h-10 object-contain"
                />
              ) : (
                <>
                  <BookOpen className="h-7 w-7 md:h-8 md:w-8 text-amber-700 dark:text-amber-500" />
                  <span className="text-xl md:text-2xl font-serif text-gray-900 dark:text-gray-100 tracking-wide">{logoSettings.logoText}</span>
                </>
              )}
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4 lg:space-x-5">
            {[
              { path: '/', label: 'Home' },
              { path: '/devotional', label: 'Devotional' },
              { path: '/about', label: 'About' },
              { path: '/donate', label: 'Donate' },
              { path: '/contact', label: 'Contact' },
              { path: '/events', label: 'Events' },
              { path: '/prayer-wall', label: 'Prayer Wall' },
              { path: '/forum', label: 'Forum' }
            ].map((link) => {
              const isActive = link.path === '/' 
                ? location.pathname === '/' 
                : location.pathname.startsWith(link.path);
              
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative text-sm font-semibold tracking-wide transition-all duration-300 px-2 py-1 whitespace-nowrap ${
                    isActive 
                      ? 'text-amber-700 dark:text-amber-500' 
                      : 'text-gray-600 dark:text-gray-400 hover:text-amber-700 dark:hover:text-amber-500'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <div className="absolute -bottom-1 left-2 right-2 h-0.5 bg-amber-600 rounded-full animate-in fade-in slide-in-from-bottom-1 duration-300"></div>
                  )}
                </Link>
              );
            })}
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <NotificationCenter />
                <Link
                  to={isAdmin ? "/dashboard" : "/member-dashboard"}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-xl text-sm font-bold hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-all border border-amber-100 dark:border-amber-800 whitespace-nowrap"
                >
                  <UserIcon className="w-4 h-4" />
                  {isAdmin ? "Admin" : (user?.name || "My Profile")}
                </Link>
              </div>
            ) : (
              <Link
                to="/login"
                className="text-sm font-bold text-gray-700 dark:text-gray-300 hover:text-amber-700 dark:hover:text-amber-500 transition-colors"
              >
                Sign In
              </Link>
            )}
          </nav>

          <div className="hidden md:flex items-center space-x-5">
            <div className="relative" ref={dropdownRef}>
              <form onSubmit={handleSearch} className="relative" role="search">
                <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery.trim() && setShowDropdown(true)}
                  className="pl-9 pr-4 py-1.5 text-xs border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-md focus:ring-1 focus:ring-amber-500 focus:border-transparent w-24 md:w-32 transition-all focus:w-32 md:focus:w-48"
                  aria-label="Search"
                />
                {isSearching && (
                  <Loader2 className="h-3 w-3 text-amber-600 absolute right-3 top-1/2 transform -translate-y-1/2 animate-spin" />
                )}
              </form>

              {/* Quick Results Dropdown */}
              {showDropdown && (
                <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="max-h-[400px] overflow-y-auto p-2">
                    {isSearching ? (
                      <div className="p-8 text-center">
                        <Loader2 className="h-6 w-6 text-amber-600 animate-spin mx-auto mb-2" />
                        <p className="text-xs text-gray-400">Searching the archives...</p>
                      </div>
                    ) : searchResults ? (
                      <div className="space-y-4">
                        {searchResults.devotionals.length > 0 && (
                          <div>
                            <h3 className="px-3 py-1 text-[10px] font-black uppercase tracking-widest text-gray-400">Archived Manna</h3>
                            {searchResults.devotionals.slice(0, 3).map(dev => (
                              <Link key={dev.id} to={`/devotional?id=${dev.id}`} onClick={() => setShowDropdown(false)} className="flex items-center gap-3 p-3 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl transition-colors group mx-1">
                                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/40 rounded-lg group-hover:bg-white transition-colors border border-transparent group-hover:border-emerald-100">
                                  <BookOpen className="w-4 h-4 text-emerald-600" />
                                </div>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">{dev.title}</span>
                              </Link>
                            ))}
                          </div>
                        )}
                        {searchResults.events && searchResults.events.length > 0 && (
                          <div>
                            <h3 className="px-3 py-1 text-[10px] font-black uppercase tracking-widest text-gray-400">Gatherings</h3>
                            {searchResults.events.slice(0, 3).map(event => (
                              <Link key={event.id} to={`/events`} onClick={() => setShowDropdown(false)} className="flex items-center gap-3 p-3 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-colors group mx-1">
                                <div className="p-2 bg-rose-100 dark:bg-rose-900/40 rounded-lg group-hover:bg-white transition-colors border border-transparent group-hover:border-rose-100">
                                  <History className="w-4 h-4 text-rose-600" />
                                </div>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">{event.title}</span>
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-8 text-center">
                        <p className="text-sm text-gray-500">No quick results for "{searchQuery}"</p>
                        <button onClick={handleSearch} className="mt-2 text-xs font-bold text-amber-600 hover:underline">View All Results</button>
                      </div>
                    )}
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800">
                    <button onClick={handleSearch} className="w-full py-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-amber-600 transition-colors">
                      Full Search Experience
                    </button>
                  </div>
                </div>
              )}
            </div>
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

          <div className="flex items-center space-x-3 md:hidden">
            <ThemeToggle />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 focus:outline-none focus:ring-2 focus:ring-amber-600 rounded text-gray-700 dark:text-gray-300"
              aria-label="Toggle navigation menu"
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col space-y-4">
              <Link to="/" className="text-gray-700 dark:text-gray-300 hover:text-amber-700 dark:hover:text-amber-500 transition-colors text-sm">Home</Link>
              <Link to="/about" className="text-gray-700 dark:text-gray-300 hover:text-amber-700 dark:hover:text-amber-500 transition-colors text-sm">About</Link>
              <Link to="/donate" className="text-gray-700 dark:text-gray-300 hover:text-amber-700 dark:hover:text-amber-500 transition-colors text-sm">Donate</Link>
              <Link to="/contact" className="text-gray-700 dark:text-gray-300 hover:text-amber-700 dark:hover:text-amber-500 transition-colors text-sm">Contact</Link>
              <Link to="/prayer-wall" className="text-gray-700 dark:text-gray-300 hover:text-amber-700 dark:hover:text-amber-500 transition-colors text-sm">Prayer Wall</Link>
              <Link to="/forum" className="text-gray-700 dark:text-gray-300 hover:text-amber-700 dark:hover:text-amber-500 transition-colors text-sm">Forum</Link>
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