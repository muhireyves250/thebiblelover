import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, MoreHorizontal, Share2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import ShareModal from './ShareModal';

interface BlogCardProps {
  image: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  readTime: string;
  views: number;
  comments: number;
  likes: number;
  isLarge?: boolean;
  slug?: string;
}

const BlogCard: React.FC<BlogCardProps> = ({
  image,
  title,
  excerpt,
  author,
  date,
  readTime,
  views: _views,
  comments: _comments,
  likes: _likes,
  isLarge = false,
  slug = ''
}) => {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const storageKey = `post:${slug}:likes`;
  const likedKey = `post:${slug}:liked`;
  const commentsKey = `post:${slug}:comments`;
  const [likeCount, setLikeCount] = useState<number>(typeof window !== 'undefined' ? Number(localStorage.getItem(storageKey) || _likes) : _likes);
  const [hasLiked, setHasLiked] = useState<boolean>(typeof window !== 'undefined' ? localStorage.getItem(likedKey) === 'true' : false);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(storageKey);
      if (stored === null) localStorage.setItem(storageKey, String(likeCount));
    }
  }, [storageKey]);

  const getCommentsCount = () => {
    if (typeof window === 'undefined') return _comments;
    try {
      const arr = JSON.parse(localStorage.getItem(commentsKey) || '[]');
      return Array.isArray(arr) ? arr.length : _comments;
    } catch {
      return _comments;
    }
  };

  const [commentCount, setCommentCount] = useState<number>(getCommentsCount());

  useEffect(() => {
    setCommentCount(getCommentsCount());
    const onStorage = (e: StorageEvent) => {
      if (e.key === commentsKey) setCommentCount(getCommentsCount());
    };
    const onCustom = (e: any) => {
      if (e?.detail?.slug === slug) setCommentCount(getCommentsCount());
    };
    window.addEventListener('storage', onStorage);
    window.addEventListener('comments:updated', onCustom as EventListener);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('comments:updated', onCustom as EventListener);
    };
  }, [commentsKey, slug]);

  const handleLike = () => {
    console.log('Like button clicked', { hasLiked, likeCount, storageKey, likedKey });
    
    if (hasLiked) {
      console.log('Already liked, returning');
      return; // Prevent multiple likes
    }
    
    const next = likeCount + 1;
    console.log('Setting like count to:', next);
    setLikeCount(next);
    setHasLiked(true);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, String(next));
      localStorage.setItem(likedKey, 'true');
      console.log('Saved to localStorage:', { storageKey: next, likedKey: 'true' });
    }
  };

  return (
    <article className="bg-white border border-gray-200 overflow-hidden">
      <div className="relative">
        <img 
          src={image} 
          alt={title}
          className="w-full h-auto"
        />
      </div>

      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-7 h-7 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-[10px] font-medium text-gray-600">A</span>
            </div>
            <div className="leading-tight">
              <p className="text-[13px] text-gray-800">{author}</p>
              <p className="text-[11px] text-gray-500">{date} • {readTime}</p>
            </div>
          </div>
          <button className="p-1 hover:bg-gray-100 rounded">
            <MoreHorizontal className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        <Link to={`/blog/${slug}`}>
          <h2 className={`font-serif text-gray-900 mb-3 hover:text-amber-700 cursor-pointer transition-colors leading-tight ${isLarge ? 'text-2xl' : 'text-2xl'}`}>
            {title}
          </h2>
        </Link>

        <p className="text-gray-700 text-sm leading-relaxed mb-6 line-clamp-3">
          {excerpt || 'No excerpt available'}
        </p>

        <div className="pt-4 border-t border-gray-200 flex items-center justify-between text-[12px] text-gray-500">
          <div className="flex items-center space-x-6">
            <span>{_views} views</span>
            <span>{commentCount} comments</span>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setIsShareModalOpen(true)}
              className="flex items-center space-x-1 text-gray-500 hover:text-amber-600 transition-colors" 
              aria-label="Share post"
            >
              <Share2 className="h-4 w-4" />
            </button>
            <button 
              onClick={handleLike} 
              disabled={hasLiked}
              className={`flex items-center space-x-1 transition-colors ${
                hasLiked 
                  ? 'text-gray-400 cursor-not-allowed' 
                  : 'text-gray-500 hover:text-red-600'
              }`} 
              aria-label={hasLiked ? "Already liked" : "Like post"}
            >
              <span>{likeCount}</span>
              <Heart className={`h-4 w-4 ${hasLiked ? 'fill-current' : ''}`} />
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