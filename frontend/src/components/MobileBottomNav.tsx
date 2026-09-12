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
      className="md:hidden fixed inset-x-3 z-50 bottom-[calc(0.75rem+env(safe-area-inset-bottom))]"
      aria-label="Primary"
    >
      <div className="relative flex items-stretch justify-around bg-white/95 backdrop-blur-xl rounded-2xl border border-gray-200 shadow-2xl overflow-hidden">
        <span className="absolute inset-x-6 bottom-0 h-px bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />
        {TABS.map(({ path, label, icon: Icon }) => {
          const isActive = path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);
          return (
            <Link
              key={path}
              to={path}
              className="flex flex-1 flex-col items-center justify-center gap-1 py-2.5 min-w-0"
            >
              <span
                className={`flex items-center justify-center w-9 h-9 rounded-xl transition-colors ${
                  isActive ? 'bg-amber-700 text-white' : 'text-gray-400'
                }`}
              >
                <Icon className="h-[18px] w-[18px]" strokeWidth={isActive ? 2.4 : 2} />
              </span>
              <span
                className={`text-[10px] tracking-wide truncate ${
                  isActive ? 'text-amber-700 font-bold' : 'text-gray-500 font-medium'
                }`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
