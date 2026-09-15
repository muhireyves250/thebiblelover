import { useState, useEffect, useRef } from 'react';
import { Bell, BellOff, ExternalLink, Calendar, Heart, ShieldCheck } from 'lucide-react';
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
            case 'EVENT_UPDATE': return <Calendar className="h-4 w-4 text-emerald-500" />;
            case 'PRAYER_SUPPORT': return <Heart className="h-4 w-4 text-rose-500 fill-rose-500/20" />;
            case 'ADMIN_MESSAGE': return <ShieldCheck className="h-4 w-4 text-amber-500" />;
            default: return <Bell className="h-4 w-4 text-gray-400 dark:text-gray-500" />;
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-400 dark:text-gray-500 hover:text-amber-600 transition-colors focus:outline-none"
            >
                <Bell className="h-6 w-6" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-[#0a0a0a]">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="fixed sm:absolute inset-x-3 sm:inset-x-auto top-16 sm:top-auto sm:right-0 sm:mt-3 sm:w-[400px] max-h-[70vh] sm:max-h-[500px] overflow-hidden bg-white dark:bg-[#141417] rounded-lg shadow-2xl border border-gray-300 dark:border-white/10 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-5 py-4 border-b border-gray-200 dark:border-white/10 flex items-center justify-between bg-gray-50 dark:bg-white/5">
                        <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllAsRead}
                                className="text-[10px] font-bold text-amber-700 hover:text-amber-800 uppercase tracking-widest"
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>

                    <div className="overflow-y-auto max-h-[calc(70vh-56px)] sm:max-h-[420px]">
                        {notifications.length === 0 ? (
                            <div className="py-12 text-center">
                                <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                                    <BellOff className="h-6 w-6 text-amber-700" />
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">No notifications yet</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100 dark:divide-white/5">
                                {notifications.map((notif) => {
                                    const getBgColor = (type: string) => {
                                        if (notif.isRead) return 'hover:bg-gray-50 dark:hover:bg-white/5';
                                        switch (type) {
                                            case 'PRAYER_SUPPORT': return 'bg-rose-50/40 dark:bg-rose-900/10 hover:bg-rose-50 dark:hover:bg-rose-900/20';
                                            case 'EVENT_UPDATE': return 'bg-emerald-50/40 dark:bg-emerald-900/10 hover:bg-emerald-50 dark:hover:bg-emerald-900/20';
                                            default: return 'bg-amber-50/30 dark:bg-amber-900/10 hover:bg-amber-50 dark:hover:bg-amber-900/20';
                                        }
                                    };

                                    return (
                                        <div
                                            key={notif.id}
                                            className={`p-4 transition-colors flex gap-3 ${getBgColor(notif.type)} ${notif.isRead ? 'opacity-60' : ''}`}
                                        >
                                            <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 border ${notif.isRead ? 'bg-gray-100 dark:bg-white/10 border-gray-200 dark:border-white/10' : 'bg-white dark:bg-[#141417] border-gray-200 dark:border-white/10 shadow-sm'
                                                }`}>
                                                {getIcon(notif.type)}
                                            </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2 mb-1">
                                                <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">{notif.title}</h4>
                                                <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium shrink-0">
                                                    {new Date(notif.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2 mb-2">
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
                                                        className="text-[10px] font-black uppercase tracking-widest text-amber-700 hover:text-amber-800 flex items-center gap-1"
                                                    >
                                                        View <ExternalLink className="h-3 w-3" />
                                                    </Link>
                                                )}
                                                {!notif.isRead && (
                                                    <button
                                                        onClick={() => handleMarkAsRead(notif.id)}
                                                        className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 flex items-center gap-1"
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
