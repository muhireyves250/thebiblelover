import React, { useState, useEffect } from 'react';
import { Heart, Plus, MessageSquare, Shield, Clock, Users, ArrowRight, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
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
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ title: '', content: '', category: 'GENERAL', isAnonymous: false });
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
        if (!currentUser) return;

        setSubmitting(true);
        setError('');
        try {
            const response = await prayerAPI.createRequest(formData);
            if (response.success) {
                setSuccess('Your prayer request has been shared with the community.');
                setFormData({ title: '', content: '', category: 'GENERAL', isAnonymous: false });
                setShowModal(false);
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
        <div className="min-h-screen bg-gray-50">
            <PageHeader
                title="Community Prayer Wall"
                subtitle="A sacred space to share burdens and lift each other up in prayer."
            />

            <main className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
                {/* Actions & Filters */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
                    <div className="flex flex-wrap justify-center gap-2">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => {
                                    setActiveCategory(cat.id);
                                    setPagination({ ...pagination, page: 1 });
                                }}
                                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 flex items-center space-x-2 ${activeCategory === cat.id
                                    ? 'bg-amber-600 text-white shadow-lg shadow-amber-200'
                                    : 'bg-white text-gray-700 hover:bg-amber-50 border border-gray-200'
                                    }`}
                            >
                                <span>{cat.icon}</span>
                                <span>{cat.name}</span>
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => currentUser ? setShowModal(true) : alert('Please log in to share a prayer request.')}
                        className="flex items-center space-x-2 bg-gradient-to-r from-amber-600 to-amber-700 text-white px-8 py-4 rounded-2xl font-bold hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 active:scale-95"
                    >
                        <Plus className="h-5 w-5" />
                        <span>Share a Request</span>
                    </button>
                </div>

                {success && (
                    <div className="mb-8 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center space-x-3 animate-fade-in">
                        <CheckCircle className="h-5 w-5" />
                        <p className="font-medium">{success}</p>
                    </div>
                )}

                {/* Prayer Feed */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm animate-pulse">
                                <div className="h-6 w-3/4 bg-gray-200 rounded-lg mb-4"></div>
                                <div className="h-20 bg-gray-100 rounded-lg mb-6"></div>
                                <div className="h-10 w-1/2 bg-gray-200 rounded-full"></div>
                            </div>
                        ))}
                    </div>
                ) : requests.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {requests.map(request => (
                            <div key={request.id} className="group bg-white rounded-3xl overflow-hidden border border-gray-100 hover:border-amber-200 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col">
                                <div className={`p-8 flex-1 relative ${request.status === 'ANSWERED' ? 'bg-gradient-to-br from-white to-emerald-50/30' : ''}`}>
                                    {request.status === 'ANSWERED' && (
                                        <div className="absolute top-0 right-0 p-4">
                                            <div className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 shadow-sm border border-emerald-200">
                                                <Sparkles className="h-3 w-3" />
                                                Answered
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-2">
                                            <span className="px-3 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-full border border-amber-100 uppercase tracking-wider">
                                                {request.category}
                                            </span>
                                            {request.status === 'ANSWERED' && (
                                                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-100 uppercase tracking-wider">
                                                    Praise Report
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-gray-400 text-xs flex items-center">
                                            <Clock className="h-3 w-3 mr-1" />
                                            {new Date(request.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>

                                    <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-amber-700 transition-colors">
                                        {request.title}
                                    </h3>

                                    <p className="text-gray-600 leading-relaxed mb-8 line-clamp-4">
                                        {request.content}
                                    </p>

                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center border-2 border-white shadow-sm overflow-hidden">
                                            {request.user?.profileImage ? (
                                                <img src={request.user.profileImage} alt={request.user.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-amber-700 font-bold text-sm">
                                                    {request.user?.name.charAt(0)}
                                                </span>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">{request.user?.name}</p>
                                            <p className="text-[10px] text-gray-500 uppercase font-semibold">Community Member</p>
                                        </div>
                                    </div>
                                </div>

                                <div className={`px-8 py-6 flex items-center justify-between border-t ${request.status === 'ANSWERED' ? 'bg-emerald-50/50 border-emerald-100' : 'bg-gray-50 border-gray-100'}`}>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handlePray(request.id)}
                                            className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${request.status === 'ANSWERED'
                                                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 cursor-default'
                                                : (request as any).supportedByMe
                                                    ? 'bg-amber-600 text-white shadow-lg shadow-amber-200'
                                                    : 'bg-white text-amber-700 border border-amber-200 hover:bg-amber-600 hover:text-white hover:border-transparent hover:shadow-lg'
                                                }`}
                                            disabled={request.status === 'ANSWERED'}
                                        >
                                            <Heart className={`h-4 w-4 ${((request as any).supportedByMe || request.status === 'ANSWERED') ? 'fill-current' : ''}`} />
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
                                                className={`p-2.5 rounded-xl border transition-all duration-300 ${request.status === 'ANSWERED'
                                                    ? 'bg-amber-100 border-amber-200 text-amber-700 hover:bg-amber-200'
                                                    : 'bg-white border-gray-200 text-gray-400 hover:text-amber-600 hover:border-amber-200'
                                                }`}
                                                title={request.status === 'ANSWERED' ? 'Return to Active Prayer' : 'Mark as Answered (Praise Report)'}
                                            >
                                                <Sparkles className={`h-4 w-4 ${request.status === 'ANSWERED' ? 'fill-current' : ''}`} />
                                            </button>
                                        )}
                                    </div>

                                    <div className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border font-bold text-xs ${request.status === 'ANSWERED' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-amber-100 text-amber-800 border-amber-200'}`}>
                                        <Users className="h-3.5 w-3.5" />
                                        <span>{request._count?.supports || 0}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-gray-200">
                        <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
                            🙏
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">No prayer requests found</h3>
                        <p className="text-gray-500 max-w-sm mx-auto">
                            Be the first to share a burden or request guidance from our community.
                        </p>
                    </div>
                )}

                {/* Pagination */}
                {pagination.pages > 1 && (
                    <div className="mt-16 flex justify-center items-center space-x-4">
                        <button
                            disabled={pagination.page === 1}
                            onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                            className="p-3 rounded-xl border border-gray-200 hover:border-amber-500 hover:text-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            <ArrowRight className="h-5 w-5 rotate-180" />
                        </button>
                        <span className="text-sm font-bold text-gray-700">
                            Page {pagination.page} of {pagination.pages}
                        </span>
                        <button
                            disabled={pagination.page === pagination.pages}
                            onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                            className="p-3 rounded-xl border border-gray-200 hover:border-amber-500 hover:text-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            <ArrowRight className="h-5 w-5" />
                        </button>
                    </div>
                )}
            </main>

            {/* Submit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fade-in">
                    <div className="bg-white rounded-[2.5rem] max-w-lg w-full p-8 md:p-12 shadow-2xl relative overflow-hidden transform animate-scale-up">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-500 to-amber-700"></div>

                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <Plus className="h-6 w-6 rotate-45" />
                        </button>

                        <div className="text-center mb-10">
                            <h2 className="text-3xl font-bold text-gray-900 mb-3">Share a Prayer Request</h2>
                            <p className="text-gray-500 italic">"Cast all your anxiety on him because he cares for you." — 1 Peter 5:7</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Request Title</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g., Healing for my Mother"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-amber-500 focus:bg-white outline-none transition-all font-medium"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                                <select
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-amber-500 focus:bg-white outline-none transition-all font-medium"
                                >
                                    {CATEGORIES.filter(c => c.id !== 'ALL').map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Tell us more so we can pray specifically</label>
                                <textarea
                                    required
                                    rows={4}
                                    placeholder="Share as much or as little as you're comfortable with..."
                                    value={formData.content}
                                    onChange={e => setFormData({ ...formData, content: e.target.value })}
                                    className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-amber-500 focus:bg-white outline-none transition-all font-medium resize-none"
                                ></textarea>
                            </div>

                            <div className="flex items-center space-x-3 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                                <input
                                    type="checkbox"
                                    id="isAnonymous"
                                    checked={formData.isAnonymous}
                                    onChange={e => setFormData({ ...formData, isAnonymous: e.target.checked })}
                                    className="w-5 h-5 accent-amber-600 rounded cursor-pointer"
                                />
                                <label htmlFor="isAnonymous" className="text-sm font-semibold text-amber-900 cursor-pointer flex items-center">
                                    <Shield className="h-4 w-4 mr-2" />
                                    Post anonymously
                                </label>
                            </div>

                            {error && (
                                <div className="p-4 bg-red-50 text-red-700 text-sm font-bold rounded-2xl border border-red-100 flex items-center space-x-2">
                                    <AlertCircle className="h-4 w-4" />
                                    <span>{error}</span>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-gradient-to-r from-amber-600 to-amber-700 text-white py-5 rounded-2xl font-bold hover:shadow-2xl transition-all duration-300 disabled:opacity-50 flex items-center justify-center space-x-2 text-lg shadow-xl shadow-amber-200"
                            >
                                {submitting ? (
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                                ) : (
                                    <>
                                        <MessageSquare className="h-6 w-6" />
                                        <span>Post Request</span>
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Global CSS for animations */}
            <style dangerouslySetInnerHTML={{
                __html: `
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-up {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
        .animate-scale-up { animation: scale-up 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
      `}} />
        </div>
    );
};

export default PrayerWall;
