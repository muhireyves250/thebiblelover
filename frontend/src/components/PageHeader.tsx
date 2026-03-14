import React, { useEffect, useState } from 'react';
import { useBackgroundSettings } from '../hooks/useBackgroundSettings';

interface PageHeaderProps {
    title: string;
    subtitle: string;
    bgImage?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, bgImage }) => {
    const [offset, setOffset] = useState(0);
    const { getBackgroundStyle, getOverlayStyle } = useBackgroundSettings();

    useEffect(() => {
        const onScroll = () => setOffset(window.scrollY * 0.25);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const getParallaxStyle = () => {
        const baseStyle = getBackgroundStyle();

        if (bgImage) {
            baseStyle.backgroundImage = `url(${bgImage})`;
        }

        return {
            ...baseStyle,
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
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 px-10 md:px-16 py-10 text-center shadow-sm transition-colors duration-300">
                    <h1 className="text-3xl md:text-5xl font-serif mb-4 tracking-wider text-gray-900 dark:text-gray-100 uppercase">
                        {title}
                    </h1>
                    <p className="text-xs md:text-sm font-light tracking-[0.35em] uppercase text-gray-700 dark:text-gray-300">
                        {subtitle}
                    </p>
                </div>
            </div>
        </section>
    );
};

export default PageHeader;
