import { MessageSquare, BookOpen, Trash2, Check } from 'lucide-react';

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
    const approvedCount = comments.filter(c => c.isApproved).length;
    const pendingCount = comments.filter(c => !c.isApproved).length;

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="bg-white dark:bg-[#141417] border border-gray-300 dark:border-white/10 rounded-lg shadow-sm p-4 md:p-5">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-amber-50 dark:bg-amber-900/20 rounded-lg flex items-center justify-center">
                        <MessageSquare className="h-4 w-4 text-amber-700" />
                    </div>
                    <h3 className="text-base font-black uppercase tracking-tight text-gray-900 dark:text-white">Comments Management</h3>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
                {[
                    { label: 'Total', value: comments.length },
                    { label: 'Approved', value: approvedCount },
                    { label: 'Pending', value: pendingCount },
                ].map((stat) => (
                    <div key={stat.label} className="bg-white dark:bg-[#141417] border border-gray-300 dark:border-white/10 rounded-lg shadow-sm p-3 text-center">
                        <p className="text-xl font-black text-gray-900 dark:text-white">{stat.value}</p>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mt-0.5">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Comments List */}
            <div className="bg-white dark:bg-[#141417] border border-gray-300 dark:border-white/10 rounded-lg shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-200 dark:border-white/10">
                    <h4 className="text-sm font-black uppercase tracking-tight text-gray-900 dark:text-white">Recent Comments</h4>
                </div>

                <div className={`${showAllComments ? 'max-h-64' : 'max-h-48'} overflow-y-auto`}>
                    {comments.slice(0, showAllComments ? comments.length : 2).map((comment) => (
                        <div key={comment.id} className="p-3 border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 bg-amber-50 dark:bg-amber-900/20 rounded-lg flex items-center justify-center shrink-0">
                                    <span className="text-amber-700 font-bold text-xs">
                                        {comment.authorName?.charAt(0).toUpperCase() || 'A'}
                                    </span>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h5 className="text-xs font-bold text-gray-900 dark:text-white truncate">{comment.authorName}</h5>
                                        {comment.isApproved ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 uppercase">
                                                Approved
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40 uppercase">
                                                Pending
                                            </span>
                                        )}
                                    </div>

                                    <div className="mb-2">
                                        <div className="bg-gray-50 dark:bg-white/5 rounded-lg p-3 border border-gray-200 dark:border-white/10">
                                            <p className="text-xs text-gray-700 dark:text-gray-200 leading-relaxed">
                                                {expandedComments.has(comment.id) ? (
                                                    <>
                                                        {comment.content}
                                                        {comment.content.length > 100 && (
                                                            <button
                                                                onClick={() => toggleCommentExpansion(comment.id)}
                                                                className="text-amber-700 hover:text-amber-800 ml-2 font-semibold"
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
                                                                    className="text-amber-700 hover:text-amber-800 ml-1 font-semibold"
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

                                    <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 dark:bg-white/10 rounded-full">
                                                <BookOpen className="h-2.5 w-2.5" />
                                                <span className="font-medium">{comment.postSlug}</span>
                                            </div>
                                            <span>{new Date(comment.timestamp).toLocaleDateString()}</span>
                                        </div>

                                        <div className="flex items-center gap-1">
                                            {!comment.isApproved && (
                                                <button
                                                    onClick={() => approveComment(comment.id)}
                                                    className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                                                    title="Approve comment"
                                                >
                                                    <Check className="h-3.5 w-3.5" />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => deleteComment(comment.id)}
                                                className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                title="Delete comment"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {comments.length === 0 && (
                        <div className="text-center py-10">
                            <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                                <MessageSquare className="h-6 w-6 text-amber-700" />
                            </div>
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">No Comments Yet</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Comments from your blog posts will appear here</p>
                        </div>
                    )}
                </div>

                {comments.length > 2 && (
                    <div className="p-3 bg-gray-50 dark:bg-white/5 border-t border-gray-200 dark:border-white/10 flex items-center justify-between">
                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                            {showAllComments
                                ? `Showing all ${comments.length} comments`
                                : `Showing 2 of ${comments.length} comments`
                            }
                        </p>
                        <button
                            onClick={toggleAllComments}
                            className="px-3 py-1.5 text-xs text-white bg-amber-700 hover:bg-amber-800 font-bold rounded-lg transition-colors"
                        >
                            {showAllComments ? 'Show Less' : 'View All Comments'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommentsManager;
