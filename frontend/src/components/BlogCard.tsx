import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MoreHorizontal, Share2, Eye } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ShareModal from './ShareModal';
import { blogAPI } from '../services/api';

interface BlogCardProps {
  id: string;
  featuredImage: string;
  title: string;
  excerpt: string;
  author: {
    name: string;
    profileImage?: string;
  };
  publishedAt: string;
  readTime: number;
  views: number;
  likes: number;
  _count?: { comments?: number };
  isLarge?: boolean;
  slug: string;
  isPremium?: boolean;
}

const BlogCard: React.FC<BlogCardProps> = ({
  id,
  featuredImage,
  title,
  excerpt,
  author,
  publishedAt,
  readTime,
  views: _views,
  likes: _likes,
  isLarge = false,
  slug,
  isPremium = false,
  _count
}) => {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [likeCount, setLikeCount] = useState<number>(_likes);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [isLiking, setIsLiking] = useState<boolean>(false);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleLike = async () => {
    if (isLiking) return;

    setIsLiking(true);
    try {
      if (isLiked) {
        // Unlike the post
        const response = await blogAPI.unlikePost(id);
        setLikeCount(response.data.likes);
        setIsLiked(false);
      } else {
        // Like the post
        const response = await blogAPI.likePost(id);
        setLikeCount(response.data.likes);
        setIsLiked(true);
      }
    } catch (error) {
      console.error('Error liking/unliking post:', error);
      // Revert optimistic update on error
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <motion.article 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl overflow-hidden hover:shadow-2xl hover:shadow-amber-900/10 dark:hover:shadow-black/40 transition-all duration-500 ease-out group"
    >
      <Link to={`/blog/${slug}`} className="block w-full bg-gray-50 dark:bg-gray-900/50 relative overflow-hidden aspect-[16/10]">
        {isPremium && (
          <div className="absolute top-4 right-4 z-10">
            <span className="px-3 py-1 bg-amber-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-full shadow-lg border border-amber-500/30 backdrop-blur-sm">
              Premium
            </span>
          </div>
        )}
        <img
          src={featuredImage}
          alt={title}
          className="w-full h-full object-cover block transition-transform duration-1000 ease-out group-hover:scale-110"
          loading="lazy"
          decoding="async"
        />
        {/* Professional overlay effect */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 dark:from-black/60 via-transparent to-transparent opacity-40 group-hover:opacity-60 transition-opacity duration-500 ease-out"></div>
        {/* Subtle shine effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
      </Link>

      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/40 rounded-2xl flex items-center justify-center overflow-hidden group-hover:ring-4 group-hover:ring-amber-500/20 transition-all duration-500 ease-out">
              {author.profileImage ? (
                <img
                  src={author.profileImage}
                  alt={author.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                />
              ) : (
                <span className="text-xs font-bold text-amber-600 dark:text-amber-500 group-hover:scale-110 transition-all duration-300">
                  {author.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="leading-tight">
              <p className="text-sm font-bold text-gray-900 dark:text-gray-100 group-hover:text-amber-700 dark:group-hover:text-amber-500 transition-colors duration-300 ease-out">{author.name}</p>
              <p className="text-[11px] font-medium text-gray-500 group-hover:text-gray-600 transition-colors duration-300 ease-out uppercase tracking-wider">{formatDate(publishedAt)} • {readTime} min read</p>
            </div>
          </div>
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
            <MoreHorizontal className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <Link to={`/blog/${slug}`}>
          <h2 className={`font-serif text-gray-900 dark:text-gray-100 mb-4 hover:text-amber-700 dark:hover:text-amber-500 cursor-pointer transition-all duration-500 ease-out leading-tight group-hover:translate-x-1 ${isLarge ? 'text-3xl' : 'text-2xl'}`}>
            {title}
          </h2>
        </Link>

        <Link to={`/blog/${slug}`} className="block">
          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-8 line-clamp-2 group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors duration-500 ease-out">
            {excerpt || 'No excerpt available'}
          </p>
        </Link>

        <div className="pt-6 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center space-x-5 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
            <span className="flex items-center gap-1.5"><Eye className="w-3.5 h-3.5" /> {_views}</span>
            <span className="flex items-center gap-1.5"><Heart className="w-3.5 h-3.5" /> {likeCount}</span>
          </div>
          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => { e.preventDefault(); setIsShareModalOpen(true); }}
              className="p-2.5 bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-amber-600 dark:hover:text-amber-500 rounded-xl transition-all shadow-sm"
              aria-label="Share post"
            >
              <Share2 className="h-4 w-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => { e.preventDefault(); handleLike(); }}
              disabled={isLiking}
              className={`p-2.5 rounded-xl transition-all shadow-sm flex items-center gap-2 ${isLiked
                ? 'bg-red-50 text-red-600'
                : 'bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-red-500'
                } ${isLiking ? 'opacity-50' : ''}`}
              aria-label={isLiked ? 'Unlike post' : 'Like post'}
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
              {isLiked && <span className="text-xs font-bold">{likeCount}</span>}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        post={{
          title: title,
          slug: slug,
          excerpt: excerpt
        }}
      />
    </motion.article>
  );
};

export default memo(BlogCard);