import React from 'react';
import { Heart, Sparkles, Trash2, CheckCircle, Clock, Filter, User } from 'lucide-react';
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
    refresh
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
                <div className="bg-gradient-to-br from-amber-500/10 to-transparent backdrop-blur-md rounded-2xl border border-white/10 p-4">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center">
                            <Heart className="w-5 h-5 text-amber-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{stats.total}</p>
                            <p className="text-[10px] uppercase tracking-widest text-white/50">Total Requests</p>
                        </div>
                    </div>
                </div>
                <div className="bg-gradient-to-br from-emerald-500/10 to-transparent backdrop-blur-md rounded-2xl border border-white/10 p-4">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                            <Clock className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{stats.active}</p>
                            <p className="text-[10px] uppercase tracking-widest text-white/50">Active Intercession</p>
                        </div>
                    </div>
                </div>
                <div className="bg-gradient-to-br from-blue-500/10 to-transparent backdrop-blur-md rounded-2xl border border-white/10 p-4">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{stats.answered}</p>
                            <p className="text-[10px] uppercase tracking-widest text-white/50">Praise Reports</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* List Container */}
            <div className="bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 overflow-hidden">
                <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-amber-500" />
                        </div>
                        <h3 className="text-sm font-bold text-white uppercase tracking-widest">Community Prayers</h3>
                    </div>
                    {refresh && (
                        <button onClick={refresh} className="p-2 text-white/40 hover:text-white transition-colors">
                            <Filter className="w-4 h-4" />
                        </button>
                    )}
                </div>

                <div className="divide-y divide-white/5">
                    <AnimatePresence initial={false}>
                        {requests.slice(0, showAll ? requests.length : 5).map((request) => (
                            <motion.div
                                key={request.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="p-4 hover:bg-white/5 transition-colors group"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start space-x-4">
                                        <div className="w-10 h-10 rounded-full overflow-hidden bg-white/10 flex-shrink-0 border border-white/20">
                                            {request.user?.profileImage ? (
                                                <img src={request.user.profileImage} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <User className="w-5 h-5 text-white/30" />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <div className="flex items-center space-x-2 mb-1">
                                                <span className="text-sm font-bold text-white">{request.title}</span>
                                                <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter ${
                                                    request.status === 'ANSWERED' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-amber-500/20 text-amber-500'
                                                }`}>
                                                    {request.status}
                                                </span>
                                            </div>
                                            <p className="text-xs text-white/60 line-clamp-2 mb-2 leading-relaxed">
                                                {request.content}
                                            </p>
                                            <div className="flex items-center space-x-4 text-[10px] text-white/40 font-medium">
                                                <span className="flex items-center space-x-1">
                                                    <User className="w-3 h-3" />
                                                    <span>{request.isAnonymous ? 'Anonymous' : request.user?.name}</span>
                                                </span>
                                                <span>•</span>
                                                <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                                                <span>•</span>
                                                <span className="flex items-center space-x-1 text-emerald-400">
                                                    <Heart className="w-3 h-3 fill-current" />
                                                    <span>{request._count?.supports || 0} supported</span>
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => togglePraise(request.id)}
                                            className={`p-2 rounded-xl transition-all ${
                                                request.status === 'ANSWERED' ? 'bg-white/10 text-white/40' : 'bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30'
                                            }`}
                                            title={request.status === 'ANSWERED' ? 'Mark as Active' : 'Mark as Answered'}
                                        >
                                            <CheckCircle className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => deleteRequest(request.id)}
                                            className="p-2 bg-red-500/20 text-red-500 hover:bg-red-500/30 rounded-xl transition-all"
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
                            <Heart className="w-12 h-12 text-white/10 mx-auto mb-4" />
                            <p className="text-white/40 text-sm font-medium">No prayer requests at the moment.</p>
                        </div>
                    )}
                </div>

                {requests.length > 5 && (
                    <div className="p-4 bg-white/5 border-t border-white/10">
                        <button
                            onClick={toggleAll}
                            className="w-full py-2 rounded-xl border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/50 hover:bg-white/5 hover:text-white transition-all"
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
