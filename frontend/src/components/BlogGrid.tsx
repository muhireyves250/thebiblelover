import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import BlogCard from './BlogCard';
import { blogAPI } from '../services/api';
import { useFetch } from '../hooks/useAPI';

interface BlogGridProps {
  limit?: number;
  showViewAll?: boolean;
}

const BlogGrid: React.FC<BlogGridProps> = ({ limit, showViewAll = false }) => {
  const { data, loading, error, refetch } = useFetch(() => blogAPI.getPosts({ page: 1, limit: 1000 }));
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
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <h2 className="text-sm tracking-widest uppercase text-gray-500 mb-8">All Posts</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-300 h-48 rounded-lg mb-4"></div>
                <div className="bg-gray-300 h-4 rounded mb-2"></div>
                <div className="bg-gray-300 h-3 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20 bg-white">
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
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h2 className="text-sm tracking-widest uppercase text-gray-500 mb-8">All Posts</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto" aria-live="polite">
          {postsToRender.map((post) => (
            <BlogCard key={post.id} {...post} publishedAt={post.publishedAt || new Date().toISOString()} author={post.author || { name: 'Unknown', profileImage: undefined }} />
          ))}
        </div>
        {showViewAll && (
          <div className="text-center mt-6">
            <Link to="/posts" className="text-amber-700 hover:underline">View all posts</Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default BlogGrid;