import {
    BookOpen,
    Plus,
    ExternalLink,
    Edit,
    Trash2,
    Eye,
    Heart,
    MessageSquare
} from 'lucide-react';

interface PostsManagerProps {
    posts: any[];
    setShowAddPostConfirm: (show: boolean) => void;
    setSelectedPost: (post: any) => void;
    setShowEditPostConfirm: (show: boolean) => void;
    handleDeletePost: (post: any) => void;
}

const PostsManager = ({
    posts,
    setShowAddPostConfirm,
    setSelectedPost,
    setShowEditPostConfirm,
    handleDeletePost
}: PostsManagerProps) => {
    const publishedCount = posts.filter(p => p.status === 'PUBLISHED').length;
    const draftCount = posts.filter(p => p.status === 'DRAFT').length;

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="bg-white dark:bg-[#141417] border border-gray-300 dark:border-white/10 rounded-lg shadow-sm p-4 md:p-5">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-amber-50 dark:bg-amber-900/20 rounded-lg flex items-center justify-center">
                            <BookOpen className="h-4 w-4 text-amber-700" />
                        </div>
                        <div>
                            <h3 className="text-base font-black uppercase tracking-tight text-gray-900 dark:text-white">Blog Posts</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Manage your blog content and articles</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowAddPostConfirm(true)}
                        className="flex items-center gap-2 bg-amber-700 hover:bg-amber-800 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                        <Plus className="h-4 w-4" />
                        <span className="text-sm font-bold">New Post</span>
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
                {[
                    { label: 'Total', value: posts.length },
                    { label: 'Published', value: publishedCount },
                    { label: 'Drafts', value: draftCount },
                ].map((stat) => (
                    <div key={stat.label} className="bg-white dark:bg-[#141417] border border-gray-300 dark:border-white/10 rounded-lg shadow-sm p-3 text-center">
                        <p className="text-xl font-black text-gray-900 dark:text-white">{stat.value}</p>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mt-0.5">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Posts Table */}
            <div className="bg-white dark:bg-[#141417] border border-gray-300 dark:border-white/10 rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full divide-y divide-gray-200 dark:divide-white/10">
                        <thead className="bg-gray-50 dark:bg-white/5">
                            <tr>
                                <th className="px-3 py-2 text-left text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Title</th>
                                <th className="px-3 py-2 text-left text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest hidden md:table-cell">Author</th>
                                <th className="px-3 py-2 text-left text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest hidden lg:table-cell">Stats</th>
                                <th className="px-3 py-2 text-left text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Status</th>
                                <th className="px-3 py-2 text-left text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                            {posts.map((post) => (
                                <tr key={post.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                                    <td className="px-3 py-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 bg-amber-50 dark:bg-amber-900/20 rounded-md flex items-center justify-center shrink-0">
                                                <BookOpen className="h-3.5 w-3.5 text-amber-700" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="text-xs font-bold text-gray-900 dark:text-white truncate">{post.title}</div>
                                                <div className="text-xs text-gray-400 dark:text-gray-500">{post.date}</div>
                                                {/* Mobile stats */}
                                                <div className="flex items-center gap-3 mt-1 md:hidden">
                                                    <div className="flex items-center gap-1">
                                                        <Eye className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                                                        <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">{post.views}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Heart className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                                                        <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">{post.likes}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <MessageSquare className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                                                        <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">{post.comments}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-3 py-2 hidden md:table-cell">
                                        <div className="flex items-center gap-2">
                                            <div className="w-5 h-5 bg-gray-200 dark:bg-white/10 rounded-full flex items-center justify-center shrink-0">
                                                <span className="text-gray-600 dark:text-gray-200 font-bold text-[10px]">{post.author?.charAt(0) || 'A'}</span>
                                            </div>
                                            <span className="text-xs font-semibold text-gray-700 dark:text-gray-200 truncate">{post.author}</span>
                                        </div>
                                    </td>
                                    <td className="px-3 py-2 hidden lg:table-cell">
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-1">
                                                <Eye className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                                                <span className="text-xs font-bold text-gray-700 dark:text-gray-200">{post.views}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Heart className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                                                <span className="text-xs font-bold text-gray-700 dark:text-gray-200">{post.likes}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <MessageSquare className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                                                <span className="text-xs font-bold text-gray-700 dark:text-gray-200">{post.comments}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-3 py-2">
                                        {(() => {
                                            const isFuture = post.publishedAt && new Date(post.publishedAt) > new Date();
                                            if (isFuture && post.status === 'PUBLISHED') {
                                                return (
                                                    <span className="px-2 py-1 text-[10px] font-bold rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900/40 uppercase whitespace-nowrap">
                                                        Scheduled
                                                    </span>
                                                );
                                            }
                                            switch (post.status) {
                                                case 'PUBLISHED':
                                                    return (
                                                        <span className="px-2 py-1 text-[10px] font-bold rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 uppercase">
                                                            Published
                                                        </span>
                                                    );
                                                case 'DRAFT':
                                                    return (
                                                        <span className="px-2 py-1 text-[10px] font-bold rounded-full bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-white/10 uppercase">
                                                            Draft
                                                        </span>
                                                    );
                                                case 'ARCHIVED':
                                                    return (
                                                        <span className="px-2 py-1 text-[10px] font-bold rounded-full bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/40 uppercase">
                                                            Archived
                                                        </span>
                                                    );
                                                default:
                                                    return (
                                                        <span className="px-2 py-1 text-[10px] font-bold rounded-full bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-white/10 uppercase">
                                                            {post.status}
                                                        </span>
                                                    );
                                            }
                                        })()}
                                    </td>
                                    <td className="px-3 py-2">
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => window.open(`/blog/${post.slug}`, '_blank')}
                                                className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                title="Preview post"
                                            >
                                                <ExternalLink className="h-3.5 w-3.5" />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedPost(post);
                                                    setShowEditPostConfirm(true);
                                                }}
                                                className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors"
                                                title="Edit post"
                                            >
                                                <Edit className="h-3.5 w-3.5" />
                                            </button>
                                            <button
                                                onClick={() => handleDeletePost(post)}
                                                className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                title="Delete post"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {posts.length === 0 && (
                        <div className="text-center py-10">
                            <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                                <BookOpen className="h-6 w-6 text-amber-700" />
                            </div>
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">No Posts Yet</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Create your first blog post to get started</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PostsManager;
