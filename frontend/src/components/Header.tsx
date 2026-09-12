import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Facebook, Twitter, Menu, X, User as UserIcon, Loader2, FileText, MessageSquare, History, Home, Sun, Moon, Monitor } from 'lucide-react';
import { useLogoSettings } from '../hooks/useLogoSettings';
import IhemaLogo from './IhemaLogo';
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
  const [searchResults, setSearchResults] = useState<{ posts: any[], events?: any[] } | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);

  const { user, isAuthenticated } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const socialLinks = getSocialLinks();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const insideDesktop = dropdownRef.current?.contains(target);
      const insideMobile = mobileSearchRef.current?.contains(target);
      if (!insideDesktop && !insideMobile) {
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
    <header className={`sticky top-0 z-50 transition-all duration-500 border-b-2 border-gray-200 dark:border-gray-800 ${
      scrolled
        ? 'bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl py-1 shadow-2xl'
        : 'bg-white dark:bg-gray-900 py-2 md:py-3'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        {/* Mobile bar: home / search pill / theme / profile / menu */}
        <div className="flex md:hidden items-center gap-2 h-12">
          <Link
            to="/"
            className="shrink-0 p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-600/50"
            aria-label="Home"
          >
            {logoSettings.logoUrl && !logoSettings.showText ? (
              <img src={logoSettings.logoUrl} alt="Logo" className="h-5 w-5 object-contain" />
            ) : (
              <Home className="h-5 w-5" />
            )}
          </Link>

          <div className="relative flex-1" ref={mobileSearchRef}>
            <form onSubmit={handleSearch} className="group relative flex items-center" role="search">
              <input
                type="text"
                placeholder="Search the site..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.trim() && setShowDropdown(true)}
                className="w-full pl-4 pr-11 py-2 text-sm border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-100 dark:active:bg-gray-700 focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700 focus:ring-2 focus:ring-amber-600/50 transition-colors"
                aria-label="Search"
              />
              <button
                type="submit"
                className="absolute right-1 p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-100 dark:active:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-600/50"
                aria-label="Submit search"
              >
                {isSearching ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Search className="h-3.5 w-3.5" />
                )}
              </button>
            </form>

            {/* Quick Results Dropdown */}
            {showDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="max-h-[400px] overflow-y-auto p-2">
                  {isSearching ? (
                    <div className="p-8 text-center">
                      <Loader2 className="h-6 w-6 text-amber-600 animate-spin mx-auto mb-2" />
                      <p className="text-xs text-gray-400">Searching the archives...</p>
                    </div>
                  ) : searchResults?.events && searchResults.events.length > 0 ? (
                    <div>
                      <h3 className="px-3 py-1 text-[10px] font-black uppercase tracking-widest text-gray-400">Gatherings</h3>
                      {searchResults.events.slice(0, 3).map(event => (
                        <Link key={event.id} to="/events" onClick={() => setShowDropdown(false)} className="flex items-center gap-3 p-3 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-colors group mx-1">
                          <div className="p-2 bg-rose-100 dark:bg-rose-900/40 rounded-lg group-hover:bg-white transition-colors border border-transparent group-hover:border-rose-100">
                            <History className="w-4 h-4 text-rose-600" />
                          </div>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">{event.title}</span>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 text-center">
                      <p className="text-sm text-gray-500">No quick results for "{searchQuery}"</p>
                      <button onClick={handleSearch} className="mt-2 text-xs font-bold text-amber-600 hover:underline">View All Results</button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <ThemeToggle />

          <button
            onClick={() => setIsMenuOpen(true)}
            className="shrink-0 p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-600/50"
            aria-label="Open navigation menu"
            aria-expanded={isMenuOpen}
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        <div className="hidden md:flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Link to="/" className="flex items-center space-x-2">
              {logoSettings.logoUrl && logoSettings.showText ? (
                <>
                  <img
                    src={logoSettings.logoUrl}
                    alt="Logo"
                    className="h-8 w-8 object-contain"
                  />
                  <span className="text-2xl font-serif text-gray-900 dark:text-gray-100 tracking-wide">{logoSettings.logoText}</span>
                </>
              ) : logoSettings.logoUrl ? (
                <img
                  src={logoSettings.logoUrl}
                  alt="Logo"
                  className="h-10 object-contain"
                />
              ) : (
                <IhemaLogo />
              )}
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="flex items-center space-x-4 lg:space-x-5">
            {[
              { path: '/', label: 'Home' },
              { path: '/about', label: 'About' },
              { path: '/donate', label: 'Donate' },
              { path: '/contact', label: 'Contact' },
              { path: '/events', label: 'Events' },
              { path: '/prayer-wall', label: 'Prayer Wall' }
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

          <div className="flex items-center space-x-5">
            <div className="relative" ref={dropdownRef}>
              <form onSubmit={handleSearch} className="relative" role="search">
                <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery.trim() && setShowDropdown(true)}
                  className="pl-9 pr-4 py-1.5 text-xs border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-amber-500/50 focus:border-transparent w-24 md:w-32 transition-all focus:w-32 md:focus:w-48"
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
                className="p-1 rounded focus:outline-none focus:ring-2 focus:ring-amber-600/50"
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
                className="p-1 rounded focus:outline-none focus:ring-2 focus:ring-amber-600/50"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5 text-gray-700 hover:text-amber-700 transition-colors" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Mobile slide-out drawer */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[60]">
          <div
            className="absolute inset-0 bg-black/50 animate-in fade-in duration-200"
            onClick={() => setIsMenuOpen(false)}
          />
          <div className="absolute inset-y-0 right-0 w-80 max-w-[88vw] bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between px-5 py-5 border-b border-gray-100">
              <Link to="/" onClick={() => setIsMenuOpen(false)} className="flex items-center space-x-2">
                {logoSettings.logoUrl && logoSettings.showText ? (
                  <>
                    <img src={logoSettings.logoUrl} alt="Logo" className="h-7 w-7 object-contain" />
                    <span className="text-lg font-serif text-gray-900 tracking-wide">{logoSettings.logoText}</span>
                  </>
                ) : logoSettings.logoUrl ? (
                  <img src={logoSettings.logoUrl} alt="Logo" className="h-8 object-contain" />
                ) : (
                  <IhemaLogo />
                )}
              </Link>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 -mr-2 focus:outline-none focus:ring-2 focus:ring-amber-600/50 rounded text-gray-400 hover:text-gray-600"
                aria-label="Close navigation menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-6 py-2 flex flex-col">
              {[
                { path: '/', label: 'Home' },
                { path: '/about', label: 'About' },
                { path: '/posts', label: 'Blog' },
                { path: '/watch', label: 'Watch' },
                { path: '/verses', label: 'Bible Verses' },
                { path: '/prayer-wall', label: 'Prayer Wall' },
                { path: '/events', label: 'Events' },
                { path: '/contact', label: 'Contact' },
              ].map((link) => {
                const isActive = link.path === '/' ? location.pathname === '/' : location.pathname.startsWith(link.path);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`py-3 text-base transition-colors ${
                      isActive ? 'text-amber-700 font-bold' : 'text-gray-700 hover:text-amber-700'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}

              <div className="my-4 border-t border-gray-100" />

              {isAuthenticated ? (
                <Link
                  to={isAdmin ? '/dashboard' : '/member-dashboard'}
                  onClick={() => setIsMenuOpen(false)}
                  className="py-3 text-base text-gray-700 hover:text-amber-700 transition-colors"
                >
                  {isAdmin ? 'Admin' : (user?.name || 'My Profile')}
                </Link>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="py-3 text-base text-gray-700 hover:text-amber-700 transition-colors"
                >
                  Log In
                </Link>
              )}

              <Link
                to="/register"
                onClick={() => setIsMenuOpen(false)}
                className="mt-3 w-full text-center px-5 py-3 rounded-md bg-amber-700 hover:bg-amber-800 text-white font-bold text-sm transition-colors"
              >
                Join the Family
              </Link>

              <div className="my-5 border-t border-gray-100" />

              <div className="flex items-center justify-between pb-4">
                <span className="text-sm text-gray-500">Appearance</span>
                <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-full p-1">
                  <span className="p-1.5 rounded-full text-gray-400" aria-label="Light (coming soon)">
                    <Sun className="w-3.5 h-3.5" />
                  </span>
                  <span className="p-1.5 rounded-full bg-white shadow-sm text-amber-700" aria-label="Dark (coming soon)">
                    <Moon className="w-3.5 h-3.5" />
                  </span>
                  <span className="p-1.5 rounded-full text-gray-400" aria-label="System (coming soon)">
                    <Monitor className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;