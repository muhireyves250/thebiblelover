import {
    Eye,
    Heart,
    TrendingUp,
    BookOpen,
    Mail,
    ArrowUpRight,
    Users,
    Plus,
    Palette,
    MessageSquare
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell
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

// Mock data for charts - in a real app, this would come from the API
const chartData = [
    { name: 'Mon', views: 400, interactions: 240 },
    { name: 'Tue', views: 300, interactions: 138 },
    { name: 'Wed', views: 200, interactions: 980 },
    { name: 'Thu', views: 278, interactions: 390 },
    { name: 'Fri', views: 189, interactions: 480 },
    { name: 'Sat', views: 239, interactions: 380 },
    { name: 'Sun', views: 349, interactions: 430 },
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: {
            duration: 0.5,
            ease: "easeOut" as any
        }
    }
};

const DashboardOverview = ({
    user,
    stats,
    comments,
    setActiveTab,
    setShowAddPostConfirm,
    setIsBackgroundModalOpen
}: StatsOverviewProps) => {
    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6 h-full pb-10"
        >
            {/* Welcome Section */}
            <motion.div
                variants={itemVariants}
                className="glass-card p-10 relative overflow-hidden group"
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-amber-500/20 transition-all duration-700"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-500/5 rounded-full blur-2xl -ml-20 -mb-20"></div>

                <div className="flex items-center justify-between relative z-10">
                    <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-4">
                            <motion.div
                                whileHover={{ rotate: 360 }}
                                transition={{ duration: 0.8, ease: "anticipate" as any }}
                                className="w-16 h-16 premium-gradient rounded-2xl flex items-center justify-center shadow-2xl"
                            >
                                <TrendingUp className="h-8 w-8 text-white" />
                            </motion.div>
                            <div>
                                <h2 className="text-3xl font-extrabold text-white tracking-tight">
                                    Shalom, <span className="premium-gradient-text drop-shadow-md">{user?.name || 'Admin'}</span>!
                                </h2>
                                <p className="text-gray-300 font-medium text-lg mt-1">Your spiritual platform is flourishing today.</p>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-4 mt-6">
                            <div className="flex items-center space-x-2 px-4 py-2 bg-white/50 dark:bg-gray-800/50 rounded-full border border-white/20 shadow-sm">
                                <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Live Services Active</span>
                            </div>
                            <div className="flex items-center space-x-2 px-4 py-2 bg-white/50 dark:bg-gray-800/50 rounded-full border border-white/20 shadow-sm">
                                <Users className="h-4 w-4 text-blue-500" />
                                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    {stats.soulsActive || 0} souls active
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Posts', value: stats.totalPosts, icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-500/10', trend: '+12%' },
                    { label: 'Total Views', value: stats.totalViews.toLocaleString(), icon: Eye, color: 'text-emerald-500', bg: 'bg-emerald-500/10', trend: '+8%' },
                    { label: 'Engagement', value: stats.totalLikes + stats.totalComments, icon: Heart, color: 'text-purple-500', bg: 'bg-purple-500/10', trend: '+15%' },
                    { label: 'Scheduled', value: stats.totalScheduled, icon: TrendingUp, color: 'text-amber-500', bg: 'bg-amber-500/10', trend: 'Upcoming' }
                ].map((metric, idx) => {
                    const Icon = metric.icon;
                    return (
                        <motion.div
                            key={idx}
                            variants={itemVariants}
                            whileHover={{ y: -5, scale: 1.02 }}
                            className="glass-card p-8 h-full flex flex-col justify-between group cursor-default"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div className={`p-4 ${metric.bg} rounded-2xl group-hover:scale-110 transition-transform duration-500 shadow-sm border border-black/5 dark:border-white/5`}>
                                    <Icon className={`h-6 w-6 ${metric.color}`} />
                                </div>
                                <div className="flex items-center space-x-1 px-3 py-1 bg-green-500/10 dark:bg-green-500/20 rounded-full border border-green-500/20">
                                    <TrendingUp className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                                    <span className="text-[10px] font-black text-green-700 dark:text-green-400 uppercase tracking-widest">{metric.trend}</span>
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest leading-none mb-2">{metric.label}</p>
                                <h3 className="text-4xl font-serif text-white">{metric.value}</h3>
                            </div>
                            <div className="mt-8 pt-6 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">vs last month</span>
                                <ArrowUpRight className="h-4 w-4 text-gray-300 group-hover:text-amber-500 transition-colors" />
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Analytics & Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Traffic Analytics */}
                <motion.div
                    variants={itemVariants}
                    className="lg:col-span-2 glass-card p-10 relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-110 transition-transform duration-[3000ms]">
                        <TrendingUp className="w-64 h-64 text-amber-500" />
                    </div>
                    
                    <div className="relative z-10">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                            <div>
                                <h3 className="text-2xl font-serif text-white">Growth Distribution</h3>
                                <p className="text-xs text-gray-300 font-bold uppercase tracking-widest mt-1">Platform Performance Analysis</p>
                            </div>
                            <div className="flex gap-4 p-1.5 bg-gray-100/50 dark:bg-white/5 rounded-2xl w-fit">
                                <span className="flex items-center text-[10px] font-black px-4 py-2 bg-white dark:bg-gray-800 text-amber-600 rounded-xl shadow-sm border border-black/5 dark:border-white/5 tracking-widest uppercase">
                                    <div className="w-2 h-2 bg-amber-500 rounded-full mr-2 shadow-[0_0_8px_rgba(245,158,11,0.5)] animate-pulse"></div>
                                    Views
                                </span>
                                <span className="flex items-center text-[10px] font-black px-4 py-2 text-blue-500 rounded-xl tracking-widest uppercase">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 opacity-50"></div>
                                    Reacts
                                </span>
                            </div>
                        </div>
    
                        <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats.chartData && stats.chartData.length > 0 ? stats.chartData : chartData}>
                                    <defs>
                                        <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorInter" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
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
                                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                            borderRadius: '24px',
                                            border: 'none',
                                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
                                            padding: '16px'
                                        }}
                                        itemStyle={{ fontWeight: 'bold', fontSize: '12px' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="views"
                                        stroke="#f59e0b"
                                        strokeWidth={4}
                                        fillOpacity={1}
                                        fill="url(#colorViews)"
                                        animationDuration={2000}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="interactions"
                                        stroke="#3b82f6"
                                        strokeWidth={4}
                                        fillOpacity={1}
                                        fill="url(#colorInter)"
                                        animationDuration={2000}
                                        animationDelay={300}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </motion.div>

                {/* Quick Actions */}
                <motion.div
                    variants={itemVariants}
                    className="glass-card p-10 flex flex-col relative overflow-hidden group"
                >
                    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-amber-500/5 rounded-full blur-3xl group-hover:bg-amber-500/10 transition-all duration-700"></div>
                    
                    <h3 className="text-xl font-serif text-white mb-10 flex items-center gap-3">
                        <div className="p-2 bg-amber-500/10 rounded-xl">
                            <Plus className="h-5 w-5 text-amber-500" />
                        </div>
                        Quick Registry
                    </h3>
                    <div className="space-y-6 flex-1 relative z-10">
                        <motion.button
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setShowAddPostConfirm(true)}
                            className="w-full p-6 bg-gray-900 dark:bg-amber-600 text-white rounded-[2rem] flex items-center space-x-5 shadow-2xl hover:shadow-amber-500/20 transition-all border border-white/10"
                        >
                            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                                <Plus className="h-6 w-6" />
                            </div>
                            <div className="text-left">
                                <p className="font-black uppercase tracking-widest text-[10px] opacity-70">Editorial</p>
                                <p className="font-serif text-lg leading-none mt-1">Create New Post</p>
                            </div>
                        </motion.button>

                        <div className="grid grid-cols-2 gap-6">
                            <motion.button
                                whileHover={{ scale: 1.05, y: -3 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setActiveTab('bible-verses')}
                                className="p-6 glass-card !rounded-3xl flex flex-col items-center justify-center text-center space-y-3 hover:bg-amber-500/10 transition-colors group"
                            >
                                <div className="p-3 bg-amber-500/10 rounded-2xl group-hover:bg-amber-500/20 transition-colors">
                                    <BookOpen className="h-6 w-6 text-amber-500" />
                                </div>
                                <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Verses</span>
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05, y: -3 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setIsBackgroundModalOpen(true)}
                                className="p-6 glass-card !rounded-3xl flex flex-col items-center justify-center text-center space-y-3 hover:bg-blue-500/10 transition-colors group"
                            >
                                <div className="p-3 bg-blue-500/10 rounded-2xl group-hover:bg-blue-500/20 transition-colors">
                                    <Palette className="h-6 w-6 text-blue-500" />
                                </div>
                                <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Theme</span>
                            </motion.button>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setActiveTab('messages')}
                            className="w-full p-6 glass-card !rounded-2xl flex items-center justify-between hover:bg-purple-500/10 transition-all group border-transparent hover:border-purple-500/20"
                        >
                            <div className="flex items-center space-x-4">
                                <div className="p-2 bg-purple-500/10 rounded-xl group-hover:scale-110 transition-transform">
                                    <Mail className="h-5 w-5 text-purple-500" />
                                </div>
                                <span className="text-sm font-bold text-white">Inbox</span>
                            </div>
                            <span className="px-3 py-1 bg-purple-600 text-white text-[10px] font-black rounded-full shadow-lg shadow-purple-600/20">
                                {stats.recentMessages} NEW
                            </span>
                        </motion.button>
                    </div>
                </motion.div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <motion.div variants={itemVariants} className="glass-card p-8">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-white">Recent Activity</h3>
                        <button onClick={() => setActiveTab('comments')} className="text-amber-500 text-sm font-bold hover:underline">View All</button>
                    </div>
                    <div className="space-y-4">
                        {comments.slice(0, 3).map((comment) => (
                            <div key={comment.id} className="flex items-start space-x-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center flex-shrink-0">
                                    <MessageSquare className="h-5 w-5 text-blue-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-bold text-white">{comment.authorName}</p>
                                        <p className="text-[10px] font-bold text-gray-300">2 min ago</p>
                                    </div>
                                    <p className="text-sm text-gray-200 mt-1 line-clamp-1">{comment.content}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Engagement Metrics */}
                <motion.div variants={itemVariants} className="glass-card p-10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-110 transition-transform duration-[3000ms]">
                        <Users className="w-48 h-48 text-amber-500" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-serif text-white mb-2">Community Reach</h3>
                        <p className="text-xs text-gray-300 font-bold uppercase tracking-widest mb-10">Audience Pulse</p>
                    </div>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.chartData && stats.chartData.length > 0 ? stats.chartData : chartData}>
                                <defs>
                                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#f59e0b" stopOpacity={1} />
                                        <stop offset="100%" stopColor="#d97706" stopOpacity={0.8} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} hide />
                                <YAxis axisLine={false} tickLine={false} hide />
                                <Tooltip
                                    cursor={{ fill: 'rgba(245, 158, 11, 0.05)' }}
                                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)' }}
                                />
                                <Bar dataKey="interactions" fill="url(#barGradient)" radius={[10, 10, 0, 0]} barSize={40} animationDuration={2000}>
                                    { (stats.chartData && stats.chartData.length > 0 ? stats.chartData : chartData).map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fillOpacity={0.6 + (index * 0.06)} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-8 grid grid-cols-2 gap-6">
                        <div className="p-5 bg-gray-100/50 dark:bg-white/5 rounded-3xl border border-black/5 dark:border-white/5 group/stat">
                            <p className="text-[10px] text-gray-300 font-black uppercase tracking-widest mb-1 group-hover/stat:text-amber-500 transition-colors">Avg Response</p>
                            <p className="text-3xl font-serif font-black text-white">1.2h</p>
                        </div>
                        <div className="p-5 bg-gray-100/50 dark:bg-white/5 rounded-3xl border border-black/5 dark:border-white/5 group/stat">
                            <p className="text-[10px] text-gray-300 font-black uppercase tracking-widest mb-1 group-hover/stat:text-amber-500 transition-colors">Bounce Rate</p>
                            <p className="text-3xl font-serif font-black text-white">24%</p>
                        </div>
                    </div>
                </motion.div>

                {/* Live Engagement Feed */}
                <motion.div variants={itemVariants} className="xl:col-span-1">
                    <LiveEngagementFeed />
                </motion.div>
            </div>
        </motion.div>
    );
};

export default DashboardOverview;
