import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MessageSquare, Eye, Clock, Plus, ChevronLeft, Pin } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { forumAPI } from '../services/api';
import type { ForumTopic } from '../services/api.d';
import SEO from '../components/SEO';

const ForumCategoryPage = () => {
    const { id } = useParams<{ id: string }>();
    const [topics, setTopics] = useState<ForumTopic[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, pages: 1 });
    // const currentUser = authAPI.getCurrentUser();

    useEffect(() => {
        if (id) loadTopics();
    }, [id, pagination.page]);

    const loadTopics = async () => {
        setLoading(true);
        try {
            const response = await forumAPI.getCategoryTopics(id!, { page: pagination.page });
            if (response.success && response.data) {
                setTopics(response.data.topics);
                setPagination(response.data.pagination);
            }
        } catch (err) {
            console.error('Failed to load category topics:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <SEO 
                title="Forum Discussions" 
                description="Browse community discussions, share insights, and grow together in faith."
            />
            <PageHeader
                title="Category Discussions"
                subtitle="Dive into specific topics and share your thoughts with the community."
            />

            <main className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
                {/* Navigation & Action */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
                    <Link to="/forum" className="flex items-center gap-2 text-gray-500 hover:text-amber-700 font-bold transition-colors group">
                        <ChevronLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                        Back to Categories
                    </Link>

                    <Link
                        to={`/forum/category/${id}/new`}
                        className="flex items-center space-x-2 bg-gradient-to-r from-amber-600 to-amber-700 text-white px-8 py-4 rounded-2xl font-bold hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 active:scale-95"
                    >
                        <Plus className="h-5 w-5" />
                        <span>Start a New Topic</span>
                    </Link>
                </div>

                {/* Topics List */}
                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                    <div className="hidden lg:grid grid-cols-12 gap-4 px-10 py-6 bg-gray-50 border-b border-gray-100">
                        <div className="col-span-6 text-[10px] uppercase font-bold tracking-[0.2em] text-gray-400">Discussion</div>
                        <div className="col-span-2 text-center text-[10px] uppercase font-bold tracking-[0.2em] text-gray-400">Replies</div>
                        <div className="col-span-2 text-center text-[10px] uppercase font-bold tracking-[0.2em] text-gray-400">Views</div>
                        <div className="col-span-2 text-right text-[10px] uppercase font-bold tracking-[0.2em] text-gray-400">Last Activity</div>
                    </div>

                    <div className="divide-y divide-gray-50">
                        {loading ? (
                            [1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="px-10 py-8 animate-pulse">
                                    <div className="h-6 w-1/2 bg-gray-100 rounded mb-3"></div>
                                    <div className="h-4 w-1/4 bg-gray-50 rounded"></div>
                                </div>
                            ))
                        ) : topics.length > 0 ? (
                            topics.map((topic: ForumTopic) => (
                                <div key={topic.id} className="group hover:bg-amber-50/30 transition-all duration-300">
                                    <div className="px-6 lg:px-10 py-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                                        <div className="col-span-12 lg:col-span-6">
                                            <div className="flex items-start gap-4">
                                                <div className={`mt-1.5 p-2 rounded-lg ${topic.isSticky ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-400'}`}>
                                                    {topic.isSticky ? <Pin className="h-4 w-4 fill-current" /> : <MessageSquare className="h-4 w-4" />}
                                                </div>
                                                <div>
                                                    <Link to={`/forum/topic/${topic.id}`}>
                                                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-amber-700 transition-colors mb-2">
                                                            {topic.title}
                                                        </h3>
                                                    </Link>
                                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                                        <span className="font-bold text-gray-700">{topic.author?.name}</span>
                                                        <span>•</span>
                                                        <Clock className="h-3.5 w-3.5 mr-1" />
                                                        {new Date(topic.createdAt).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="col-span-4 lg:col-span-2 text-center flex lg:block items-center justify-between">
                                            <span className="lg:hidden text-xs font-bold text-gray-400 uppercase">Replies:</span>
                                            <div className="text-lg font-bold text-gray-800 flex items-center justify-center gap-1.5">
                                                <MessageSquare className="h-4 w-4 text-amber-500 lg:hidden" />
                                                {topic._count?.posts || 0}
                                            </div>
                                        </div>

                                        <div className="col-span-4 lg:col-span-2 text-center flex lg:block items-center justify-between border-x border-gray-100 lg:border-none px-4 lg:px-0">
                                            <span className="lg:hidden text-xs font-bold text-gray-400 uppercase">Views:</span>
                                            <div className="text-lg font-bold text-gray-800 flex items-center justify-center gap-1.5">
                                                <Eye className="h-4 w-4 text-amber-500 lg:hidden" />
                                                {topic.views}
                                            </div>
                                        </div>

                                        <div className="col-span-4 lg:col-span-2 text-right">
                                            <p className="text-sm font-bold text-gray-900 mb-1">{new Date(topic.updatedAt).toLocaleDateString()}</p>
                                            <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Active</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="px-10 py-32 text-center">
                                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl">🌿</div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">No discussions yet</h3>
                                <p className="text-gray-500 max-w-sm mx-auto">
                                    Be the one to start the conversation in this category.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                    <div className="mt-12 flex justify-center items-center space-x-4">
                        <button
                            disabled={pagination.page === 1}
                            onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                            className="p-3 rounded-xl border border-gray-200 hover:border-amber-500 hover:text-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                        <span className="text-sm font-bold text-gray-700">
                            Page {pagination.page} of {pagination.pages}
                        </span>
                        <button
                            disabled={pagination.page === pagination.pages}
                            onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                            className="p-3 rounded-xl border border-gray-200 hover:border-amber-500 hover:text-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronLeft className="h-5 w-5 rotate-180" />
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
};

export default ForumCategoryPage;
