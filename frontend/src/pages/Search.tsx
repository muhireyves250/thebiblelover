import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Search as SearchIcon, BookOpen, FileText, Book, ArrowRight, MessageSquare, Clock, History } from 'lucide-react';
import api from '../services/api';
import BlogCard from '../components/BlogCard';
import type { ViewHistory } from '../services/api.d';

interface SearchResults {
    posts: any[];
    topics: any[];
    devotionals: any[];
}

type Tab = 'all' | 'posts' | 'topics' | 'devotionals';

const Search = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const query = searchParams.get('q') || '';
    const [results, setResults] = useState<SearchResults>({ posts: [], topics: [], devotionals: [] });
    const [history, setHistory] = useState<ViewHistory[]>([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<Tab>('all');

    useEffect(() => {
        const fetchData = async () => {
            if (!query.trim()) {
                // Fetch history if no query
                try {
                    if (api.auth.isAuthenticated()) {
                        const response = await api.search.getHistory();
                        if (response.success) setHistory(response.data || []);
                    }
                } catch (err) {
                    console.error('Failed to fetch history:', err);
                }
                return;
            }

            setLoading(true);
            try {
                const response = await api.search.search(query);
                if (response.success) {
                    setResults(response.data || { posts: [], topics: [], devotionals: [] });
                }
            } catch (err) {
                console.error('Search error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [query]);

    const hasResults = results.posts.length > 0 || results.topics.length > 0 || results.devotionals.length > 0;

    const TabButton = ({ id, label, count, icon: Icon }: { id: Tab; label: string; count?: number; icon: any }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-all ${activeTab === id
                ? 'bg-amber-700 text-white shadow-md transform scale-105'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
        >
            <Icon className="w-4 h-4" />
            {label}
            {count !== undefined && (
                <span className={`ml-1 px-2 py-0.5 rounded-full text-[10px] ${activeTab === id ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                    {count}
                </span>
            )}
        </button>
    );

    return (
        <div className="min-h-screen bg-gray-50/50">
            <section className="relative pt-20 pb-10 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-amber-50 to-transparent opacity-60"></div>
                    <div className="absolute bottom-0 left-0 w-1/2 h-full bg-gradient-to-r from-slate-50 to-transparent opacity-60"></div>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-4 pb-24 relative z-10">
                {!query ? (
                    /* History & Discovery Mode */
                    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="text-center max-w-2xl mx-auto">
                            <h1 className="text-4xl md:text-5xl font-serif text-gray-900 mb-6">What are you looking for today?</h1>
                            <p className="text-lg text-gray-600 mb-10 leading-relaxed">
                                Search for bible verses, forum discussions, or read our latest reflections.
                            </p>

                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    const q = (e.currentTarget.elements.namedItem('search') as HTMLInputElement).value;
                                    if (q) navigate(`/search?q=${encodeURIComponent(q)}`);
                                }}
                                className="relative max-w-xl mx-auto group"
                            >
                                <SearchIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400 group-focus-within:text-amber-600 transition-colors" />
                                <input
                                    name="search"
                                    type="text"
                                    placeholder="Search the entire community..."
                                    className="w-full pl-12 pr-6 py-2.5 rounded-xl bg-white border border-gray-100 shadow-lg shadow-amber-900/5 focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all outline-none text-sm"
                                />
                            </form>
                        </div>

                        {history.length > 0 && (
                            <section>
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="p-2 bg-amber-100 rounded-lg text-amber-700">
                                        <History className="w-5 h-5" />
                                    </div>
                                    <h2 className="text-2xl font-serif text-gray-900">Your Recent Activity</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {history.map((item) => (
                                        <Link
                                            key={item.id}
                                            to={item.link}
                                            className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-gray-100 hover:border-amber-200 hover:shadow-lg transition-all group"
                                        >
                                            <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-amber-50 group-hover:text-amber-600 transition-colors">
                                                {item.type === 'POST' ? <FileText className="w-6 h-6" /> :
                                                    item.type === 'FORUM' ? <MessageSquare className="w-6 h-6" /> :
                                                        <BookOpen className="w-6 h-6" />}
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="font-bold text-gray-900 truncate group-hover:text-amber-700">{item.title}</h3>
                                                <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold flex items-center gap-1.5 mt-1">
                                                    <Clock className="w-3 h-3" /> {new Date(item.viewedAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                ) : (
                    /* Search Results Mode */
                    <>
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
                            <div className="flex flex-wrap gap-3">
                                <TabButton id="all" label="All Results" icon={Book} count={results.posts.length + results.topics.length + results.devotionals.length} />
                                <TabButton id="posts" label="Reflections" icon={FileText} count={results.posts.length} />
                                <TabButton id="topics" label="Discussions" icon={MessageSquare} count={results.topics.length} />
                                <TabButton id="devotionals" label="Devotionals" icon={BookOpen} count={results.devotionals.length} />
                            </div>

                            {!loading && (
                                <p className="text-sm text-gray-500 italic">
                                    Showing results for "{query}"
                                </p>
                            )}
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm animate-pulse">
                                        <div className="h-48 bg-gray-100 rounded-xl mb-6"></div>
                                        <div className="h-6 bg-gray-100 rounded-md w-3/4 mb-4"></div>
                                        <div className="h-4 bg-gray-100 rounded-md w-full mb-2"></div>
                                    </div>
                                ))}
                            </div>
                        ) : !hasResults ? (
                            <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-200 shadow-sm">
                                <div className="bg-amber-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <SearchIcon className="w-10 h-10 text-amber-600 opacity-50" />
                                </div>
                                <h3 className="text-2xl font-serif text-gray-900 mb-2">No matches found</h3>
                                <p className="text-gray-500 max-w-sm mx-auto mb-8">
                                    We couldn't find anything matching your search. Try using more general keywords.
                                </p>
                                <button
                                    onClick={() => navigate('/search')}
                                    className="text-amber-700 font-semibold hover:underline flex items-center gap-2 mx-auto"
                                >
                                    Reset Search <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-20">
                                {/* Blog Posts */}
                                {(activeTab === 'all' || activeTab === 'posts') && results.posts.length > 0 && (
                                    <section className="animate-in fade-in slide-in-from-bottom-4">
                                        <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-amber-50 rounded-lg text-amber-700">
                                                    <FileText className="w-5 h-5" />
                                                </div>
                                                <h2 className="text-2xl font-serif text-gray-900">Scriptural Reflections</h2>
                                            </div>
                                        </div>
                                        <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                                            {results.posts.map((post: any) => (
                                                <BlogCard key={post.id} {...post} author={post.author || { name: 'The Bible Lover' }} />
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {/* Forum Topics */}
                                {(activeTab === 'all' || activeTab === 'topics') && results.topics.length > 0 && (
                                    <section className="animate-in fade-in slide-in-from-bottom-4">
                                        <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-blue-50 rounded-lg text-blue-700">
                                                    <MessageSquare className="w-5 h-5" />
                                                </div>
                                                <h2 className="text-2xl font-serif text-gray-900">Community Discussions</h2>
                                            </div>
                                        </div>
                                        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                                            {results.topics.map((topic: any) => (
                                                <Link
                                                    key={topic.id}
                                                    to={`/forum/topic/${topic.id}`}
                                                    className="group bg-white p-6 rounded-3xl border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all flex justify-between items-center"
                                                >
                                                    <div className="min-w-0">
                                                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-700 truncate mb-1">{topic.title}</h3>
                                                        <div className="flex items-center gap-3 text-xs text-gray-500">
                                                            <span className="font-bold">{topic.author?.name}</span>
                                                            <span>•</span>
                                                            <span>{new Date(topic.createdAt).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-2xl font-bold text-sm">
                                                        <MessageSquare className="w-4 h-4" />
                                                        {topic._count?.posts || 0}
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {/* Devotionals */}
                                {(activeTab === 'all' || activeTab === 'devotionals') && results.devotionals.length > 0 && (
                                    <section className="animate-in fade-in slide-in-from-bottom-4">
                                        <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-purple-50 rounded-lg text-purple-700">
                                                    <BookOpen className="w-5 h-5" />
                                                </div>
                                                <h2 className="text-2xl font-serif text-gray-900">Daily Devotionals</h2>
                                            </div>
                                        </div>
                                        <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                                            {results.devotionals.map((devotional: any) => (
                                                <Link
                                                    key={devotional.id}
                                                    to={`/devotional?id=${devotional.id}`}
                                                    className="bg-white p-8 rounded-[2.5rem] border border-gray-100 hover:border-purple-200 hover:shadow-xl transition-all group flex flex-col justify-between"
                                                >
                                                    <div>
                                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-500 mb-4 block">
                                                            {new Date(devotional.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                                        </span>
                                                        <h3 className="text-2xl font-serif text-gray-900 group-hover:text-purple-700 mb-4">{devotional.title}</h3>
                                                        <p className="text-sm font-bold text-gray-500 italic mb-6">"{devotional.scripture}"</p>
                                                    </div>
                                                    <div className="flex items-center text-purple-600 font-bold text-sm gap-2 mt-auto">
                                                        Read Devotional <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    </section>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Search;
