import React from 'react';
import { Users, Shield, User as UserIcon, Mail, Calendar, ShieldCheck, UserX } from 'lucide-react';
import { motion } from 'framer-motion';

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
    _count: {
        comments: number;
        posts: number;
        rsvps: number;
    }
}

interface UserManagerProps {
    users: User[];
    onUpdateRole: (id: string, role: string) => void;
    onDelete: (id: string) => void;
}

const UserManager: React.FC<UserManagerProps> = ({ users, onUpdateRole, onDelete }) => {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-gray-900 dark:text-white">Users</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-widest font-bold">Manage registered accounts</p>
                </div>
                <div className="px-5 py-2.5 bg-white dark:bg-[#141417] border border-gray-300 dark:border-white/10 rounded-lg shadow-sm flex items-center gap-3">
                    <Users className="h-4 w-4 text-amber-700" />
                    <span className="text-lg font-black text-gray-900 dark:text-white">{users.length}</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">Total</span>
                </div>
            </div>

            {users.length === 0 ? (
                <div className="bg-white dark:bg-[#141417] border border-dashed border-gray-300 dark:border-white/10 rounded-lg p-12 text-center">
                    <Users className="h-8 w-8 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-sm font-bold text-gray-700 dark:text-gray-200">No users yet</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {users.map((user, idx) => (
                        <motion.div
                            key={user.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="bg-white dark:bg-[#141417] border border-gray-300 dark:border-white/10 rounded-lg shadow-sm hover:border-gray-400 dark:hover:border-white/20 transition-all p-5 relative"
                        >
                            <div className="absolute top-4 right-4">
                                {user.role === 'ADMIN' ? (
                                    <ShieldCheck className="h-4 w-4 text-amber-700" />
                                ) : (
                                    <UserIcon className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                                )}
                            </div>

                            <div className="flex items-center gap-3 mb-4 pr-6">
                                <div className={`w-11 h-11 rounded-full flex items-center justify-center text-base font-bold shrink-0 ${user.role === 'ADMIN' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300'
                                    }`}>
                                    {user.name?.[0]?.toUpperCase() || 'U'}
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate">{user.name || 'Anonymous'}</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate flex items-center gap-1.5">
                                        <Mail className="h-3 w-3" />
                                        {user.email}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-2 mb-4">
                                <div className="p-2.5 bg-gray-50 dark:bg-white/5 rounded-md text-center">
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">{user._count.comments}</p>
                                    <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">Comments</p>
                                </div>
                                <div className="p-2.5 bg-gray-50 dark:bg-white/5 rounded-md text-center">
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">{user._count.posts}</p>
                                    <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">Posts</p>
                                </div>
                                <div className="p-2.5 bg-gray-50 dark:bg-white/5 rounded-md text-center">
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">{user._count.rsvps}</p>
                                    <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">RSVPs</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-white/5">
                                <div className="flex items-center gap-1.5">
                                    <Calendar className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                                    <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
                                        Joined {new Date(user.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => onUpdateRole(user.id, user.role === 'ADMIN' ? 'MEMBER' : 'ADMIN')}
                                        className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-md transition-colors"
                                        title="Toggle admin access"
                                    >
                                        <Shield className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                        onClick={() => onDelete(user.id)}
                                        className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                                        title="Delete user"
                                    >
                                        <UserX className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default UserManager;
