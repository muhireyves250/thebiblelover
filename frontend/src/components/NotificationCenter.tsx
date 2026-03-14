import { useState, useEffect, useRef } from 'react';
import { Bell, BellOff, ExternalLink, Calendar, MessageSquare, Heart, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { notificationAPI } from '../services/api';
import type { Notification } from '../services/api.d';

const NotificationCenter = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        loadNotifications();
        // Polling every 60 seconds (conservative for performance)
        const interval = setInterval(loadNotifications, 60000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const loadNotifications = async () => {
        try {
            const response = await notificationAPI.getNotifications();
            if (response.success && response.data) {
                setNotifications(response.data.notifications);
                setUnreadCount(response.data.unreadCount);
            }
        } catch (err) {
            console.error('Failed to load notifications:', err);
        }
    };

    const handleMarkAsRead = async (id: string) => {
        try {
            const response = await notificationAPI.markAsRead(id);
            if (response.success) {
                loadNotifications();
            }
        } catch (err) {
            console.error('Failed to mark as read:', err);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            const response = await notificationAPI.markAllAsRead();
            if (response.success) {
                loadNotifications();
            }
        } catch (err) {
            console.error('Failed to mark all as read:', err);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'FORUM_REPLY': return <MessageSquare className="h-4 w-4 text-indigo-500" />;
            case 'EVENT_UPDATE': return <Calendar className="h-4 w-4 text-emerald-500" />;
            case 'PRAYER_SUPPORT': return <Heart className="h-4 w-4 text-rose-500 fill-rose-500/20" />;
            case 'ADMIN_MESSAGE': return <ShieldCheck className="h-4 w-4 text-amber-500" />;
            default: return <Bell className="h-4 w-4 text-gray-400" />;
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-400 hover:text-amber-600 transition-colors focus:outline-none"
            >
                <Bell className="h-6 w-6" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-4 w-[400px] max-h-[500px] overflow-hidden bg-white rounded-3xl shadow-2xl border border-gray-100 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                        <h3 className="text-sm font-black uppercase tracking-widest text-gray-900">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllAsRead}
                                className="text-[10px] font-bold text-amber-600 hover:text-amber-700 uppercase tracking-widest"
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>

                    <div className="overflow-y-auto max-h-[380px]">
                        {notifications.length === 0 ? (
                            <div className="py-12 text-center">
                                <BellOff className="h-10 w-10 text-gray-200 mx-auto mb-4" />
                                <p className="text-sm text-gray-500 font-medium">No notifications yet</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-50">
                                {notifications.map((notif) => {
                                    const getBgColor = (type: string) => {
                                        if (notif.isRead) return 'hover:bg-gray-50';
                                        switch (type) {
                                            case 'PRAYER_SUPPORT': return 'bg-rose-50/30 hover:bg-rose-50/50';
                                            case 'FORUM_REPLY': return 'bg-indigo-50/30 hover:bg-indigo-50/50';
                                            case 'EVENT_UPDATE': return 'bg-emerald-50/30 hover:bg-emerald-50/50';
                                            default: return 'bg-amber-50/20 hover:bg-amber-50/40';
                                        }
                                    };

                                    return (
                                        <div
                                            key={notif.id}
                                            className={`p-6 transition-all duration-300 flex gap-4 ${getBgColor(notif.type)} ${notif.isRead ? 'opacity-60' : ''}`}
                                        >
                                            <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border transition-transform duration-500 group-hover:scale-110 ${notif.isRead ? 'bg-gray-100 border-gray-200' : 'bg-white border-white shadow-sm'
                                                }`}>
                                                {getIcon(notif.type)}
                                            </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <h4 className="text-sm font-bold text-gray-900 truncate">{notif.title}</h4>
                                                <span className="text-[10px] text-gray-400 font-medium">
                                                    {new Date(notif.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-3">
                                                {notif.message}
                                            </p>
                                            <div className="flex items-center gap-4">
                                                {notif.link && (
                                                    <Link
                                                        to={notif.link}
                                                        onClick={() => {
                                                            handleMarkAsRead(notif.id);
                                                            setIsOpen(false);
                                                        }}
                                                        className="text-[10px] font-black uppercase tracking-widest text-amber-600 hover:text-amber-700 flex items-center gap-1"
                                                    >
                                                        View <ExternalLink className="h-3 w-3" />
                                                    </Link>
                                                )}
                                                {!notif.isRead && (
                                                    <button
                                                        onClick={() => handleMarkAsRead(notif.id)}
                                                        className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-600 flex items-center gap-1"
                                                    >
                                                        Mark read
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationCenter;
