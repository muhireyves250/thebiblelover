import React from 'react';
import { Heart, Sparkles, Trash2, CheckCircle, Clock, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PrayerRequest {
    id: string;
    title: string;
    content: string;
    category: string;
    isAnonymous: boolean;
    status: string;
    createdAt: string;
    user?: {
        name: string;
        profileImage?: string;
    };
    _count?: {
        supports: number;
    };
}

interface PrayerManagerProps {
    requests: PrayerRequest[];
    showAll: boolean;
    toggleAll: () => void;
    togglePraise: (id: string) => void;
    deleteRequest: (id: string) => void;
    refresh?: () => void;
}

const PrayerManager: React.FC<PrayerManagerProps> = ({
    requests,
    showAll,
    toggleAll,
    togglePraise,
    deleteRequest,
}) => {
    const stats = {
        total: requests.length,
        active: requests.filter(r => r.status === 'ACTIVE').length,
        answered: requests.filter(r => r.status === 'ANSWERED').length,
    };

    return (
        <div className="space-y-4">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-[#141417] border border-gray-300 dark:border-white/10 rounded-lg shadow-sm p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-50 dark:bg-amber-900/20 rounded-lg flex items-center justify-center shrink-0">
                            <Heart className="w-5 h-5 text-amber-700" />
                        </div>
                        <div>
                            <p className="text-xl font-black text-gray-900 dark:text-white">{stats.total}</p>
                            <p className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500 font-bold">Total Requests</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-[#141417] border border-gray-300 dark:border-white/10 rounded-lg shadow-sm p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center shrink-0">
                            <Clock className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-xl font-black text-gray-900 dark:text-white">{stats.active}</p>
                            <p className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500 font-bold">Active</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-[#141417] border border-gray-300 dark:border-white/10 rounded-lg shadow-sm p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center shrink-0">
                            <CheckCircle className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-xl font-black text-gray-900 dark:text-white">{stats.answered}</p>
                            <p className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500 font-bold">Praise Reports</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* List Container */}
            <div className="bg-white dark:bg-[#141417] border border-gray-300 dark:border-white/10 rounded-lg shadow-sm overflow-hidden">
                <div className="px-5 py-3.5 border-b border-gray-200 dark:border-white/10 flex items-center gap-3">
                    <div className="w-8 h-8 bg-amber-50 dark:bg-amber-900/20 rounded-lg flex items-center justify-center shrink-0">
                        <Sparkles className="w-4 h-4 text-amber-700" />
                    </div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-widest">Community Prayers</h3>
                </div>

                <div className="p-3 space-y-3">
                    <AnimatePresence initial={false}>
                        {requests.slice(0, showAll ? requests.length : 5).map((request) => (
                            <motion.div
                                key={request.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="p-4 rounded-lg border border-gray-200 dark:border-white/10 hover:border-amber-300 dark:hover:border-amber-700/40 transition-colors group"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-start gap-3 min-w-0">
                                        <div className="w-10 h-10 rounded-full overflow-hidden bg-amber-50 dark:bg-white/10 flex-shrink-0 border border-amber-100 dark:border-white/10">
                                            {request.user?.profileImage ? (
                                                <img src={request.user.profileImage} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <User className="w-5 h-5 text-amber-700" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                <span className="text-sm font-bold text-gray-900 dark:text-white">{request.title}</span>
                                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${request.status === 'ANSWERED' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                                                    }`}>
                                                    {request.status}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 mb-2 leading-relaxed">
                                                {request.content}
                                            </p>
                                            <div className="flex items-center gap-2.5 flex-wrap text-[10px] text-gray-400 dark:text-gray-500 font-medium">
                                                <span className="flex items-center gap-1">
                                                    <User className="w-3 h-3" />
                                                    <span>{request.isAnonymous ? 'Anonymous' : request.user?.name}</span>
                                                </span>
                                                <span>&middot;</span>
                                                <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                                                <span>&middot;</span>
                                                <span className="flex items-center gap-1 text-emerald-600">
                                                    <Heart className="w-3 h-3 fill-current" />
                                                    <span>{request._count?.supports || 0} supported</span>
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1.5 shrink-0">
                                        <button
                                            onClick={() => togglePraise(request.id)}
                                            className={`p-2 rounded-md border transition-colors ${request.status === 'ANSWERED'
                                                ? 'border-gray-200 dark:border-white/10 text-gray-400 dark:text-gray-500'
                                                : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                                }`}
                                            title={request.status === 'ANSWERED' ? 'Mark as Active' : 'Mark as Answered'}
                                        >
                                            <CheckCircle className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => deleteRequest(request.id)}
                                            className="p-2 rounded-md border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {requests.length === 0 && (
                        <div className="p-12 text-center">
                            <Heart className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">No prayer requests at the moment.</p>
                        </div>
                    )}
                </div>

                {requests.length > 5 && (
                    <div className="p-3 bg-gray-50 dark:bg-white/5 border-t border-gray-200 dark:border-white/10">
                        <button
                            onClick={toggleAll}
                            className="w-full py-2 rounded-md border border-gray-300 dark:border-white/10 text-[10px] font-black uppercase tracking-widest text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-white/10 hover:text-amber-700 transition-colors"
                        >
                            {showAll ? 'Show Less' : `View All ${requests.length} Requests`}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PrayerManager;
