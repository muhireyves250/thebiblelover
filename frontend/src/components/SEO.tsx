import React from 'react';
import { Helmet } from 'react-helmet-async';

// The one domain all SEO/OG URLs should ever point at, regardless of
// which host (hema.rw, www.hema.rw, a Vercel preview alias) actually
// served the page - otherwise Google sees the exact same content as
// separate pages under separate hostnames and splits ranking signals
// between them instead of consolidating onto one indexable URL.
export const CANONICAL_ORIGIN = 'https://hema.rw';

interface SEOProps {
    title?: string;
    description?: string;
    image?: string | null;
    url?: string;
    type?: 'website' | 'article';
    noindex?: boolean;
    /** BCP-47 language of this page's content (e.g. 'rw', 'en', 'fr') - sets <html lang>. */
    lang?: string;
    /**
     * Other language versions of this exact page, keyed by language code,
     * absolute or site-relative path. Only meaningful when the page's
     * content genuinely lives at a distinct URL per language (e.g. the
     * Bible reader's /bible/:lang/:book/:chapter) - tells Google these
     * pages are translations of each other instead of three unrelated,
     * possibly-duplicate pages.
     */
    alternateUrls?: Partial<Record<'en' | 'fr' | 'rw', string>>;
}

const SEO: React.FC<SEOProps> = ({
    title,
    description = "A haven for those who seek the wisdom, comfort, and inspiration of the Holy Bible.",
    image = "/og-image.jpg",
    url = `${CANONICAL_ORIGIN}${window.location.pathname}${window.location.search}`,
    type = 'website',
    noindex = false,
    lang,
    alternateUrls,
}) => {
    const siteTitle = "The Bible Lover";
    const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;

    // A default parameter only kicks in for `undefined`, but callers can
    // pass an explicit `null` (e.g. a verse/post with no image in the DB),
    // so fall back here too.
    const resolvedImage = image || "/og-image.jpg";

    // Ensure image is an absolute URL, always under the canonical origin
    const absoluteImage = resolvedImage.startsWith('http')
        ? resolvedImage
        : `${CANONICAL_ORIGIN}${resolvedImage.startsWith('/') ? resolvedImage : `/${resolvedImage}`}`;

    const absoluteAlternate = (path: string) =>
        path.startsWith('http') ? path : `${CANONICAL_ORIGIN}${path.startsWith('/') ? path : `/${path}`}`;

    return (
        <Helmet>
            {lang && <html lang={lang} />}

            {/* Standard Meta Tags */}
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            <link rel="canonical" href={url} />
            {noindex && <meta name="robots" content="noindex,nofollow" />}

            {/* Alternate-language versions of this same page */}
            {alternateUrls && Object.entries(alternateUrls).map(([code, path]) => (
                <link key={code} rel="alternate" hrefLang={code} href={absoluteAlternate(path as string)} />
            ))}
            {alternateUrls?.en && <link rel="alternate" hrefLang="x-default" href={absoluteAlternate(alternateUrls.en)} />}

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={url} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={absoluteImage} />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
            <meta property="og:site_name" content={siteTitle} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:url" content={url} />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={absoluteImage} />
            <meta name="twitter:site" content="@thebiblelover" />
            <meta name="twitter:creator" content="@thebiblelover" />

            {/* Structured Data */}
            {type === 'article' && (
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "BlogPosting",
                        "headline": title || siteTitle,
                        "description": description,
                        "image": absoluteImage,
                        "url": url,
                        "publisher": {
                            "@type": "Organization",
                            "name": siteTitle,
                            "logo": {
                                "@type": "ImageObject",
                                "url": `${CANONICAL_ORIGIN}/logo.png`
                            }
                        },
                        "mainEntityOfPage": {
                            "@type": "WebPage",
                            "@id": url
                        }
                    })}
                </script>
            )}
        </Helmet>
    );
};

export default SEO;
