import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { blogAPI } from '../services/api';
import { useFetch } from '../hooks/useAPI';
import { Heart } from 'lucide-react';

const BlogPost: React.FC = () => {
  const { slug = '' } = useParams<{ slug: string }>();

  const { data, loading, error, refetch } = useFetch(() => blogAPI.getPost(slug), [slug]);
  const post = data?.data?.post;

  // Recent posts (we'll render as a horizontal slider)
  const { data: recentData, loading: recentLoading } = useFetch(() => blogAPI.getPosts({ page: 1, limit: 10 }), []);
  const recentPosts = (recentData?.data?.posts || []).filter((p: any) => p.slug !== slug);
  const sliderRef = useRef<HTMLDivElement | null>(null);
  const isHoveringRef = useRef<boolean>(false);
  const isDraggingRef = useRef<boolean>(false);
  const dragStartXRef = useRef<number>(0);
  const dragScrollLeftRef = useRef<number>(0);

  // Enhanced auto-scroll with smooth animations and pause functionality
  useEffect(() => {
    const el = sliderRef.current;
    if (!el || recentPosts.length <= 1) return;

    let rafId = 0;
    let lastTs = 0;
    let isScrolling = true;
    const speedPxPerSec = 80; // Slower, more professional speed
    let scrollDirection = 1; // 1 for right, -1 for left

    const step = (ts: number) => {
      if (!lastTs) lastTs = ts;
      const dt = (ts - lastTs) / 1000;
      lastTs = ts;

      if (!isHoveringRef.current && !isDraggingRef.current && isScrolling) {
        el.scrollLeft += speedPxPerSec * dt * scrollDirection;

        // Smooth loop with fade effect
        const maxScroll = el.scrollWidth - el.clientWidth;
        if (scrollDirection === 1 && el.scrollLeft >= maxScroll - 10) {
          // Pause at the end, then reverse
          setTimeout(() => {
            scrollDirection = -1;
          }, 2000);
        } else if (scrollDirection === -1 && el.scrollLeft <= 10) {
          // Pause at the beginning, then reverse
          setTimeout(() => {
            scrollDirection = 1;
          }, 2000);
        }
      }

      rafId = requestAnimationFrame(step);
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [recentPosts.length]);

  // Drag-to-scroll handlers
  const onDragStart = (clientX: number) => {
    const el = sliderRef.current;
    if (!el) return;
    isDraggingRef.current = true;
    dragStartXRef.current = clientX;
    dragScrollLeftRef.current = el.scrollLeft;
    el.classList.add('cursor-grabbing');
    el.style.scrollBehavior = 'auto'; // Disable smooth scroll during drag
  };

  const onDragMove = (clientX: number) => {
    const el = sliderRef.current;
    if (!el || !isDraggingRef.current) return;
    const delta = clientX - dragStartXRef.current;
    el.scrollLeft = dragScrollLeftRef.current - delta;
  };

  const onDragEnd = () => {
    const el = sliderRef.current;
    if (!el) return;
    isDraggingRef.current = false;
    el.classList.remove('cursor-grabbing');
    el.style.scrollBehavior = 'smooth'; // Re-enable smooth scroll
  };

  const scrollByAmount = (amount: number) => {
    const el = sliderRef.current;
    if (!el) return;
    el.scrollBy({
      left: amount,
      behavior: 'smooth'
    });
  };

  // Add scroll progress indicator
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const el = sliderRef.current;
    if (!el) return;

    const updateScrollProgress = () => {
      const maxScroll = el.scrollWidth - el.clientWidth;
      if (maxScroll > 0) {
        setScrollProgress((el.scrollLeft / maxScroll) * 100);
      }
    };

    el.addEventListener('scroll', updateScrollProgress);
    return () => el.removeEventListener('scroll', updateScrollProgress);
  }, [recentPosts.length]);

  // Comments
  const { data: commentsData, refetch: refetchComments } = useFetch(
    () => (post?.id ? blogAPI.getComments(post.id) : Promise.resolve({ success: true, data: { comments: [] } })),
    [post?.id]
  );
  const comments = commentsData?.data?.comments || [];

  // Like state
  const [isLiking, setIsLiking] = useState<boolean>(false);
  const [likeCount, setLikeCount] = useState<number>(post?.likes || 0);
  const [isLiked, setIsLiked] = useState<boolean>(() => {
    if (!post?.id) return false;
    return localStorage.getItem(`liked:${post.id}`) === '1';
  });

  const handleLike = async () => {
    if (!post?.id || isLiking) return;
    setIsLiking(true);
    try {
      if (isLiked) {
        const res = await blogAPI.unlikePost(post.id);
        setLikeCount(res.data.likes);
        setIsLiked(false);
        localStorage.removeItem(`liked:${post.id}`);
      } else {
        const res = await blogAPI.likePost(post.id);
        setLikeCount(res.data.likes);
        setIsLiked(true);
        localStorage.setItem(`liked:${post.id}`, '1');
      }
    } catch (e) {
      // noop
    } finally {
      setIsLiking(false);
    }
  };

  // Comment form state
  const [authorName, setAuthorName] = useState('');
  const [authorEmail, setAuthorEmail] = useState('');
  const [commentContent, setCommentContent] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post?.id) return;
    setIsSubmittingComment(true);
    try {
      await blogAPI.addComment(post.id, { authorName, authorEmail, content: commentContent });
      setAuthorName('');
      setAuthorEmail('');
      setCommentContent('');
      refetchComments();
    } catch (err) {
      // optionally show error toast
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const formattedDate = useMemo(() => {
    if (!post?.publishedAt) return '';
    return new Date(post.publishedAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }, [post?.publishedAt]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-3xl mx-auto px-4 py-12">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-2/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-3xl mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-serif text-gray-900 mb-3">Error loading post</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button onClick={refetch} className="px-4 py-2 bg-amber-700 text-white rounded-md hover:bg-amber-800">Try again</button>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-3xl mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-serif text-gray-900 mb-3">Post not found</h1>
          <p className="text-gray-600">We couldn't find the post you're looking for.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <article className="max-w-3xl mx-auto px-4 py-12">
        <header className="mb-8">
          <h1 className="text-3xl font-serif text-gray-900 mb-3">{post.title}</h1>
          <p className="text-gray-600 mb-4">{post.excerpt}</p>

          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-300 rounded-full overflow-hidden flex items-center justify-center">
                {post.author?.profileImage ? (
                  <img src={post.author.profileImage} alt={post.author?.name || 'Author'} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[10px] font-medium text-gray-600">
                    {(post.author?.name || 'A').charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <p className="text-gray-800">{post.author?.name || 'Unknown author'}</p>
                <p className="text-gray-500">{formattedDate} • {post.readTime} min read</p>
              </div>
            </div>
          </div>
        </header>

        {post.featuredImage && (
          <div className="mb-8">
            <img src={post.featuredImage} alt={post.title} className="w-full h-auto object-contain" />
          </div>
        )}

        <section className="prose prose-amber max-w-none">
          {/** Content may include HTML; prefer rendering as HTML if so */}
          {/<[a-z][\s\S]*>/i.test(post.content) ? (
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
          ) : (
            <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{post.content}</p>
          )}
        </section>

        {/* Metrics under content */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
            <span className="inline-flex items-center gap-1">👁️ {post.views}</span>
            <span className="inline-flex items-center gap-1">❤️ {likeCount}</span>
            <span className="inline-flex items-center gap-1">💬 {post._count?.comments ?? comments.length}</span>
            <button
              onClick={handleLike}
              disabled={isLiking}
              className={`ml-auto inline-flex items-center gap-2 px-3 py-1.5 rounded-md border ${isLiked ? 'text-red-600 border-red-200 bg-red-50' : 'text-gray-700 border-gray-200 hover:bg-gray-50'} ${isLiking ? 'opacity-50 cursor-not-allowed' : ''}`}
              aria-label={isLiked ? 'Unlike post' : 'Like post'}
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
              {isLiked ? 'Unlike' : 'Like'}
            </button>
          </div>
        </div>

        {/* Comments */}
        <section className="mt-12">
          <h2 className="text-2xl font-serif text-gray-900 mb-6">Comments ({comments.length})</h2>
          <div className="space-y-4 mb-10">
            {comments.map((c: any) => (
              <div key={c.id} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-sm font-semibold">
                    {c.authorName?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-gray-900">{c.authorName || 'Anonymous'}</div>
                      <div className="text-xs text-gray-400">{new Date(c.createdAt).toLocaleDateString()}</div>
                    </div>
                    <p className="mt-1 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{c.content}</p>
                  </div>
                </div>
              </div>
            ))}
            {comments.length === 0 && (
              <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center text-gray-500">No comments yet. Be the first to comment!</div>
            )}
          </div>

          <form onSubmit={submitComment} className="space-y-5 bg-gray-50 border border-gray-200 p-5 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="commentName" className="block text-sm text-gray-700 mb-1">Name</label>
                <input
                  id="commentName"
                  name="commentName"
                  type="text"
                  required
                  autoComplete="name"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="commentEmail" className="block text-sm text-gray-700 mb-1">Email</label>
                <input
                  id="commentEmail"
                  name="commentEmail"
                  type="email"
                  required
                  autoComplete="email"
                  value={authorEmail}
                  onChange={(e) => setAuthorEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label htmlFor="commentContent" className="block text-sm text-gray-700 mb-1">Comment</label>
              <textarea
                id="commentContent"
                name="commentContent"
                rows={4}
                required
                autoComplete="off"
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmittingComment}
              className="px-4 py-2 bg-amber-700 text-white rounded-md hover:bg-amber-800 disabled:opacity-50"
            >
              {isSubmittingComment ? 'Posting…' : 'Post Comment'}
            </button>
          </form>
        </section>

        {/* Recent Posts */}
        <section className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-serif text-gray-900 mb-1">Recent Posts</h2>
              <div className="w-16 h-0.5 bg-amber-700 rounded-full"></div>
            </div>
            {recentPosts.length > 3 && (
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span>Auto-scrolling</span>
                </div>
                <div className="w-16 h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-700 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${scrollProgress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          {recentLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-700"></div>
              <span className="ml-2 text-gray-600">Loading recent posts...</span>
            </div>
          ) : recentPosts.length > 0 ? (
            <div className="relative group">

              {/* Controls - only show if there are enough posts to scroll */}
              {recentPosts.length > 2 && (
                <>
                  <button
                    type="button"
                    aria-label="Scroll left"
                    onClick={() => scrollByAmount(-300)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-white/95 backdrop-blur-sm border border-gray-200/50 shadow-lg hover:bg-white hover:shadow-xl hover:scale-110 transition-all duration-300 ease-out opacity-0 group-hover:opacity-100"
                  >
                    <div className="flex items-center justify-center">
                      <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </div>
                  </button>
                  <button
                    type="button"
                    aria-label="Scroll right"
                    onClick={() => scrollByAmount(300)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-white/95 backdrop-blur-sm border border-gray-200/50 shadow-lg hover:bg-white hover:shadow-xl hover:scale-110 transition-all duration-300 ease-out opacity-0 group-hover:opacity-100"
                  >
                    <div className="flex items-center justify-center">
                      <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                </>
              )}

              <div
                ref={sliderRef}
                className="overflow-x-auto scrollbar-hide snap-x snap-mandatory scroll-smooth"
                style={{ scrollBehavior: 'smooth' }}
                onMouseEnter={() => (isHoveringRef.current = true)}
                onMouseLeave={() => {
                  isHoveringRef.current = false;
                  onDragEnd();
                }}
                onMouseDown={(e) => onDragStart(e.clientX)}
                onMouseMove={(e) => onDragMove(e.clientX)}
                onMouseUp={onDragEnd}
                onTouchStart={(e) => onDragStart(e.touches[0].clientX)}
                onTouchMove={(e) => onDragMove(e.touches[0].clientX)}
                onTouchEnd={onDragEnd}
              >
                <div className="flex gap-6 pr-4">
                  {recentPosts.map((rp: any, index: number) => (
                    <Link
                      key={rp.id}
                      to={`/blog/${rp.slug}`}
                      className="w-64 sm:w-72 flex-shrink-0 border border-gray-200/60 rounded-xl hover:shadow-xl hover:shadow-amber-100/50 hover:border-amber-200 transition-all duration-500 ease-out bg-white snap-start group transform hover:-translate-y-2 hover:scale-105"
                      style={{
                        animationDelay: `${index * 100}ms`,
                        animation: 'fadeInUp 0.6s ease-out forwards'
                      }}
                    >
                      {rp.featuredImage && (
                        <div className="w-full h-40 bg-gray-50 overflow-hidden rounded-t-xl">
                          <img
                            src={rp.featuredImage}
                            alt={rp.title}
                            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                      )}
                      <div className="p-5">
                        <div className="text-gray-900 font-semibold line-clamp-2 group-hover:text-amber-700 transition-colors duration-300 leading-tight">
                          {rp.title}
                        </div>
                        <div className="text-xs text-gray-500 mt-2 flex items-center">
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                          </svg>
                          {new Date(rp.publishedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                        <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                          <div className="flex items-center space-x-3">
                            <span className="flex items-center">
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              {rp.views || 0}
                            </span>
                            <span className="flex items-center">
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                              </svg>
                              {rp.likes || 0}
                            </span>
                            <span className="flex items-center">
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                              </svg>
                              {(rp._count?.comments) || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-500 mb-2">No other posts available</div>
              <Link
                to="/posts"
                className="inline-block bg-amber-700 text-white px-4 py-2 rounded-md hover:bg-amber-800 transition-colors"
              >
                View All Posts
              </Link>
            </div>
          )}
        </section>
      </article>
    </div>
  );
};

export default BlogPost;


