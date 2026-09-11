import { useEffect, useState } from 'react';
import { Play, AlertTriangle } from 'lucide-react';
import { homeFeedAPI } from '../services/api';
import type { HomeFeedVideo } from '../services/api.d';
import PageHeader from '../components/PageHeader';
import SEO from '../components/SEO';

const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const VideoCard = ({ item }: { item: HomeFeedVideo }) => {
    const [playing, setPlaying] = useState(false);
    const isLive = item.type === 'LIVE';

    return (
        <div className="bg-white border border-gray-300 rounded-lg shadow-sm overflow-hidden hover:border-gray-400 hover:shadow-md transition-all">
            <div className="relative h-48 bg-gray-100 overflow-hidden">
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
                            <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 bg-red-600 rounded-full shadow-lg">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                                </span>
                                <span className="text-white text-[10px] font-black uppercase tracking-widest">Live</span>
                            </div>
                        )}
                        <button
                            onClick={() => setPlaying(true)}
                            aria-label="Play video"
                            className="absolute inset-0 flex items-center justify-center group"
                        >
                            <span className="flex items-center justify-center w-14 h-14 rounded-full bg-red-600/90 shadow-xl group-hover:scale-110 group-hover:bg-red-600 transition-all duration-300">
                                <Play className="w-6 h-6 text-white ml-0.5" fill="currentColor" />
                            </span>
                        </button>
                    </>
                )}
            </div>
            <div className="p-4">
                <h3 className="text-sm font-bold text-gray-900 leading-snug line-clamp-2 mb-2">
                    {item.title}
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-3">{item.excerpt}</p>
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <span className="text-[11px] text-gray-400">{formatDate(item.publishedAt)}</span>
                    <span className="text-[11px] text-gray-400">{item.views} views</span>
                </div>
            </div>
        </div>
    );
};

const VideoCardSkeleton = () => (
    <div className="bg-white border border-gray-300 rounded-lg shadow-sm overflow-hidden">
        <div className="h-48 bg-gray-200 animate-pulse" />
        <div className="p-4">
            <div className="h-4 w-full bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse mb-3" />
            <div className="h-3 w-full bg-gray-200 rounded animate-pulse mb-3" />
            <div className="flex justify-between pt-3 border-t border-gray-100">
                <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
                <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
            </div>
        </div>
    </div>
);

const Videos = () => {
    const [items, setItems] = useState<HomeFeedVideo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

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

    return (
        <div className="min-h-screen bg-white">
            <SEO
                title="Watch"
                description="Every live stream and video The Bible Lover has published on YouTube, in one place."
            />
            <PageHeader title="Watch" subtitle="LIVE STREAMS &amp; VIDEOS" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map(i => <VideoCardSkeleton key={i} />)}
                    </div>
                ) : error ? (
                    <div className="text-center py-16 bg-white border border-dashed border-gray-300 rounded-lg">
                        <AlertTriangle className="h-10 w-10 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-gray-900 mb-1">Failed to load videos</h3>
                        <p className="text-gray-500 text-sm">Please try again later.</p>
                    </div>
                ) : items.length === 0 ? (
                    <p className="text-gray-500 text-center py-16">No videos found.</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {items.map(item => (
                            <VideoCard key={item.id} item={item} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Videos;
