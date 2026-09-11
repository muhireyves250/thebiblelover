import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { blogAPI, authAPI, searchAPI } from '../services/api';
import { useFetch } from '../hooks/useAPI';
import { Heart, Eye, MessageCircle } from 'lucide-react';
import SEO from '../components/SEO';
import ShareButtons from '../components/ShareButtons';
import AudioReader from '../components/AudioReader';
import BibleReference from '../components/BibleReference';

const categoryLabel = (category?: string) => (category || 'Reflection').replace(/_/g, ' ');

const BlogPost: React.FC = () => {
  const { slug = '' } = useParams<{ slug: string }>();

  const { data, loading, error, refetch } = useFetch<any>(() => blogAPI.getPost(slug), [slug]);
  const post = data?.data?.post || data?.post;

  useEffect(() => {
    if (post?.id && post?.title) {
      searchAPI.recordHistory({
        type: 'POST',
        itemId: post.id,
        title: post.title,
        link: `/blog/${post.slug}`
      }).catch(() => { });
    }
  }, [post?.id, post?.title, post?.slug]);

  // Recent stories (sidebar list)
  const { data: recentData } = useFetch<any>(() => blogAPI.getPosts({ page: 1, limit: 11 }), []);
  const recentPosts = (recentData?.data?.posts || recentData?.posts || []).filter((p: any) => p.slug !== slug).slice(0, 10);

  // Comments
  const { data: commentsData, refetch: refetchComments } = useFetch<any>(
    () => (post?.id ? blogAPI.getComments(post.id) : Promise.resolve({ success: true, data: { comments: [] } })),
    [post?.id]
  );
  const comments = commentsData?.data?.comments || commentsData?.comments || [];

  // Like state
  const [isLiking, setIsLiking] = useState<boolean>(false);
  const [likeCount, setLikeCount] = useState<number>(post?.likes || 0);
  const [isLiked, setIsLiked] = useState<boolean>(() => {
    if (!post?.id) return false;
    return localStorage.getItem(`liked:${post.id}`) === '1';
  });

  useEffect(() => {
    if (post?.likes !== undefined) setLikeCount(post.likes);
  }, [post?.likes]);

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse space-y-4 max-w-3xl">
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
      {post && (
        <SEO
          title={post.title}
          description={post.excerpt}
          image={post.featuredImage}
          type="article"
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Breadcrumb */}
        <nav className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-6">
          <Link to="/" className="hover:text-amber-700 transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/posts" className="hover:text-amber-700 transition-colors">Blog</Link>
          <span className="mx-2">/</span>
          <span className="text-amber-700">{categoryLabel(post.category)}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main column */}
          <article className="lg:col-span-2">
            <span className="inline-block px-2.5 py-1 bg-amber-700 text-white text-[10px] font-black uppercase tracking-widest rounded mb-4">
              {categoryLabel(post.category)}
            </span>
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-gray-900 leading-tight mb-4">
              {post.title}
            </h1>

            {post.featuredImage ? (
              <div className="mb-6">
                <div className="group relative float-left w-1/2 h-64 md:h-80 mr-6 md:mr-8 mb-4 rounded-lg overflow-hidden border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-300">
                  <img
                    src={post.featuredImage}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <p className="text-gray-600 text-lg leading-relaxed">{post.excerpt}</p>
                <div className="clear-both" />
              </div>
            ) : (
              <div className="mb-6">
                <p className="text-gray-600 text-lg leading-relaxed">{post.excerpt}</p>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gray-200 rounded-full overflow-hidden flex items-center justify-center shrink-0">
                  {post.author?.profileImage ? (
                    <img src={post.author.profileImage} alt={post.author?.name || 'Author'} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                  ) : (
                    <span className="text-xs font-bold text-gray-600">
                      {(post.author?.name || 'A').charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="text-sm">
                  <p className="font-bold text-gray-900">{post.author?.name || 'Unknown author'}</p>
                  <p className="text-gray-500">{formattedDate} &middot; {post.readTime} min read</p>
                </div>
              </div>
              <ShareButtons title={post.title} />
            </div>

            <AudioReader content={post.content} title={post.title} />

            <section className="prose prose-amber max-w-none relative">
              {post.isPremium && !authAPI.isAuthenticated() ? (
                <div className="relative">
                  <div className="blur-sm select-none pointer-events-none opacity-50">
                    {post.excerpt}
                    <div className="h-40"></div>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 top-0 flex flex-col items-center justify-center bg-gradient-to-t from-white via-white/80 to-transparent pt-20 pb-10 text-center">
                    <div className="bg-white p-8 rounded-2xl shadow-2xl border border-amber-100 max-w-md mx-auto transform hover:scale-105 transition-transform duration-300">
                      <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <h3 className="text-2xl font-serif text-gray-900 mb-3">Premium Content</h3>
                      <p className="text-gray-700 mb-8 leading-relaxed">
                        This deep dive is exclusive to our community members. Join us today to unlock full access to this and all other premium reflections.
                      </p>
                      <div className="flex flex-col space-y-3">
                        <Link
                          to="/register"
                          className="w-full py-4 bg-amber-700 text-white rounded-xl font-bold hover:bg-amber-800 transition-all shadow-lg hover:shadow-amber-700/30"
                        >
                          Create Free Account
                        </Link>
                        <Link
                          to="/login"
                          className="w-full py-3 text-amber-700 font-semibold hover:text-amber-800 transition-colors"
                        >
                          Already a member? Log In
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <BibleReference>
                  {/<[a-z][\s\S]*>/i.test(post.content) ? (
                    <div dangerouslySetInnerHTML={{ __html: post.content }} />
                  ) : (
                    <div
                      className="text-gray-800 whitespace-pre-wrap leading-relaxed space-y-4 prose prose-amber max-w-none"
                      dangerouslySetInnerHTML={{
                        __html: post.content
                          .replace(/^###\s+(.+)$/gm, '<h4 class="text-lg font-bold text-gray-900 mt-6 mb-2">$1</h4>')
                          .replace(/^##\s+(.+)$/gm, '<h3 class="text-xl font-serif text-gray-900 mt-8 mb-3">$1</h3>')
                          .replace(/^#\s+(.+)$/gm, '<h2 class="text-2xl font-serif text-gray-900 mt-10 mb-4">$1</h2>')
                          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      }}
                    />
                  )}
                </BibleReference>
              )}
            </section>

            {/* Metrics under content */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <span className="inline-flex items-center gap-1.5"><Eye className="w-4 h-4" /> {post.views}</span>
                <span className="inline-flex items-center gap-1.5"><Heart className="w-4 h-4" /> {likeCount}</span>
                <span className="inline-flex items-center gap-1.5"><MessageCircle className="w-4 h-4" /> {post._count?.comments ?? comments.length}</span>
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
                          <div className="text-xs text-gray-500">{new Date(c.createdAt).toLocaleDateString()}</div>
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
          </article>

          {/* Sidebar */}
          <aside className="lg:col-span-1 space-y-6">
            {/* Story Details */}
            <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-5">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-amber-700 mb-4">Story Details</h3>
              <dl className="space-y-3 text-sm">
                {[
                  ['Category', categoryLabel(post.category)],
                  ['Published', formattedDate],
                  ['Reading time', `${post.readTime} min read`],
                  ['Views', post.views],
                  ['Likes', likeCount],
                  ['Comments', post._count?.comments ?? comments.length]
                ].map(([label, value]) => (
                  <div key={label as string} className="flex items-center justify-between pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                    <dt className="text-gray-500">{label}</dt>
                    <dd className="font-bold text-gray-900">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Reported By */}
            <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-5">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-amber-700 mb-4">Written By</h3>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-amber-100 rounded-full overflow-hidden flex items-center justify-center shrink-0">
                  {post.author?.profileImage ? (
                    <img src={post.author.profileImage} alt={post.author?.name || 'Author'} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <span className="text-sm font-bold text-amber-800">{(post.author?.name || 'A').charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{post.author?.name || 'Unknown author'}</p>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">The Bible Lover Author</p>
                </div>
              </div>
            </div>

            {/* Recent Stories */}
            {recentPosts.length > 0 && (
              <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">Recent Stories</h3>
                  <Link to="/posts" className="text-[10px] font-bold text-amber-700 uppercase tracking-widest hover:text-amber-800 transition-colors">
                    Read Latest News &rarr;
                  </Link>
                </div>
                <div className="space-y-4">
                  {recentPosts.map((rp: any) => (
                    <Link key={rp.id} to={`/blog/${rp.slug}`} className="flex items-start gap-3 group">
                      {rp.featuredImage && (
                        <div className="w-16 h-16 rounded-md overflow-hidden bg-gray-100 shrink-0">
                          <img src={rp.featuredImage} alt={rp.title} className="w-full h-full object-cover" loading="lazy" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <span className="block text-[10px] font-black uppercase tracking-widest text-amber-700 mb-0.5">
                          {categoryLabel(rp.category)}
                        </span>
                        <p className="text-sm font-bold text-gray-900 leading-snug line-clamp-2 group-hover:text-amber-700 transition-colors">
                          {rp.title}
                        </p>
                        <div className="flex items-center justify-between mt-1.5">
                          <span className="text-[11px] text-gray-400">
                            {new Date(rp.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                          <span className="text-[11px] text-gray-400">
                            {rp.views || 0} &middot; {rp.likes || 0} &middot; {rp._count?.comments ?? 0}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
};

export default BlogPost;
