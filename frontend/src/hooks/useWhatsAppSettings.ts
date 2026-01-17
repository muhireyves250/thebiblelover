import { useState, useEffect } from 'react';
import { settingsAPI } from '../services/api';

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
    const [settings, setSettings] = useState<WhatsAppSettings>(defaultSettings);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const response = await settingsAPI.getSettingCategory('whatsappSettings');
            if (response.success && response.data.settings) {
                setSettings(response.data.settings);
            }
            setError(null);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch WhatsApp settings');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const saveSettings = async (newSettings: WhatsAppSettings) => {
        try {
            const response = await settingsAPI.updateSettings('whatsappSettings', newSettings);
            if (response.success) {
                setSettings(newSettings);
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
