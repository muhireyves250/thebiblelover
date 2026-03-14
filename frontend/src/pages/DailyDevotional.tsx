import { useState, useEffect } from 'react';
import { BookOpen, Calendar, Share2, Heart, MessageCircle, User as UserIcon, Quote, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import { devotionalAPI, searchAPI, authAPI } from '../services/api';
import type { Devotional } from '../services/api.d';
import SEO from '../components/SEO';
import ShareButtons from '../components/ShareButtons';
import AudioReader from '../components/AudioReader';
import BibleReference from '../components/BibleReference';

const DailyDevotional = () => {
    const [devotional, setDevotional] = useState<Devotional | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (devotional) {
            searchAPI.recordHistory({
                type: 'DEVOTIONAL',
                itemId: devotional.id,
                title: devotional.title,
                link: `/devotional?id=${devotional.id}`
            }).catch(() => { });
        }
    }, [devotional?.id]);

    useEffect(() => {
        loadTodayDevotional();
    }, []);

    const loadTodayDevotional = async () => {
        try {
            const response = await devotionalAPI.getToday();
            if (response.success && response.data) {
                setDevotional(response.data);
            } else {
                setError(response.message || 'No devotional available for today.');
            }
        } catch (err) {
            console.error('Failed to load devotional:', err);
            setError('An unexpected error occurred while fetching today\'s devotional.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            {devotional && (
                <SEO
                    title={devotional.title}
                    description={`Daily Devotional: ${devotional.scripture} - ${devotional.content.substring(0, 150)}...`}
                    type="article"
                />
            )}
            {/* Immersive Hero Header */}
            <section className="relative h-[60vh] min-h-[400px] flex items-center justify-center overflow-hidden bg-gray-900">
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1504052434139-44b413697eb5?auto=format&fit=crop&q=80&w=2000"
                        alt="Bible reading"
                        className="w-full h-full object-cover opacity-40 scale-105"
                        decoding="async"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
                </div>

                <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/20 backdrop-blur-md rounded-full text-amber-400 text-xs font-bold uppercase tracking-[0.2em] mb-8 border border-amber-500/30">
                        <Calendar className="h-3 w-3" />
                        {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </div>
                    <h1 className="text-4xl md:text-7xl font-bold text-white mb-6 font-serif leading-tight">
                        {devotional ? devotional.title : 'Stay Rooted in the Word'}
                    </h1>
                    {devotional && (
                        <div className="flex items-center justify-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center overflow-hidden border border-white/20">
                                {devotional.author?.profileImage ? (
                                    <img src={devotional.author.profileImage} alt="" className="w-full h-full object-cover" loading="lazy" decoding="async" />
                                ) : (
                                    <UserIcon className="h-5 w-5 text-amber-400" />
                                )}
                            </div>
                            <span className="text-white/80 font-medium">By {devotional.author?.name}</span>
                        </div>
                    )}
                </div>
            </section>

            {/* Main Content */}
            <main className="max-w-3xl mx-auto px-4 -mt-20 relative z-20 mb-32">
                {error ? (
                    <div className="bg-white rounded-[2.5rem] p-12 shadow-2xl border border-gray-100 text-center">
                        <div className="text-4xl mb-6">🏜️</div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">{error}</h2>
                        <p className="text-gray-500 mb-8">Please check back soon for fresh nourishment.</p>
                        <button onClick={loadTodayDevotional} className="px-8 py-3 bg-amber-600 text-white rounded-xl font-bold hover:bg-amber-700 transition">Try Again</button>
                    </div>
                ) : devotional && (
                    <div className="space-y-12">
                        {/* Scripture Card */}
                        <div className="bg-amber-50 rounded-[2.5rem] p-10 md:p-16 relative overflow-hidden group shadow-xl shadow-amber-900/5">
                            <Quote className="absolute top-8 left-8 h-20 w-20 text-amber-200/50 -rotate-12 transition-transform group-hover:rotate-0 duration-700" />
                            <div className="relative z-10">
                                <p className="text-2xl md:text-3xl font-serif text-amber-900 italic leading-relaxed mb-8">
                                    {devotional.scripture}
                                </p>
                                <div className="h-1 w-20 bg-amber-300 rounded-full"></div>
                            </div>
                        </div>

                        {/* Reading Content */}
                        <AudioReader content={devotional.content} title={devotional.title} />
                        <BibleReference>
                            <article className="prose prose-xl prose-stone max-w-none text-gray-700 leading-relaxed font-serif">
                                {/<[a-z][\s\S]*>/i.test(devotional.content) ? (
                                    <div dangerouslySetInnerHTML={{ __html: devotional.content }} />
                                ) : (
                                    <div 
                                        className="space-y-6"
                                        dangerouslySetInnerHTML={{ 
                                            __html: devotional.content
                                                .replace(/^###\s+(.+)$/gm, '<h4 class="text-xl font-bold text-gray-900 mt-8 mb-4">$1</h4>')
                                                .replace(/^##\s+(.+)$/gm, '<h3 class="text-2xl font-serif text-gray-900 mt-10 mb-5">$1</h3>')
                                                .replace(/^#\s+(.+)$/gm, '<h2 class="text-3xl font-serif text-gray-900 mt-12 mb-6">$1</h2>')
                                                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                                .replace(/\n\n/g, '</p><p class="mb-6">')
                                                .split('\n').join('<br />')
                                        }} 
                                    />
                                )}
                            </article>
                        </BibleReference>

                        <ShareButtons title={devotional.title} />

                        {/* Reflection Questions */}
                        {devotional.reflectionQuestions && (
                            <div className="bg-gray-50 rounded-[2.5rem] p-10 md:p-12 border border-gray-100">
                                <h3 className="text-xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                                    <span className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center text-xs">?</span>
                                    Deepen Your Reflection
                                </h3>
                                <div className="space-y-6">
                                    {devotional.reflectionQuestions.split('\n').map((q, i) => (
                                        <div key={i} className="flex gap-4">
                                            <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0"></div>
                                            <p className="text-gray-700 font-medium leading-relaxed">{q}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Community Engagement */}
                        <div className="space-y-12 pt-12 border-t border-gray-100">
                            <div className="flex flex-wrap items-center justify-between gap-6">
                                <div className="flex items-center gap-4">
                                    <button className="flex items-center gap-2 px-6 py-3 rounded-full bg-gray-50 text-gray-600 hover:bg-amber-50 hover:text-amber-600 transition-all font-bold">
                                        <Heart className="h-5 w-5" />
                                        Amen
                                    </button>
                                    <button className="flex items-center gap-2 px-6 py-3 rounded-full bg-gray-50 text-gray-600 hover:bg-amber-50 hover:text-amber-600 transition-all font-bold">
                                        <Share2 className="h-5 w-5" />
                                        Share
                                    </button>
                                </div>
                                <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
                                    <MessageCircle className="h-5 w-5 text-amber-600" />
                                    {devotional.comments?.length || 0} Grains of Thought
                                </div>
                            </div>

                            {/* Comments List */}
                            <div className="space-y-8">
                                {devotional.comments?.length === 0 ? (
                                    <div className="text-center py-12 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                                        <p className="text-gray-400 italic font-serif">Be the first to share how this word touched your heart...</p>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {devotional.comments?.map((comment: any) => (
                                            <div key={comment.id} className="flex gap-4 p-6 bg-white rounded-3xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
                                                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 font-bold text-sm">
                                                    {comment.authorName.charAt(0)}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <h4 className="font-bold text-gray-900 text-sm">{comment.authorName}</h4>
                                                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                    <p className="text-gray-600 text-sm leading-relaxed">{comment.content}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Add Comment Form */}
                                {authAPI.getCurrentUser() ? (
                                    <div className="bg-amber-900 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-800 rounded-bl-[5rem] -mr-8 -mt-8 opacity-50"></div>
                                        <div className="relative z-10">
                                            <h3 className="text-white font-serif text-xl mb-6 italic">What is your reflection, {authAPI.getCurrentUser().name}?</h3>
                                            <form onSubmit={async (e) => {
                                                e.preventDefault();
                                                const form = e.target as HTMLFormElement;
                                                const content = (form.elements.namedItem('content') as HTMLTextAreaElement).value;
                                                if (!content.trim()) return;
                                                
                                                try {
                                                    const res = await devotionalAPI.addComment(devotional.id, content);
                                                    if (res.success) {
                                                        form.reset();
                                                        loadTodayDevotional(); // Reload to show new comment
                                                    }
                                                } catch (err) { console.error(err); }
                                            }}>
                                                <textarea 
                                                    name="content"
                                                    required
                                                    className="w-full h-32 bg-amber-800/50 border-amber-700/50 rounded-2xl p-6 text-white text-sm placeholder:text-amber-200/30 focus:ring-2 focus:ring-amber-500 transition-all outline-none resize-none mb-4"
                                                    placeholder="Share your testimony or reflection after today's manna..."
                                                ></textarea>
                                                <div className="flex justify-end">
                                                    <button type="submit" className="bg-white text-amber-900 px-8 py-3 rounded-xl font-bold hover:bg-amber-50 transition-all flex items-center gap-2 group">
                                                        Share Reflection
                                                        <Send className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-8 bg-gray-50 rounded-3xl border border-gray-100 text-center">
                                        <p className="text-gray-500 text-sm mb-4">You must be part of the family to share reflections.</p>
                                        <Link to="/login" className="text-amber-600 font-bold hover:underline">Sign In to Join the Discussion</Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Footer Reflection */}
            <section className="bg-stone-900 py-32 text-center text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <img src="https://www.transparenttextures.com/patterns/natural-paper.png" alt="" className="w-full h-full" loading="lazy" decoding="async" />
                </div>
                <div className="max-w-2xl mx-auto px-4 relative z-10">
                    <BookOpen className="h-12 w-12 text-amber-500 mx-auto mb-8" />
                    <h2 className="text-4xl font-serif mb-6 italic">"Thy word is a lamp unto my feet, and a light unto my path."</h2>
                    <p className="text-gray-400 uppercase tracking-widest text-sm font-bold">— Psalm 119:105</p>
                </div>
            </section>
        </div>
    );
};

export default DailyDevotional;
