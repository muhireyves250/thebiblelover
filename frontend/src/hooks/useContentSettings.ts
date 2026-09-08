import { useState, useEffect, useCallback } from 'react';
import { settingsAPI } from '../services/api';
import { getCached, setCached, dedupedFetch } from '../lib/dataCache';

const CACHE_KEY = 'contentSettings';
const TTL = 5 * 60 * 1000; // 5 minutes

export interface ContentSection {
    title: string;
    content: string;
    imageUrl: string;
}

export interface HeroSection {
    videoUrl: string;
    imageUrl: string;
    title: string;
    content: string;
}

export interface FooterSettings {
    description: string;
    email: string;
    location: string;
    responseTime: string;
    copyrightText: string;
    madeWithText: string;
    facebook: string;
    twitter: string;
    instagram: string;
    linkedin: string;
    youtube: string;
    tiktok: string;
    whatsapp: string;
}

export interface ContentSettings {
    aboutSection: ContentSection;
    storySection: ContentSection;
    missionSection: ContentSection;
    heroSection: HeroSection;
    footerSettings: FooterSettings;
    [key: string]: any;
}

export type SectionKey = 'aboutSection' | 'storySection' | 'missionSection' | 'heroSection' | 'footerSettings';

const defaultSection: ContentSection = {
    title: '',
    content: '',
    imageUrl: ''
};

const defaultHeroSection: HeroSection = {
    videoUrl: '',
    imageUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
    title: 'THE BIBLE LOVER',
    content: 'READ ALL ABOUT IT'
};

const defaultFooterSettings: FooterSettings = {
    description: "Sharing the joy of reading and faith through thoughtful book reviews, inspiring content, and meaningful discussions about literature and spirituality.",
    email: "hello@thebiblelover.com",
    location: "New York, NY",
    responseTime: "Response within 24-48 hours",
    copyrightText: "© 2024 The Bible Lover. All rights reserved.",
    madeWithText: "Made with for book lovers",
    facebook: "#",
    twitter: "#",
    instagram: "#",
    linkedin: "#",
    youtube: "#",
    tiktok: "#",
    whatsapp: "#"
};

const defaultSettings: ContentSettings = {
    aboutSection: defaultSection,
    storySection: defaultSection,
    missionSection: defaultSection,
    heroSection: defaultHeroSection,
    footerSettings: defaultFooterSettings
};

async function resolveContentSettings(): Promise<ContentSettings> {
    const [about, story, mission, hero, footer] = await Promise.all([
        settingsAPI.getSettingCategory('aboutSection'),
        settingsAPI.getSettingCategory('storySection'),
        settingsAPI.getSettingCategory('missionSection'),
        settingsAPI.getSettingCategory('heroSection').catch(() => ({ data: { settings: defaultHeroSection } })),
        settingsAPI.getSettingCategory('footerSettings').catch(() => ({ data: { settings: defaultFooterSettings } }))
    ]);

    return {
        aboutSection: about?.data?.settings || defaultSection,
        storySection: story?.data?.settings || defaultSection,
        missionSection: mission?.data?.settings || defaultSection,
        heroSection: hero?.data?.settings || defaultHeroSection,
        footerSettings: footer?.data?.settings || defaultFooterSettings
    };
}

export const useContentSettings = () => {
    const cached = getCached<ContentSettings>(CACHE_KEY);
    const [settings, setSettings] = useState<ContentSettings>(cached?.data || defaultSettings);
    const [loading, setLoading] = useState(!cached);
    const [error, setError] = useState<string | null>(null);

    const fetchSettings = useCallback(async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            const resolved = await dedupedFetch(CACHE_KEY, resolveContentSettings);
            setSettings(resolved);
            setCached(CACHE_KEY, resolved);
            setError(null);
        } catch (err: any) {
            if (!silent) {
                setError(err.message || 'Failed to fetching content settings');
                console.error(err);
            }
        } finally {
            if (!silent) setLoading(false);
        }
    }, []);

    useEffect(() => {
        const entry = getCached<ContentSettings>(CACHE_KEY);
        if (entry) {
            setSettings(entry.data);
            setLoading(false);
            if (Date.now() - entry.timestamp > TTL) {
                fetchSettings(true); // stale — refresh quietly in the background
            }
        } else {
            fetchSettings(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const saveSection = async (section: SectionKey, data: ContentSection | HeroSection | FooterSettings | any) => {
        try {
            const response = await settingsAPI.updateSettings(section, data);
            if (response.success) {
                setSettings(prev => {
                    const next = { ...prev, [section]: response.data.settings };
                    setCached(CACHE_KEY, next);
                    return next;
                });
                return true;
            }
            return false;
        } catch (err: any) {
            console.error(`Error saving ${section}:`, err);
            return false;
        }
    };

    return {
        settings,
        loading,
        error,
        saveSection,
        refreshSettings: fetchSettings
    };
};
