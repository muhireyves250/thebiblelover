import React, { useState, useEffect } from 'react';
import { Heart, MessageSquare, Shield, Clock, Users, ArrowRight, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { prayerAPI, authAPI } from '../services/api';
import type { PrayerRequest } from '../services/api.d';

const CATEGORIES = [
    { id: 'ALL', name: 'All Requests', icon: '🙏' },
    { id: 'HEALING', name: 'Healing', icon: '💪' },
    { id: 'FAMILY', name: 'Family', icon: '🏠' },
    { id: 'GUIDANCE', name: 'Guidance', icon: '✨' },
    { id: 'STRENGTH', name: 'Strength', icon: '🔥' },
    { id: 'THANKSGIVING', name: 'Thanksgiving', icon: '🙌' },
    { id: 'OTHER', name: 'Other', icon: '🙏' }
];

const PrayerWall = () => {
    const [requests, setRequests] = useState<PrayerRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('ALL');
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        category: 'GENERAL',
        isAnonymous: false,
        guestName: '',
        guestEmail: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [pagination, setPagination] = useState({ page: 1, pages: 1 });

    const currentUser = authAPI.getCurrentUser();

    useEffect(() => {
        loadRequests();
    }, [activeCategory, pagination.page]);

    const loadRequests = async () => {
        setLoading(true);
        try {
            const response = await prayerAPI.getRequests({
                category: activeCategory,
                page: pagination.page,
                limit: 9
            });
            if (response.success && response.data) {
                setRequests(response.data.requests);
                setPagination(response.data.pagination);
            }
        } catch (err) {
            console.error('Failed to load prayer requests:', err);
        } finally {
            setLoading(false);
        }
    };

    const handlePray = async (id: string) => {
        if (!currentUser) {
            alert('Please log in to support this prayer request.');
            return;
        }

        try {
            const response = await prayerAPI.pray(id);
            if (response.success) {
                // Optimistic update
                setRequests(prev => prev.map(req => {
                    if (req.id === id) {
                        const currentCount = req._count?.supports || 0;
                        return {
                            ...req,
                            _count: {
                                supports: response.data?.supported ? currentCount + 1 : Math.max(0, currentCount - 1)
                            },
                            supportedByMe: response.data?.supported
                        };
                    }
                    return req;
                }));
            }
        } catch (err) {
            console.error('Failed to support prayer:', err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setSubmitting(true);
        setError('');
        try {
            const response = await prayerAPI.createRequest(formData);
            if (response.success) {
                setSuccess('Your prayer request has been shared with the community.');
                setFormData({ title: '', content: '', category: 'GENERAL', isAnonymous: false, guestName: '', guestEmail: '' });
                loadRequests();
                setTimeout(() => setSuccess(''), 5000);
            } else {
                setError(response.message || 'Failed to share request.');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-white">
            <PageHeader
                title="Community Prayer Wall"
                subtitle="A sacred space to share burdens and lift each other up in prayer."
            />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {/* Share a Testimony or Prayer Request */}
                <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-6 md:p-8 mb-10">
                    <div className="mb-6">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="w-1 h-4 bg-amber-700 rounded-sm" />
                            <span className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">Share a Testimony or Prayer Request</span>
                        </div>
                        <p className="text-gray-500 text-sm italic">"Cast all your anxiety on him because he cares for you." — 1 Peter 5:7</p>
                    </div>

                    {success && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 text-sm rounded-md flex items-center gap-3">
                            <CheckCircle className="h-5 w-5 shrink-0" />
                            <p className="font-medium">{success}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {!currentUser && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5">Your Name</label>
                                    <input
                                        required
                                        type="text"
                                        autoComplete="name"
                                        placeholder="Your name"
                                        value={formData.guestName}
                                        onChange={e => setFormData({ ...formData, guestName: e.target.value })}
                                        className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:border-amber-600 focus:outline-none transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5">Email</label>
                                    <input
                                        required
                                        type="email"
                                        autoComplete="email"
                                        placeholder="your.email@example.com"
                                        value={formData.guestEmail}
                                        onChange={e => setFormData({ ...formData, guestEmail: e.target.value })}
                                        className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:border-amber-600 focus:outline-none transition-colors"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-1">
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5">Title</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g., Healing for my Mother"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:border-amber-600 focus:outline-none transition-colors"
                                />
                            </div>

                            <div className="md:col-span-1">
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5">Category</label>
                                <select
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:border-amber-600 focus:outline-none transition-colors"
                                >
                                    {CATEGORIES.filter(c => c.id !== 'ALL').map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5">Your Testimony or Request</label>
                            <textarea
                                required
                                rows={4}
                                placeholder="Share as much or as little as you're comfortable with..."
                                value={formData.content}
                                onChange={e => setFormData({ ...formData, content: e.target.value })}
                                className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:border-amber-600 focus:outline-none transition-colors resize-none"
                            ></textarea>
                        </div>

                        <div className="flex items-center gap-3 p-3.5 bg-amber-50 rounded-md border border-amber-100">
                            <input
                                type="checkbox"
                                id="isAnonymous"
                                checked={formData.isAnonymous}
                                onChange={e => setFormData({ ...formData, isAnonymous: e.target.checked })}
                                className="w-4 h-4 accent-amber-700 rounded cursor-pointer"
                            />
                            <label htmlFor="isAnonymous" className="text-sm font-semibold text-amber-900 cursor-pointer flex items-center gap-1.5">
                                <Shield className="h-4 w-4" />
                                Post anonymously
                            </label>
                        </div>

                        {error && (
                            <div className="p-3.5 bg-red-50 text-red-700 text-sm font-medium rounded-md border border-red-200 flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full md:w-auto bg-amber-700 text-white py-3 px-8 rounded-md text-sm font-bold uppercase tracking-widest hover:bg-amber-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {submitting ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            ) : (
                                <>
                                    <MessageSquare className="h-4 w-4" />
                                    <span>Post Request</span>
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap justify-center gap-2 mb-10">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => {
                                setActiveCategory(cat.id);
                                setPagination({ ...pagination, page: 1 });
                            }}
                            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider border transition-colors ${activeCategory === cat.id
                                ? 'bg-amber-700 text-white border-amber-700'
                                : 'bg-white text-gray-500 border-gray-300 hover:border-gray-400'
                                }`}
                        >
                            <span>{cat.icon}</span>
                            <span>{cat.name}</span>
                        </button>
                    ))}
                </div>

                {/* Prayer Feed */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="bg-white border border-gray-300 rounded-lg shadow-sm p-6 animate-pulse">
                                <div className="h-6 w-3/4 bg-gray-200 rounded mb-4"></div>
                                <div className="h-20 bg-gray-100 rounded mb-6"></div>
                                <div className="h-9 w-1/2 bg-gray-200 rounded-md"></div>
                            </div>
                        ))}
                    </div>
                ) : requests.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {requests.map(request => (
                            <div key={request.id} className="group bg-white border border-gray-300 rounded-lg shadow-sm overflow-hidden hover:border-gray-400 hover:shadow-md transition-all flex flex-col">
                                <div className="p-6 flex-1 relative">
                                    {request.status === 'ANSWERED' && (
                                        <div className="absolute top-0 right-0 p-4">
                                            <div className="bg-green-50 text-green-700 border border-green-200 px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                                                <Sparkles className="h-3 w-3" />
                                                Answered
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between mb-4 pr-4">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="px-2.5 py-1 bg-amber-50 text-amber-700 text-[10px] font-black rounded border border-amber-100 uppercase tracking-widest">
                                                {request.category}
                                            </span>
                                            {request.status === 'ANSWERED' && (
                                                <span className="px-2.5 py-1 bg-green-50 text-green-700 text-[10px] font-black rounded border border-green-200 uppercase tracking-widest">
                                                    Praise Report
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-gray-400 text-xs flex items-center shrink-0">
                                            <Clock className="h-3 w-3 mr-1" />
                                            {new Date(request.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>

                                    <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-amber-700 transition-colors">
                                        {request.title}
                                    </h3>

                                    <p className="text-gray-600 text-sm leading-relaxed mb-6 line-clamp-4">
                                        {request.content}
                                    </p>

                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center shrink-0 overflow-hidden">
                                            {request.user?.profileImage ? (
                                                <img src={request.user.profileImage} alt={request.user.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-amber-800 font-bold text-sm">
                                                    {request.user?.name.charAt(0)}
                                                </span>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">{request.user?.name}</p>
                                            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Community Member</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="px-6 py-4 flex items-center justify-between border-t border-gray-100 bg-gray-50">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handlePray(request.id)}
                                            className={`flex items-center gap-1.5 px-4 py-2 rounded-md font-bold text-xs uppercase tracking-wider transition-colors ${request.status === 'ANSWERED'
                                                ? 'bg-green-100 text-green-700 cursor-default'
                                                : (request as any).supportedByMe
                                                    ? 'bg-amber-700 text-white'
                                                    : 'bg-white text-amber-700 border border-amber-200 hover:bg-amber-700 hover:text-white hover:border-amber-700'
                                                }`}
                                            disabled={request.status === 'ANSWERED'}
                                        >
                                            <Heart className={`h-3.5 w-3.5 ${((request as any).supportedByMe || request.status === 'ANSWERED') ? 'fill-current' : ''}`} />
                                            <span>{request.status === 'ANSWERED' ? 'Amen' : "I'm Praying"}</span>
                                        </button>

                                        {currentUser?.id === (request as any).userId && (
                                            <button
                                                onClick={async () => {
                                                    try {
                                                        const res = await prayerAPI.praise(request.id);
                                                        if (res.success) {
                                                            setRequests(prev => prev.map(r => r.id === request.id ? { ...r, status: res.data.status } : r));
                                                        }
                                                    } catch (err) {
                                                        console.error('Failed to toggle praise:', err);
                                                    }
                                                }}
                                                className={`p-2 rounded-md border transition-colors ${request.status === 'ANSWERED'
                                                    ? 'bg-amber-100 border-amber-200 text-amber-700 hover:bg-amber-200'
                                                    : 'bg-white border-gray-200 text-gray-400 hover:text-amber-700 hover:border-amber-200'
                                                }`}
                                                title={request.status === 'ANSWERED' ? 'Return to Active Prayer' : 'Mark as Answered (Praise Report)'}
                                            >
                                                <Sparkles className={`h-3.5 w-3.5 ${request.status === 'ANSWERED' ? 'fill-current' : ''}`} />
                                            </button>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded border border-amber-200 bg-amber-50 text-amber-800 font-bold text-xs">
                                        <Users className="h-3.5 w-3.5" />
                                        <span>{request._count?.supports || 0}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-white border border-dashed border-gray-300 rounded-lg">
                        <div className="w-16 h-16 bg-amber-50 border border-amber-100 rounded-full flex items-center justify-center mx-auto mb-5 text-2xl">
                            🙏
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">No prayer requests found</h3>
                        <p className="text-gray-500 text-sm max-w-sm mx-auto">
                            Be the first to share a burden or request guidance from our community.
                        </p>
                    </div>
                )}

                {/* Pagination */}
                {pagination.pages > 1 && (
                    <div className="mt-12 flex justify-center items-center gap-3">
                        <button
                            disabled={pagination.page === 1}
                            onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                            className="p-2.5 rounded-md border border-gray-300 hover:border-amber-600 hover:text-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ArrowRight className="h-4 w-4 rotate-180" />
                        </button>
                        <span className="text-sm font-bold text-gray-700">
                            Page {pagination.page} of {pagination.pages}
                        </span>
                        <button
                            disabled={pagination.page === pagination.pages}
                            onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                            className="p-2.5 rounded-md border border-gray-300 hover:border-amber-600 hover:text-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ArrowRight className="h-4 w-4" />
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
};

export default PrayerWall;
