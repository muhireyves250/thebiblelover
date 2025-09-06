import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Heart, MessageCircle, Eye, Share2 } from 'lucide-react';
import Newsletter from '../components/Newsletter';
import ShareModal from '../components/ShareModal';

const BlogPost = () => {
  const { slug } = useParams();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Load blog posts from localStorage or use default posts
  const getBlogPosts = () => {
    const savedPosts = JSON.parse(localStorage.getItem('blogPosts') || '[]');
    
    // Default posts if none exist
    const defaultPosts = {
    "how-reading-changes-your-perspective": {
      title: "How reading changes your perspective",
      image: "https://images.pexels.com/photos/1370295/pexels-photo-1370295.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      author: "Admin",
      date: "Mar 22, 2023",
      readTime: "1 min read",
      views: 1547,
      comments: 0,
      likes: 37,
      content: `
        <p>Welcome to your blog post. Use this space to connect with your readers and potential customers in a way that's current and interesting. Think of it as an ongoing conversation where you can share updates about business, trends, news, and more.</p>
        
        <blockquote>"Do you have a design in mind for your blog? Whether you prefer a trendy postcard look or you're going for a more editorial style blog - there's a stunning layout for everyone."</blockquote>
        
        <p>You'll be posting loads of engaging content, so be sure to keep your blog organized with Categories that also allow visitors to explore more of what interests them.</p>
        
        <h3>Create Relevant Content</h3>
        
        <p>Writing a blog is a great way to position yourself as an authority in your field and captivate your readers' attention. Do you want to improve your site's SEO ranking? Consider topics that focus on relevant keywords and relate back to your website or business. You can also add hashtags (#vacation #dream #summer) throughout your posts to reach more people, and help visitors search for relevant content.</p>
        
        <p>Blogging gives your site a voice, so let your business' personality shine through. Choose a great image to feature in your post or add a video for extra engagement. Are you ready to get started? Simply create a new post now.</p>
      `
    },
    "you-want-your-child-to-read-these-books": {
      title: "You want your child to read these books",
      image: "https://images.pexels.com/photos/1370295/pexels-photo-1370295.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      author: "Admin",
      date: "Mar 22, 2023",
      readTime: "1 min read",
      views: 325,
      comments: 0,
      likes: 22,
      content: `
        <p>Create a blog post subtitle that summarizes your post in a few short, punchy sentences and entices your audience to continue reading.</p>
        <p>Welcome to your blog post. Use this space to connect with your readers and potential customers in a way that's current and interesting. Think of it as an ongoing conversation where you can share updates about business, trends, news, and more.</p>
      `
    },
    "the-traitors-daughter": {
      title: "The Traitor's Daughter",
      image: "https://images.pexels.com/photos/1370295/pexels-photo-1370295.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      author: "Admin",
      date: "Mar 22, 2023",
      readTime: "1 min read",
      views: 314,
      comments: 0,
      likes: 23,
      content: `
        <p>Create a blog post subtitle that summarizes your post in a few short, punchy sentences and entices your audience to continue reading.</p>
        <p>Welcome to your blog post. Use this space to connect with your readers and potential customers in a way that's current and interesting. Think of it as an ongoing conversation where you can share updates about business, trends, news, and more.</p>
      `
    },
    "the-art-of-writing": {
      title: "The art of writing",
      image: "https://images.pexels.com/photos/1370295/pexels-photo-1370295.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      author: "Admin",
      date: "Mar 22, 2023",
      readTime: "1 min read",
      views: 632,
      comments: 0,
      likes: 28,
      content: `
        <p>Create a blog post subtitle that summarizes your post in a few short, punchy sentences and entices your audience to continue reading.</p>
        <p>Welcome to your blog post. Use this space to connect with your readers and potential customers in a way that's current and interesting. Think of it as an ongoing conversation where you can share updates about business, trends, news, and more.</p>
      `
    },
    "8-must-read-books": {
      title: "8 must-read books",
      image: "https://images.pexels.com/photos/1370295/pexels-photo-1370295.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      author: "Admin",
      date: "Mar 22, 2023",
      readTime: "1 min read",
      views: 358,
      comments: 0,
      likes: 22,
      content: `
        <p>Create a blog post subtitle that summarizes your post in a few short, punchy sentences and entices your audience to continue reading.</p>
        
        <p>Welcome to your blog post. Use this space to connect with your readers and potential customers in a way that's current and interesting. Think of it as an ongoing conversation where you can share updates about business, trends, news, and more.</p>
      `
    }
    };

    // Convert saved posts to the expected format
    const savedPostsObj: any = {};
    savedPosts.forEach((post: any) => {
      savedPostsObj[post.slug] = {
        title: post.title,
        subtitle: post.subtitle || '',
        image: post.image,
        author: post.author,
        date: post.date,
        readTime: post.readTime,
        views: Number(localStorage.getItem(`post:${post.slug}:views`) || '0'),
        comments: JSON.parse(localStorage.getItem(`post:${post.slug}:comments`) || '[]').length,
        likes: Number(localStorage.getItem(`post:${post.slug}:likes`) || '0'),
        content: post.content
      };
    });

    // Merge saved posts with default posts
    return { ...defaultPosts, ...savedPostsObj };
  };

  const blogPosts = getBlogPosts();
  const post = blogPosts[slug as keyof typeof blogPosts];

  // Get recent posts (excluding current post)
  const getRecentPosts = () => {
    const allPosts = Object.entries(blogPosts)
      .filter(([postSlug]) => postSlug !== slug) // Exclude current post
      .map(([postSlug, postData]) => ({
        slug: postSlug,
        ...postData,
        views: Number(localStorage.getItem(`post:${postSlug}:views`) || postData.views || 0),
        likes: Number(localStorage.getItem(`post:${postSlug}:likes`) || postData.likes || 0),
        comments: JSON.parse(localStorage.getItem(`post:${postSlug}:comments`) || '[]').length
      }))
      .sort((a, b) => {
        // Sort by date (newest first) - you can adjust this logic
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      })
      .slice(0, 3); // Get only 3 recent posts

    return allPosts;
  };

  const recentPosts = getRecentPosts();

  const likeKey = `post:${slug}:likes`;
  const viewsKey = `post:${slug}:views`;
  const commentsKey = `post:${slug}:comments`;
  const likedKey = `post:${slug}:liked`;

  const [likes, setLikes] = useState<number>(typeof window !== 'undefined' ? Number(localStorage.getItem(likeKey) || post?.likes || 0) : post?.likes || 0);
  const [views, setViews] = useState<number>(typeof window !== 'undefined' ? Number(localStorage.getItem(viewsKey) || post?.views || 0) : post?.views || 0);
  const [hasLiked, setHasLiked] = useState<boolean>(typeof window !== 'undefined' ? localStorage.getItem(likedKey) === 'true' : false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<string[]>(typeof window !== 'undefined' ? JSON.parse(localStorage.getItem(commentsKey) || '[]') : []);

  useEffect(() => {
    // increment view count once
    if (typeof window !== 'undefined') {
      const next = views + 1;
      setViews(next);
      localStorage.setItem(viewsKey, String(next));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLike = () => {
    console.log('Like button clicked in BlogPost', { hasLiked, likes, likeKey, likedKey });
    
    if (hasLiked) {
      console.log('Already liked, returning');
      return; // Prevent multiple likes
    }
    
    const next = likes + 1;
    console.log('Setting likes to:', next);
    setLikes(next);
    setHasLiked(true);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(likeKey, String(next));
      localStorage.setItem(likedKey, 'true');
      console.log('Saved to localStorage:', { likeKey: next, likedKey: 'true' });
    }
  };

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    const next = [...comments, commentText.trim()];
    setComments(next);
    setCommentText('');
    if (typeof window !== 'undefined') localStorage.setItem(commentsKey, JSON.stringify(next));
    // notify other tabs/components to refresh counts
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('comments:updated', { detail: { slug } }));
    }
  };

  if (!post) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-serif text-gray-900 mb-4">Post not found</h1>
          <p className="text-gray-600">The blog post you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="bg-gray-50 py-4">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-gray-500">All Posts</p>
        </div>
      </div>

      {/* Blog Post Content */}
      <article className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Author Info */}
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-gray-600">A</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{post.author}</p>
              <p className="text-xs text-gray-500">{post.date} • {post.readTime}</p>
            </div>
            <button className="ml-auto p-1 hover:bg-gray-100 rounded">
              <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-serif text-gray-900 mb-8 leading-tight">
            {post.title}
          </h1>

          {/* Subtitle - only show if post has a custom subtitle */}
          {post.subtitle && (
            <p className="text-lg text-gray-700 mb-8 font-medium">
              {post.subtitle}
            </p>
          )}

          {/* Featured Image */}
          <div className="mb-12">
            <img 
              src={post.image} 
              alt={post.title}
              className="w-full h-auto rounded-none"
            />
          </div>

          {/* Content */}
          <div 
            className="prose prose-lg max-w-none mb-12"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Social Share */}
          <div className="flex items-center justify-between mb-8 pb-8 border-b">
            <div className="flex items-center space-x-2">
              <Share2 className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-600">Share this post</span>
            </div>
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-amber-700 text-white rounded-md hover:bg-amber-800 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span className="text-sm">Share</span>
            </button>
          </div>

          {/* Engagement Stats */}
          <div className="flex items-center justify-between text-sm text-gray-500 mb-12">
            <div className="flex items-center space-x-4">
              <span>{views} views</span>
              <span>{comments.length} comments</span>
            </div>
            <button 
              onClick={handleLike} 
              disabled={hasLiked}
              className={`flex items-center space-x-1 transition-colors ${
                hasLiked 
                  ? 'text-gray-400 cursor-not-allowed' 
                  : 'text-red-500 hover:text-red-600'
              }`} 
              aria-label={hasLiked ? "Already liked" : "Like post"}
            >
              <span>{likes}</span>
              <Heart className={`h-4 w-4 ${hasLiked ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Recent Posts */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-medium text-gray-900">Recent Posts</h3>
              <Link to="/" className="text-sm text-gray-600 hover:text-gray-800">See All</Link>
            </div>
            
            {recentPosts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {recentPosts.map((recentPost) => (
                  <Link 
                    key={recentPost.slug}
                    to={`/blog/${recentPost.slug}`}
                    className="group cursor-pointer block"
                  >
                    <img 
                      src={recentPost.image} 
                      alt={recentPost.title}
                      className="w-full h-auto mb-3"
                    />
                    <h4 className="font-serif text-gray-900 group-hover:text-amber-700 transition-colors mb-2 line-clamp-2">
                      {recentPost.title}
                    </h4>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center space-x-2">
                        <Eye className="w-3 h-3" />
                        <span>{recentPost.views}</span>
                        <MessageCircle className="w-3 h-3" />
                        <span>{recentPost.comments}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span>{recentPost.likes}</span>
                        <Heart className="w-3 h-3" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No other posts available at the moment.</p>
              </div>
            )}
          </div>

          {/* Comments Section */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-6">Comments</h3>
            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-none">
                <textarea
                  placeholder="Write a comment..."
                  className="w-full p-4 border border-gray-300 rounded-none resize-none h-24 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-transparent"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                />
                <div className="mt-4 text-right">
                  <button onClick={handleAddComment} className="px-4 py-2 bg-amber-700 text-white text-sm hover:bg-amber-800">Post Comment</button>
                </div>
              </div>
              {comments.length > 0 && (
                <ul className="divide-y border border-gray-200">
                  {comments.map((c, idx) => (
                    <li key={idx} className="p-4 text-gray-800">{c}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </article>

      <Newsletter />

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        post={{
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt
        }}
      />
    </div>
  );
};

export default BlogPost;