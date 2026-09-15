import { useState, useEffect } from 'react';
import { Mail, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import { newsletterAPI } from '../services/api';

interface Subscriber {
    id: string;
    email: string;
    isActive: boolean;
    createdAt: string;
}

const NewsletterManager = () => {
    const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    const loadSubscribers = async () => {
        setLoading(true);
        try {
            const response = await newsletterAPI.getSubscribers();
            if (response.success && response.data) {
                setSubscribers(response.data.subscribers);
            }
        } catch (err) {
            console.error('Failed to load newsletter subscribers:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSubscribers();
    }, []);

    const handleDelete = async (id: string) => {
        try {
            const response = await newsletterAPI.deleteSubscriber(id);
            if (response.success) {
                setSubscribers(prev => prev.filter(s => s.id !== id));
            }
        } catch (err) {
            console.error('Failed to remove subscriber:', err);
        } finally {
            setDeleteConfirm(null);
        }
    };

    const activeCount = subscribers.filter(s => s.isActive).length;
    const inactiveCount = subscribers.length - activeCount;

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="bg-white dark:bg-[#141417] border border-gray-300 dark:border-white/10 rounded-lg shadow-sm p-4 md:p-5">
                <h3 className="text-base font-black uppercase tracking-tight text-gray-900 dark:text-white">Newsletter</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">People who have subscribed for updates from your site</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
                {[
                    { label: 'Total', value: subscribers.length },
                    { label: 'Active', value: activeCount },
                    { label: 'Unsubscribed', value: inactiveCount },
                ].map((stat) => (
                    <div key={stat.label} className="bg-white dark:bg-[#141417] border border-gray-300 dark:border-white/10 rounded-lg shadow-sm p-3 text-center">
                        <p className="text-xl font-black text-gray-900 dark:text-white">{stat.value}</p>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mt-0.5">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Subscribers List */}
            <div className="bg-white dark:bg-[#141417] border border-gray-300 dark:border-white/10 rounded-lg shadow-sm p-3">
                {loading ? (
                    <div className="space-y-3 animate-pulse">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="p-3.5 rounded-lg border border-gray-200 dark:border-white/10 flex items-center gap-3">
                                <div className="w-9 h-9 bg-gray-100 dark:bg-white/10 rounded-lg shrink-0" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-3 w-1/3 bg-gray-100 dark:bg-white/10 rounded" />
                                    <div className="h-2.5 w-1/4 bg-gray-100 dark:bg-white/10 rounded" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : subscribers.length === 0 ? (
                    <div className="text-center py-10">
                        <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                            <Mail className="h-6 w-6 text-amber-700" />
                        </div>
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">No Subscribers Yet</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Newsletter sign-ups will appear here</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {subscribers.map((sub) => (
                            <div
                                key={sub.id}
                                className="p-3.5 rounded-lg border border-gray-200 dark:border-white/10 hover:border-amber-300 dark:hover:border-amber-700/40 transition-colors flex items-center gap-3"
                            >
                                <div className="w-9 h-9 bg-amber-50 dark:bg-amber-900/20 rounded-lg flex items-center justify-center shrink-0">
                                    <Mail className="h-4 w-4 text-amber-700" />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-sm font-bold text-gray-900 dark:text-white truncate">{sub.email}</span>
                                        {sub.isActive ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 uppercase">
                                                <CheckCircle2 className="w-2.5 h-2.5" /> Active
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-white/10 uppercase">
                                                <XCircle className="w-2.5 h-2.5" /> Unsubscribed
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                                        Subscribed {new Date(sub.createdAt).toLocaleDateString()}
                                    </p>
                                </div>

                                <button
                                    onClick={() => setDeleteConfirm(sub.id)}
                                    className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors shrink-0"
                                    title="Remove subscriber"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Delete Confirmation */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-[#141417] border border-gray-300 dark:border-white/10 rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-base font-black uppercase tracking-tight text-gray-900 dark:text-white mb-3">Remove Subscriber</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                            Are you sure you want to remove this subscriber? This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="px-4 py-2 text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-white/10 rounded-lg hover:bg-gray-200 dark:hover:bg-white/20 transition-colors font-semibold"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDelete(deleteConfirm)}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-bold"
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NewsletterManager;
