import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search as SearchIcon, BookOpen, FileText, Book, ArrowRight } from 'lucide-react';
import api from '../services/api';
import BlogCard from '../components/BlogCard';

interface SearchResults {
    posts: any[];
    verses: any[];
}

type Tab = 'all' | 'verses' | 'posts';

const Search = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const query = searchParams.get('q') || '';
    const [results, setResults] = useState<SearchResults>({ posts: [], verses: [] });
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<Tab>('all');

    useEffect(() => {
        const fetchResults = async () => {
            if (!query.trim()) return;

            setLoading(true);
            try {
                const [postsResponse, versesResponse] = await Promise.all([
                    api.blog.getPosts({ search: query, limit: 12 }),
                    api.bibleVerses.getVerses({ search: query, limit: 12 })
                ]);

                setResults({
                    posts: postsResponse.success && postsResponse.data ? postsResponse.data.posts : [],
                    verses: versesResponse.success && versesResponse.data ? versesResponse.data.verses : []
                });
            } catch (err) {
                console.error('Search error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [query]);

    const hasResults = results.posts.length > 0 || results.verses.length > 0;

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
            {/* Search Hero Section ("Hello") */}
            <section className="relative pt-20 pb-10 overflow-hidden">
                {/* Background Decoration */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-amber-50 to-transparent opacity-60"></div>
                    <div className="absolute bottom-0 left-0 w-1/2 h-full bg-gradient-to-r from-slate-50 to-transparent opacity-60"></div>
                </div>
            </section>

            <div className="max-w-6xl mx-auto px-4 pb-24">
                {/* Result Controls */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
                    <div className="flex flex-wrap gap-3">
                        <TabButton id="all" label="All Results" icon={Book} count={results.verses.length + results.posts.length} />
                        <TabButton id="verses" label="Bible Verses" icon={BookOpen} count={results.verses.length} />
                        <TabButton id="posts" label="Blog Posts" icon={FileText} count={results.posts.length} />
                    </div>

                    {!loading && query && (
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
                                <div className="h-4 bg-gray-100 rounded-md w-2/3"></div>
                            </div>
                        ))}
                    </div>
                ) : !hasResults && query ? (
                    <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-200 shadow-sm">
                        <div className="bg-amber-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <SearchIcon className="w-10 h-10 text-amber-600 opacity-50" />
                        </div>
                        <h3 className="text-2xl font-serif text-gray-900 mb-2">No matches found</h3>
                        <p className="text-gray-500 max-w-sm mx-auto mb-8">
                            We couldn't find anything matching your search. Try using more general keywords or check for typos.
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
                        {/* Bible Verses Section */}
                        {(activeTab === 'all' || activeTab === 'verses') && results.verses.length > 0 && (
                            <section>
                                <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-amber-100 rounded-lg text-amber-700">
                                            <BookOpen className="w-5 h-5" />
                                        </div>
                                        <h2 className="text-2xl font-serif text-gray-900">Scripture Matches</h2>
                                    </div>
                                    <span className="text-sm text-gray-500 font-medium">{results.verses.length} verses found</span>
                                </div>

                                <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                                    {results.verses.map((verse: any) => (
                                        <div
                                            key={verse.id}
                                            className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-amber-900/5 transition-all duration-500 flex flex-col h-full group relative overflow-hidden"
                                        >
                                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                                <BookOpen className="w-16 h-16 text-amber-900" />
                                            </div>

                                            <div className="flex-1 relative z-10">
                                                <p className="text-xl text-gray-800 font-serif leading-relaxed italic mb-8">
                                                    "{verse.text}"
                                                </p>
                                            </div>

                                            <div className="flex items-center justify-between pt-6 border-t border-gray-50 relative z-10">
                                                <div>
                                                    <span className="block text-amber-700 font-bold tracking-tight">
                                                        {verse.book} {verse.chapter}:{verse.verse}
                                                    </span>
                                                    <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                                                        {verse.translation} Translation
                                                    </span>
                                                </div>
                                                <button className="p-2 bg-gray-50 rounded-full text-gray-400 hover:text-amber-700 hover:bg-amber-50 transition-all">
                                                    <ArrowRight className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Blog Posts Section */}
                        {(activeTab === 'all' || activeTab === 'posts') && results.posts.length > 0 && (
                            <section>
                                <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-slate-100 rounded-lg text-slate-700">
                                            <FileText className="w-5 h-5" />
                                        </div>
                                        <h2 className="text-2xl font-serif text-gray-900">Discover Articles</h2>
                                    </div>
                                    <span className="text-sm text-gray-500 font-medium">{results.posts.length} posts found</span>
                                </div>

                                <div className="grid gap-12 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                                    {results.posts.map((post: any) => (
                                        <BlogCard
                                            key={post.id}
                                            {...post}
                                            author={post.author || { name: 'Unknown' }}
                                            publishedAt={post.publishedAt || new Date().toISOString()}
                                        />
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Search;
