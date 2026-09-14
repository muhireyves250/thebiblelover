import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Check } from 'lucide-react';
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from '../i18n';

const LANGUAGE_LABELS: Record<SupportedLanguage, { short: string; key: string }> = {
  en: { short: 'EN', key: 'language.english' },
  rw: { short: 'RW', key: 'language.kinyarwanda' },
  fr: { short: 'FR', key: 'language.french' },
};

const LanguageSwitcher: React.FC<{ variant?: 'header' | 'drawer' }> = ({ variant = 'header' }) => {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = (i18n.language in LANGUAGE_LABELS ? i18n.language : 'en') as SupportedLanguage;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const changeLanguage = (lang: SupportedLanguage) => {
    i18n.changeLanguage(lang);
    setIsOpen(false);
  };

  if (variant === 'drawer') {
    return (
      <div className="px-1">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">{t('language.label')}</p>
        <div className="grid grid-cols-3 gap-2">
          {SUPPORTED_LANGUAGES.map((lang) => (
            <button
              key={lang}
              onClick={() => changeLanguage(lang)}
              className={`py-2 rounded-md text-xs font-bold uppercase tracking-widest border transition-colors ${
                current === lang
                  ? 'bg-amber-700 border-amber-700 text-white'
                  : 'border-gray-300 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:border-amber-600 hover:text-amber-700'
              }`}
            >
              {LANGUAGE_LABELS[lang].short}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen((v) => !v)}
        aria-label={t('language.label')}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-gray-300 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:border-amber-600 hover:text-amber-700 transition-colors text-xs font-bold uppercase tracking-widest"
      >
        <Globe className="h-3.5 w-3.5" />
        {LANGUAGE_LABELS[current].short}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-[#141417] border border-gray-300 dark:border-white/10 rounded-md shadow-lg py-1.5 z-50">
          {SUPPORTED_LANGUAGES.map((lang) => (
            <button
              key={lang}
              onClick={() => changeLanguage(lang)}
              className="w-full flex items-center justify-between px-3.5 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-amber-50 hover:text-amber-700 transition-colors"
            >
              <span>{t(LANGUAGE_LABELS[lang].key)}</span>
              {current === lang && <Check className="h-4 w-4 text-amber-700" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
