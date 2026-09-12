import { Link, useLocation } from 'react-router-dom';
import { Home, FileText, HandHeart, BookOpenText } from 'lucide-react';

const TABS = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/posts', label: 'Blog', icon: FileText },
  { path: '/prayer-wall', label: 'Prayer', icon: HandHeart },
  { path: '/verses', label: 'Bible Verse', icon: BookOpenText },
];

const MobileBottomNav = () => {
  const location = useLocation();

  return (
    <nav
      className="md:hidden fixed inset-x-3 bottom-0 z-50 pb-[env(safe-area-inset-bottom)]"
      aria-label="Primary"
    >
      <div className="relative flex items-stretch justify-around gap-0.5 px-2 bg-white/95 backdrop-blur-xl rounded-full border-2 border-gray-300 shadow-2xl overflow-hidden">
        <span className="absolute inset-x-6 bottom-0 h-px bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />
        {TABS.map(({ path, label, icon: Icon }) => {
          const isActive = path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);
          return (
            <Link
              key={path}
              to={path}
              className="flex flex-1 items-center justify-center py-1.5 min-w-0"
            >
              <span
                className={`flex w-full flex-col items-center justify-center gap-1 px-2 py-2 rounded-full border-2 bg-white transition-colors ${
                  isActive ? 'border-amber-700 text-amber-700' : 'border-transparent text-gray-600'
                }`}
              >
                <Icon
                  className={`h-5 w-5 transition-colors ${isActive ? 'text-amber-700' : ''}`}
                  strokeWidth={isActive ? 2.75 : 2.25}
                />
                <span
                  className={`text-[10px] tracking-wide truncate transition-colors ${
                    isActive ? 'text-amber-700 font-bold' : 'text-gray-600 font-semibold'
                  }`}
                >
                  {label}
                </span>
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
