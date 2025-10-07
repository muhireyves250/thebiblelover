import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, MoreHorizontal, Share2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
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
    <article className="bg-white border border-gray-200 overflow-hidden hover:shadow-xl hover:shadow-gray-100/50 transition-all duration-500 ease-out group">
      <div className="w-full bg-gray-50 relative overflow-hidden">
        <img
          src={featuredImage}
          alt={title}
          className="w-full h-auto object-contain block transition-transform duration-700 ease-out group-hover:scale-110"
          loading="lazy"
          decoding="async"
          fetchpriority="low"
        />
        {/* Professional overlay effect */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out"></div>
        {/* Subtle shine effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
      </div>

      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-7 h-7 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden group-hover:ring-2 group-hover:ring-amber-200 transition-all duration-300 ease-out">
              {author.profileImage ? (
                <img 
                  src={author.profileImage} 
                  alt={author.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 ease-out"
                />
              ) : (
                <span className="text-[10px] font-medium text-gray-600 group-hover:text-amber-600 transition-colors duration-300 ease-out">
                  {author.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="leading-tight">
              <p className="text-[13px] text-gray-800 group-hover:text-gray-700 transition-colors duration-300 ease-out">{author.name}</p>
              <p className="text-[11px] text-gray-500 group-hover:text-gray-600 transition-colors duration-300 ease-out">{formatDate(publishedAt)} • {readTime} min read</p>
            </div>
          </div>
          <button className="p-1 hover:bg-gray-100 rounded">
            <MoreHorizontal className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        <Link to={`/blog/${slug}`}>
          <h2 className={`font-serif text-gray-900 mb-3 hover:text-amber-700 cursor-pointer transition-all duration-300 ease-out leading-tight transform group-hover:translate-x-1 ${isLarge ? 'text-2xl' : 'text-2xl'}`}>
            {title}
          </h2>
        </Link>

        <p className="text-gray-700 text-sm leading-relaxed mb-6 line-clamp-3 group-hover:text-gray-600 transition-colors duration-300 ease-out">
          {excerpt || 'No excerpt available'}
        </p>

        <div className="pt-4 border-t border-gray-200 flex items-center justify-between text-[12px] text-gray-500">
          <div className="flex items-center space-x-6">
            <span>{_views} views</span>
            <span>{likeCount} likes</span>
            <span>{_count?.comments ?? 0} comments</span>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setIsShareModalOpen(true)}
              className="flex items-center space-x-1 text-gray-500 hover:text-amber-600 transition-all duration-300 ease-out hover:scale-110 transform" 
              aria-label="Share post"
            >
              <Share2 className="h-4 w-4" />
            </button>
            <button 
              onClick={handleLike} 
              disabled={isLiking}
              className={`flex items-center space-x-1 transition-all duration-300 ease-out hover:scale-110 transform ${
                isLiked 
                  ? 'text-red-600' 
                  : 'text-gray-500 hover:text-red-600'
              } ${isLiking ? 'opacity-50 cursor-not-allowed' : ''}`}
              aria-label={isLiked ? 'Unlike post' : 'Like post'}
            >
              <span>{likeCount}</span>
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''} transition-transform duration-200 ease-out hover:scale-125`} />
            </button>
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
    </article>
  );
};

export default BlogCard;