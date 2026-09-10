import { useState, useEffect } from 'react';
import { settingsAPI } from '../services/api';
import { getCached, setCached, dedupedFetch } from '../lib/dataCache';

const CACHE_KEY = 'whatsappSettings';
const TTL = 5 * 60 * 1000; // 5 minutes

export interface WhatsAppSettings {
    phoneNumber: string;
    message: string;
    enabled: boolean;
}

const defaultSettings: WhatsAppSettings = {
    phoneNumber: '',
    message: '',
    enabled: false
};

export const useWhatsAppSettings = () => {
    const cached = getCached<WhatsAppSettings>(CACHE_KEY);
    const [settings, setSettings] = useState<WhatsAppSettings>(cached?.data || defaultSettings);
    const [loading, setLoading] = useState(!cached);
    const [error, setError] = useState<string | null>(null);

    const fetchSettings = async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            const response = await dedupedFetch(CACHE_KEY, () => settingsAPI.getSettingCategory('whatsappSettings'));
            if (response.success && response.data.settings) {
                setSettings(response.data.settings);
                setCached(CACHE_KEY, response.data.settings);
            }
            if (!silent) setError(null);
        } catch (err: any) {
            if (!silent) {
                setError(err.message || 'Failed to fetch WhatsApp settings');
                console.error(err);
            }
        } finally {
            if (!silent) setLoading(false);
        }
    };

    useEffect(() => {
        const entry = getCached<WhatsAppSettings>(CACHE_KEY);
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

    const saveSettings = async (newSettings: WhatsAppSettings) => {
        try {
            const response = await settingsAPI.updateSettings('whatsappSettings', newSettings);
            if (response.success) {
                setSettings(newSettings);
                setCached(CACHE_KEY, newSettings);
                return true;
            }
            return false;
        } catch (err: any) {
            console.error('Error saving WhatsApp settings:', err);
            return false;
        }
    };

    return {
        settings,
        loading,
        error,
        saveSettings,
        refreshSettings: fetchSettings
    };
};
