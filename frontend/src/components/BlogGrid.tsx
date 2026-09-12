import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import BlogCard from './BlogCard';
import { blogAPI } from '../services/api';
import { useCachedFetch } from '../hooks/useAPI';

interface BlogGridProps {
  limit?: number;
  showViewAll?: boolean;
}

const BlogGrid: React.FC<BlogGridProps> = ({ limit, showViewAll = false }) => {
  // Shared cache key across Home and Posts pages — whichever loads first
  // populates it, so navigating between them never re-fetches from scratch.
  const { data, loading, error, refetch } = useCachedFetch(
    'blogPosts:all',
    () => blogAPI.getPosts({ page: 1, limit: 1000 })
  );
  const blogPosts = data?.data?.posts || [];
  const initialCount = typeof limit === 'number' ? limit : 0;
  const [visibleCount, setVisibleCount] = useState<number>(initialCount);

  // When no explicit limit is provided, reveal all posts once data arrives
  useEffect(() => {
    if (typeof limit !== 'number') {
      setVisibleCount(blogPosts.length);
    }
  }, [blogPosts.length, limit]);

  const postsToRender = useMemo(() => {
    return blogPosts.slice(0, Math.min(visibleCount, blogPosts.length));
  }, [blogPosts, visibleCount]);

  if (loading) {
    return (
      <section className="py-3 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-3 md:mb-10">
            <h2 className="text-sm tracking-widest uppercase text-gray-500 mb-2 md:mb-8">All Posts</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white border border-gray-300 rounded-lg shadow-sm overflow-hidden animate-pulse">
                <div className="bg-gray-200 aspect-[16/10]" />
                <div className="p-2 md:p-6">
                  <div className="hidden md:flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-gray-200" />
                    <div className="space-y-1.5 flex-1">
                      <div className="h-3 w-24 bg-gray-200 rounded" />
                      <div className="h-2.5 w-32 bg-gray-200 rounded" />
                    </div>
                  </div>
                  <div className="h-3 md:h-5 w-3/4 bg-gray-200 rounded mb-1.5 md:mb-2" />
                  <div className="hidden md:block h-3 w-full bg-gray-200 rounded mb-1.5" />
                  <div className="hidden md:block h-3 w-2/3 bg-gray-200 rounded mb-5" />
                  <div className="pt-1.5 md:pt-4 border-t border-gray-100 flex justify-between">
                    <div className="h-2 md:h-3 w-12 md:w-16 bg-gray-200 rounded" />
                    <div className="h-2 md:h-3 w-10 md:w-12 bg-gray-200 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-3 md:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Posts</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={refetch}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-3 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-3 md:mb-10">
          <h2 className="text-sm tracking-widest uppercase text-gray-500 mb-2 md:mb-8">All Posts</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8" aria-live="polite">
          {postsToRender.map((post) => (
            <BlogCard key={post.id} {...post} isPremium={post.isPremium} publishedAt={post.publishedAt || new Date().toISOString()} author={post.author || { name: 'Unknown', profileImage: undefined }} />
          ))}
        </div>
        {showViewAll && (
          <div className="text-center mt-10">
            <Link to="/posts" className="inline-flex items-center gap-1.5 text-sm font-bold text-amber-700 hover:text-amber-800 transition-colors">
              View all posts
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default BlogGrid;