import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { User as UserIcon, Church, ShieldCheck, BookOpen } from 'lucide-react';
import { blogAPI } from '../services/api';
import BlogCard from '../components/BlogCard';
import SEO from '../components/SEO';
import AutoText from '../components/AutoText';

interface AuthorData {
  id: string;
  name: string;
  profileImage?: string;
  role: string;
}

const ROLE_LABEL: Record<string, { label: string; icon: React.ElementType }> = {
  ADMIN: { label: 'Admin', icon: ShieldCheck },
  PASTOR: { label: 'Pastor', icon: Church },
};

const AuthorProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [author, setAuthor] = useState<AuthorData | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setNotFound(false);
    blogAPI.getAuthor(id, { page: 1, limit: 24 })
      .then((response) => {
        if (response.success && response.data) {
          setAuthor(response.data.author);
          setPosts(response.data.posts || []);
        } else {
          setNotFound(true);
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <section className="py-3 md:py-20 bg-white dark:bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 md:border md:border-gray-300 md:dark:border-white/10 md:rounded-lg md:p-8 animate-pulse">
          <div className="flex items-center gap-4 mb-6 md:mb-10">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gray-200 dark:bg-white/10 shrink-0" />
            <div className="space-y-2">
              <div className="h-5 md:h-6 w-40 md:w-48 bg-gray-200 dark:bg-white/10 rounded-md" />
              <div className="h-4 w-20 md:w-24 bg-gray-200 dark:bg-white/10 rounded-md" />
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-56 md:h-72 bg-gray-100 dark:bg-white/5 rounded-lg" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (notFound || !author) {
    return (
      <section className="py-3 md:py-20 bg-white dark:bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 md:border md:border-gray-300 md:dark:border-white/10 md:rounded-lg md:p-8">
          <div className="text-center py-16">
            <AutoText as="h1" className="text-xl font-black uppercase tracking-tight text-gray-900 dark:text-white mb-2">Author Not Found</AutoText>
            <AutoText as="p" className="text-gray-500 dark:text-gray-400 mb-6">This profile doesn't exist or isn't public.</AutoText>
            <Link to="/posts" className="text-amber-700 font-bold text-sm uppercase tracking-widest hover:text-amber-800">Back to Posts</Link>
          </div>
        </div>
      </section>
    );
  }

  const roleInfo = ROLE_LABEL[author.role];
  const RoleIcon = roleInfo?.icon;

  return (
    <section className="py-3 md:py-20 bg-white dark:bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 md:border md:border-gray-300 md:dark:border-white/10 md:rounded-lg md:p-8">
        <SEO title={author.name} description={`Posts written by ${author.name} on The Bible Lover.`} />

        <div className="flex items-center gap-4 mb-6 md:mb-10 pb-6 md:pb-8 border-b border-gray-200 dark:border-white/10">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-amber-100 dark:bg-amber-900/20 overflow-hidden flex items-center justify-center shrink-0">
            {author.profileImage ? (
              <img src={author.profileImage} alt={author.name} className="w-full h-full object-cover" />
            ) : (
              <UserIcon className="w-8 h-8 md:w-9 md:h-9 text-amber-700" />
            )}
          </div>
          <div>
            <h1 className="text-xl md:text-3xl font-black uppercase tracking-tight text-gray-900 dark:text-white">{author.name}</h1>
            {roleInfo && (
              <span className="inline-flex items-center gap-1.5 mt-1.5 px-3 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-[10px] font-black rounded-md uppercase tracking-widest border border-amber-200 dark:border-amber-800">
                {RoleIcon && <RoleIcon className="h-3.5 w-3.5" />}
                {roleInfo.label}
              </span>
            )}
          </div>
        </div>

        <AutoText as="h2" className="text-sm tracking-widest uppercase text-gray-500 dark:text-gray-400 mb-3 md:mb-8">
          {`Posts by ${author.name}`}
        </AutoText>

        {posts.length === 0 ? (
          <div className="bg-white dark:bg-[#141417] border border-dashed border-gray-300 dark:border-white/20 rounded-lg p-16 text-center">
            <BookOpen className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <AutoText as="p" className="text-sm font-bold text-gray-500 dark:text-gray-400">No published posts yet.</AutoText>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8">
            {posts.map((post) => (
              <BlogCard
                key={post.id}
                {...post}
                publishedAt={post.publishedAt || new Date().toISOString()}
                author={{ name: author.name, profileImage: author.profileImage }}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default AuthorProfile;
