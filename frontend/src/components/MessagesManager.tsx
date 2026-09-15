import { Mail, Calendar, Inbox, CheckCircle2, Trash2, Send, Check } from 'lucide-react';

interface MessagesManagerProps {
    messages: any[];
    showAllMessages: boolean;
    isLoading: boolean;
    expandedMessages: Set<string>;
    setShowAllMessages: (show: boolean) => void;
    toggleMessageExpansion: (id: string) => void;
    markMessageAsRead: (id: string) => void;
    deleteMessage: (id: string) => void;
}

const MessagesManager = ({
    messages,
    showAllMessages,
    isLoading,
    expandedMessages,
    setShowAllMessages,
    toggleMessageExpansion,
    markMessageAsRead,
    deleteMessage
}: MessagesManagerProps) => {
    const thisMonthCount = messages.filter(msg => {
        const msgDate = new Date(msg.timestamp);
        const now = new Date();
        return msgDate.getMonth() === now.getMonth() && msgDate.getFullYear() === now.getFullYear();
    }).length;
    const unreadCount = messages.filter(msg => !msg.isRead).length;
    const readCount = messages.length - unreadCount;

    return (
        <div className="space-y-4">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                    { label: 'Total Messages', value: messages.length, icon: Mail },
                    { label: 'This Month', value: thisMonthCount, icon: Calendar },
                    { label: 'Unread', value: unreadCount, icon: Inbox },
                    { label: 'Read', value: readCount, icon: CheckCircle2 },
                ].map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div key={stat.label} className="bg-white dark:bg-[#141417] border border-gray-300 dark:border-white/10 rounded-lg shadow-sm p-3">
                            <div className="w-8 h-8 bg-amber-50 dark:bg-amber-900/20 rounded-lg flex items-center justify-center mb-2">
                                <Icon className="h-4 w-4 text-amber-700" />
                            </div>
                            <p className="text-lg font-black text-gray-900 dark:text-white">{stat.value}</p>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">{stat.label}</p>
                        </div>
                    );
                })}
            </div>

            {/* Messages List */}
            <div className="bg-white dark:bg-[#141417] border border-gray-300 dark:border-white/10 rounded-lg shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-200 dark:border-white/10 flex items-center justify-between">
                    <h3 className="text-sm font-black uppercase tracking-tight text-gray-900 dark:text-white">Contact Messages</h3>
                    <button
                        onClick={() => setShowAllMessages(!showAllMessages)}
                        className="text-xs font-bold text-amber-700 hover:text-amber-800"
                    >
                        {showAllMessages ? 'Show Recent Only' : 'View All Messages'}
                    </button>
                </div>

                <div className="divide-y divide-gray-100 dark:divide-white/5">
                    {isLoading ? (
                        <div className="p-4 space-y-4 animate-pulse">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex items-start gap-3">
                                    <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-white/10 shrink-0" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-3 w-1/3 bg-gray-100 dark:bg-white/10 rounded" />
                                        <div className="h-2.5 w-1/2 bg-gray-100 dark:bg-white/10 rounded" />
                                        <div className="h-12 w-full bg-gray-100 dark:bg-white/10 rounded-lg" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (showAllMessages ? messages : messages.slice(0, 5)).length === 0 ? (
                        <div className="text-center py-10">
                            <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                                <Mail className="h-6 w-6 text-amber-700" />
                            </div>
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">No messages yet</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Contact messages from your website visitors will appear here.</p>
                        </div>
                    ) : (
                        (showAllMessages ? messages : messages.slice(0, 5)).map((message) => (
                            <div key={message.id} className="p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                <div className="flex items-start gap-3">
                                    <div className="w-9 h-9 bg-amber-50 dark:bg-amber-900/20 rounded-lg flex items-center justify-center shrink-0">
                                        <span className="text-amber-700 font-bold text-xs">
                                            {message.name.charAt(0).toUpperCase()}
                                        </span>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                                            <div className="flex items-center gap-2">
                                                <h4 className="text-xs font-bold text-gray-900 dark:text-white">{message.name}</h4>
                                                {!message.isRead && (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 uppercase">
                                                        New
                                                    </span>
                                                )}
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 uppercase">
                                                    {message.status || 'Pending'}
                                                </span>
                                            </div>
                                            <span className="text-xs text-gray-400 dark:text-gray-500">
                                                {new Date(message.timestamp).toLocaleDateString()}
                                            </span>
                                        </div>

                                        <div className="mb-2">
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white mb-0.5">{message.subject}</p>
                                            <p className="text-xs text-gray-400 dark:text-gray-500">{message.email}</p>
                                        </div>

                                        <div className="mb-3">
                                            <div className="bg-gray-50 dark:bg-white/5 rounded-lg p-3 border border-gray-200 dark:border-white/10">
                                                <p className="text-xs text-gray-700 dark:text-gray-200 leading-relaxed">
                                                    {expandedMessages.has(message.id) ? (
                                                        <>
                                                            {message.message}
                                                            {message.message.length > 150 && (
                                                                <button
                                                                    onClick={() => toggleMessageExpansion(message.id)}
                                                                    className="text-amber-700 hover:text-amber-800 ml-2 font-semibold"
                                                                >
                                                                    Show less
                                                                </button>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <>
                                                            {message.message.length > 150 ? (
                                                                <>
                                                                    {message.message.substring(0, 150)}...
                                                                    <button
                                                                        onClick={() => toggleMessageExpansion(message.id)}
                                                                        className="text-amber-700 hover:text-amber-800 ml-1 font-semibold"
                                                                    >
                                                                        Read more
                                                                    </button>
                                                                </>
                                                            ) : (
                                                                message.message
                                                            )}
                                                        </>
                                                    )}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => window.open(`mailto:${message.email}?subject=Re: ${message.subject}`, '_blank')}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 dark:border-white/10 text-xs font-bold rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                                                >
                                                    <Send className="w-3 h-3" />
                                                    Reply
                                                </button>
                                                <button
                                                    onClick={() => markMessageAsRead(message.id)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 dark:border-white/10 text-xs font-bold rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                                                >
                                                    <Check className="w-3 h-3" />
                                                    Mark Read
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => deleteMessage(message.id)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-red-200 dark:border-red-900/40 text-xs font-bold rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {!showAllMessages && messages.length > 5 && (
                    <div className="p-3 bg-gray-50 dark:bg-white/5 border-t border-gray-200 dark:border-white/10">
                        <button
                            onClick={() => setShowAllMessages(true)}
                            className="w-full text-center text-xs font-bold text-amber-700 hover:text-amber-800"
                        >
                            View all {messages.length} messages
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MessagesManager;
