import {
    Eye,
    Heart,
    TrendingUp,
    BookOpen,
    Mail,
    Users,
    Plus,
    Palette,
    MessageSquare,
    DollarSign
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import LiveEngagementFeed from './LiveEngagementFeed';

interface StatsOverviewProps {
    user: any;
    stats: {
        totalPosts: number;
        totalViews: number;
        totalLikes: number;
        totalComments: number;
        totalDonations: number;
        recentMessages: number;
        totalScheduled: number;
        chartData?: any[];
    };
    comments: any[];
    setActiveTab: (tab: string) => void;
    setShowAddPostConfirm: (show: boolean) => void;
    setIsBackgroundModalOpen: (show: boolean) => void;
}

// Placeholder shape only - replaced by stats.chartData as soon as the API
// returns real numbers, so the chart never sits empty on first load.
const fallbackChartData = [
    { name: 'Mon', views: 0, interactions: 0 },
    { name: 'Tue', views: 0, interactions: 0 },
    { name: 'Wed', views: 0, interactions: 0 },
    { name: 'Thu', views: 0, interactions: 0 },
    { name: 'Fri', views: 0, interactions: 0 },
    { name: 'Sat', views: 0, interactions: 0 },
    { name: 'Sun', views: 0, interactions: 0 },
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08
        }
    }
};

const itemVariants = {
    hidden: { y: 12, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: {
            duration: 0.4,
            ease: "easeOut" as any
        }
    }
};

// Formats a comment's timestamp as relative time (e.g. "5m ago"), falling
// back to a plain date once it's more than a day old.
const formatRelativeTime = (timestamp: string) => {
    if (!timestamp) return '';
    const diffMs = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diffMs / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return new Date(timestamp).toLocaleDateString();
};

