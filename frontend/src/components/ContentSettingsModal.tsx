import React, { useState, useEffect } from 'react';
import { X, Save, Upload, Layout, Loader2, Video } from 'lucide-react';
import { useContentSettings, ContentSection } from '../hooks/useContentSettings';
import { uploadAPI } from '../services/api';

interface ContentSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type SectionKey = 'aboutSection' | 'storySection' | 'missionSection' | 'heroSection';

const ContentSettingsModal: React.FC<ContentSettingsModalProps> = ({ isOpen, onClose }) => {
    const { settings, loading: loadingSettings, saveSection } = useContentSettings();
    const [activeTab, setActiveTab] = useState<SectionKey>('aboutSection');
    const [formData, setFormData] = useState<ContentSection & { videoUrl?: string }>({
        title: '',
        content: '',
        imageUrl: '',
        videoUrl: ''
    });
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (settings && settings[activeTab]) {
            setFormData(prev => ({
                ...prev,
                ...settings[activeTab]
            }));
        } else {
            // Reset form for clean slate if no settings
            setFormData({
                title: '',
                content: '',
                imageUrl: '',
                videoUrl: ''
            });
        }
    }, [settings, activeTab]);

    if (!isOpen) return null;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploading(true);
            const response = await uploadAPI.uploadImage(file);
            if (response.data && response.data.fullUrl) {
                setFormData(prev => ({ ...prev, imageUrl: response.data!.fullUrl }));
            }
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploading(true);
            const response = await uploadAPI.uploadVideo(file);
            if (response.data && response.data.fullUrl) {
                setFormData(prev => ({ ...prev, videoUrl: response.data!.fullUrl }));
            }
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Failed to upload video');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            // Filter data based on active tab
            let dataToSave = {};
            if (activeTab === 'heroSection') {
                dataToSave = {
                    videoUrl: formData.videoUrl,
                    imageUrl: formData.imageUrl,
                    title: formData.title,
                    content: formData.content
                };
            } else {
                dataToSave = {
                    title: formData.title,
                    content: formData.content,
                    imageUrl: formData.imageUrl
                };
            }

            const success = await saveSection(activeTab, dataToSave);
            if (success) {
                // Optional: show toast success
            } else {
                alert('Failed to save changes');
            }
        } finally {
            setSaving(false);
        }
    };

    const tabs: { id: SectionKey; label: string }[] = [
        { id: 'aboutSection', label: 'About Us' },
        { id: 'storySection', label: 'Our Story' },
        { id: 'missionSection', label: 'Our Mission' },
        { id: 'heroSection', label: 'Hero Section' }
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100/50 rounded-lg text-indigo-600">
                            <Layout className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-serif text-gray-900">Site Content</h2>
                            <p className="text-sm text-gray-500">Update static page content</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {loadingSettings ? (
                    <div className="flex-1 flex items-center justify-center p-12">
                        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                    </div>
                ) : (
                    <div className="flex flex-1 overflow-hidden">
                        {/* Sidebar Tabs */}
                        <div className="w-48 bg-gray-50 border-r border-gray-100 overflow-y-auto">
                            <div className="p-4 space-y-1">
                                {tabs.map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id
                                            ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-gray-200'
                                            : 'text-gray-600 hover:bg-gray-100'
                                            }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Content Form */}
                        <div className="flex-1 overflow-y-auto p-6">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {activeTab === 'heroSection' ? (
                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Main Heading (Title)</label>
                                            <input
                                                type="text"
                                                name="title"
                                                value={formData.title}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
                                                placeholder="e.g. THE BIBLE LOVER"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Subheading (Subtitle)</label>
                                            <input
                                                type="text"
                                                name="content"
                                                value={formData.content}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
                                                placeholder="e.g. READ ALL ABOUT IT"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Hero Video (Bottom Left)</label>
                                            <div className="space-y-4">
                                                {formData.videoUrl && (
                                                    <div className="aspect-video w-full rounded-lg overflow-hidden bg-gray-100 border border-gray-200 relative group">
                                                        <video
                                                            src={formData.videoUrl}
                                                            controls
                                                            className="w-full h-full object-cover"
                                                        />
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                                            <p className="text-white text-sm font-medium">Current Video</p>
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="flex items-center gap-3">
                                                    <input
                                                        type="text"
                                                        name="videoUrl"
                                                        value={formData.videoUrl || ''}
                                                        onChange={handleInputChange}
                                                        placeholder="Enter video URL..."
                                                        className="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none text-sm"
                                                    />
                                                    <label className={`cursor-pointer px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors flex items-center gap-2 ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                                                        <Video className="w-4 h-4 text-gray-400" />
                                                        <span className="text-sm font-medium text-gray-600">
                                                            {uploading ? '...' : 'Upload Video'}
                                                        </span>
                                                        <input type="file" className="hidden" accept="video/*" onChange={handleVideoUpload} />
                                                    </label>
                                                </div>
                                                <p className="text-xs text-gray-500">Max size: 50MB. Formats: MP4, WebM.</p>
                                            </div>

                                            <div className="mt-8">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Hero Background Image</label>
                                                <div className="space-y-4">
                                                    {formData.imageUrl && (
                                                        <div className="aspect-video w-full rounded-lg overflow-hidden bg-gray-100 border border-gray-200 relative group">
                                                            <img
                                                                src={formData.imageUrl}
                                                                alt="Hero Background Preview"
                                                                className="w-full h-full object-cover"
                                                            />
                                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                <p className="text-white text-sm font-medium">Current Background</p>
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="flex items-center gap-3">
                                                        <input
                                                            type="text"
                                                            name="imageUrl"
                                                            value={formData.imageUrl}
                                                            onChange={handleInputChange}
                                                            placeholder="Enter image URL..."
                                                            className="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none text-sm"
                                                        />
                                                        <label className={`cursor-pointer px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors flex items-center gap-2 ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                                                            <Upload className="w-4 h-4 text-gray-400" />
                                                            <span className="text-sm font-medium text-gray-600">
                                                                {uploading ? '...' : 'Upload Image'}
                                                            </span>
                                                            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Section Title</label>
                                            <input
                                                type="text"
                                                name="title"
                                                value={formData.title}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
                                                placeholder="Enter section title..."
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Section Content</label>
                                            <textarea
                                                name="content"
                                                value={formData.content}
                                                onChange={handleInputChange}
                                                rows={6}
                                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none resize-none"
                                                placeholder="Enter section description..."
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Section Image</label>
                                            <div className="space-y-4">
                                                {formData.imageUrl && (
                                                    <div className="aspect-video w-full rounded-lg overflow-hidden bg-gray-100 border border-gray-200 relative group">
                                                        <img
                                                            src={formData.imageUrl}
                                                            alt="Section Preview"
                                                            className="w-full h-full object-cover"
                                                        />
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                            <p className="text-white text-sm font-medium">Current Image</p>
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="flex items-center gap-3">
                                                    <input
                                                        type="text"
                                                        name="imageUrl"
                                                        value={formData.imageUrl}
                                                        onChange={handleInputChange}
                                                        placeholder="Enter image URL..."
                                                        className="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none text-sm"
                                                    />
                                                    <label className={`cursor-pointer px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors flex items-center gap-2 ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                                                        <Upload className="w-4 h-4 text-gray-400" />
                                                        <span className="text-sm font-medium text-gray-600">
                                                            {uploading ? '...' : 'Upload'}
                                                        </span>
                                                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                <div className="pt-4 border-t border-gray-100 flex items-center justify-end">
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
                                        className="px-6 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 font-medium transition-all shadow-sm hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {saving ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4" />
                                                Save Changes
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
                }
            </div >
        </div >
    );
};

export default ContentSettingsModal;
