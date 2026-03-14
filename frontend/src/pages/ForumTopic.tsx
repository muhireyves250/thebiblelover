import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { User as UserIcon, Clock, ChevronLeft, Send, Trash2, ShieldCheck } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { forumAPI, authAPI, searchAPI } from '../services/api';
import type { ForumTopic, ForumPost } from '../services/api.d';
import SEO from '../components/SEO';
import ShareButtons from '../components/ShareButtons';
import { Heart, Sparkles } from 'lucide-react';

const UserBadge = ({ author }: { author: any }) => {
    const stats = author?._count || { forumPosts: 0, prayerSupports: 0 };
    const badges = [];

    if (stats.prayerSupports >= 5) badges.push({ name: 'Prayer Warrior', icon: <Heart className="h-3 w-3 fill-current" />, color: 'bg-blue-50 text-blue-700 border-blue-100' });
    if (stats.forumPosts >= 5) badges.push({ name: 'Community Pillar', icon: <Sparkles className="h-3 w-3" />, color: 'bg-purple-50 text-purple-700 border-purple-100' });

    return (
        <div className="flex gap-1.5">
            {badges.map(badge => (
                <span key={badge.name} className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${badge.color}`}>
                    {badge.icon}
                    {badge.name}
                </span>
            ))}
        </div>
    );
};

const ForumTopicPage = () => {
    const { id } = useParams<{ id: string }>();
    // const navigate = useNavigate(); // Removed unused
    const [topic, setTopic] = useState<ForumTopic | null>(null);
    const [reply, setReply] = useState('');
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const currentUser = authAPI.getCurrentUser();
    const isAdmin = currentUser?.role === 'ADMIN';

    useEffect(() => {
        if (id) loadTopic();
    }, [id]);

    useEffect(() => {
        if (topic) {
            searchAPI.recordHistory({
                type: 'FORUM',
                itemId: topic.id,
                title: topic.title,
                link: `/forum/topic/${topic.id}`
            }).catch(() => { });
        }
    }, [topic?.id]);

    const loadTopic = async () => {
        try {
            const response = await forumAPI.getTopic(id!);
            if (response.success && response.data) {
                setTopic(response.data);
            }
        } catch (err) {
            console.error('Failed to load topic:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reply.trim() || !id) return;

        setIsSubmitting(true);
        try {
            const response = await forumAPI.createPost(id, { content: reply });
            if (response.success) {
                setReply('');
                loadTopic(); // Reload to show new post
            }
        } catch (err) {
            console.error('Failed to post reply:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeletePost = async (postId: string) => {
        if (!window.confirm('Are you sure you want to delete this post?')) return;

        try {
            const response = await forumAPI.deletePost(postId);
            if (response.success) {
                loadTopic();
            }
        } catch (err) {
            console.error('Failed to delete post:', err);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
            </div>
        );
    }

    if (!topic) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Topic not found</h2>
                <Link to="/forum" className="text-amber-600 font-bold hover:underline">Back to Forums</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {topic && (
                <SEO
                    title={topic.title}
                    description={`Join the discussion: ${topic.title} in the ${topic.category?.name || 'community'} forum.`}
                    type="article"
                />
            )}
            <PageHeader
                title={topic.title}
                subtitle={`Discussion in ${topic.category?.name}`}
            />

            <main className="max-w-5xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
                {/* Back Link */}
                <Link to={`/forum/category/${topic.categoryId}`} className="flex items-center gap-2 text-gray-500 hover:text-amber-700 font-bold mb-10 transition-colors group">
                    <ChevronLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                    Back to {topic.category?.name}
                </Link>

                {/* Original Post */}
                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden mb-12">
                    <div className="p-8 md:p-12">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
                                {topic.author?.profileImage ? (
                                    <img src={topic.author.profileImage} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <UserIcon className="h-6 w-6 text-amber-600" />
                                )}
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-bold text-gray-900 text-lg">{topic.author?.name}</h3>
                                    <UserBadge author={topic.author} />
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-400">
                                    <Clock className="h-4 w-4" />
                                    {new Date(topic.createdAt).toLocaleString()}
                                </div>
                            </div>
                        </div>

                        <div className="prose prose-amber max-w-none text-gray-700 leading-relaxed text-lg mb-8">
                            {topic.content.split('\n').map((para: string, i: number) => (
                                <p key={i} className="mb-4">{para}</p>
                            ))}
                        </div>

                        <ShareButtons title={topic.title} />
                    </div>
                </div>

                {/* Replies Heading */}
                <div className="flex items-center gap-4 mb-8">
                    <div className="h-px bg-gray-200 flex-1"></div>
                    <h2 className="text-sm uppercase tracking-[0.3em] font-bold text-gray-400">
                        {topic.posts?.length || 0} Community Replies
                    </h2>
                    <div className="h-px bg-gray-200 flex-1"></div>
                </div>

                {/* Replies List */}
                <div className="space-y-8 mb-16">
                    {topic.posts?.map((post: ForumPost) => (
                        <div key={post.id} className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8 md:p-10 transition-all hover:shadow-md relative group">
                            <div className="flex items-start md:items-center justify-between mb-8 gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center overflow-hidden border border-gray-100">
                                        {post.author?.profileImage ? (
                                            <img src={post.author.profileImage} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <UserIcon className="h-5 w-5 text-gray-400" />
                                        )}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-bold text-gray-900">{post.author?.name}</h4>
                                            <UserBadge author={post.author} />
                                            {post.author?.role === 'ADMIN' && (
                                                <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-bold rounded-full uppercase">
                                                    <ShieldCheck className="h-3 w-3" /> Staff
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-400">{new Date(post.createdAt).toLocaleString()}</p>
                                    </div>
                                </div>

                                {(isAdmin || post.authorId === currentUser?.id) && (
                                    <button
                                        onClick={() => handleDeletePost(post.id)}
                                        className="p-2 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                )}
                            </div>

                            <div className="text-gray-700 leading-relaxed pl-16 border-l-2 border-amber-50 ml-6">
                                {post.content.split('\n').map((para: string, i: number) => (
                                    <p key={i} className="mb-4">{para}</p>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Reply Box */}
                {currentUser ? (
                    <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl border-2 border-amber-100 relative">
                        <div className="absolute -top-4 left-10 px-4 py-1 bg-amber-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-full shadow-lg">
                            Join the conversation
                        </div>
                        <form onSubmit={handleSubmitReply}>
                            <div className="flex items-start gap-4 mb-6">
                                <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center overflow-hidden">
                                    {currentUser.profileImage ? (
                                        <img src={currentUser.profileImage} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <UserIcon className="h-5 w-5 text-amber-600" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-gray-900 mb-1">Replying as {currentUser.name}</p>
                                    <p className="text-xs text-gray-400">Please remain respectful and kind.</p>
                                </div>
                            </div>
                            <textarea
                                value={reply}
                                onChange={(e) => setReply(e.target.value)}
                                placeholder="Share your thoughts, insights, or words of encouragement..."
                                className="w-full h-40 p-6 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-amber-500 transition-all resize-none mb-6 text-gray-700"
                                required
                            />
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !reply.trim()}
                                    className="flex items-center gap-2 bg-gradient-to-r from-amber-600 to-amber-700 text-white px-10 py-4 rounded-xl font-bold hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                                >
                                    {isSubmitting ? 'Posting...' : 'Post Reply'}
                                    <Send className={`h-4 w-4 transition-transform group-hover:translate-x-1 ${isSubmitting ? 'animate-pulse' : ''}`} />
                                </button>
                            </div>
                        </form>
                    </div>
                ) : (
                    <div className="bg-gray-100 rounded-[2.5rem] p-12 text-center border border-gray-200">
                        <h3 className="text-2xl font-bold text-gray-900 mb-4 font-serif">Want to weigh in?</h3>
                        <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                            Please sign in to share your thoughts and respond to this discussion.
                        </p>
                        <Link to="/login" className="inline-block bg-white text-gray-900 px-10 py-4 rounded-xl font-bold border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm">
                            Sign In to Reply
                        </Link>
                    </div>
                )}
            </main>
        </div>
    );
};

export default ForumTopicPage;
