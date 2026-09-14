import React from 'react';
import { useTranslatedText } from '../hooks/useDynamicTranslation';

interface AutoTextProps extends React.HTMLAttributes<HTMLElement> {
  children: string;
  as?: keyof JSX.IntrinsicElements;
}

// Wraps hardcoded UI copy that isn't in the curated i18next locale files
// (page body text, headings, buttons scattered across every page) so it
// still gets translated on the fly when a non-English language is active,
// without hand-authoring a translation key for every string in the app.
// Accepts the usual element props (className, etc.) and forwards them to
// the rendered tag, so it can stand in directly for the element that used
// to hold the text (e.g. <AutoText as="h1" className="...">Title</AutoText>
// instead of <h1 className="..."><AutoText>Title</AutoText></h1>).
const AutoText: React.FC<AutoTextProps> = ({ children, as: As = 'span', ...rest }) => {
  const translated = useTranslatedText(children);
  return <As {...rest}>{translated}</As>;
};

export default AutoText;
