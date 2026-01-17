import React, { useEffect, useState } from 'react';
import { useBackgroundSettings } from '../hooks/useBackgroundSettings';
import { useContentSettings } from '../hooks/useContentSettings';
import { optimizeCloudinaryUrl } from '../utils/media';

interface PageHeaderProps {
    title: string;
    subtitle: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle }) => {
    const [offset, setOffset] = useState(0);
    const { getBackgroundStyle, getOverlayStyle } = useBackgroundSettings();
    const { settings } = useContentSettings();

    useEffect(() => {
        const onScroll = () => setOffset(window.scrollY * 0.25);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const getParallaxStyle = () => {
        const baseStyle = getBackgroundStyle();
        // Default hero image from settings
        const heroImage = settings?.heroSection?.imageUrl;

        // Optimize the background image for fast loading
        const optimizedImage = optimizeCloudinaryUrl(heroImage, { width: 1920 });

        return {
            ...baseStyle,
            backgroundImage: heroImage ? `url(${optimizedImage})` : baseStyle.backgroundImage,
            // If we have a custom hero image, we might want it to be more visible than the default background
            opacity: heroImage ? 1 : baseStyle.opacity,
            backgroundPosition: `center calc(50% + ${offset}px)`,
            backgroundAttachment: 'fixed'
        };
    };

    return (
        <section className="relative h-[480px] md:h-[520px] bg-cover bg-center overflow-hidden">
            <div
                className="absolute inset-0 bg-cover bg-center bg-fixed"
                style={getParallaxStyle()}
            />

            {/* Overlay */}
            <div
                className="absolute inset-0"
                style={getOverlayStyle()}
            />

            <div className="relative z-10 flex items-center justify-center h-full px-4">
                <div className="bg-white border border-gray-200 px-10 md:px-16 py-10 text-center shadow-sm">
                    <h1 className="text-3xl md:text-5xl font-serif mb-4 tracking-wider text-gray-900 uppercase">
                        {title}
                    </h1>
                    <p className="text-xs md:text-sm font-light tracking-[0.35em] uppercase text-gray-700">
                        {subtitle}
                    </p>
                </div>
            </div>
        </section>
    );
};

export default PageHeader;
