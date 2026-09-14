import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const cache = new Map<string, string>();

async function translateText(text: string, targetLang: string): Promise<string> {
  if (!text || targetLang === 'en') return text;

  const cacheKey = `${targetLang}:${text}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    const response = await fetch(url);
    if (!response.ok) return text;
    const data = await response.json();
    const translated = (data?.[0] || []).map((chunk: any[]) => chunk[0]).join('');
    if (translated) {
      cache.set(cacheKey, translated);
      return translated;
    }
    return text;
  } catch {
    return text;
  }
}

// Translates dynamic (database-sourced) text on the fly when the active
// language isn't English - static UI copy uses react-i18next's t()
// instead, this is only for content we don't control the wording of.
export function useTranslatedText(text: string | null | undefined): string {
  const { i18n } = useTranslation();
  const [translated, setTranslated] = useState(text || '');

  useEffect(() => {
    let cancelled = false;
    if (!text || i18n.language === 'en') {
      setTranslated(text || '');
      return;
    }
    translateText(text, i18n.language).then((result) => {
      if (!cancelled) setTranslated(result);
    });
    return () => {
      cancelled = true;
    };
  }, [text, i18n.language]);

  return translated;
}

export default useTranslatedText;
