import { useEffect, useState } from 'react';
import { Play, AlertTriangle, Clock, Eye } from 'lucide-react';
import { homeFeedAPI } from '../services/api';
import type { HomeFeedVideo } from '../services/api.d';
import SEO from '../components/SEO';

const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const VideoCard = ({ item }: { item: HomeFeedVideo }) => {
    const [playing, setPlaying] = useState(false);
    const isLive = item.type === 'LIVE';

    return (
        <div className="group bg-white border border-gray-300 rounded-lg shadow-sm overflow-hidden hover:border-gray-400 hover:shadow-md transition-all flex flex-col">
            <div className={`relative bg-gray-100 overflow-hidden ${playing ? 'h-64 md:h-80' : 'h-48 md:h-56'}`}>
                {playing ? (
                    <iframe
                        className="absolute inset-0 w-full h-full"
                        src={`https://www.youtube.com/embed/${item.id}?autoplay=1`}
                        title={item.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                ) : (
                    <>
                        <img
                            src={item.thumbnail}
                            alt={item.title}
                            className="absolute inset-0 w-full h-full object-cover"
                            loading="lazy"
                        />
                        {isLive && (
                            <div className="absolute top-2 left-2 md:top-3 md:left-3 flex items-center gap-1.5 px-2 py-0.5 md:px-2.5 md:py-1 bg-red-600 rounded-full shadow-lg">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                                </span>
                                <span className="text-white text-[9px] md:text-[10px] font-black uppercase tracking-widest">Live</span>
                            </div>
                        )}
                        <button
                            onClick={() => setPlaying(true)}
                            aria-label="Play video"
                            className="absolute inset-0 flex items-center justify-center group"
                        >
                            <span className="flex items-center justify-center w-11 h-11 md:w-14 md:h-14 rounded-full bg-red-600/90 shadow-xl group-hover:scale-110 group-hover:bg-red-600 transition-all duration-300">
                                <Play className="w-5 h-5 md:w-6 md:h-6 text-white ml-0.5" fill="currentColor" />
                            </span>
                        </button>
                    </>
                )}
            </div>

            <div className="p-3 md:p-6 flex-1">
                <div className="flex items-center justify-between mb-2 md:mb-4">
                    <span className="px-2 py-0.5 md:px-2.5 md:py-1 bg-amber-50 text-amber-700 text-[9px] md:text-[10px] font-black rounded border border-amber-100 uppercase tracking-widest">
                        {isLive ? 'Live' : 'Video'}
                    </span>
                    <span className="text-gray-400 text-[10px] md:text-xs flex items-center shrink-0">
                        <Clock className="h-2.5 w-2.5 md:h-3 md:w-3 mr-1" />
                        {formatDate(item.publishedAt)}
                    </span>
                </div>

                <h3 className="text-sm md:text-lg font-bold text-gray-900 leading-snug line-clamp-2 mb-2 md:mb-3 group-hover:text-amber-700 transition-colors">
                    {item.title}
                </h3>
                <p className="text-xs md:text-sm text-gray-600 leading-relaxed line-clamp-2 md:line-clamp-3">{item.excerpt}</p>
            </div>

            <div className="px-3 py-2.5 md:px-6 md:py-4 flex items-center justify-end border-t border-gray-100 bg-gray-50">
                <div className="flex items-center gap-1 md:gap-1.5 px-2 py-1 md:px-2.5 md:py-1.5 rounded border border-amber-200 bg-amber-50 text-amber-800 font-bold text-[10px] md:text-xs">
                    <Eye className="h-3 w-3 md:h-3.5 md:w-3.5" />
                    <span>{item.views}</span>
                </div>
            </div>
        </div>
    );
};

const VideoCardSkeleton = () => (
    <div className="bg-white border border-gray-300 rounded-lg shadow-sm overflow-hidden">
        <div className="h-48 md:h-56 bg-gray-200 animate-pulse" />
        <div className="p-3 md:p-6">
            <div className="flex items-center justify-between mb-2 md:mb-4">
                <div className="h-4 w-14 bg-gray-200 rounded animate-pulse" />
                <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="h-4 w-full bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse mb-3" />
            <div className="h-3 w-full bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="px-3 py-2.5 md:px-6 md:py-4 flex justify-end border-t border-gray-100 bg-gray-50">
            <div className="h-5 w-14 bg-gray-200 rounded animate-pulse" />
        </div>
    </div>
);

const FILTERS = [
    { id: 'ALL', name: 'All' },
    { id: 'LIVE', name: 'Live' },
    { id: 'VIDEO', name: 'Videos' },
] as const;

const Videos = () => {
    const [items, setItems] = useState<HomeFeedVideo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [activeFilter, setActiveFilter] = useState<typeof FILTERS[number]['id']>('ALL');

    useEffect(() => {
        setLoading(true);
        setError(false);
        homeFeedAPI.getVideos(24).then((response) => {
            if (response.success && response.data) {
                setItems(response.data.items);
            } else {
                setError(true);
            }
        }).catch(() => setError(true)).finally(() => setLoading(false));
    }, []);

    const visibleItems = activeFilter === 'ALL' ? items : items.filter(item => item.type === activeFilter);

    return (
        <div className="min-h-screen bg-white">
            <SEO
                title="Watch"
                description="Every live stream and video The Bible Lover has published on YouTube, in one place."
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 md:py-16">
                <div className="md:hidden mb-4">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="w-1 h-4 bg-amber-700 rounded-sm" />
                        <span className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">Live Streams &amp; Videos</span>
                    </div>
                    <h1 className="text-2xl font-black uppercase tracking-tight text-gray-900">Watch</h1>
                    <p className="text-sm text-gray-500 mt-2">Every live stream and video The Bible Lover has published on YouTube, in one place.</p>
                </div>

                {/* Filters */}
                <div className="flex md:flex-wrap gap-2 mb-6 md:mb-10 overflow-x-auto md:overflow-visible -mx-4 px-4 md:mx-0 md:px-0 pb-1 md:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    {FILTERS.map(f => (
                        <button
                            key={f.id}
                            onClick={() => setActiveFilter(f.id)}
                            className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border transition-colors ${activeFilter === f.id
                                ? 'bg-amber-700 text-white border-amber-700'
                                : 'bg-white text-gray-500 border-gray-300 hover:border-gray-400'
                                }`}
                        >
                            {f.name}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {[1, 2, 3, 4, 5, 6].map(i => <VideoCardSkeleton key={i} />)}
                    </div>
                ) : error ? (
                    <div className="text-center py-16 bg-white border border-dashed border-gray-300 rounded-lg">
                        <AlertTriangle className="h-10 w-10 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-gray-900 mb-1">Failed to load videos</h3>
                        <p className="text-gray-500 text-sm">Please try again later.</p>
                    </div>
                ) : visibleItems.length === 0 ? (
                    <p className="text-gray-500 text-center py-16">No videos found.</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {visibleItems.map(item => (
                            <VideoCard key={item.id} item={item} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Videos;
