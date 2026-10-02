import React, { useState, useEffect } from 'react';
import { BookOpen, Heart, Bookmark, ChevronRight, User as UserIcon, LogOut, MessageSquare, Users, Trash2, Sparkles, History, Clock, FileText, Bell, Mail } from 'lucide-react';
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

// Placeholder shape only, shown while data?.weeklyActivity is still
// loading - all zeros so it never implies real activity that hasn't
// happened.
const growthDataPlaceholder = [
    { day: 'Sun', progress: 0 },
    { day: 'Mon', progress: 0 },
    { day: 'Tue', progress: 0 },
    { day: 'Wed', progress: 0 },
    { day: 'Thu', progress: 0 },
    { day: 'Fri', progress: 0 },
    { day: 'Sat', progress: 0 },
];

const MemberDashboard: React.FC = () => {
    const [data, setData] = useState<{
        likedPosts: BlogPostType[];
        savedVerses: BibleVerse[];
        newsletterSubscription: boolean;
        prayerRequests: PrayerRequest[];
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
            <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0c] animate-pulse">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="bg-white dark:bg-[#141417] border border-gray-300 dark:border-white/20 rounded-lg p-10 mb-12 flex flex-col md:flex-row items-center gap-10">
                        <div className="w-24 h-24 rounded-lg bg-gray-200 dark:bg-white/10 shrink-0" />
                        <div className="w-full space-y-4 text-center md:text-left">
                            <div className="h-8 w-64 bg-gray-200 dark:bg-white/10 rounded-md mx-auto md:mx-0" />
                            <div className="h-4 w-40 bg-gray-200 dark:bg-white/10 rounded-md mx-auto md:mx-0" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-40 bg-white dark:bg-[#141417] border border-gray-300 dark:border-white/20 rounded-lg" />
                        ))}
                    </div>
                </div>
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
                <motion.div variants={itemVariants} className="bg-white dark:bg-[#141417] border border-gray-300 dark:border-white/20 rounded-lg shadow-sm p-8 md:p-10 mb-12">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-10">
                        <div className="flex flex-col md:flex-row items-center gap-8">
                            <div className="w-24 h-24 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center overflow-hidden shrink-0">
                                {user?.profileImage ? (
                                    <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                                ) : (
                                    <UserIcon className="w-10 h-10 text-amber-700" />
                                )}
                            </div>
                            <div className="text-center md:text-left">
                                <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-gray-900 dark:text-white mb-1">Welcome back, {user?.name}</h1>
                                <p className="text-gray-500 dark:text-gray-400 font-medium mb-4">{user?.email}</p>
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                                    <span className="px-3 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-[10px] font-black rounded-md uppercase tracking-widest border border-amber-200 dark:border-amber-800">
                                        {user?.role || 'Member'}
                                    </span>
                                    {getBadges().map(badge => (
                                        <span
                                            key={badge.id}
                                            className="px-3 py-1 bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-300 text-[10px] font-black uppercase tracking-widest rounded-md flex items-center gap-1.5 border border-gray-300 dark:border-white/15"
                                        >
                                            <span className="text-xs">{badge.icon}</span> {badge.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={() => setIsProfileModalOpen(true)}
                                className="flex items-center justify-center gap-2 px-6 py-3 bg-amber-700 text-white rounded-md hover:bg-amber-800 transition-colors font-bold uppercase tracking-widest text-xs"
                            >
                                <UserIcon className="w-4 h-4" />
                                Edit Profile
                            </button>
                            <button
                                onClick={handleLogout}
                                className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 dark:border-white/15 bg-white dark:bg-[#141417] text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 rounded-md transition-colors font-bold uppercase tracking-widest text-xs"
                            >
                                <LogOut className="w-4 h-4" />
                                Sign Out
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Spiritual Growth Journey */}
                <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-16">
                    <div className="lg:col-span-3 bg-white dark:bg-[#141417] border border-gray-300 dark:border-white/20 rounded-lg shadow-sm p-8">
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-10">
                                <div className="flex items-center gap-3">
                                    <Sparkles className="w-5 h-5 text-amber-700" />
                                    <div>
                                        <h2 className="text-xl font-black uppercase tracking-tight text-gray-900 dark:text-white">Spiritual Growth Journey</h2>
                                        <p className="text-[10px] text-gray-400 dark:text-gray-500 font-black uppercase tracking-widest mt-1">Consistency Insight</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest">
                                        Level {Math.floor(((data?.stats.posts || 0) + (data?.stats.prayers || 0)) / 5) + 1}
                                    </p>
                                    <p className="text-xl font-black text-gray-900 dark:text-white">
                                        {((data?.stats.posts || 0) + (data?.stats.prayers || 0)) < 5 ? 'Seeker' :
                                         ((data?.stats.posts || 0) + (data?.stats.prayers || 0)) < 15 ? 'Disciple' : 'Elder'}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                                <div className="md:col-span-2">
                                    <div className="h-64 w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={data?.weeklyActivity || growthDataPlaceholder}>
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
                                        <div key={i} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-white/5 rounded-md border border-gray-200 dark:border-white/10">
                                            <stat.icon className={`w-5 h-5 ${stat.color}`} />
                                            <div>
                                                <p className="text-xl font-black text-gray-900 dark:text-white leading-none">{stat.value}</p>
                                                <p className="text-[10px] text-gray-400 dark:text-gray-500 font-black uppercase tracking-widest mt-1">{stat.label}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                             <div className="mt-10">
                                <div className="flex justify-between items-end mb-3">
                                    <p className="text-sm font-bold text-gray-600 dark:text-gray-400 italic">"Your roots are deepening in faith..."</p>
                                    <p className="text-sm font-black text-amber-700">
                                        {Math.min(100, Math.round(((data?.stats.posts || 0) + (data?.stats.prayers || 0)) * 6.5))}% Progress
                                    </p>
                                </div>
                                <div className="h-2 w-full bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min(100, Math.round(((data?.stats.posts || 0) + (data?.stats.prayers || 0)) * 6.5))}%` }}
                                        transition={{ duration: 1.5, delay: 0.5 }}
                                        className="h-full bg-amber-700 rounded-full"
                                    ></motion.div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-amber-700 rounded-lg p-8 text-white shadow-sm flex flex-col justify-between">
                        <div className="w-10 h-10 bg-white/15 rounded-md flex items-center justify-center mb-6">
                            <Heart className="w-5 h-5 fill-current text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black uppercase tracking-tight mb-3">Daily Blessing</h3>
                            <p className="text-amber-50/80 italic leading-relaxed">
                                "May your heart be a sanctuary of peace and your words be seeds of hope today."
                            </p>
                        </div>
                        <div className="mt-8 pt-6 border-t border-white/20">
                            <p className="text-[10px] font-black uppercase tracking-widest text-amber-200">The Bible Lover Team</p>
                        </div>
                    </div>
                </motion.div>

                {/* Tabs */}
                <div className="flex items-center gap-2 mb-12 border-b border-gray-300 dark:border-white/15">
                    {([
                        { id: 'overview', label: 'Overview' },
                        { id: 'activity', label: 'Activity' },
                        { id: 'events', label: 'My Events' },
                    ] as const).map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-3 text-xs font-black uppercase tracking-widest transition-colors relative ${activeTab === tab.id ? 'text-amber-700' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                        >
                            {tab.label}
                            {activeTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-amber-700"></div>}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Main Content Area */}
                    <div className="lg:col-span-2 space-y-12">
                        {activeTab === 'overview' && (
                            <>
                                {/** Recommended for You */}
                                {data && data.recommendations.length > 0 && (
                                    <section>
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="flex items-center gap-2">
                                                <Sparkles className="w-5 h-5 text-amber-700" />
                                                <h2 className="text-xl font-black uppercase tracking-tight text-gray-900 dark:text-white">Recommended for You</h2>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-2">
                                            <Heart className="w-5 h-5 text-amber-700" />
                                            <h2 className="text-xl font-black uppercase tracking-tight text-gray-900 dark:text-white">Liked Reflections</h2>
                                        </div>
                                        <Link to="/posts" className="text-amber-700 hover:text-amber-800 dark:text-amber-500 dark:hover:text-amber-400 font-bold text-xs uppercase tracking-widest flex items-center gap-1 group">
                                            Explore More <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </Link>
                                    </div>

                                    {!data || data.likedPosts.length === 0 ? (
                                        <div className="bg-white dark:bg-[#141417] border border-dashed border-gray-300 dark:border-white/20 rounded-lg p-12 text-center">
                                            <Heart className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                                            <p className="text-sm font-bold text-gray-500 dark:text-gray-400">You haven't liked any reflections yet.</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-2">
                                            <MessageSquare className="w-5 h-5 text-amber-700" />
                                            <h2 className="text-xl font-black uppercase tracking-tight text-gray-900 dark:text-white">My Prayers</h2>
                                        </div>
                                        <Link to="/prayer-wall" className="text-amber-700 hover:text-amber-800 dark:text-amber-500 dark:hover:text-amber-400 font-bold text-xs uppercase tracking-widest flex items-center gap-1 group">
                                            View Wall <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </Link>
                                    </div>

                                    {!data || data.prayerRequests.length === 0 ? (
                                        <div className="bg-white dark:bg-[#141417] border border-dashed border-gray-300 dark:border-white/20 rounded-lg p-12 text-center">
                                            <p className="text-sm font-bold text-gray-500 dark:text-gray-400">No prayers shared yet.</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {data.prayerRequests.map((request) => (
                                                <div key={request.id} className="bg-white dark:bg-[#141417] border border-gray-300 dark:border-white/20 rounded-lg shadow-sm p-6">
                                                    <h3 className="text-base font-black text-gray-900 dark:text-white mb-2 truncate">{request.title}</h3>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-4 leading-relaxed italic">"{request.content}"</p>
                                                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-white/5">
                                                        <div className="flex items-center gap-2 text-[10px] font-black text-amber-700 uppercase tracking-widest">
                                                            <Users className="w-3.5 h-3.5" />
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
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-2">
                                            <Heart className="w-5 h-5 text-amber-700" />
                                            <h2 className="text-xl font-black uppercase tracking-tight text-gray-900 dark:text-white">Seed Support History</h2>
                                        </div>
                                    </div>

                                    {!data || data.donations.length === 0 ? (
                                        <div className="bg-white dark:bg-[#141417] border border-dashed border-gray-300 dark:border-white/20 rounded-lg p-12 text-center">
                                            <Sparkles className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                                            <p className="text-sm font-bold text-gray-500 dark:text-gray-400">No support history recorded yet.</p>
                                            <Link to="/donate" className="inline-block mt-3 text-amber-700 font-bold text-xs uppercase tracking-widest hover:underline underline-offset-4">Plant a seed today</Link>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 gap-4">
                                            {data.donations.map((donation: any) => (
                                                <div key={donation.id} className="bg-white dark:bg-[#141417] border border-gray-300 dark:border-white/20 rounded-lg shadow-sm p-5 flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-md bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-700">
                                                            <Heart className="w-5 h-5 fill-current" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-black text-gray-900 dark:text-white">Donation Supported</p>
                                                            <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-widest">{new Date(donation.createdAt).toLocaleDateString()}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-lg font-black text-amber-700">${donation.amount}</p>
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
                                <div className="grid grid-cols-1 gap-12">
                                    {/* Recently Viewed */}
                                    <div>
                                        <div className="flex items-center gap-2 mb-6">
                                            <History className="w-5 h-5 text-amber-700" />
                                            <h2 className="text-xl font-black uppercase tracking-tight text-gray-900 dark:text-white">Recently Viewed</h2>
                                        </div>

                                        {!data || data.history.length === 0 ? (
                                            <div className="bg-white dark:bg-[#141417] border border-dashed border-gray-300 dark:border-white/20 rounded-lg p-12 text-center">
                                                <p className="text-sm font-bold text-gray-500 dark:text-gray-400">History is clear.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {data.history.map((item) => (
                                                    <Link
                                                        key={item.id}
                                                        to={item.link}
                                                        className="flex items-center gap-4 p-4 bg-white dark:bg-[#141417] rounded-lg border border-gray-300 dark:border-white/20 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group"
                                                    >
                                                        <div className="p-2 bg-gray-50 dark:bg-white/10 rounded-md">
                                                            {item.type === 'POST' ? <FileText className="w-4 h-4 text-gray-500 dark:text-gray-400" /> : <MessageSquare className="w-4 h-4 text-gray-500 dark:text-gray-400" />}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">{item.title}</h4>
                                                            <p className="text-[10px] text-gray-400 dark:text-gray-500 flex items-center gap-1 mt-0.5">
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
                            <section>
                                <div className="flex items-center gap-2 mb-6">
                                    <BookOpen className="w-5 h-5 text-amber-700" />
                                    <h2 className="text-xl font-black uppercase tracking-tight text-gray-900 dark:text-white">Joined Events</h2>
                                </div>

                                {!data || data.joinedEvents.length === 0 ? (
                                    <div className="bg-white dark:bg-[#141417] border border-dashed border-gray-300 dark:border-white/20 rounded-lg p-12 text-center">
                                        <p className="text-sm font-bold text-gray-500 dark:text-gray-400">No upcoming events.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {data.joinedEvents.map((event) => (
                                            <Link key={event.id} to={`/events/${event.id}`} className="group bg-white dark:bg-[#141417] rounded-lg overflow-hidden shadow-sm border border-gray-300 dark:border-white/20 hover:border-gray-400 dark:hover:border-white/30 transition-colors">
                                                <div className="aspect-video relative overflow-hidden">
                                                    <img src={event.thumbnail || 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&q=80'} alt={event.title} className="w-full h-full object-cover" />
                                                </div>
                                                <div className="p-5">
                                                    <h3 className="text-base font-black text-gray-900 dark:text-white mb-1">{event.title}</h3>
                                                    <p className="text-xs text-gray-400 dark:text-gray-500">{new Date(event.date).toLocaleDateString()}</p>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </section>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-8">
                        {/* Notification Settings */}
                        <section className="bg-white dark:bg-[#141417] border border-gray-300 dark:border-white/20 rounded-lg shadow-sm p-6">
                            <div className="flex items-center gap-2 mb-6">
                                <Bell className="w-5 h-5 text-amber-700" />
                                <h3 className="text-lg font-black uppercase tracking-tight text-gray-900 dark:text-white">Preferences</h3>
                            </div>

                            <div className="space-y-5">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-md bg-gray-50 dark:bg-white/10 flex items-center justify-center">
                                            <Mail className="w-4 h-4 text-gray-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900 dark:text-white">Newsletter</p>
                                            <p className="text-[10px] text-gray-400 dark:text-gray-500">Weekly grains of wisdom</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handlePreferenceChange('receiveNewsletter', !data?.preferences.receiveNewsletter)}
                                        disabled={prefLoading}
                                        className={`w-11 h-6 rounded-full transition-colors relative ${data?.preferences.receiveNewsletter ? 'bg-amber-700' : 'bg-gray-200 dark:bg-white/15'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${data?.preferences.receiveNewsletter ? 'left-6' : 'left-1'}`}></div>
                                    </button>
                                </div>

                                <div className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center group-hover:bg-amber-50 dark:group-hover:bg-amber-900/20 transition-colors">
                                            <Sparkles className="w-4 h-4 text-gray-400 group-hover:text-amber-600 transition-colors" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900 dark:text-white">Prayer Alerts</p>
                                            <p className="text-[10px] text-gray-400 dark:text-gray-500">Community prayer updates</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handlePreferenceChange('receivePrayerAlerts', !data?.preferences.receivePrayerAlerts)}
                                        disabled={prefLoading}
                                        className={`w-11 h-6 rounded-full transition-colors relative ${data?.preferences.receivePrayerAlerts ? 'bg-amber-700' : 'bg-gray-200 dark:bg-white/15'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${data?.preferences.receivePrayerAlerts ? 'left-6' : 'left-1'}`}></div>
                                    </button>
                                </div>
                            </div>
                        </section>

                        {/* Saved Verses */}
                        <section>
                            <div className="flex items-center gap-2 mb-6">
                                <Bookmark className="w-5 h-5 text-amber-700" />
                                <h2 className="text-xl font-black uppercase tracking-tight text-gray-900 dark:text-white">Saved Verses</h2>
                            </div>

                            <div className="space-y-4">
                                {!data || data.savedVerses.length === 0 ? (
                                    <div className="bg-white dark:bg-[#141417] border border-dashed border-gray-300 dark:border-white/20 rounded-lg p-10 text-center">
                                        <p className="text-gray-500 dark:text-gray-400 text-sm font-bold">Save your favorite verses.</p>
                                    </div>
                                ) : (
                                    data.savedVerses.map((verse) => (
                                        <div
                                            key={verse.id}
                                            className="bg-white dark:bg-[#141417] border border-gray-300 dark:border-white/20 rounded-lg shadow-sm p-6"
                                        >
                                            <p className="text-base text-gray-800 dark:text-gray-200 leading-relaxed mb-4 italic">"{verse.text}"</p>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-black text-amber-700 uppercase tracking-widest">
                                                    {verse.book} {verse.chapter}:{verse.verse}
                                                </span>
                                                <button
                                                    onClick={async () => {
                                                        const response = await userAPI.removeSavedVerse(verse.id);
                                                        if (response.success) {
                                                            const dashboardResponse = await userAPI.getDashboardData();
                                                            if (dashboardResponse.success && dashboardResponse.data) {
                                                                setData(prev => prev ? { ...prev, savedVerses: dashboardResponse.data?.savedVerses || [] } : null);
                                                            }
                                                        }
                                                    }}
                                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </section>

                        {/* Quick Links */}
                        <div className="bg-amber-700 rounded-lg p-6 text-white shadow-sm">
                            <BookOpen className="w-8 h-8 mb-4 opacity-40" />
                            <h3 className="text-lg font-black uppercase tracking-tight mb-2">Deepen Your Faith</h3>
                            <p className="text-amber-100 text-sm mb-6 leading-relaxed">Continue your journey with our recommended deep-dives.</p>
                            <Link to="/posts?category=STUDY" className="inline-flex items-center gap-2 bg-white text-amber-700 px-5 py-2.5 rounded-md font-bold text-xs uppercase tracking-widest hover:bg-amber-50 transition-colors">
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
                            className="relative w-full max-w-lg bg-white dark:bg-[#141417] rounded-lg shadow-2xl overflow-hidden border border-gray-300 dark:border-white/20"
                        >
                            <div className="p-8">
                                <h2 className="text-xl font-black uppercase tracking-tight text-gray-900 dark:text-white mb-1">Edit Profile</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 font-medium">Update your digital identity in the community.</p>

                                <form onSubmit={handleUpdateProfile} className="space-y-5">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 ml-0.5">Full Name</label>
                                        <input
                                            type="text"
                                            value={profileForm.name}
                                            onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                                            className="w-full bg-gray-50 dark:bg-white/5 border border-gray-300 dark:border-white/15 rounded-md px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-amber-700 transition-colors font-medium"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 ml-0.5">Profile Image</label>
                                        <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-white/5 border border-gray-300 dark:border-white/15 rounded-md">
                                            <div className="relative w-14 h-14 rounded-md overflow-hidden bg-amber-100 flex-shrink-0">
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
                                                    className="w-full py-2 bg-white dark:bg-[#141417] text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-white/15 rounded-md text-xs font-bold hover:bg-gray-50 dark:hover:bg-white/10 transition-colors disabled:opacity-50"
                                                >
                                                    {isUploadingImage ? 'Uploading...' : 'Upload New Photo'}
                                                </button>
                                                <p className="mt-2 text-[10px] text-gray-400 dark:text-gray-500 text-center">Or provide an external URL below</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 ml-0.5">Image URL</label>
                                        <input
                                            type="url"
                                            value={profileForm.profileImage}
                                            onChange={(e) => setProfileForm({ ...profileForm, profileImage: e.target.value })}
                                            className="w-full bg-gray-50 dark:bg-white/5 border border-gray-300 dark:border-white/15 rounded-md px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-amber-700 transition-colors font-medium"
                                            placeholder="https://..."
                                        />
                                    </div>

                                    <div className="pt-2 flex gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setIsProfileModalOpen(false)}
                                            className="flex-1 py-3 border border-gray-300 dark:border-white/15 bg-white dark:bg-[#141417] text-gray-600 dark:text-gray-300 rounded-md font-black uppercase tracking-widest text-xs hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isUpdatingProfile}
                                            className="flex-1 py-3 bg-amber-700 text-white rounded-md font-black uppercase tracking-widest text-xs hover:bg-amber-800 transition-colors disabled:opacity-50"
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
