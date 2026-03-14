import { MessageSquare, BookOpen, Trash2 } from 'lucide-react';

interface CommentsManagerProps {
    comments: any[];
    showAllComments: boolean;
    expandedComments: Set<string>;
    toggleAllComments: () => void;
    toggleCommentExpansion: (id: string) => void;
    approveComment: (id: string) => void;
    deleteComment: (id: string) => void;
}

const CommentsManager = ({
    comments,
    showAllComments,
    expandedComments,
    toggleAllComments,
    toggleCommentExpansion,
    approveComment,
    deleteComment
}: CommentsManagerProps) => {
    return (
        <div className="space-y-3">
            {/* Comments Header - Professional Ultra Compact */}
            <div className="bg-gradient-to-r from-white to-gray-50 rounded-lg shadow-md border border-gray-200 p-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center shadow-lg">
                            <MessageSquare className="h-4 w-4 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Comments Management</h3>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2 px-3 py-1.5 bg-green-50 rounded-full border border-green-200">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-xs font-bold text-green-700">{comments.filter(c => c.isApproved).length} Approved</span>
                        </div>
                        <div className="flex items-center space-x-2 px-3 py-1.5 bg-yellow-50 rounded-full border border-yellow-200">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                            <span className="text-xs font-bold text-yellow-700">{comments.filter(c => !c.isApproved).length} Pending</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Comments Stats - Professional Ultra Compact */}
            <div className="grid grid-cols-3 gap-2">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-md border border-blue-200 p-2 hover:shadow-lg transition-all duration-300">
                    <div className="text-center">
                        <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                            <MessageSquare className="h-3 w-3 text-white" />
                        </div>
                        <p className="text-lg font-bold text-blue-900">{comments.length}</p>
                        <p className="text-xs font-semibold text-blue-700">Total</p>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-md border border-green-200 p-2 hover:shadow-lg transition-all duration-300">
                    <div className="text-center">
                        <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
                            <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <p className="text-lg font-bold text-green-900">{comments.filter(c => c.isApproved).length}</p>
                        <p className="text-xs font-semibold text-green-700">Approved</p>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg shadow-md border border-yellow-200 p-2 hover:shadow-lg transition-all duration-300">
                    <div className="text-center">
                        <div className="w-6 h-6 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-2">
                            <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <p className="text-lg font-bold text-yellow-900">{comments.filter(c => !c.isApproved).length}</p>
                        <p className="text-xs font-semibold text-yellow-700">Pending</p>
                    </div>
                </div>
            </div>

            {/* Comments List - Professional Ultra Compact */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 px-3 py-2 border-b border-purple-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center shadow-md">
                                <MessageSquare className="h-3 w-3 text-white" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-gray-900">Recent Comments</h4>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-1 px-2 py-1 bg-green-50 rounded-full border border-green-200">
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                <span className="text-xs font-bold text-green-700">{comments.filter(c => c.isApproved).length}</span>
                            </div>
                            <div className="flex items-center space-x-1 px-2 py-1 bg-yellow-50 rounded-full border border-yellow-200">
                                <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div>
                                <span className="text-xs font-bold text-yellow-700">{comments.filter(c => !c.isApproved).length}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="relative">
                    {/* Scroll Fade Indicators */}
                    <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-white to-transparent z-10 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-white to-transparent z-10 pointer-events-none"></div>

                    <div className={`${showAllComments ? 'max-h-64 overflow-y-auto scroll-smooth' : 'max-h-48 overflow-y-auto scroll-smooth'}`}
                        style={{
                            scrollbarWidth: 'thin',
                            scrollbarColor: '#d1d5db #f3f4f6'
                        }}>
                        {comments.slice(0, showAllComments ? comments.length : 2).map((comment) => (
                            <div key={comment.id} className="p-2 border-b border-gray-100 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 transition-all duration-300 group">
                                <div className="flex items-start space-x-3">
                                    {/* Author Avatar */}
                                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center shadow-md flex-shrink-0 group-hover:shadow-lg transition-all duration-300">
                                        <span className="text-white font-bold text-xs">
                                            {comment.authorName?.charAt(0).toUpperCase() || 'A'}
                                        </span>
                                    </div>

                                    {/* Comment Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center space-x-2 mb-1">
                                            <h5 className="text-xs font-bold text-gray-900 truncate group-hover:text-purple-600 transition-colors duration-200">{comment.authorName}</h5>
                                            {comment.isApproved ? (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300">
                                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></div>
                                                    ✓ Approved
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border border-yellow-300">
                                                    <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mr-1"></div>
                                                    ⏳ Pending
                                                </span>
                                            )}
                                        </div>

                                        <div className="mb-2">
                                            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                                <p className="text-xs text-gray-700 leading-relaxed">
                                                    {expandedComments.has(comment.id) ? (
                                                        <>
                                                            {comment.content}
                                                            {comment.content.length > 100 && (
                                                                <button
                                                                    onClick={() => toggleCommentExpansion(comment.id)}
                                                                    className="text-blue-600 hover:text-blue-700 ml-2 font-medium transition-colors duration-200"
                                                                >
                                                                    Show less
                                                                </button>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <>
                                                            {comment.content.length > 100 ? (
                                                                <>
                                                                    {comment.content.substring(0, 100)}...
                                                                    <button
                                                                        onClick={() => toggleCommentExpansion(comment.id)}
                                                                        className="text-blue-600 hover:text-blue-700 ml-1 font-medium transition-colors duration-200"
                                                                    >
                                                                        Read more
                                                                    </button>
                                                                </>
                                                            ) : (
                                                                comment.content
                                                            )}
                                                        </>
                                                    )}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between text-xs text-gray-500">
                                            <div className="flex items-center space-x-2">
                                                <div className="flex items-center space-x-1 px-2 py-0.5 bg-gray-100 rounded-full">
                                                    <BookOpen className="h-2 w-2" />
                                                    <span className="font-medium">{comment.postSlug}</span>
                                                </div>
                                                <span>•</span>
                                                <span className="text-gray-400">{new Date(comment.timestamp).toLocaleDateString()}</span>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center space-x-1">
                                                {!comment.isApproved && (
                                                    <button
                                                        onClick={() => approveComment(comment.id)}
                                                        className="p-1.5 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-all duration-200 hover:shadow-md"
                                                        title="Approve comment"
                                                    >
                                                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => deleteComment(comment.id)}
                                                    className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200 hover:shadow-md"
                                                    title="Delete comment"
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {comments.length === 0 && (
                            <div className="text-center py-8">
                                <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-md">
                                    <MessageSquare className="h-6 w-6 text-purple-400" />
                                </div>
                                <h3 className="text-sm font-bold text-gray-900 mb-1">No Comments Yet</h3>
                                <p className="text-xs text-gray-500">Comments from your blog posts will appear here</p>
                            </div>
                        )}

                        {comments.length > 2 && (
                            <div className="p-2 bg-gradient-to-r from-purple-50 to-indigo-50 border-t border-purple-200">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                        <p className="text-xs font-semibold text-gray-700">
                                            {showAllComments
                                                ? `Showing all ${comments.length} comments`
                                                : `Showing 2 of ${comments.length} comments`
                                            }
                                        </p>
                                    </div>
                                    <button
                                        onClick={toggleAllComments}
                                        className="px-3 py-1.5 text-xs text-white bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 font-semibold rounded-lg transition-all duration-200 hover:shadow-md"
                                    >
                                        {showAllComments ? 'Show Less' : 'View All Comments'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommentsManager;
