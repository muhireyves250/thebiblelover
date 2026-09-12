import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Share2, Eye } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ShareModal from './ShareModal';
import { blogAPI } from '../services/api';

interface BlogCardProps {
  id: string;
  featuredImage: string;
  title: string;
  excerpt: string;
  category?: string;
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
  category,
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
      className="group bg-white border border-gray-300 rounded-lg shadow-sm overflow-hidden hover:shadow-md hover:border-gray-400 transition-all duration-300"
    >
      <Link to={`/blog/${slug}`} className="block w-full bg-gray-50 relative overflow-hidden aspect-[16/10]">
        {isPremium && (
          <div className="absolute top-3 right-3 z-10">
            <span className="px-2.5 py-1 bg-amber-700 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-sm">
              Premium
            </span>
          </div>
        )}
        <img
          src={featuredImage}
          alt={title}
          className="w-full h-full object-cover block transition-transform duration-700 ease-out group-hover:scale-105"
          loading="lazy"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="md:hidden absolute inset-0 bg-black/25"></div>
        <div className="md:hidden absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent px-2 pt-6 pb-1.5">
          <h2 className="font-sans font-bold uppercase text-white leading-snug line-clamp-2 text-xs">
            {title}
          </h2>
        </div>
      </Link>

      <div className="p-2 md:p-6">
        <div className="hidden md:flex items-center gap-3 mb-4">
          <div className="w-8 h-8 shrink-0 bg-amber-50 border border-amber-100 rounded-full flex items-center justify-center overflow-hidden">
            {author.profileImage ? (
              <img
                src={author.profileImage}
                alt={author.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-xs font-black text-amber-700">
                {author.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="leading-tight min-w-0">
            <p className="text-sm font-bold text-gray-900 truncate">{author.name}</p>
            <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">{formatDate(publishedAt)} • {readTime} min read</p>
          </div>
        </div>

        {category && (
          <span className="hidden md:block text-[11px] font-bold uppercase tracking-wider text-amber-700 mb-2">
            {category.replace(/_/g, ' ')}
          </span>
        )}

        <Link to={`/blog/${slug}`} className="hidden md:block">
          <h2 className={`font-sans font-bold uppercase text-gray-900 mb-2 group-hover:text-amber-700 transition-colors duration-300 leading-snug ${isLarge ? 'text-2xl' : 'text-lg'}`}>
            {title}
          </h2>
        </Link>

        <Link to={`/blog/${slug}`} className="block">
          <p className="text-gray-600 text-[11px] md:text-sm leading-relaxed mb-1.5 md:mb-5 line-clamp-2">
            {excerpt || 'No excerpt available'}
          </p>
        </Link>

        <div className="pt-1.5 md:pt-4 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-4 text-[9px] md:text-xs font-bold text-gray-500">
            <span className="flex items-center gap-1 md:gap-1.5"><Eye className="w-2.5 h-2.5 md:w-3.5 md:h-3.5" /> {_views}</span>
            <span className="flex items-center gap-1 md:gap-1.5"><Heart className="w-2.5 h-2.5 md:w-3.5 md:h-3.5" /> {likeCount}</span>
          </div>
          <div className="flex items-center gap-1 md:gap-2">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={(e) => { e.preventDefault(); setIsShareModalOpen(true); }}
              className="p-1 md:p-1.5 border border-gray-200 text-gray-400 hover:text-amber-700 hover:border-amber-200 rounded-full transition-colors"
              aria-label="Share post"
            >
              <Share2 className="h-2.5 w-2.5 md:h-3.5 md:w-3.5" />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={(e) => { e.preventDefault(); handleLike(); }}
              disabled={isLiking}
              className={`p-1 md:p-1.5 rounded-full border transition-colors flex items-center gap-1 md:gap-1.5 ${isLiked
                ? 'bg-red-50 border-red-100 text-red-600'
                : 'border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-100'
                } ${isLiking ? 'opacity-50' : ''}`}
              aria-label={isLiked ? 'Unlike post' : 'Like post'}
            >
              <Heart className={`h-2.5 w-2.5 md:h-3.5 md:w-3.5 ${isLiked ? 'fill-current' : ''}`} />
              {isLiked && <span className="text-[10px] md:text-xs font-bold pr-0.5">{likeCount}</span>}
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