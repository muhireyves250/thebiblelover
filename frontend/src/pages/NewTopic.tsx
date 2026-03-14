import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Send, ChevronLeft, AlertCircle, Sparkles, BookOpen, Users, Heart } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { forumAPI, authAPI, type ForumCategory } from '../services/api';

const NewTopicPage = () => {
    const { categoryId } = useParams<{ categoryId: string }>();
    const navigate = useNavigate();
    const [category, setCategory] = useState<ForumCategory | null>(null);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const currentUser = authAPI.getCurrentUser();
        if (!currentUser) {
            navigate('/login');
            return;
        }

        if (categoryId) loadCategory();
    }, [categoryId]);

    const loadCategory = async () => {
        try {
            const response = await forumAPI.getCategories();
            if (response.success && response.data) {
                const cat = response.data.find((c: ForumCategory) => c.id === categoryId);
                if (cat) setCategory(cat);
            }
        } catch (err) {
            console.error('Failed to load category:', err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !content.trim() || !categoryId) return;

        setIsSubmitting(true);
        setError(null);
        try {
            const response = await forumAPI.createTopic({
                categoryId,
                title: title.trim(),
                content: content.trim()
            });

            if (response.success && response.data) {
                navigate(`/forum/topic/${response.data.id}`);
            } else {
                setError(response.message || 'Failed to create topic');
            }
        } catch (err) {
            console.error('Failed to create topic:', err);
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <PageHeader
                title="Start a Discussion"
                subtitle={category ? `New topic in ${category.name}` : 'Share your thoughts with the community'}
            />

            <main className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
                <Link to={`/forum/category/${categoryId}`} className="flex items-center gap-2 text-gray-500 hover:text-amber-700 font-bold mb-10 transition-colors group">
                    <ChevronLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                    Cancel and return to {category?.name || 'Category'}
                </Link>

                {error && (
                    <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600">
                        <AlertCircle className="h-5 w-5" />
                        <p className="font-medium text-sm">{error}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Main Form */}
                    <div className="lg:col-span-2">
                        <form onSubmit={handleSubmit} className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100">
                            <div className="mb-8">
                                <label htmlFor="title" className="block text-sm font-bold text-gray-900 uppercase tracking-widest mb-3">Topic Title</label>
                                <input
                                    id="title"
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Summarize your main point or question..."
                                    className="w-full p-5 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-amber-500 transition-all font-bold text-lg text-gray-900 placeholder-gray-400"
                                    required
                                    maxLength={100}
                                />
                            </div>

                            <div className="mb-10">
                                <label htmlFor="content" className="block text-sm font-bold text-gray-900 uppercase tracking-widest mb-3">Your Message</label>
                                <textarea
                                    id="content"
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="Go into more detail here. You can share verses, personal stories, or ask deeper questions..."
                                    className="w-full h-80 p-6 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-amber-500 transition-all resize-none text-gray-700 leading-relaxed"
                                    required
                                />
                            </div>

                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !title.trim() || !content.trim()}
                                    className="flex items-center gap-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white px-12 py-5 rounded-2xl font-bold hover:shadow-2xl transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group"
                                >
                                    {isSubmitting ? 'Creating...' : 'Launch Discussion'}
                                    <Send className={`h-5 w-5 transition-transform group-hover:translate-x-1 ${isSubmitting ? 'animate-pulse' : ''}`} />
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Guidelines Sidebar */}
                    <div className="space-y-8">
                        <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm">
                            <h3 className="text-xl font-bold text-gray-900 mb-6 font-serif">Community Guidelines</h3>
                            <ul className="space-y-6">
                                <li className="flex gap-4">
                                    <div className="mt-1 p-1 bg-amber-50 rounded-lg text-amber-600">
                                        <Sparkles className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-900 mb-1">Be Encouraging</h4>
                                        <p className="text-xs text-gray-500 leading-relaxed">Speak the truth in love and lift each other up.</p>
                                    </div>
                                </li>
                                <li className="flex gap-4">
                                    <div className="mt-1 p-1 bg-amber-50 rounded-lg text-amber-600">
                                        <BookOpen className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-900 mb-1">Scripture First</h4>
                                        <p className="text-xs text-gray-500 leading-relaxed">Ground your insights in the Word of God.</p>
                                    </div>
                                </li>
                                <li className="flex gap-4">
                                    <div className="mt-1 p-1 bg-amber-50 rounded-lg text-amber-600">
                                        <Heart className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-900 mb-1">Respect Privacy</h4>
                                        <p className="text-xs text-gray-500 leading-relaxed">Avoid sharing sensitive info about others without permission.</p>
                                    </div>
                                </li>
                            </ul>
                        </div>

                        <div className="bg-amber-600 rounded-[2rem] p-8 text-white">
                            <Users className="h-10 w-10 mb-6 opacity-30" />
                            <h4 className="text-xl font-bold mb-3 font-serif">Need Help?</h4>
                            <p className="text-amber-100 text-sm leading-relaxed mb-6">
                                If you're unsure where to post, try the 'General Discussion' category first.
                            </p>
                            <Link to="/contact" className="inline-block text-xs font-bold uppercase tracking-widest border-b-2 border-amber-400 pb-1 hover:text-white transition-colors">
                                Contact Staff
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default NewTopicPage;
