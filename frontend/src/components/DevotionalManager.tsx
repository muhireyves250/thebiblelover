import React from 'react';
import { BookOpen, Plus, Edit, Trash2, Sparkles, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Devotional {
    id: string;
    date: string;
    title: string;
    content: string;
    scripture: string;
    reflectionQuestions?: string;
    author?: {
        name: string;
    };
}

interface DevotionalManagerProps {
    devotionals: Devotional[];
    onAdd: () => void;
    onEdit: (devotional: Devotional) => void;
    onDelete: (id: string) => void;
}

const DevotionalManager: React.FC<DevotionalManagerProps> = ({ devotionals, onAdd, onEdit, onDelete }) => {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-serif font-black text-white">Daily Grains Editor</h2>
                    <p className="text-[10px] text-amber-500/70 font-black uppercase tracking-[0.2em]">Cultivate Spiritual Nourishment</p>
                </div>
                <button
                    onClick={onAdd}
                    className="flex items-center space-x-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/20"
                >
                    <Plus className="w-4 h-4" />
                    <span>Seed Devotional</span>
                </button>
            </div>

            <div className="bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 overflow-hidden">
                <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                            <BookOpen className="w-4 h-4 text-indigo-500" />
                        </div>
                        <h3 className="text-sm font-bold text-white uppercase tracking-widest">Chronicle of Wisdom</h3>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="px-3 py-1 bg-white/5 rounded-full border border-white/10 text-[8px] font-black text-white/40 uppercase tracking-widest">
                            {devotionals.length} Manuscripts
                        </div>
                    </div>
                </div>

                <div className="divide-y divide-white/5 max-h-[600px] overflow-y-auto no-scrollbar">
                    {devotionals.map((devotional) => (
                        <div key={devotional.id} className="p-4 group hover:bg-white/5 transition-all">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 flex flex-col items-center justify-center">
                                        <span className="text-[10px] font-black text-white/60 leading-none mb-1">
                                            {new Date(devotional.date).toLocaleString('default', { month: 'short' })}
                                        </span>
                                        <span className="text-sm font-black text-white leading-none">
                                            {new Date(devotional.date).getDate()}
                                        </span>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-white mb-1 group-hover:text-indigo-400 transition-colors">{devotional.title}</h4>
                                        <div className="flex items-center space-x-3 text-[10px] text-white/40 font-medium uppercase tracking-wider">
                                            <span className="flex items-center space-x-1">
                                                <Sparkles className="w-3 h-3 text-amber-500/60" />
                                                <span>{devotional.scripture}</span>
                                            </span>
                                            <span>•</span>
                                            <span className="flex items-center space-x-1">
                                                <User className="w-3 h-3" />
                                                <span>{devotional.author?.name || 'Sanctuary'}</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => onEdit(devotional)}
                                        className="p-2 bg-white/10 text-white hover:bg-white/20 rounded-xl transition-all"
                                        title="Edit"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => onDelete(devotional.id)}
                                        className="p-2 bg-red-500/20 text-red-500 hover:bg-red-500/30 rounded-xl transition-all"
                                        title="Exile"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {devotionals.length === 0 && (
                        <div className="p-20 text-center">
                            <BookOpen className="w-16 h-16 text-white/10 mx-auto mb-4" />
                            <p className="text-white/40 text-sm font-black uppercase tracking-widest">The archives are silent.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DevotionalManager;
