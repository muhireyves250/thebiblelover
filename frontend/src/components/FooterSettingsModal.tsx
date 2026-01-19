import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { FooterSettings } from '../hooks/useContentSettings';

interface FooterSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (settings: FooterSettings) => Promise<boolean>;
    initialSettings: FooterSettings;
}

const FooterSettingsModal: React.FC<FooterSettingsModalProps> = ({
    isOpen,
    onClose,
    onSave,
    initialSettings
}) => {
    const [settings, setSettings] = useState<FooterSettings>(initialSettings);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setSettings(initialSettings);
        }
    }, [isOpen, initialSettings]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        const success = await onSave(settings);
        if (success) {
            onClose();
        } else {
            alert('Failed to save footer settings. Please try again.');
        }
        setIsSaving(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">Footer Customization</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Brand Description */}
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                            Brand Description
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            rows={4}
                            value={settings.description}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-amber-500 focus:border-transparent"
                            placeholder="About your brand..."
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                Contact Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={settings.email}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-amber-500 focus:border-transparent"
                            />
                        </div>

                        {/* Location */}
                        <div>
                            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                                Location
                            </label>
                            <input
                                type="text"
                                id="location"
                                name="location"
                                value={settings.location}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-amber-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Response Time */}
                        <div>
                            <label htmlFor="responseTime" className="block text-sm font-medium text-gray-700 mb-2">
                                Response Time Text
                            </label>
                            <input
                                type="text"
                                id="responseTime"
                                name="responseTime"
                                value={settings.responseTime}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-amber-500 focus:border-transparent"
                            />
                        </div>

                        {/* Copyright Text */}
                        <div>
                            <label htmlFor="copyrightText" className="block text-sm font-medium text-gray-700 mb-2">
                                Copyright Text
                            </label>
                            <input
                                type="text"
                                id="copyrightText"
                                name="copyrightText"
                                value={settings.copyrightText}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-amber-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Made With Text */}
                    <div>
                        <label htmlFor="madeWithText" className="block text-sm font-medium text-gray-700 mb-2">
                            "Made with" Text
                        </label>
                        <input
                            type="text"
                            id="madeWithText"
                            name="madeWithText"
                            value={settings.madeWithText}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-amber-500 focus:border-transparent"
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="flex items-center space-x-2 px-6 py-2 bg-amber-700 text-white rounded-md hover:bg-amber-800 transition-colors disabled:opacity-50"
                        >
                            {isSaving ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            ) : (
                                <Save className="h-4 w-4" />
                            )}
                            <span>{isSaving ? 'Saving...' : 'Save Footer'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FooterSettingsModal;
