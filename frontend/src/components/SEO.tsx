import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title?: string;
    description?: string;
    image?: string | null;
    url?: string;
    type?: 'website' | 'article';
    noindex?: boolean;
}

const SEO: React.FC<SEOProps> = ({
    title,
    description = "A haven for those who seek the wisdom, comfort, and inspiration of the Holy Bible.",
    image = "/og-image.jpg",
    url = window.location.href,
    type = 'website',
    noindex = false
}) => {
    const siteTitle = "The Bible Lover";
    const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;

    // A default parameter only kicks in for `undefined`, but callers can
    // pass an explicit `null` (e.g. a verse/post with no image in the DB),
    // so fall back here too.
    const resolvedImage = image || "/og-image.jpg";

    // Ensure image is an absolute URL
    const absoluteImage = resolvedImage.startsWith('http')
        ? resolvedImage
        : `${window.location.origin}${resolvedImage.startsWith('/') ? resolvedImage : `/${resolvedImage}`}`;

    return (
        <Helmet>
            {/* Standard Meta Tags */}
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            <link rel="canonical" href={url} />
            {noindex && <meta name="robots" content="noindex,nofollow" />}

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
                                "url": `${window.location.origin}/logo.png`
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
