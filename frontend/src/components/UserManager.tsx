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
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-serif text-white">Disciple Registry</h2>
                    <p className="text-sm text-white/40 mt-1 uppercase tracking-widest font-black">Managing the gathering of the faithful</p>
                </div>
                <div className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-4">
                    <Users className="h-5 w-5 text-amber-500" />
                    <span className="text-2xl font-serif text-white">{users.length}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Total Souls</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {users.map((user, idx) => (
                    <motion.div
                        key={user.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="glass-card p-6 border border-white/10 hover:border-white/20 transition-all group relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-4">
                           {user.role === 'ADMIN' ? (
                               <ShieldCheck className="h-5 w-5 text-amber-500 opacity-50" />
                           ) : (
                               <UserIcon className="h-5 w-5 text-blue-500 opacity-50" />
                           )}
                        </div>

                        <div className="flex items-center gap-4 mb-6">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold font-serif ${
                                user.role === 'ADMIN' ? 'bg-amber-500/20 text-amber-500' : 'bg-blue-500/20 text-blue-500'
                            }`}>
                                {user.name?.[0] || 'U'}
                            </div>
                            <div className="min-w-0">
                                <h3 className="text-lg font-serif text-white truncate">{user.name || 'Anonymous'}</h3>
                                <p className="text-xs text-white/30 truncate flex items-center gap-1.5">
                                    <Mail className="h-3 w-3" />
                                    {user.email}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 mb-6">
                            <div className="p-3 bg-white/5 rounded-xl text-center">
                                <p className="text-lg font-bold text-white">{user._count.comments}</p>
                                <p className="text-[8px] font-black uppercase tracking-widest text-white/20">Echoes</p>
                            </div>
                            <div className="p-3 bg-white/5 rounded-xl text-center">
                                <p className="text-lg font-bold text-white">{user._count.posts}</p>
                                <p className="text-[8px] font-black uppercase tracking-widest text-white/20">Discourse</p>
                            </div>
                            <div className="p-3 bg-white/5 rounded-xl text-center">
                                <p className="text-lg font-bold text-white">{user._count.rsvps}</p>
                                <p className="text-[8px] font-black uppercase tracking-widest text-white/20">Gatherings</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-6 border-t border-white/5">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-3.5 w-3.5 text-white/20" />
                                <span className="text-[10px] text-white/20 font-medium">
                                    Joined {new Date(user.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => onUpdateRole(user.id, user.role === 'ADMIN' ? 'MEMBER' : 'ADMIN')}
                                    className="p-2 text-white/30 hover:text-amber-500 hover:bg-amber-500/10 rounded-lg transition-all"
                                    title="Toggle Sanctuary Access"
                                >
                                    <Shield className="h-4 w-4" />
                                </button>
                                <button 
                                    onClick={() => onDelete(user.id)}
                                    className="p-2 text-white/30 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                    title="Excommunicate"
                                >
                                    <UserX className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default UserManager;
