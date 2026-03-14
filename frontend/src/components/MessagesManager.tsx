import { Trash2 } from 'lucide-react';

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
    return (
        <div className="space-y-6">
            {/* Contact Messages Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Messages</p>
                            <p className="text-2xl font-bold text-gray-900">{messages.length}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">This Month</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {messages.filter(msg => {
                                    const msgDate = new Date(msg.timestamp);
                                    const now = new Date();
                                    return msgDate.getMonth() === now.getMonth() && msgDate.getFullYear() === now.getFullYear();
                                }).length}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Unread</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {messages.filter(msg => !msg.isRead).length}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6v-6H4v6zM4 5v6h6V5H4z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Average Response</p>
                            <p className="text-2xl font-bold text-gray-900">2.4h</p>
                        </div>
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contact Messages List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">Contact Messages</h3>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setShowAllMessages(!showAllMessages)}
                                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                            >
                                {showAllMessages ? 'Show Recent Only' : 'View All Messages'}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="divide-y divide-gray-200">
                    {isLoading ? (
                        <div className="p-8 text-center">
                            <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-gray-500 bg-white transition ease-in-out duration-150">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Loading messages...
                            </div>
                        </div>
                    ) : (showAllMessages ? messages : messages.slice(0, 5)).length === 0 ? (
                        <div className="p-8 text-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
                            <p className="text-gray-500">Contact messages from your website visitors will appear here.</p>
                        </div>
                    ) : (
                        (showAllMessages ? messages : messages.slice(0, 5)).map((message) => (
                            <div key={message.id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                                <div className="flex items-start space-x-4">
                                    {/* Avatar */}
                                    <div className="flex-shrink-0">
                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                            <span className="text-white font-semibold text-sm">
                                                {message.name.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Message Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center space-x-2">
                                                <h4 className="text-sm font-semibold text-gray-900">{message.name}</h4>
                                                {!message.isRead && (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                        New
                                                    </span>
                                                )}
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                    {message.status || 'Pending'}
                                                </span>
                                            </div>
                                            <div className="flex items-center space-x-1">
                                                <span className="text-xs text-gray-500">
                                                    {new Date(message.timestamp).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="mb-3">
                                            <p className="text-sm font-medium text-gray-900 mb-1">{message.subject}</p>
                                            <p className="text-xs text-gray-500">{message.email}</p>
                                        </div>

                                        <div className="mb-4">
                                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                                <p className="text-sm text-gray-700 leading-relaxed">
                                                    {expandedMessages.has(message.id) ? (
                                                        <>
                                                            {message.message}
                                                            {message.message.length > 150 && (
                                                                <button
                                                                    onClick={() => toggleMessageExpansion(message.id)}
                                                                    className="text-blue-600 hover:text-blue-700 ml-2 font-medium transition-colors duration-200"
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
                                                                        className="text-blue-600 hover:text-blue-700 ml-1 font-medium transition-colors duration-200"
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

                                        {/* Action Buttons */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => window.open(`mailto:${message.email}?subject=Re: ${message.subject}`, '_blank')}
                                                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                                                >
                                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                    </svg>
                                                    Reply
                                                </button>
                                                <button
                                                    onClick={() => markMessageAsRead(message.id)}
                                                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200"
                                                >
                                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    Mark Read
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => deleteMessage(message.id)}
                                                className="inline-flex items-center px-3 py-1.5 border border-red-300 shadow-sm text-xs font-medium rounded-lg text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200"
                                            >
                                                <Trash2 className="w-3 h-3 mr-1" />
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
                    <div className="p-4 bg-gray-50 border-t border-gray-200">
                        <button
                            onClick={() => setShowAllMessages(true)}
                            className="w-full text-center text-sm text-gray-600 hover:text-gray-800 font-medium"
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
