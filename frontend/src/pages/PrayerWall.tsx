import React, { useState, useEffect } from 'react';
import { Heart, Plus, MessageSquare, Shield, Clock, Users, ArrowRight, CheckCircle, AlertCircle, Sparkles, HeartPulse, Home, Compass, Flame, HandHeart, MoreHorizontal } from 'lucide-react';
import { prayerAPI, authAPI } from '../services/api';
import type { PrayerRequest } from '../services/api.d';

const CATEGORIES = [
    { id: 'ALL', name: 'All Requests', icon: Heart },
    { id: 'HEALING', name: 'Healing', icon: HeartPulse },
    { id: 'FAMILY', name: 'Family', icon: Home },
    { id: 'GUIDANCE', name: 'Guidance', icon: Compass },
    { id: 'STRENGTH', name: 'Strength', icon: Flame },
    { id: 'THANKSGIVING', name: 'Thanksgiving', icon: HandHeart },
    { id: 'OTHER', name: 'Other', icon: MoreHorizontal }
];

const PrayerWall = () => {
    const [requests, setRequests] = useState<PrayerRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('ALL');
    const [showForm, setShowForm] = useState(false);
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
        try {
            // A signed-in user's support toggles server-side per account. A
            // guest tap isn't individually identifiable, so the guest's own
            // "am I praying" state lives in localStorage and we tell the
            // server which direction to move the shared counter.
            const isGuest = !currentUser;
            const guestKey = `prayed:${id}`;
            const nextPraying = isGuest ? localStorage.getItem(guestKey) !== '1' : undefined;

            const response = await prayerAPI.pray(id, isGuest ? { praying: nextPraying } : undefined);
            if (response.success) {
                if (isGuest) {
                    if (nextPraying) localStorage.setItem(guestKey, '1');
                    else localStorage.removeItem(guestKey);
                }

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
                setShowForm(false);
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
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 md:py-16">
                <h1 className="md:hidden text-lg font-black uppercase tracking-tight text-gray-900 mb-3">
                    A sacred space to share burdens and lift each other up in prayer.
                </h1>

                {/* Actions & Filters */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 md:mb-10 gap-3 md:gap-4">
                    <div className="w-full md:w-auto flex md:flex-wrap md:justify-center gap-2 overflow-x-auto md:overflow-visible -mx-4 px-4 md:mx-0 md:px-0 pb-1 md:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => {
                                    setActiveCategory(cat.id);
                                    setPagination({ ...pagination, page: 1 });
                                }}
                                className={`flex items-center gap-1.5 shrink-0 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border transition-colors ${activeCategory === cat.id
                                    ? 'bg-amber-700 text-white border-amber-700'
                                    : 'bg-white text-gray-500 border-gray-300 hover:border-gray-400'
                                    }`}
                            >
                                <cat.icon className="w-3.5 h-3.5" />
                                <span>{cat.name}</span>
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => setShowForm(true)}
                        className="w-full md:w-auto flex items-center justify-center gap-2 bg-amber-700 text-white px-5 py-2.5 rounded-md text-sm font-bold uppercase tracking-widest hover:bg-amber-800 transition-colors shrink-0"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Share a Request</span>
                    </button>
                </div>

                {success && (
                    <div className="mb-8 p-4 bg-green-50 border border-green-200 text-green-800 text-sm rounded-md flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 shrink-0" />
                        <p className="font-medium">{success}</p>
                    </div>
                )}


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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
                        {requests.map(request => (
                            <div key={request.id} className="group bg-white border border-gray-300 rounded-lg shadow-sm overflow-hidden hover:border-gray-400 hover:shadow-md transition-all flex flex-col">
                                <div className="p-4 md:p-6 flex-1 relative">
                                    {request.status === 'ANSWERED' && (
                                        <div className="absolute top-0 right-0 p-3 md:p-4">
                                            <div className="bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 md:px-2.5 md:py-1 rounded text-[9px] md:text-[10px] font-black uppercase tracking-widest flex items-center gap-1 md:gap-1.5">
                                                <Sparkles className="h-2.5 w-2.5 md:h-3 md:w-3" />
                                                Answered
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between mb-3 md:mb-4 pr-3 md:pr-4">
                                        <div className="flex items-center gap-1.5 md:gap-2 flex-wrap">
                                            <span className="px-2 py-0.5 md:px-2.5 md:py-1 bg-amber-50 text-amber-700 text-[9px] md:text-[10px] font-black rounded border border-amber-100 uppercase tracking-widest">
                                                {request.category}
                                            </span>
                                            {request.status === 'ANSWERED' && (
                                                <span className="px-2 py-0.5 md:px-2.5 md:py-1 bg-green-50 text-green-700 text-[9px] md:text-[10px] font-black rounded border border-green-200 uppercase tracking-widest">
                                                    Praise Report
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-gray-400 text-[10px] md:text-xs flex items-center shrink-0">
                                            <Clock className="h-2.5 w-2.5 md:h-3 md:w-3 mr-1" />
                                            {new Date(request.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>

                                    <h3 className="text-sm md:text-lg font-bold text-gray-900 mb-2 md:mb-3 group-hover:text-amber-700 transition-colors">
                                        {request.title}
                                    </h3>

                                    <p className="text-gray-600 text-xs md:text-sm leading-relaxed mb-4 md:mb-6 line-clamp-4">
                                        {request.content}
                                    </p>

                                    <div className="flex items-center gap-2.5 md:gap-3">
                                        <div className="w-7 h-7 md:w-9 md:h-9 rounded-full bg-amber-100 flex items-center justify-center shrink-0 overflow-hidden">
                                            {request.user?.profileImage ? (
                                                <img src={request.user.profileImage} alt={request.user.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-amber-800 font-bold text-xs md:text-sm">
                                                    {request.user?.name.charAt(0)}
                                                </span>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-xs md:text-sm font-bold text-gray-900">{request.user?.name}</p>
                                            <p className="text-[9px] md:text-[10px] text-gray-400 uppercase font-bold tracking-widest">Community Member</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="px-4 py-3 md:px-6 md:py-4 flex items-center justify-between border-t border-gray-100 bg-gray-50">
                                    <div className="flex items-center gap-1.5 md:gap-2">
                                        <button
                                            onClick={() => handlePray(request.id)}
                                            className={`flex items-center gap-1 md:gap-1.5 px-3 md:px-4 py-1.5 md:py-2 rounded-md font-bold text-[10px] md:text-xs uppercase tracking-wider transition-colors ${request.status === 'ANSWERED'
                                                ? 'bg-green-100 text-green-700 cursor-default'
                                                : (request as any).supportedByMe
                                                    ? 'bg-amber-700 text-white'
                                                    : 'bg-white text-amber-700 border border-amber-200 hover:bg-amber-700 hover:text-white hover:border-amber-700'
                                                }`}
                                            disabled={request.status === 'ANSWERED'}
                                        >
                                            <Heart className={`h-3 w-3 md:h-3.5 md:w-3.5 ${((request as any).supportedByMe || request.status === 'ANSWERED') ? 'fill-current' : ''}`} />
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
                                                className={`p-1.5 md:p-2 rounded-md border transition-colors ${request.status === 'ANSWERED'
                                                    ? 'bg-amber-100 border-amber-200 text-amber-700 hover:bg-amber-200'
                                                    : 'bg-white border-gray-200 text-gray-400 hover:text-amber-700 hover:border-amber-200'
                                                }`}
                                                title={request.status === 'ANSWERED' ? 'Return to Active Prayer' : 'Mark as Answered (Praise Report)'}
                                            >
                                                <Sparkles className="h-3 w-3 md:h-3.5 md:w-3.5" />
                                            </button>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-1 md:gap-1.5 px-2 py-1 md:px-2.5 md:py-1.5 rounded border border-amber-200 bg-amber-50 text-amber-800 font-bold text-[10px] md:text-xs">
                                        <Users className="h-3 w-3 md:h-3.5 md:w-3.5" />
                                        <span>{request._count?.supports || 0}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-white border border-dashed border-gray-300 rounded-lg">
                        <div className="w-16 h-16 bg-amber-50 border border-amber-100 rounded-full flex items-center justify-center mx-auto mb-5">
                            <Heart className="w-7 h-7 text-amber-700" />
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

            {/* Submit Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                    <div className="bg-white border border-gray-300 rounded-lg shadow-sm max-w-lg w-full p-6 md:p-8 relative max-h-[90vh] overflow-y-auto">
                        <button
                            onClick={() => setShowForm(false)}
                            className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <Plus className="h-5 w-5 rotate-45" />
                        </button>

                        <div className="mb-6">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="w-1 h-4 bg-amber-700 rounded-sm" />
                                <span className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">Share a Testimony or Prayer Request</span>
                            </div>
                            <p className="text-gray-500 text-sm italic">"Cast all your anxiety on him because he cares for you." — 1 Peter 5:7</p>
                        </div>

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

                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5">Request Title</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g., Healing for my Mother"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:border-amber-600 focus:outline-none transition-colors"
                                />
                            </div>

                            <div>
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

                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5">Tell us more so we can pray specifically</label>
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
                                className="w-full bg-amber-700 text-white py-3 rounded-md text-sm font-bold uppercase tracking-widest hover:bg-amber-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
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
                </div>
            )}
        </div>
    );
};

export default PrayerWall;
