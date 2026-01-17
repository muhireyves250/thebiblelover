import React, { useState, useEffect } from 'react';
import { X, Save, MessageCircle, Loader2 } from 'lucide-react';
import { useWhatsAppSettings, WhatsAppSettings } from '../hooks/useWhatsAppSettings';

interface WhatsAppSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const WhatsAppSettingsModal: React.FC<WhatsAppSettingsModalProps> = ({ isOpen, onClose }) => {
    const { settings, loading, saveSettings } = useWhatsAppSettings();
    const [formData, setFormData] = useState<WhatsAppSettings>({
        phoneNumber: '',
        message: '',
        enabled: false
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (settings) {
            setFormData(settings);
        }
    }, [settings]);

    if (!isOpen) return null;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        // @ts-ignore
        const finalValue = type === 'checkbox' ? e.target.checked : value;

        setFormData(prev => ({
            ...prev,
            [name]: finalValue
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const success = await saveSettings(formData);
            if (success) {
                // Optional: show toast success
                onClose();
            } else {
                alert('Failed to save settings');
            }
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-green-50/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100/50 rounded-lg text-green-600">
                            <MessageCircle className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-serif text-gray-900">WhatsApp Widget</h2>
                            <p className="text-sm text-gray-500">Configure chat settings</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {loading ? (
                    <div className="p-12 flex justify-center">
                        <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {/* Enable Toggle */}
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className={`w-2 h-2 rounded-full ${formData.enabled ? 'bg-green-500' : 'bg-gray-300'}`} />
                                <span className="font-medium text-gray-900">Enable Widget</span>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="enabled"
                                    checked={formData.enabled}
                                    onChange={(e) => setFormData(prev => ({ ...prev, enabled: e.target.checked }))}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                            </label>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                            <input
                                type="text"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none"
                                placeholder="e.g. 1234567890"
                            />
                            <p className="mt-1 text-xs text-gray-500">Enter number with country code, no + or spaces.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Default Message</label>
                            <textarea
                                name="message"
                                value={formData.message}
                                onChange={handleInputChange}
                                rows={3}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none resize-none"
                                placeholder="Message that customers will send to you..."
                            />
                        </div>

                        <div className="pt-2 flex items-center justify-end">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-2 rounded-lg text-gray-600 hover:bg-gray-100 font-medium transition-colors mr-3"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-6 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 font-medium transition-all shadow-sm hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        Save Settings
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default WhatsAppSettingsModal;
