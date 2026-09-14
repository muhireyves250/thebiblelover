import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, FileText, HandHeart, BookOpenText } from 'lucide-react';

const TABS = [
  { path: '/', labelKey: 'nav.home', icon: Home },
  { path: '/posts', labelKey: 'nav.blog', icon: FileText },
  { path: '/prayer-wall', labelKey: 'nav.prayerWall', icon: HandHeart },
  { path: '/verses', labelKey: 'nav.verses', icon: BookOpenText },
];

const MobileBottomNav = () => {
  const location = useLocation();
  const { t } = useTranslation();

  return (
    <nav
      className="md:hidden fixed inset-x-3 bottom-0 z-50 pb-[env(safe-area-inset-bottom)]"
      aria-label="Primary"
    >
      <div className="relative flex items-stretch justify-around gap-0.5 px-2 bg-white/95 dark:bg-[#0e0e10]/95 backdrop-blur-xl rounded-t-[2.5rem] rounded-b-none border-2 border-b-0 border-gray-300 dark:border-white/10 shadow-2xl overflow-hidden">
        <span className="absolute inset-x-6 bottom-0 h-px bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />
        {TABS.map(({ path, labelKey, icon: Icon }) => {
          const label = t(labelKey);
          const isActive = path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);
          return (
            <Link
              key={path}
              to={path}
              className="flex flex-1 items-center justify-center py-1.5 min-w-0"
            >
              <span
                className={`flex w-full flex-col items-center justify-center gap-1 px-2 py-2 rounded-full border-2 bg-white dark:bg-[#141417] transition-colors ${
                  isActive ? 'border-amber-700 text-amber-700' : 'border-transparent text-gray-600 dark:text-gray-300'
                }`}
              >
                <Icon
                  className={`h-5 w-5 transition-colors ${isActive ? 'text-amber-700' : ''}`}
                  strokeWidth={isActive ? 2.75 : 2.25}
                />
                <span
                  className={`text-[10px] tracking-wide truncate transition-colors ${
                    isActive ? 'text-amber-700 font-bold' : 'text-gray-600 dark:text-gray-300 font-semibold'
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
