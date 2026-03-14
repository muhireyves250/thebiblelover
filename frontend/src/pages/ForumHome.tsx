import { useState, useEffect } from 'react';
import { MessageSquare, BookOpen, Sparkles, Heart, Users, ChevronRight, MessageCircle, User as UserIcon } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { forumAPI, authAPI } from '../services/api';
import type { ForumCategory } from '../services/api.d';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

const ICON_MAP: Record<string, any> = {
    MessageSquare,
    BookOpen,
    Sparkles,
    Heart,
    Users
};

const ForumHome = () => {
    const [categories, setCategories] = useState<ForumCategory[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const currentUser = authAPI.getCurrentUser();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [catRes, statsRes] = await Promise.all([
                forumAPI.getCategories(),
                statsAPI.getPlatformSummary()
            ]);

            if (catRes.success && catRes.data) {
                setCategories(catRes.data);
            }
            if (statsRes.success && statsRes.data) {
                setStats(statsRes.data);
            }
        } catch (err) {
            console.error('Failed to load forum data:', err);
        } finally {
            setLoading(false);
        }
    };

    const getIcon = (iconName: string | undefined) => {
        if (!iconName) return <MessageSquare className="h-6 w-6" />;
        const IconComponent = ICON_MAP[iconName] || MessageSquare;
        return <IconComponent className="h-6 w-6" />;
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <SEO 
                title="Community Forums" 
                description="Join our spiritual community. Discuss the Bible, share testimonies, and find support in a safe and welcoming environment."
            />
            <PageHeader
                title="Community Forums"
                subtitle="A place for deep discussions, sharing testimonies, and growing together."
            />

            <main className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
                {/* Intro Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-20">
                    <div className="lg:col-span-2">
                        <h2 className="text-4xl font-bold text-gray-900 mb-6 font-serif">Welcome to the Discussion</h2>
                        <p className="text-lg text-gray-600 leading-relaxed max-w-2xl">
                            Our community is built on mutual respect and a shared love for the Word. Whether you're here to ask a tough question, share a victory, or just listen, you are welcome.
                        </p>
                    </div>
                    <div className="bg-gradient-to-br from-amber-600 to-amber-700 rounded-[2rem] p-8 text-white shadow-xl flex flex-col justify-between">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                                <Users className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-bold uppercase tracking-wider">Join The Conversation</h3>
                        </div>
                        <p className="text-amber-100 mb-8 font-medium">
                            Create an account to start your own topics and participate in the community.
                        </p>
                        {!currentUser && (
                            <Link to="/login" className="bg-white text-amber-700 w-full py-4 rounded-xl font-bold text-center hover:bg-amber-50 transition-colors">
                                Sign In to Participate
                            </Link>
                        )}
                    </div>
                </div>

                {/* Categories Grid */}
                <div className="grid grid-cols-1 gap-8">
                    {loading ? (
                        [1, 2, 3].map(i => (
                            <div key={i} className="bg-white rounded-[2rem] p-10 animate-pulse border border-gray-100 shadow-sm">
                                <div className="flex items-center gap-6 mb-4">
                                    <div className="w-16 h-16 bg-gray-100 rounded-2xl"></div>
                                    <div className="h-8 w-48 bg-gray-200 rounded-lg"></div>
                                </div>
                                <div className="h-4 w-3/4 bg-gray-100 rounded-lg"></div>
                            </div>
                        ))
                    ) : categories.map((category: ForumCategory) => (
                        <Link
                            key={category.id}
                            to={`/forum/category/${category.id}`}
                            className="group bg-white rounded-[2.5rem] p-10 border border-gray-100 hover:border-amber-200 shadow-sm hover:shadow-2xl transition-all duration-500 relative overflow-hidden"
                        >
                            {/* Subtle background decoration */}
                            <div className="absolute -right-10 -bottom-10 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500 transform group-hover:scale-110">
                                {getIcon(category.icon)}
                            </div>

                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                                <div className="flex items-start md:items-center gap-8 flex-1">
                                    <div className="w-20 h-20 bg-amber-50 rounded-[1.5rem] flex items-center justify-center text-amber-600 transition-all duration-300 group-hover:scale-110 group-hover:bg-amber-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-amber-200">
                                        {getIcon(category.icon)}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-amber-700 transition-colors">
                                            {category.name}
                                        </h3>
                                        <p className="text-gray-500 leading-relaxed max-w-xl">
                                            {category.description}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-12 md:pl-8 md:border-l border-gray-100">
                                    <div className="text-center">
                                        <div className="flex items-center justify-center gap-2 text-2xl font-bold text-gray-900 mb-1">
                                            <MessageCircle className="h-5 w-5 text-amber-600" />
                                            {category._count?.topics || 0}
                                        </div>
                                        <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Topics</p>
                                    </div>

                                    <div className="hidden lg:block min-w-[200px]">
                                        {category.topics && category.topics.length > 0 ? (
                                            <div className="text-right">
                                                <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400 mb-2">Latest Post</p>
                                                <div className="flex items-center justify-end gap-3">
                                                    <div className="text-right leading-none">
                                                        <p className="text-sm font-bold text-gray-900">{category.topics[0].author?.name}</p>
                                                        <p className="text-[10px] text-gray-400 mt-1">{new Date(category.topics[0].updatedAt).toLocaleDateString()}</p>
                                                    </div>
                                                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
                                                        {category.topics[0].author?.profileImage ? (
                                                            <img src={category.topics[0].author.profileImage} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <UserIcon className="h-5 w-5 text-gray-400" />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-300 italic text-right">No topics yet</p>
                                        )}
                                    </div>

                                    <div className="bg-gray-50 p-3 rounded-full group-hover:bg-amber-50 group-hover:text-amber-600 transition-all duration-300 transform group-hover:translate-x-2">
                                        <ChevronRight className="h-6 w-6" />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </main>

            {/* Stats Section */}
            <section className="bg-white border-t border-gray-200 py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
                        <div className="text-center">
                            <div className="text-4xl font-bold text-gray-900 mb-2">{stats?.totalUsers || 0}</div>
                            <p className="text-sm uppercase font-bold tracking-widest text-amber-600">Community Members</p>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-gray-900 mb-2">{stats?.totalTopics || 0}+</div>
                            <p className="text-sm uppercase font-bold tracking-widest text-amber-600">Active Topics</p>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-gray-900 mb-2">{stats?.totalInsights || 0}</div>
                            <p className="text-sm uppercase font-bold tracking-widest text-amber-600">Shared Insights</p>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-gray-900 mb-2">{stats?.totalPrayers || 0}</div>
                            <p className="text-sm uppercase font-bold tracking-widest text-amber-600">Prayer Support</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ForumHome;
