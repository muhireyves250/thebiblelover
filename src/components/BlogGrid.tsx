import React from 'react';
import BlogCard from './BlogCard';

const BlogGrid = () => {
  // Load posts from localStorage or use default posts
  const savedPosts = JSON.parse(localStorage.getItem('blogPosts') || '[]');
  
  const defaultPosts = [
    {
      id: 1,
      image: "https://images.pexels.com/photos/1370295/pexels-photo-1370295.jpeg?auto=compress&cs=tinysrgb&w=800",
      title: "8 must-read books",
      excerpt: "Create a blog post subtitle that summarizes your post in a few short, punchy sentences and entices your audience to continue reading...",
      author: "Admin",
      date: "Mar 22, 2023",
      readTime: "1 min read",
      views: 358,
      comments: 0,
      likes: 22,
      isLarge: false,
      slug: "8-must-read-books"
    },
    {
      id: 2,
      image: "https://images.pexels.com/photos/1370295/pexels-photo-1370295.jpeg?auto=compress&cs=tinysrgb&w=800",
      title: "You want your child to read these books",
      excerpt: "Create a blog post subtitle that summarizes your post in a few short, punchy sentences and entices your audience to continue reading...",
      author: "Admin",
      date: "Mar 22, 2023",
      readTime: "1 min read",
      views: 325,
      comments: 0,
      likes: 22,
      isLarge: false,
      slug: "you-want-your-child-to-read-these-books"
    },
    {
      id: 3,
      image: "https://images.pexels.com/photos/1370295/pexels-photo-1370295.jpeg?auto=compress&cs=tinysrgb&w=800",
      title: "\"The Traitor's Daughter\"",
      excerpt: "Create a blog post subtitle that summarizes your post in a few short, punchy sentences and entices your audience to continue reading...",
      author: "Admin",
      date: "Mar 22, 2023",
      readTime: "1 min read",
      views: 314,
      comments: 0,
      likes: 23,
      isLarge: false,
      slug: "the-traitors-daughter"
    },
    {
      id: 4,
      image: "https://images.pexels.com/photos/1370295/pexels-photo-1370295.jpeg?auto=compress&cs=tinysrgb&w=800",
      title: "How reading changes your perspective",
      excerpt: "Create a blog post subtitle that summarizes your post in a few short, punchy sentences and entices your audience to continue reading...",
      author: "Admin",
      date: "Mar 22, 2023",
      readTime: "1 min read",
      views: 1547,
      comments: 0,
      likes: 37,
      isLarge: false,
      slug: "how-reading-changes-your-perspective"
    },
    {
      id: 5,
      image: "https://images.pexels.com/photos/1370295/pexels-photo-1370295.jpeg?auto=compress&cs=tinysrgb&w=800",
      title: "The art of writing",
      excerpt: "Create a blog post subtitle that summarizes your post in a few short, punchy sentences and entices your audience to continue reading...",
      author: "Admin",
      date: "Mar 22, 2023",
      readTime: "1 min read",
      views: 632,
      comments: 0,
      likes: 28,
      isLarge: false,
      slug: "the-art-of-writing"
    }
  ];

  // Use saved posts or default posts, and add live data
  const blogPosts = (savedPosts.length > 0 ? savedPosts : defaultPosts).map((post: any) => {
    const processedPost = {
      ...post,
      views: Number(localStorage.getItem(`post:${post.slug}:views`) || post.views || 0),
      likes: Number(localStorage.getItem(`post:${post.slug}:likes`) || post.likes || 0),
      comments: JSON.parse(localStorage.getItem(`post:${post.slug}:comments`) || '[]').length
    };
    
    // Debug: log excerpt for new posts
    if (savedPosts.length > 0 && savedPosts.some((savedPost: any) => savedPost.id === post.id)) {
      console.log('New post excerpt:', post.title, '->', post.excerpt);
    }
    
    return processedPost;
  });

  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h2 className="text-sm tracking-widest uppercase text-gray-500 mb-8">All Posts</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
          {blogPosts.map((post) => (
            <BlogCard key={post.id} {...post} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default BlogGrid;