import { useState, useEffect } from 'react';
import { settingsAPI } from '../services/api';

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

export const useContentSettings = () => {
    const [settings, setSettings] = useState<ContentSettings>({
        aboutSection: defaultSection,
        storySection: defaultSection,
        missionSection: defaultSection,
        heroSection: {
            videoUrl: '',
            imageUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
            title: 'THE BIBLE LOVER',
            content: 'READ ALL ABOUT IT'
        },
        footerSettings: {
            description: '',
            email: '',
            location: '',
            responseTime: '',
            copyrightText: '',
            madeWithText: '',
            facebook: '',
            twitter: '',
            instagram: '',
            linkedin: '',
            youtube: '',
            tiktok: '',
            whatsapp: ''
        }
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const [about, story, mission, hero, footer] = await Promise.all([
                settingsAPI.getSettingCategory('aboutSection'),
                settingsAPI.getSettingCategory('storySection'),
                settingsAPI.getSettingCategory('missionSection'),
                settingsAPI.getSettingCategory('heroSection').catch(() => ({
                    data: {
                        settings: {
                            videoUrl: '',
                            imageUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
                            title: 'THE BIBLE LOVER',
                            content: 'READ ALL ABOUT IT'
                        }
                    }
                })),
                settingsAPI.getSettingCategory('footerSettings').catch(() => ({
                    data: {
                        settings: {
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
                        }
                    }
                }))
            ]);

            setSettings({
                aboutSection: about.data.settings || defaultSection,
                storySection: story.data.settings || defaultSection,
                missionSection: mission.data.settings || defaultSection,
                heroSection: hero.data.settings || {
                    videoUrl: '',
                    imageUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
                    title: 'THE BIBLE LOVER',
                    content: 'READ ALL ABOUT IT'
                },
                footerSettings: footer.data.settings || {
                    description: '',
                    email: '',
                    location: '',
                    responseTime: '',
                    copyrightText: '',
                    madeWithText: '',
                    facebook: '',
                    twitter: '',
                    instagram: '',
                    linkedin: '',
                    youtube: '',
                    tiktok: '',
                    whatsapp: ''
                }
            });
            setError(null);
        } catch (err: any) {
            setError(err.message || 'Failed to fetching content settings');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const saveSection = async (section: SectionKey, data: ContentSection | HeroSection | FooterSettings | any) => {
        try {
            const response = await settingsAPI.updateSettings(section, data);
            if (response.success) {
                setSettings(prev => ({
                    ...prev,
                    [section]: response.data.settings
                }));
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
