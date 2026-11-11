import type { Lang } from './bibleOfflineDb';

/**
 * Shared between BibleChapter.tsx (client) and middleware.ts (server-side,
 * for link-preview bots) so both describe the exact same chapter the exact
 * same way - never duplicated, never allowed to drift apart.
 */
export function bibleChapterSeoDescription(lang: Lang, bookName: string, chapter: number): string {
  if (lang === 'rw') return `Soma ${bookName} ${chapter} muri Bibiliya Yera, ku buntu kandi nta interineti ukeneye.`;
  if (lang === 'fr') return `Lisez ${bookName} ${chapter} dans la Sainte Bible, gratuitement et même hors ligne.`;
  return `Read ${bookName} ${chapter} in the Holy Bible, free and available offline.`;
}
