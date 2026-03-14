import React from 'react';
import { MessageSquare, Folder, Plus, Edit, Trash2, Lock, Unlock, Hash, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Category {
    id: string;
    name: string;
    description?: string;
    icon?: string;
    order: number;
    _count?: {
        topics: number;
    };
}

interface Topic {
    id: string;
    title: string;
    categoryId: string;
    isLocked: boolean;
    isSticky: boolean;
    createdAt: string;
    author?: {
        name: string;
    };
}

interface ForumManagerProps {
    categories: Category[];
    topics: Topic[];
    onAddCategory: () => void;
    onEditCategory: (category: Category) => void;
    onDeleteCategory: (id: string) => void;
    onDeleteTopic: (id: string) => void;
    onToggleLock: (id: string) => void;
}

const ForumManager: React.FC<ForumManagerProps> = ({
    categories,
    topics,
    onAddCategory,
    onEditCategory,
    onDeleteCategory,
    onDeleteTopic,
    onToggleLock
}) => {
    return (
        <div className="space-y-8">
            {/* Category Management */}
            <section className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 text-emerald-500">
                        <Layers className="w-5 h-5" />
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/60">Foundation (Categories)</h3>
                    </div>
                    <button
                        onClick={onAddCategory}
                        className="p-2 bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30 rounded-xl transition-all flex items-center space-x-2 px-4"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-black uppercase tracking-widest">New Sphere</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {categories.map(category => (
                        <div key={category.id} className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-4 group hover:border-emerald-500/30 transition-all">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
                                        <Hash className="w-5 h-5 text-emerald-500" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-white">{category.name}</h4>
                                        <p className="text-[10px] text-white/40 font-medium">{category._count?.topics || 0} Topics</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => onEditCategory(category)} className="p-1.5 text-white/40 hover:text-white transition-colors">
                                        <Edit className="w-3.5 h-3.5" />
                                    </button>
                                    <button onClick={() => onDeleteCategory(category.id)} className="p-1.5 text-red-500/60 hover:text-red-500 transition-colors">
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                            <p className="text-[10px] text-white/40 line-clamp-2 leading-relaxed italic">
                                {category.description || 'No description provided for this sphere.'}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Topic Moderation */}
            <section className="space-y-4">
                <div className="flex items-center space-x-3 text-purple-500">
                    <MessageSquare className="w-5 h-5" />
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/60">Discourse Moderation (Topics)</h3>
                </div>

                <div className="bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 overflow-hidden">
                    <div className="divide-y divide-white/5">
                        {topics.map(topic => (
                            <div key={topic.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-all group">
                                <div className="flex items-center space-x-4">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${topic.isLocked ? 'bg-red-500/10 text-red-500' : 'bg-purple-500/10 text-purple-500'}`}>
                                        {topic.isLocked ? <Lock className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
                                    </div>
                                    <div>
                                        <div className="flex items-center space-x-2">
                                            <h5 className="text-sm font-bold text-white group-hover:text-purple-400 transition-colors">{topic.title}</h5>
                                            {topic.isSticky && <span className="px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-500 text-[8px] font-black uppercase">Sticky</span>}
                                        </div>
                                        <div className="flex items-center space-x-3 text-[10px] text-white/40 font-medium">
                                            <span>By {topic.author?.name || 'Guardian'}</span>
                                            <span>•</span>
                                            <span>{new Date(topic.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => onToggleLock(topic.id)}
                                        className={`p-2 rounded-xl transition-all ${topic.isLocked ? 'bg-emerald-500/20 text-emerald-500' : 'bg-white/10 text-white/40'}`}
                                        title={topic.isLocked ? 'Unlock Topic' : 'Lock Topic'}
                                    >
                                        {topic.isLocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                                    </button>
                                    <button
                                        onClick={() => onDeleteTopic(topic.id)}
                                        className="p-2 bg-red-500/20 text-red-500 hover:bg-red-500/30 rounded-xl transition-all"
                                        title="Exile Topic"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ForumManager;
