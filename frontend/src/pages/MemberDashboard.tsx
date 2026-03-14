import React, { useState, useEffect } from 'react';
import { BookOpen, Heart, Bookmark, ChevronRight, User as UserIcon, LogOut, MessageSquare, Users, Trash2, Sparkles, History, Clock, FileText, Bell, Mail, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { userAPI, authAPI, prayerAPI, searchAPI, uploadAPI } from '../services/api';
import type { BlogPost as BlogPostType, BibleVerse, PrayerRequest, ViewHistory } from '../services/api.d';
import BlogCard from '../components/BlogCard';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAPI';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

const growthData = [
    { day: 'Mon', progress: 30 },
    { day: 'Tue', progress: 45 },
    { day: 'Wed', progress: 38 },
    { day: 'Thu', progress: 65 },
    { day: 'Fri', progress: 55 },
    { day: 'Sat', progress: 80 },
    { day: 'Sun', progress: 70 },
];

const MemberDashboard: React.FC = () => {
    const [data, setData] = useState<{
        likedPosts: BlogPostType[];
        savedVerses: BibleVerse[];
        newsletterSubscription: boolean;
        prayerRequests: PrayerRequest[];
        forumActivity: any[];
        joinedEvents: any[];
        recommendations: BlogPostType[];
        history: ViewHistory[];
        weeklyActivity: { day: string, progress: number }[];
        donations: any[];
        stats: {
            posts: number;
            prayers: number;
            events: number;
        };
        preferences: {
            receiveNewsletter: boolean;
            receivePrayerAlerts: boolean;
        }
    } | null>(null);
    const [prefLoading, setPrefLoading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'events'>('overview');
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [profileForm, setProfileForm] = useState({ name: '', profileImage: '' });
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const { user, isAuthenticated, isInitialized, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [dashRes, prayerRes, recRes, historyRes] = await Promise.all([
                    userAPI.getDashboardData(),
                    prayerAPI.getMyRequests(),
                    searchAPI.getRecommendations(),
                    searchAPI.getHistory()
                ]);

                if (dashRes.success && dashRes.data) {
                    setData({
                        likedPosts: dashRes.data.likedPosts || [],
                        savedVerses: dashRes.data.savedVerses || [],
                        newsletterSubscription: dashRes.data.newsletterSubscription ?? false,
                        prayerRequests: (prayerRes.success && prayerRes.data) ? prayerRes.data.requests || [] : [],
                        forumActivity: dashRes.data.forumActivity || [],
                        joinedEvents: dashRes.data.joinedEvents || [],
                        recommendations: (recRes.success && recRes.data) ? recRes.data : [],
                        history: (historyRes.success && historyRes.data) ? historyRes.data : [],
                        weeklyActivity: dashRes.data.weeklyActivity || [],
                        donations: dashRes.data.donations || [],
                        stats: dashRes.data.stats || { posts: 0, prayers: 0, events: 0 },
                        preferences: dashRes.data.preferences || { receiveNewsletter: true, receivePrayerAlerts: true }
                    });
                }
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const getBadges = () => {
        if (!data) return [];
        const badges = [];
        if (data.stats.prayers >= 5) badges.push({ id: 'warrior', name: 'Prayer Warrior', icon: '🙏', color: 'bg-blue-50 text-blue-700' });
        if (data.stats.posts >= 5) badges.push({ id: 'pillar', name: 'Community Pillar', icon: '🏛️', color: 'bg-purple-50 text-purple-700' });
        if (data.stats.events >= 3) badges.push({ id: 'active', name: 'Active Participant', icon: '🌟', color: 'bg-green-50 text-green-700' });
        return badges;
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUpdatingProfile(true);
        try {
            const response = await userAPI.updateProfile(profileForm);
            if (response.success) {
                setIsProfileModalOpen(false);
                // Refresh local session
                const updatedUser = { ...user, ...profileForm };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                window.location.reload(); 
            }
        } catch (error: any) {
            console.error('Failed to update profile:', error);
            alert(error.message || 'Failed to update profile. Please try again.');
        } finally {
            setIsUpdatingProfile(false);
        }
    };

    const handlePreferenceChange = async (key: string, value: boolean) => {
        setPrefLoading(true);
        try {
            const currentPrefs = data?.preferences || { receiveNewsletter: true, receivePrayerAlerts: true };
            const updatedPrefs = { ...currentPrefs, [key]: value };
            const response = await userAPI.updatePreferences(updatedPrefs);
            if (response.success) {
                setData(prev => prev ? { ...prev, preferences: response.data } : null);
            }
        } catch (error) {
            console.error('Failed to update preferences:', error);
        } finally {
            setPrefLoading(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploadingImage(true);
        try {
            const response = await uploadAPI.uploadProfileImage(file);
            if (response.success) {
                setProfileForm(prev => ({ ...prev, profileImage: response.data.url }));
            }
        } catch (error) {
            console.error('Image upload failed:', error);
        } finally {
            setIsUploadingImage(false);
        }
    };

    useEffect(() => {
        if (user) {
            setProfileForm({
                name: user.name || '',
                profileImage: user.profileImage || ''
            });
        }
    }, [user]);

    if (loading || !isInitialized) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0c] transition-colors duration-500 selection:bg-amber-200 dark:selection:bg-amber-900/40">
            <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16"
            >
                {/* Profile Header */}
                <motion.div variants={itemVariants} className="glass-card p-10 mb-12 relative group">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 dark:bg-amber-500/5 rounded-full -mr-48 -mt-48 blur-[100px] group-hover:bg-amber-500/20 transition-all duration-1000"></div>

                    <div className="flex flex-col md:flex-row items-center justify-between gap-10 relative z-10">
                        <div className="flex flex-col md:flex-row items-center gap-10">
                            <motion.div 
                                whileHover={{ scale: 1.05, rotate: 2 }}
                                className="w-40 h-40 rounded-[2.5rem] bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/40 dark:to-amber-800/40 flex items-center justify-center shadow-2xl relative overflow-hidden ring-8 ring-white/50 dark:ring-gray-800/50"
                            >
                                {user?.profileImage ? (
                                    <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                                ) : (
                                    <UserIcon className="w-20 h-20 text-amber-600 dark:text-amber-500" />
                                )}
                            </motion.div>
                            <div className="text-center md:text-left">
                                <h1 className="text-5xl font-serif text-gray-900 dark:text-gray-100 mb-2 tracking-tight">Welcome back, {user?.name}</h1>
                                <p className="text-gray-500 dark:text-gray-400 font-medium text-lg mb-6">{user?.email}</p>
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                                    <span className="px-4 py-1.5 bg-amber-500 text-white text-[10px] font-black rounded-full uppercase tracking-widest shadow-lg shadow-amber-500/20">
                                        {user?.role || 'Member'}
                                    </span>
                                    {getBadges().map(badge => (
                                        <motion.span 
                                            key={badge.id}
                                            whileHover={{ y: -2 }}
                                            className={`px-4 py-1.5 ${badge.color} text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-2 shadow-sm border border-black/5 dark:border-white/5`}
                                        >
                                            <span className="text-sm">{badge.icon}</span> {badge.name}
                                        </motion.span>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <motion.div
                            className="flex flex-col sm:flex-row gap-4"
                        >
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setIsProfileModalOpen(true)}
                                className="flex items-center gap-3 px-8 py-4 bg-amber-600 text-white rounded-2xl transition-all duration-300 font-black uppercase tracking-widest text-xs shadow-lg shadow-amber-600/20"
                            >
                                <UserIcon className="w-5 h-5" />
                                Edit Profile
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleLogout}
                                className="flex items-center gap-3 px-8 py-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-2xl transition-all duration-300 font-black uppercase tracking-widest text-xs"
                            >
                                <LogOut className="w-5 h-5" />
                                Sign Out
                            </motion.button>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Spiritual Growth Journey */}
                <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-16">
                    <div className="lg:col-span-3 glass-card p-10 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-125 transition-transform duration-[2000ms]">
                            <TrendingUp className="w-48 h-48 text-amber-600" />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-10">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-amber-500/10 rounded-2xl">
                                        <Sparkles className="w-6 h-6 text-amber-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-serif text-gray-900 dark:text-gray-100">Spiritual Growth Journey</h2>
                                        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Consistency Insight</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-black text-amber-600 uppercase tracking-widest">
                                        Level {Math.floor(((data?.stats.posts || 0) + (data?.stats.prayers || 0)) / 5) + 1}
                                    </p>
                                    <p className="text-2xl font-serif text-gray-900 dark:text-gray-100">
                                        {((data?.stats.posts || 0) + (data?.stats.prayers || 0)) < 5 ? 'Seeker' : 
                                         ((data?.stats.posts || 0) + (data?.stats.prayers || 0)) < 15 ? 'Disciple' : 'Elder'}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                                <div className="md:col-span-2">
                                    <div className="h-64 w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={data?.weeklyActivity || growthData}>
                                                <defs>
                                                    <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                                                <XAxis 
                                                    dataKey="day" 
                                                    axisLine={false} 
                                                    tickLine={false} 
                                                    tick={{ fill: '#9CA3AF', fontSize: 10, fontWeight: 'bold' }} 
                                                />
                                                <Tooltip 
                                                    contentStyle={{ 
                                                        borderRadius: '20px', 
                                                        border: 'none', 
                                                        boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)',
                                                        backgroundColor: 'rgba(255,255,255,0.9)'
                                                    }} 
                                                />
                                                <Area 
                                                    type="monotone" 
                                                    dataKey="progress" 
                                                    stroke="#f59e0b" 
                                                    strokeWidth={4} 
                                                    fill="url(#growthGradient)" 
                                                    animationDuration={2000}
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                                <div className="space-y-6 flex flex-col justify-center">
                                    {[
                                        { label: 'Prayers Lifted', value: data?.stats.prayers || 0, icon: Heart, color: 'text-red-500' },
                                        { label: 'Seeds Sown', value: data?.stats.posts || 0, icon: Sparkles, color: 'text-amber-500' },
                                        { label: 'Gatherings', value: data?.stats.events || 0, icon: Users, color: 'text-blue-500' }
                                    ].map((stat, i) => (
                                        <div key={i} className="flex items-center gap-4 p-4 bg-gray-50/50 dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/5">
                                            <stat.icon className={`w-5 h-5 ${stat.color}`} />
                                            <div>
                                                <p className="text-xl font-bold text-gray-900 dark:text-gray-100 leading-none">{stat.value}</p>
                                                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-1">{stat.label}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                             <div className="mt-10">
                                <div className="flex justify-between items-end mb-3">
                                    <p className="text-sm font-bold text-gray-600 dark:text-gray-400 italic">"Your roots are deepening in faith..."</p>
                                    <p className="text-sm font-black text-amber-600">
                                        {Math.min(100, Math.round(((data?.stats.posts || 0) + (data?.stats.prayers || 0)) * 6.5))}% Progress
                                    </p>
                                </div>
                                <div className="h-2 w-full bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min(100, Math.round(((data?.stats.posts || 0) + (data?.stats.prayers || 0)) * 6.5))}%` }}
                                        transition={{ duration: 1.5, delay: 0.5 }}
                                        className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full shadow-[0_0_20px_rgba(245,158,11,0.4)]"
                                    ></motion.div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <motion.div 
                        whileHover={{ scale: 1.02 }}
                        className="bg-gradient-to-br from-amber-600 to-amber-800 rounded-[2.5rem] p-10 text-white shadow-2xl flex flex-col justify-between relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform duration-1000"></div>
                        <div className="w-16 h-16 bg-white/20 rounded-2xl backdrop-blur-md flex items-center justify-center mb-8">
                            <Heart className="w-8 h-8 fill-current text-white animate-pulse" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-serif mb-3">Daily Blessing</h3>
                            <p className="text-amber-50/70 italic leading-relaxed text-lg">
                                "May your heart be a sanctuary of peace and your words be seeds of hope today."
                            </p>
                        </div>
                        <div className="mt-8 pt-8 border-t border-white/20">
                            <p className="text-[10px] font-black uppercase tracking-widest text-amber-200">The Bible Lover Team</p>
                        </div>
                    </motion.div>
                </motion.div>

                {/* Tabs */}
                <div className="flex items-center gap-8 mb-12 border-b border-gray-100 dark:border-gray-800">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`pb-4 text-sm font-bold uppercase tracking-[0.2em] transition-all relative ${activeTab === 'overview' ? 'text-amber-600' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        Overview
                        {activeTab === 'overview' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-amber-600"></div>}
                    </button>
                    <button
                        onClick={() => setActiveTab('activity')}
                        className={`pb-4 text-sm font-bold uppercase tracking-[0.2em] transition-all relative ${activeTab === 'activity' ? 'text-amber-600' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        Activity
                        {activeTab === 'activity' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-amber-600"></div>}
                    </button>
                    <button
                        onClick={() => setActiveTab('events')}
                        className={`pb-4 text-sm font-bold uppercase tracking-[0.2em] transition-all relative ${activeTab === 'events' ? 'text-amber-600' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        My Events
                        {activeTab === 'events' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-amber-600"></div>}
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Main Content Area */}
                    <div className="lg:col-span-2 space-y-12">
                        {activeTab === 'overview' && (
                            <>
                                {/** Recommended for You */}
                                {data && data.recommendations.length > 0 && (
                                    <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                                        <div className="flex items-center justify-between mb-8">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg shadow-amber-200/50">
                                                    <Sparkles className="w-5 h-5 text-white" />
                                                </div>
                                                <h2 className="text-2xl font-serif text-gray-900 dark:text-gray-100">Recommended for You</h2>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            {data.recommendations.map((post) => (
                                                <BlogCard
                                                    key={post.id}
                                                    {...post}
                                                    publishedAt={post.publishedAt || new Date().toISOString()}
                                                    author={post.author || { name: 'The Bible Lover' }}
                                                />
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {/* Liked Posts */}
                                <section>
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded-lg">
                                                <Heart className="w-6 h-6 text-amber-600 dark:text-amber-500" />
                                            </div>
                                            <h2 className="text-2xl font-serif text-gray-900 dark:text-gray-100">Liked Reflections</h2>
                                        </div>
                                        <Link to="/posts" className="text-amber-600 hover:text-amber-700 dark:text-amber-500 dark:hover:text-amber-400 font-bold text-sm flex items-center gap-1 group">
                                            Explore More <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </Link>
                                    </div>

                                    {!data || data.likedPosts.length === 0 ? (
                                        <div className="glass-card p-16 text-center">
                                            <Heart className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-6" />
                                            <p className="text-gray-500 dark:text-gray-400 italic font-serif">You haven't liked any reflections yet.</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            {data.likedPosts.map((post) => (
                                                <BlogCard
                                                    key={post.id}
                                                    {...post}
                                                    publishedAt={post.publishedAt || new Date().toISOString()}
                                                    author={post.author || { name: 'The Bible Lover' }}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </section>

                                {/* Prayer Requests */}
                                <section>
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded-lg">
                                                <MessageSquare className="w-6 h-6 text-amber-600 dark:text-amber-500" />
                                            </div>
                                            <h2 className="text-2xl font-serif text-gray-900 dark:text-gray-100">My Prayers</h2>
                                        </div>
                                        <Link to="/prayer-wall" className="text-amber-600 hover:text-amber-700 dark:text-amber-500 dark:hover:text-amber-400 font-bold text-sm flex items-center gap-1 group">
                                            View Wall <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </Link>
                                    </div>

                                    {!data || data.prayerRequests.length === 0 ? (
                                        <div className="glass-card p-16 text-center">
                                            <p className="text-gray-500 dark:text-gray-400 italic font-serif">No prayers shared yet.</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            {data.prayerRequests.map((request) => (
                                                <div key={request.id} className="glass-card p-8 group hover:border-amber-500/50">
                                                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3 truncate">{request.title}</h3>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-6 leading-relaxed italic">"{request.content}"</p>
                                                    <div className="flex items-center justify-between pt-6 border-t border-black/5 dark:border-white/5">
                                                        <div className="flex items-center gap-2 text-xs font-black text-amber-600 uppercase tracking-widest">
                                                            <Users className="w-4 h-4" />
                                                            {request._count?.supports || 0} praying
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </section>

                                {/* Support History */}
                                <section>
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded-lg">
                                                <Heart className="w-6 h-6 text-amber-600 dark:text-amber-500" />
                                            </div>
                                            <h2 className="text-2xl font-serif text-gray-900 dark:text-gray-100">Seed Support History</h2>
                                        </div>
                                    </div>

                                    {!data || data.donations.length === 0 ? (
                                        <div className="glass-card p-12 text-center">
                                            <Sparkles className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                                            <p className="text-gray-500 dark:text-gray-400 italic font-serif">No support history recorded yet.</p>
                                            <Link to="/donate" className="inline-block mt-4 text-amber-600 font-bold text-sm hover:underline underline-offset-4">Plant a seed today</Link>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 gap-6">
                                            {data.donations.map((donation: any) => (
                                                <div key={donation.id} className="glass-card p-6 flex items-center justify-between group">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600">
                                                            <Heart className="w-6 h-6 fill-current" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-black text-gray-900 dark:text-gray-100">Donation Supported</p>
                                                            <p className="text-[10px] text-gray-500 uppercase tracking-widest">{new Date(donation.createdAt).toLocaleDateString()}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-lg font-serif text-amber-600">${donation.amount}</p>
                                                        <p className="text-[10px] text-green-600 font-black uppercase tracking-widest">Completed</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </section>
                            </>
                        )}

                        {activeTab === 'activity' && (
                            <section className="animate-in fade-in slide-in-from-bottom-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                    {/* Forum Activity */}
                                    <div>
                                        <div className="flex items-center gap-3 mb-8">
                                            <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded-lg">
                                                <MessageSquare className="w-6 h-6 text-amber-600 dark:text-amber-500" />
                                            </div>
                                            <h2 className="text-2xl font-serif text-gray-900 dark:text-gray-100">Forum Activity</h2>
                                        </div>

                                        {!data || data.forumActivity.length === 0 ? (
                                            <div className="glass-card p-12 text-center">
                                                <p className="text-gray-500 dark:text-gray-400 italic font-serif">No forum activity yet.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {data.forumActivity.map((activity) => (
                                                    <Link
                                                        key={activity.id}
                                                        to={`/forum/topic/${activity.topicId}`}
                                                        className="block glass-card p-6 !rounded-2xl hover:border-amber-500/30 group"
                                                    >
                                                        <h4 className="text-sm font-black text-amber-600 mb-2 uppercase tracking-wide truncate">In: {activity.topic?.title}</h4>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1 italic group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors">"{activity.content}"</p>
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Recently Viewed */}
                                    <div>
                                        <div className="flex items-center gap-3 mb-8">
                                            <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                                                <History className="w-6 h-6 text-blue-600 dark:text-blue-500" />
                                            </div>
                                            <h2 className="text-2xl font-serif text-gray-900 dark:text-gray-100">Recently Viewed</h2>
                                        </div>

                                        {!data || data.history.length === 0 ? (
                                            <div className="bg-white dark:bg-gray-900 rounded-2xl p-12 text-center border border-gray-100 dark:border-gray-800">
                                                <p className="text-gray-500 dark:text-gray-400 italic">History is clear.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {data.history.map((item) => (
                                                    <Link
                                                        key={item.id}
                                                        to={item.link}
                                                        className="flex items-center gap-4 p-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-blue-200 transition-all group"
                                                    >
                                                        <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg group-hover:bg-blue-50 transition-colors">
                                                            {item.type === 'POST' ? <FileText className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">{item.title}</h4>
                                                            <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                                                                <Clock className="w-3 h-3" /> {new Date(item.viewedAt).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </section>
                        )}

                        {activeTab === 'events' && (
                            <section className="animate-in fade-in slide-in-from-bottom-4">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded-lg">
                                        <BookOpen className="w-6 h-6 text-amber-600 dark:text-amber-500" />
                                    </div>
                                    <h2 className="text-2xl font-serif text-gray-900 dark:text-gray-100">Joined Events</h2>
                                </div>

                                {!data || data.joinedEvents.length === 0 ? (
                                    <div className="bg-white dark:bg-gray-900 rounded-2xl p-12 text-center border border-gray-100 dark:border-gray-800">
                                        <p className="text-gray-500 dark:text-gray-400 italic">No upcoming events.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {data.joinedEvents.map((event) => (
                                            <Link key={event.id} to={`/events/${event.id}`} className="group bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-all">
                                                <div className="aspect-video relative overflow-hidden">
                                                    <img src={event.thumbnail || 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&q=80'} alt={event.title} className="w-full h-full object-cover" />
                                                </div>
                                                <div className="p-6">
                                                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">{event.title}</h3>
                                                    <p className="text-xs text-gray-500">{new Date(event.date).toLocaleDateString()}</p>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </section>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-12">
                        {/* Notification Settings */}
                        <motion.section variants={itemVariants} className="glass-card p-10 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full -mr-24 -mt-24 blur-3xl"></div>

                            <div className="flex items-center gap-4 mb-10 relative z-10">
                                <div className="p-3 bg-amber-500/10 rounded-2xl ring-1 ring-amber-500/20">
                                    <Bell className="w-6 h-6 text-amber-600" />
                                </div>
                                <h3 className="text-2xl font-serif text-gray-900 dark:text-gray-100">Preferences</h3>
                            </div>

                            <div className="space-y-6 relative z-10">
                                <div className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center group-hover:bg-amber-50 dark:group-hover:bg-amber-900/20 transition-colors">
                                            <Mail className="w-4 h-4 text-gray-400 group-hover:text-amber-600 transition-colors" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900 dark:text-gray-100">Newsletter</p>
                                            <p className="text-[10px] text-gray-500">Weekly grains of wisdom</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handlePreferenceChange('receiveNewsletter', !data?.preferences.receiveNewsletter)}
                                        disabled={prefLoading}
                                        className={`w-12 h-6 rounded-full transition-all relative ${data?.preferences.receiveNewsletter ? 'bg-amber-600' : 'bg-gray-200 dark:bg-gray-800'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${data?.preferences.receiveNewsletter ? 'left-7' : 'left-1'}`}></div>
                                    </button>
                                </div>

                                <div className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center group-hover:bg-amber-50 dark:group-hover:bg-amber-900/20 transition-colors">
                                            <Sparkles className="w-4 h-4 text-gray-400 group-hover:text-amber-600 transition-colors" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900 dark:text-gray-100">Prayer Alerts</p>
                                            <p className="text-[10px] text-gray-500">Community prayer updates</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handlePreferenceChange('receivePrayerAlerts', !data?.preferences.receivePrayerAlerts)}
                                        disabled={prefLoading}
                                        className={`w-12 h-6 rounded-full transition-all relative ${data?.preferences.receivePrayerAlerts ? 'bg-amber-600' : 'bg-gray-200 dark:bg-gray-800'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${data?.preferences.receivePrayerAlerts ? 'left-7' : 'left-1'}`}></div>
                                    </button>
                                </div>
                            </div>
                        </motion.section>

                        {/* Saved Verses */}
                        <section>
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded-lg">
                                    <Bookmark className="w-6 h-6 text-amber-600 dark:text-amber-500" />
                                </div>
                                <h2 className="text-2xl font-serif text-gray-900 dark:text-gray-100">Saved Verses</h2>
                            </div>

                            <div className="space-y-6">
                                {!data || data.savedVerses.length === 0 ? (
                                    <div className="glass-card p-12 text-center">
                                        <p className="text-gray-500 dark:text-gray-400 text-sm italic font-serif">Save your favorite verses.</p>
                                    </div>
                                ) : (
                                    data.savedVerses.map((verse) => (
                                        <motion.div 
                                            key={verse.id} 
                                            whileHover={{ x: 5 }}
                                            className="glass-card p-8 group border-transparent hover:border-amber-500/30"
                                        >
                                            <p className="text-xl text-gray-800 dark:text-gray-200 font-serif leading-relaxed mb-6 italic">"{verse.text}"</p>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-black text-amber-600 uppercase tracking-widest">
                                                    {verse.book} {verse.chapter}:{verse.verse}
                                                </span>
                                                <motion.button
                                                    whileHover={{ scale: 1.1, rotate: 10 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={async () => {
                                                        const response = await userAPI.removeSavedVerse(verse.id);
                                                        if (response.success) {
                                                            const dashboardResponse = await userAPI.getDashboardData();
                                                            if (dashboardResponse.success && dashboardResponse.data) {
                                                                setData(prev => prev ? { ...prev, savedVerses: dashboardResponse.data?.savedVerses || [] } : null);
                                                            }
                                                        }
                                                    }}
                                                    className="p-3 bg-red-50 dark:bg-red-900/10 text-gray-400 hover:text-red-500 rounded-2xl transition-all"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </motion.button>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        </section>

                        {/* Quick Links */}
                        <div className="bg-gradient-to-br from-amber-600 to-amber-700 rounded-3xl p-8 text-white shadow-xl hover:scale-[1.02] transition-transform duration-500">
                            <BookOpen className="w-10 h-10 mb-6 opacity-30" />
                            <h3 className="text-2xl font-serif mb-4">Deepen Your Faith</h3>
                            <p className="text-amber-100 mb-8 leading-relaxed">Continue your journey with our recommended deep-dives.</p>
                            <Link to="/posts?category=STUDY" className="inline-flex items-center gap-2 bg-white text-amber-700 px-6 py-3 rounded-xl font-bold hover:bg-amber-50 transition-colors">
                                Start Studying <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Profile Edit Modal */}
            <AnimatePresence>
                {isProfileModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsProfileModalOpen(false)}
                            className="absolute inset-0 bg-gray-950/60 backdrop-blur-sm"
                        ></motion.div>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800"
                        >
                            <div className="p-8 md:p-12">
                                <h2 className="text-3xl font-serif text-gray-900 dark:text-gray-100 mb-2">Edit Profile</h2>
                                <p className="text-gray-500 dark:text-gray-400 mb-8 font-medium">Update your digital identity in the community.</p>

                                <form onSubmit={handleUpdateProfile} className="space-y-6">
                                    <div>
                                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Full Name</label>
                                        <input
                                            type="text"
                                            value={profileForm.name}
                                            onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                                            className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl px-6 py-4 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-amber-500 transition-all font-medium"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Profile Image</label>
                                        <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl">
                                            <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-amber-100 flex-shrink-0">
                                                {profileForm.profileImage ? (
                                                    <img src={profileForm.profileImage} alt="Preview" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-amber-700 font-bold text-xl">
                                                        {profileForm.name.charAt(0)}
                                                    </div>
                                                )}
                                                {isUploadingImage && (
                                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <input
                                                    type="file"
                                                    ref={fileInputRef}
                                                    onChange={handleImageUpload}
                                                    accept="image/*"
                                                    className="hidden"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => fileInputRef.current?.click()}
                                                    disabled={isUploadingImage}
                                                    className="w-full py-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 rounded-xl text-xs font-bold hover:bg-gray-50 transition-all disabled:opacity-50"
                                                >
                                                    {isUploadingImage ? 'Uploading...' : 'Upload New Photo'}
                                                </button>
                                                <p className="mt-2 text-[10px] text-gray-400 italic text-center">Or provide an external URL below</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Image URL</label>
                                        <input
                                            type="url"
                                            value={profileForm.profileImage}
                                            onChange={(e) => setProfileForm({ ...profileForm, profileImage: e.target.value })}
                                            className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl px-6 py-4 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-amber-500 transition-all font-medium"
                                            placeholder="https://..."
                                        />
                                    </div>

                                    <div className="pt-4 flex gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setIsProfileModalOpen(false)}
                                            className="flex-1 py-4 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-gray-200 transition-all"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isUpdatingProfile}
                                            className="flex-1 py-4 bg-amber-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-amber-600/20 hover:bg-amber-700 transition-all disabled:opacity-50"
                                        >
                                            {isUpdatingProfile ? 'Updating...' : 'Save Changes'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MemberDashboard;
