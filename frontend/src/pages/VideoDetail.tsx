import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Clock, Eye, Share2, AlertTriangle } from 'lucide-react';
import { homeFeedAPI } from '../services/api';
import type { HomeFeedVideo } from '../services/api.d';
import SEO, { CANONICAL_ORIGIN } from '../components/SEO';
import AutoText from '../components/AutoText';
import Toast from '../components/Toast';
import { useToast } from '../hooks/useToast';
import { shareOrCopy } from '../lib/share';

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

const VideoDetail: React.FC = () => {
  const { id = '' } = useParams<{ id: string }>();
  const [video, setVideo] = useState<HomeFeedVideo | null>(null);
  const [more, setMore] = useState<HomeFeedVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { toastMessage, showToast } = useToast();

  useEffect(() => {
    setLoading(true);
    setError(false);
    homeFeedAPI.getVideos(50).then((response) => {
      if (response.success && response.data) {
        const items: HomeFeedVideo[] = response.data.items;
        const match = items.find((item) => item.id === id);
        if (!match) {
          setError(true);
        } else {
          setVideo(match);
          setMore(items.filter((item) => item.id !== id).slice(0, 6));
        }
      } else {
        setError(true);
      }
    }).catch(() => setError(true)).finally(() => setLoading(false));
  }, [id]);

  const share = async () => {
    if (!video) return;
    const url = `${CANONICAL_ORIGIN}/watch/${video.id}`;
    const result = await shareOrCopy({ text: video.title, url });
    if (result === 'copied') showToast('Copied to clipboard');
    if (result === 'failed') showToast("Couldn't copy — try again");
  };

  return (
    <div className="min-h-screen bg-white dark:bg-transparent">
      {video && (
        <SEO
          title={video.title}
          description={video.excerpt || `Watch ${video.title} from The Bible Lover.`}
          image={video.thumbnail}
          type="article"
        />
      )}

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3 md:py-16">
        <Link to="/watch" className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-amber-700 hover:underline mb-4 md:mb-6">
          <ArrowLeft className="h-3.5 w-3.5" /> All videos
        </Link>

        {loading ? (
          <div className="w-full aspect-video bg-gray-200 dark:bg-white/10 rounded-lg animate-pulse" />
        ) : error || !video ? (
          <div className="text-center py-16 bg-white dark:bg-[#141417] border border-dashed border-gray-300 dark:border-white/10 rounded-lg">
            <AlertTriangle className="h-10 w-10 text-gray-300 mx-auto mb-4" />
            <AutoText as="h3" className="text-lg font-bold text-gray-900 dark:text-white mb-1">Video not found</AutoText>
            <AutoText as="p" className="text-gray-500 dark:text-gray-400 text-sm">It may have been removed, or the link is incorrect.</AutoText>
          </div>
        ) : (
          <>
            <div className="w-full aspect-video rounded-lg overflow-hidden bg-black shadow-lg">
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${video.id}?autoplay=1`}
                title={video.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            <div className="mt-4 md:mt-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 md:px-2.5 md:py-1 bg-amber-50 text-amber-700 text-[9px] md:text-[10px] font-black rounded border border-amber-100 uppercase tracking-widest">
                  {video.type === 'LIVE' ? 'Live' : 'Video'}
                </span>
                <span className="text-gray-400 dark:text-gray-500 text-xs flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {formatDate(video.publishedAt)}
                </span>
              </div>

              <AutoText as="h1" className="text-xl md:text-3xl font-black text-gray-900 dark:text-white leading-snug mb-3">
                {video.title}
              </AutoText>

              <div className="flex items-center gap-3 mb-4">
                <button
                  onClick={share}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:border-amber-400 hover:text-amber-700 font-bold text-xs uppercase tracking-wider transition-colors"
                >
                  <Share2 className="h-3.5 w-3.5" /> Share
                </button>
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-amber-200 bg-amber-50 text-amber-800 font-bold text-xs">
                  <Eye className="h-3.5 w-3.5" /> {video.views}
                </span>
              </div>

              {video.excerpt && (
                <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                  {video.excerpt}
                </p>
              )}
            </div>

            {more.length > 0 && (
              <div className="mt-10 md:mt-16">
                <AutoText as="h2" className="text-lg font-black uppercase tracking-tight text-gray-900 dark:text-white mb-4">More Videos</AutoText>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
                  {more.map((item) => (
                    <Link key={item.id} to={`/watch/${item.id}`} className="group block">
                      <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-white/10">
                        <img src={item.thumbnail} alt={item.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                      </div>
                      <p className="text-xs md:text-sm font-bold text-gray-800 dark:text-gray-200 line-clamp-2 mt-2 group-hover:text-amber-700 transition-colors">
                        {item.title}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <Toast message={toastMessage} />
    </div>
  );
};

export default VideoDetail;
