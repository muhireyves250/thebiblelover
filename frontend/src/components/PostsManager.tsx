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
    return (
        <div className="space-y-4">
            {/* Posts Header - Ultra Compact */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-md">
                            <BookOpen className="h-4 w-4 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Blog Posts</h3>
                            <p className="text-xs text-gray-600">Manage your blog content and articles</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowAddPostConfirm(true)}
                        className="flex items-center space-x-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-4 py-2 rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all duration-300 shadow-md hover:shadow-lg"
                    >
                        <Plus className="h-4 w-4" />
                        <span className="text-sm font-semibold">New Post</span>
                    </button>
                </div>
            </div>

            {/* Posts Table - Ultra Compact */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="overflow-hidden">
                    <table className="w-full divide-y divide-gray-200">
                        <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                            <tr>
                                <th className="px-3 py-2 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Title</th>
                                <th className="px-3 py-2 text-left text-xs font-bold text-gray-600 uppercase tracking-wider hidden md:table-cell">Author</th>
                                <th className="px-3 py-2 text-left text-xs font-bold text-gray-600 uppercase tracking-wider hidden lg:table-cell">Stats</th>
                                <th className="px-3 py-2 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Status</th>
                                <th className="px-3 py-2 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {posts.map((post) => (
                                <tr key={post.id} className="hover:bg-gray-50 transition-colors duration-200 group">
                                    <td className="px-3 py-2">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                                                <BookOpen className="h-3 w-3 text-white" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="text-xs font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate">{post.title}</div>
                                                <div className="text-xs text-gray-500">{post.date}</div>
                                                {/* Mobile stats */}
                                                <div className="flex items-center space-x-3 mt-1 md:hidden">
                                                    <div className="flex items-center space-x-1">
                                                        <Eye className="h-2 w-2 text-green-500" />
                                                        <span className="text-xs font-semibold text-gray-700">{post.views}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-1">
                                                        <Heart className="h-2 w-2 text-red-500" />
                                                        <span className="text-xs font-semibold text-gray-700">{post.likes}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-1">
                                                        <MessageSquare className="h-2 w-2 text-purple-500" />
                                                        <span className="text-xs font-semibold text-gray-700">{post.comments}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-3 py-2 hidden md:table-cell">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-5 h-5 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center">
                                                <span className="text-white font-bold text-xs">{post.author?.charAt(0) || 'A'}</span>
                                            </div>
                                            <span className="text-xs font-semibold text-gray-900 truncate">{post.author}</span>
                                        </div>
                                    </td>
                                    <td className="px-3 py-2 hidden lg:table-cell">
                                        <div className="flex items-center space-x-3">
                                            <div className="flex items-center space-x-1">
                                                <Eye className="h-3 w-3 text-green-500" />
                                                <span className="text-xs font-bold text-gray-900">{post.views}</span>
                                            </div>
                                            <div className="flex items-center space-x-1">
                                                <Heart className="h-3 w-3 text-red-500" />
                                                <span className="text-xs font-bold text-gray-900">{post.likes}</span>
                                            </div>
                                            <div className="flex items-center space-x-1">
                                                <MessageSquare className="h-3 w-3 text-purple-500" />
                                                <span className="text-xs font-bold text-gray-900">{post.comments}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-3 py-2">
                                        {(() => {
                                            const isFuture = post.publishedAt && new Date(post.publishedAt) > new Date();
                                            if (isFuture && post.status === 'PUBLISHED') {
                                                return (
                                                    <span className="px-2 py-1 text-[10px] font-bold rounded-full bg-blue-100 text-blue-700 border border-blue-200 uppercase whitespace-nowrap">
                                                        Scheduled
                                                    </span>
                                                );
                                            }
                                            switch (post.status) {
                                                case 'PUBLISHED':
                                                    return (
                                                        <span className="px-2 py-1 text-[10px] font-bold rounded-full bg-green-100 text-green-700 border border-green-200 uppercase">
                                                            Published
                                                        </span>
                                                    );
                                                case 'DRAFT':
                                                    return (
                                                        <span className="px-2 py-1 text-[10px] font-bold rounded-full bg-gray-100 text-gray-700 border border-gray-200 uppercase">
                                                            Draft
                                                        </span>
                                                    );
                                                case 'ARCHIVED':
                                                    return (
                                                        <span className="px-2 py-1 text-[10px] font-bold rounded-full bg-red-100 text-red-700 border border-red-200 uppercase">
                                                            Archived
                                                        </span>
                                                    );
                                                default:
                                                    return (
                                                        <span className="px-2 py-1 text-[10px] font-bold rounded-full bg-gray-100 text-gray-700 border border-gray-200 uppercase">
                                                            {post.status}
                                                        </span>
                                                    );
                                            }
                                        })()}
                                    </td>
                                    <td className="px-3 py-2">
                                        <div className="flex space-x-1">
                                            <button
                                                onClick={() => window.open(`/blog/${post.slug}`, '_blank')}
                                                className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200"
                                                title="Preview post"
                                            >
                                                <ExternalLink className="h-3 w-3" />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedPost(post);
                                                    setShowEditPostConfirm(true);
                                                }}
                                                className="p-1.5 text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-all duration-200"
                                                title="Edit post"
                                            >
                                                <Edit className="h-3 w-3" />
                                            </button>
                                            <button
                                                onClick={() => handleDeletePost(post)}
                                                className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                                                title="Delete post"
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Table Footer - Ultra Compact */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-3 py-2 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-xs font-semibold text-gray-700">Total: {posts.length}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span className="text-xs font-semibold text-gray-700">Active: {posts.length}</span>
                            </div>
                        </div>
                        <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                            <span className="text-xs font-semibold text-gray-700">Updated: {new Date().toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PostsManager;