const DashboardOverview = ({
    user,
    stats,
    comments,
    setActiveTab,
    setShowAddPostConfirm,
    setIsBackgroundModalOpen
}: StatsOverviewProps) => {
    const chartData = stats.chartData && stats.chartData.length > 0 ? stats.chartData : fallbackChartData;

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-4 md:space-y-6 h-full pb-10"
        >
            {/* Welcome Section */}
            <motion.div
                variants={itemVariants}
                className="bg-white dark:bg-[#141417] border border-gray-300 dark:border-white/10 rounded-lg shadow-sm p-5 md:p-8"
            >
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 md:w-14 md:h-14 bg-amber-700 rounded-lg flex items-center justify-center shrink-0">
                        <TrendingUp className="h-6 w-6 md:h-7 md:w-7 text-white" />
                    </div>
                    <div>
                        <h2 className="text-lg md:text-2xl font-black uppercase tracking-tight text-gray-900 dark:text-white">
                            Welcome back, {user?.name || 'Admin'}
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">Here's how The Bible Lover is doing today.</p>
                    </div>
                </div>
            </motion.div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                {[
                    { label: 'Total Posts', value: stats.totalPosts, icon: BookOpen },
                    { label: 'Total Views', value: stats.totalViews.toLocaleString(), icon: Eye },
                    { label: 'Engagement', value: stats.totalLikes + stats.totalComments, icon: Heart },
                    { label: 'Scheduled', value: stats.totalScheduled, icon: TrendingUp }
                ].map((metric, idx) => {
                    const Icon = metric.icon;
                    return (
                        <motion.div
                            key={idx}
                            variants={itemVariants}
                            className="bg-white dark:bg-[#141417] border border-gray-300 dark:border-white/10 rounded-lg shadow-sm p-4 md:p-5"
                        >
                            <div className="w-9 h-9 md:w-10 md:h-10 bg-amber-50 dark:bg-amber-900/20 rounded-lg flex items-center justify-center mb-3 md:mb-4">
                                <Icon className="h-4 w-4 md:h-5 md:w-5 text-amber-700" />
                            </div>
                            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">{metric.label}</p>
                            <h3 className="text-xl md:text-3xl font-black text-gray-900 dark:text-white">{metric.value}</h3>
                        </motion.div>
                    );
                })}
            </div>

            {/* Analytics & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                {/* Traffic Analytics */}
                <motion.div
                    variants={itemVariants}
                    className="lg:col-span-2 bg-white dark:bg-[#141417] border border-gray-300 dark:border-white/10 rounded-lg shadow-sm p-5 md:p-8"
                >
                    <div className="flex items-center gap-2 mb-1.5">
                        <span className="w-1 h-4 bg-amber-700 rounded-sm" />
                        <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-amber-700">This Week</span>
                    </div>
                    <h3 className="text-lg md:text-xl font-black uppercase tracking-tight text-gray-900 dark:text-white mb-6 md:mb-8">Views &amp; Engagement</h3>

                    <div className="h-64 md:h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#b45309" stopOpacity={0.35} />
                                        <stop offset="95%" stopColor="#b45309" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorInter" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#9ca3af" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#9ca3af" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148,163,184,0.15)" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9CA3AF', fontSize: 10, fontWeight: 'bold' }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9CA3AF', fontSize: 10, fontWeight: 'bold' }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.97)',
                                        borderRadius: '8px',
                                        border: '1px solid #e5e7eb',
                                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                                        padding: '12px'
                                    }}
                                    itemStyle={{ fontWeight: 'bold', fontSize: '12px' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="views"
                                    name="Views"
                                    stroke="#b45309"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorViews)"
                                    animationDuration={1200}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="interactions"
                                    name="Engagement"
                                    stroke="#9ca3af"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorInter)"
                                    animationDuration={1200}
                                    animationBegin={150}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Quick Actions */}
                <motion.div
                    variants={itemVariants}
                    className="bg-white dark:bg-[#141417] border border-gray-300 dark:border-white/10 rounded-lg shadow-sm p-5 md:p-6 flex flex-col"
                >
                    <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white mb-4 md:mb-6">Quick Actions</h3>
                    <div className="space-y-3 flex-1">
                        <button
                            onClick={() => setShowAddPostConfirm(true)}
                            className="w-full p-4 bg-amber-700 hover:bg-amber-800 text-white rounded-md flex items-center gap-3 transition-colors"
                        >
                            <div className="w-9 h-9 bg-white/15 rounded-md flex items-center justify-center shrink-0">
                                <Plus className="h-4 w-4" />
                            </div>
                            <div className="text-left">
                                <p className="font-black uppercase tracking-widest text-[9px] opacity-80">Editorial</p>
                                <p className="font-bold text-sm leading-none mt-1">Create New Post</p>
                            </div>
                        </button>

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setActiveTab('bible-verses')}
                                className="p-4 border border-gray-200 dark:border-white/10 rounded-md flex flex-col items-center justify-center text-center gap-2 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                            >
                                <BookOpen className="h-5 w-5 text-amber-700" />
                                <span className="text-[10px] font-bold text-gray-600 dark:text-gray-300 uppercase tracking-widest">Verses</span>
                            </button>
                            <button
                                onClick={() => setIsBackgroundModalOpen(true)}
                                className="p-4 border border-gray-200 dark:border-white/10 rounded-md flex flex-col items-center justify-center text-center gap-2 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                            >
                                <Palette className="h-5 w-5 text-amber-700" />
                                <span className="text-[10px] font-bold text-gray-600 dark:text-gray-300 uppercase tracking-widest">Theme</span>
                            </button>
                        </div>

                        <button
                            onClick={() => setActiveTab('messages')}
                            className="w-full p-4 border border-gray-200 dark:border-white/10 rounded-md flex items-center justify-between hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <Mail className="h-4 w-4 text-amber-700" />
                                <span className="text-sm font-bold text-gray-900 dark:text-white">Inbox</span>
                            </div>
                            {stats.recentMessages > 0 && (
                                <span className="px-2.5 py-1 bg-amber-700 text-white text-[10px] font-black rounded-full">
                                    {stats.recentMessages} new
                                </span>
                            )}
                        </button>
                    </div>
                </motion.div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                {/* Recent Activity */}
                <motion.div variants={itemVariants} className="bg-white dark:bg-[#141417] border border-gray-300 dark:border-white/10 rounded-lg shadow-sm p-5 md:p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white">Recent Comments</h3>
                        <button onClick={() => setActiveTab('comments')} className="text-amber-700 text-xs font-bold hover:text-amber-800 transition-colors">View All</button>
                    </div>
                    {comments.length === 0 ? (
                        <p className="text-sm text-gray-400 dark:text-gray-500 py-6 text-center">No comments yet.</p>
                    ) : (
                        <div className="space-y-2.5">
                            {comments.slice(0, 3).map((comment) => (
                                <div key={comment.id} className="flex items-start gap-3 p-3 rounded-md bg-gray-50 dark:bg-white/5">
                                    <div className="w-9 h-9 bg-amber-50 dark:bg-amber-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                                        <MessageSquare className="h-4 w-4 text-amber-700" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{comment.authorName}</p>
                                            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 shrink-0">{formatRelativeTime(comment.timestamp)}</p>
                                        </div>
                                        <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5 line-clamp-1">{comment.content}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>

                {/* Community Snapshot */}
                <motion.div variants={itemVariants} className="bg-white dark:bg-[#141417] border border-gray-300 dark:border-white/10 rounded-lg shadow-sm p-5 md:p-6">
                    <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white mb-4">Community Snapshot</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-md">
                            <div className="w-8 h-8 bg-amber-50 dark:bg-amber-900/20 rounded-md flex items-center justify-center mb-2.5">
                                <DollarSign className="h-4 w-4 text-amber-700" />
                            </div>
                            <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest mb-1">Total Donations</p>
                            <p className="text-xl font-black text-gray-900 dark:text-white">${stats.totalDonations.toLocaleString()}</p>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-md">
                            <div className="w-8 h-8 bg-amber-50 dark:bg-amber-900/20 rounded-md flex items-center justify-center mb-2.5">
                                <Users className="h-4 w-4 text-amber-700" />
                            </div>
                            <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest mb-1">Unread Messages</p>
                            <p className="text-xl font-black text-gray-900 dark:text-white">{stats.recentMessages}</p>
                        </div>
                    </div>
                </motion.div>

                {/* Live Engagement Feed */}
                <motion.div variants={itemVariants} className="lg:col-span-2">
                    <LiveEngagementFeed />
                </motion.div>
            </div>
        </motion.div>
    );
};

export default DashboardOverview;
