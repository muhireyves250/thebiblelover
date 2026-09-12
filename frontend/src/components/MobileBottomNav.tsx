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
      className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-t border-gray-200 dark:border-gray-800 pb-[env(safe-area-inset-bottom)]"
      aria-label="Primary"
    >
      <div className="flex items-stretch justify-around">
        {TABS.map(({ path, label, icon: Icon }) => {
          const isActive = path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);
          return (
            <Link
              key={path}
              to={path}
              className="flex flex-1 flex-col items-center justify-center gap-1 py-2.5 min-w-0"
            >
              <Icon
                className={`h-5 w-5 ${isActive ? 'text-amber-700 dark:text-amber-500' : 'text-gray-400 dark:text-gray-500'}`}
                strokeWidth={isActive ? 2.4 : 2}
              />
              <span
                className={`text-[10px] font-bold uppercase tracking-wide truncate ${
                  isActive ? 'text-amber-700 dark:text-amber-500' : 'text-gray-400 dark:text-gray-500'
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
