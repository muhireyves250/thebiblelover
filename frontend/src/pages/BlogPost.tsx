import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { blogAPI, authAPI, searchAPI } from '../services/api';
import { useFetch, useCachedFetch } from '../hooks/useAPI';
import { Heart, Eye, MessageCircle } from 'lucide-react';
import SEO from '../components/SEO';
import ShareButtons from '../components/ShareButtons';
import AudioReader from '../components/AudioReader';
import BibleReference from '../components/BibleReference';

const categoryLabel = (category?: string) => (category || 'Reflection').replace(/_/g, ' ');

const BlogPost: React.FC = () => {
  const { slug = '' } = useParams<{ slug: string }>();

  const { data, loading, error, refetch } = useCachedFetch<any>(
    slug ? `post:v1:${slug}` : null,
    () => blogAPI.getPost(slug),
    { ttl: 5 * 60 * 1000 }
  );
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

  {/*
    loading/error/not-found only take over the WHOLE page on the very first
    load (no post data yet). Once a post has been shown, navigating to a
    different post (e.g. a Recent Stories link) keeps the previous post's
    data on screen - including the sidebar - until the new post arrives,
    instead of blanking the entire page (sidebar included) on every
    navigation.
  */}
  if (loading && !post) {
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

  if (error && !post) {
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
          {loading ? (
            <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-6 md:p-8 mb-8 animate-pulse">
              <div className="h-5 w-24 bg-gray-200 rounded mb-4" />
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-4" />
              <div className="h-4 bg-gray-200 rounded w-full mb-2" />
              <div className="h-4 bg-gray-200 rounded w-5/6 mb-6" />
              <div className="w-1/2 h-64 md:h-80 bg-gray-200 rounded-lg float-left mr-6 mb-4" />
              <div className="h-4 bg-gray-200 rounded w-full mb-2" />
              <div className="h-4 bg-gray-200 rounded w-full mb-2" />
              <div className="h-4 bg-gray-200 rounded w-5/6 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-full mb-2" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
              <div className="clear-both" />
            </div>
          ) : (
          <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-6 md:p-8 mb-8">
            <span className="inline-block px-2.5 py-1 bg-amber-700 text-white text-[10px] font-black uppercase tracking-widest rounded mb-4">
              {categoryLabel(post.category)}
            </span>
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-gray-900 leading-tight mb-4">
              {post.title}
            </h1>

            <p className="text-gray-600 text-lg leading-relaxed mb-6">{post.excerpt}</p>

            <div className="mb-6">
              {post.featuredImage && (
                <div className="group relative float-left w-1/2 h-64 md:h-80 mr-6 md:mr-8 mb-4 rounded-lg overflow-hidden border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-300">
                  <img
                    src={post.featuredImage}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                    decoding="async"
                  />
                  <AudioReader content={post.content} title={post.title} compact />
                </div>
              )}

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

              <div className="clear-both" />
            </div>

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

              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-full text-sm text-gray-600">
                  <Eye className="w-4 h-4" /> {post.views}
                </span>
                <button
                  onClick={handleLike}
                  disabled={isLiking}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 border rounded-full text-sm transition-colors ${isLiked ? 'text-red-600 border-red-200 bg-red-50' : 'text-gray-600 border-gray-200 hover:bg-gray-50'} ${isLiking ? 'opacity-50 cursor-not-allowed' : ''}`}
                  aria-label={isLiked ? 'Unlike post' : 'Like post'}
                >
                  <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} /> Like &middot; {likeCount}
                </button>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-full text-sm text-gray-600">
                  <MessageCircle className="w-4 h-4" /> Comment &middot; {post._count?.comments ?? comments.length}
                </span>
                <ShareButtons title={post.title} />
              </div>
            </div>

            {/* Comments */}
            <section className="mt-8 pt-8 border-t border-gray-200">
              <div className="flex items-center gap-2 mb-6">
                <span className="w-1 h-4 bg-amber-700 rounded-sm" />
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">
                  Comments <span className="text-gray-400">&middot; {comments.length}</span>
                </h2>
              </div>

              <div className="space-y-3 mb-8">
                {comments.map((c: any) => (
                  <div key={c.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-sm font-bold shrink-0">
                        {c.authorName?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-bold text-gray-900">{c.authorName || 'Anonymous'}</span>
                          <span className="text-[11px] text-gray-400 shrink-0">{new Date(c.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="mt-1.5 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{c.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {comments.length === 0 && (
                  <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center text-gray-500 text-sm">No comments yet. Be the first to comment!</div>
                )}
              </div>

              <form onSubmit={submitComment} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="commentName" className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5">Name</label>
                    <input
                      id="commentName"
                      name="commentName"
                      type="text"
                      required
                      autoComplete="name"
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:border-amber-600 focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label htmlFor="commentEmail" className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5">Email</label>
                    <input
                      id="commentEmail"
                      name="commentEmail"
                      type="email"
                      required
                      autoComplete="email"
                      value={authorEmail}
                      onChange={(e) => setAuthorEmail(e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:border-amber-600 focus:outline-none transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="commentContent" className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5">Comment</label>
                  <textarea
                    id="commentContent"
                    name="commentContent"
                    rows={4}
                    required
                    autoComplete="off"
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:border-amber-600 focus:outline-none transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmittingComment}
                  className="px-6 py-2.5 bg-amber-700 text-white text-xs font-bold uppercase tracking-widest rounded-md hover:bg-amber-800 transition-colors disabled:opacity-50"
                >
                  {isSubmittingComment ? 'Posting…' : 'Post Comment'}
                </button>
              </form>
            </section>
          </div>
          )}
          </article>

          {/* Sidebar */}
          <aside className="lg:col-span-1 space-y-6 lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
            {/* Written By */}
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
