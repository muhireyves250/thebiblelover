import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Users, 
  MessageSquare, 
  Heart, 
  DollarSign, 
  Eye, 
  Plus, 
  Edit, 
  Trash2, 
  Mail,
  BookOpen,
  TrendingUp,
  Settings,
  Palette,
  ExternalLink
} from 'lucide-react';
import AddPostModal from '../components/AddPostModal';
import EditPostModal from '../components/EditPostModal';
import BackgroundSettingsModal from '../components/BackgroundSettingsModal';
import LogoSettingsModal from '../components/LogoSettingsModal';
import SocialSettingsModal from '../components/SocialSettingsModal';
import { useBackgroundSettings } from '../hooks/useBackgroundSettings';
import { useLogoSettings } from '../hooks/useLogoSettings';
import { useSocialSettings } from '../hooks/useSocialSettings';
import { getStorageInfo, clearAllBlogData, cleanupOldStorage } from '../utils/storageManager';

interface DashboardStats {
  totalPosts: number;
  totalComments: number;
  totalLikes: number;
  totalViews: number;
  totalDonations: number;
  recentMessages: number;
}

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  author: string;
  date: string;
  views: number;
  likes: number;
  comments: number;
}

interface Comment {
  id: string;
  postSlug: string;
  content: string;
  timestamp: string;
}

interface Donation {
  id: string;
  amount: number;
  timestamp: string;
}

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  timestamp: string;
}

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isAddPostModalOpen, setIsAddPostModalOpen] = useState(false);
  const [isEditPostModalOpen, setIsEditPostModalOpen] = useState(false);
  const [isBackgroundModalOpen, setIsBackgroundModalOpen] = useState(false);
  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);
  const [isSocialModalOpen, setIsSocialModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [deleteConfirmPost, setDeleteConfirmPost] = useState<any>(null);
  const [storageInfo, setStorageInfo] = useState<any>(null);
  
  const { backgroundSettings, saveBackgroundSettings } = useBackgroundSettings();
  const { logoSettings, saveLogoSettings } = useLogoSettings();
  const { socialSettings, saveSocialSettings } = useSocialSettings();
  const [stats, setStats] = useState<DashboardStats>({
    totalPosts: 0,
    totalComments: 0,
    totalLikes: 0,
    totalViews: 0,
    totalDonations: 0,
    recentMessages: 0
  });

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);

  useEffect(() => {
    loadDashboardData();
    updateStorageInfo();
  }, []);

  const updateStorageInfo = () => {
    setStorageInfo(getStorageInfo());
  };

  const handleCleanupStorage = () => {
    // No automatic cleanup - user must manually clear data if needed
    alert('No automatic cleanup is performed. Use "Clear All Data" if you need to free up space.');
  };

  const handleClearAllData = () => {
    if (window.confirm('Are you sure you want to clear all blog data? This action cannot be undone.')) {
      clearAllBlogData();
      loadDashboardData();
      updateStorageInfo();
      alert('All blog data has been cleared!');
    }
  };

  const loadDashboardData = () => {
    // Load posts data from localStorage or sessionStorage backup
    let savedPosts = [];
    try {
      savedPosts = JSON.parse(localStorage.getItem('blogPosts') || '[]');
    } catch (error) {
      // If localStorage fails, try sessionStorage backup
      try {
        savedPosts = JSON.parse(sessionStorage.getItem('blogPosts_backup') || '[]');
        console.log('Loaded posts from sessionStorage backup');
      } catch (sessionError) {
        console.error('Both localStorage and sessionStorage failed:', sessionError);
        savedPosts = [];
      }
    }
    
    // Default posts if none exist
    const defaultPosts: BlogPost[] = [
      {
        id: '1',
        title: 'How reading changes your perspective',
        slug: 'how-reading-changes-your-perspective',
        author: 'Admin',
        date: 'Mar 22, 2023',
        views: Number(localStorage.getItem('post:how-reading-changes-your-perspective:views') || '1547'),
        likes: Number(localStorage.getItem('post:how-reading-changes-your-perspective:likes') || '37'),
        comments: JSON.parse(localStorage.getItem('post:how-reading-changes-your-perspective:comments') || '[]').length
      },
      {
        id: '2',
        title: '8 must-read books',
        slug: '8-must-read-books',
        author: 'Admin',
        date: 'Mar 22, 2023',
        views: Number(localStorage.getItem('post:8-must-read-books:views') || '358'),
        likes: Number(localStorage.getItem('post:8-must-read-books:likes') || '22'),
        comments: JSON.parse(localStorage.getItem('post:8-must-read-books:comments') || '[]').length
      }
    ];

    // Use saved posts or default posts
    const postsData = savedPosts.length > 0 ? savedPosts.map((post: any) => ({
      ...post,
      views: Number(localStorage.getItem(`post:${post.slug}:views`) || post.views || '0'),
      likes: Number(localStorage.getItem(`post:${post.slug}:likes`) || post.likes || '0'),
      comments: JSON.parse(localStorage.getItem(`post:${post.slug}:comments`) || '[]').length
    })) : defaultPosts;

    // Load comments from all posts
    const allComments: Comment[] = [];
    postsData.forEach(post => {
      const postComments = JSON.parse(localStorage.getItem(`post:${post.slug}:comments`) || '[]');
      postComments.forEach((comment: string, index: number) => {
        allComments.push({
          id: `${post.slug}-${index}`,
          postSlug: post.slug,
          content: comment,
          timestamp: new Date().toISOString()
        });
      });
    });

    // Load donations from localStorage or sessionStorage backup
    let donationsData = [];
    try {
      donationsData = JSON.parse(localStorage.getItem('donations') || '[]');
    } catch (error) {
      try {
        donationsData = JSON.parse(sessionStorage.getItem('donations_backup') || '[]');
        console.log('Loaded donations from sessionStorage backup');
      } catch (sessionError) {
        console.error('Both localStorage and sessionStorage failed for donations:', sessionError);
        donationsData = [];
      }
    }

    // Load contact messages
    const messagesData = JSON.parse(localStorage.getItem('contactMessages') || '[]');

    setPosts(postsData);
    setComments(allComments);
    setDonations(donationsData);
    setMessages(messagesData);

    // Calculate stats
    const totalViews = postsData.reduce((sum, post) => sum + post.views, 0);
    const totalLikes = postsData.reduce((sum, post) => sum + post.likes, 0);
    const totalComments = allComments.length;
    const totalDonations = donationsData.reduce((sum: number, donation: Donation) => sum + donation.amount, 0);

    setStats({
      totalPosts: postsData.length,
      totalComments,
      totalLikes,
      totalViews,
      totalDonations,
      recentMessages: messagesData.length
    });
  };

  const handleSavePost = (newPost: any) => {
    loadDashboardData(); // Refresh the dashboard data
  };

  const handleEditPost = (post: any) => {
    setSelectedPost(post);
    setIsEditPostModalOpen(true);
  };

  const handleUpdatePost = (updatedPost: any) => {
    console.log('Post updated successfully:', updatedPost);
    loadDashboardData(); // Refresh the dashboard data
    // Show success message
    alert(`Post "${updatedPost.title}" has been updated successfully!`);
  };

  const handleDeletePost = (post: any) => {
    setDeleteConfirmPost(post);
  };

  const confirmDeletePost = () => {
    if (deleteConfirmPost) {
      // Remove from localStorage
      const existingPosts = JSON.parse(localStorage.getItem('blogPosts') || '[]');
      const updatedPosts = existingPosts.filter((p: any) => p.id !== deleteConfirmPost.id);
      localStorage.setItem('blogPosts', JSON.stringify(updatedPosts));

      // Remove associated data
      localStorage.removeItem(`post:${deleteConfirmPost.slug}:views`);
      localStorage.removeItem(`post:${deleteConfirmPost.slug}:likes`);
      localStorage.removeItem(`post:${deleteConfirmPost.slug}:comments`);

      loadDashboardData();
      setDeleteConfirmPost(null);
    }
  };

  const deleteComment = (commentId: string) => {
    const comment = comments.find(c => c.id === commentId);
    if (comment) {
      const postComments = JSON.parse(localStorage.getItem(`post:${comment.postSlug}:comments`) || '[]');
      const updatedComments = postComments.filter((_: any, index: number) => `${comment.postSlug}-${index}` !== commentId);
      localStorage.setItem(`post:${comment.postSlug}:comments`, JSON.stringify(updatedComments));
      loadDashboardData();
    }
  };

  const deleteMessage = (messageId: string) => {
    const updatedMessages = messages.filter(m => m.id !== messageId);
    localStorage.setItem('contactMessages', JSON.stringify(updatedMessages));
    setMessages(updatedMessages);
    setStats(prev => ({ ...prev, recentMessages: updatedMessages.length }));
  };

  const handleSaveBackground = (backgroundData: any) => {
    saveBackgroundSettings(backgroundData);
  };

  const handleSaveLogo = (logoData: any) => {
    saveLogoSettings(logoData);
  };

  const handleSaveSocial = (socialData: any) => {
    saveSocialSettings(socialData);
  };

  const StatCard = ({ title, value, icon: Icon, color }: { title: string; value: number | string; icon: any; color: string }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600">Manage your website content and analytics</p>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setIsBackgroundModalOpen(true)}
                  className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                  title="Change Background"
                >
                  <Palette className="h-4 w-4" />
                  <span className="text-sm">Background</span>
                </button>
                <button
                  onClick={() => setIsLogoModalOpen(true)}
                  className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                  title="Change Logo"
                >
                  <Settings className="h-4 w-4" />
                  <span className="text-sm">Logo</span>
                </button>
                <button
                  onClick={() => setIsSocialModalOpen(true)}
                  className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                  title="Social Media Links"
                >
                  <Users className="h-4 w-4" />
                  <span className="text-sm">Social</span>
                </button>
                <div className="flex items-center space-x-2">
                  {logoSettings.logoUrl && logoSettings.showText ? (
                    <div className="flex items-center space-x-2">
                      <img
                        src={logoSettings.logoUrl}
                        alt="Logo"
                        className="w-8 h-8 object-contain"
                      />
                      <span className="text-lg font-serif text-gray-900">{logoSettings.logoText}</span>
                    </div>
                  ) : logoSettings.logoUrl ? (
                    <img
                      src={logoSettings.logoUrl}
                      alt="Logo"
                      className="h-8 object-contain"
                    />
                  ) : (
                    <>
                      <div className="w-8 h-8 bg-amber-700 rounded flex items-center justify-center">
                        <span className="text-white font-bold text-sm">T</span>
                      </div>
                      <span className="text-lg font-serif text-gray-900">{logoSettings.logoText}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'posts', label: 'Posts', icon: BookOpen },
              { id: 'comments', label: 'Comments', icon: MessageSquare },
              { id: 'donations', label: 'Donations', icon: DollarSign },
              { id: 'messages', label: 'Messages', icon: Mail },
              { id: 'storage', label: 'Storage', icon: Settings }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === id
                    ? 'border-amber-500 text-amber-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <StatCard
                title="Total Posts"
                value={stats.totalPosts}
                icon={BookOpen}
                color="bg-blue-500"
              />
              <StatCard
                title="Total Views"
                value={stats.totalViews.toLocaleString()}
                icon={Eye}
                color="bg-green-500"
              />
              <StatCard
                title="Total Likes"
                value={stats.totalLikes}
                icon={Heart}
                color="bg-red-500"
              />
              <StatCard
                title="Total Comments"
                value={stats.totalComments}
                icon={MessageSquare}
                color="bg-purple-500"
              />
              <StatCard
                title="Total Donations"
                value={`$${stats.totalDonations}`}
                icon={DollarSign}
                color="bg-amber-500"
              />
              <StatCard
                title="New Messages"
                value={stats.recentMessages}
                icon={Mail}
                color="bg-indigo-500"
              />
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {comments.slice(0, 5).map((comment) => (
                  <div key={comment.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <MessageSquare className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{comment.content}</p>
                      <p className="text-xs text-gray-500 mt-1">Post: {comment.postSlug}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Posts Tab */}
        {activeTab === 'posts' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Blog Posts</h3>
                <button 
                  onClick={() => setIsAddPostModalOpen(true)}
                  className="flex items-center space-x-2 bg-amber-700 text-white px-4 py-2 rounded-md hover:bg-amber-800 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>New Post</span>
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Views</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Likes</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comments</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {posts.map((post) => (
                    <tr key={post.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{post.title}</div>
                        <div className="text-sm text-gray-500">{post.date}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{post.author}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{post.views}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{post.likes}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{post.comments}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => window.open(`/blog/${post.slug}`, '_blank')}
                            className="text-blue-600 hover:text-blue-900 p-1"
                            title="Preview post"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleEditPost(post)}
                            className="text-amber-600 hover:text-amber-900 p-1"
                            title="Edit post"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDeletePost(post)}
                            className="text-red-600 hover:text-red-900 p-1"
                            title="Delete post"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Comments Tab */}
        {activeTab === 'comments' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Comments Management</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 mb-2">{comment.content}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>Post: {comment.postSlug}</span>
                          <span>{new Date(comment.timestamp).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteComment(comment.id)}
                        className="text-red-600 hover:text-red-900 p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {comments.length === 0 && (
                  <p className="text-gray-500 text-center py-8">No comments yet</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Donations Tab */}
        {activeTab === 'donations' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Donations</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <DollarSign className="h-8 w-8 text-green-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-800">Total Raised</p>
                      <p className="text-2xl font-bold text-green-900">${stats.totalDonations}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <TrendingUp className="h-8 w-8 text-blue-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-blue-800">Total Donations</p>
                      <p className="text-2xl font-bold text-blue-900">{donations.length}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <BarChart3 className="h-8 w-8 text-purple-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-purple-800">Average</p>
                      <p className="text-2xl font-bold text-purple-900">
                        ${donations.length > 0 ? Math.round(stats.totalDonations / donations.length) : 0}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                {donations.map((donation) => (
                  <div key={donation.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-lg font-medium text-gray-900">${donation.amount}</p>
                        <p className="text-sm text-gray-500">{new Date(donation.timestamp).toLocaleDateString()}</p>
                      </div>
                      <div className="text-green-600">
                        <DollarSign className="h-6 w-6" />
                      </div>
                    </div>
                  </div>
                ))}
                {donations.length === 0 && (
                  <p className="text-gray-500 text-center py-8">No donations yet</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Contact Messages</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{message.name}</h4>
                        <p className="text-sm text-gray-500">{message.email}</p>
                      </div>
                      <button
                        onClick={() => deleteMessage(message.id)}
                        className="text-red-600 hover:text-red-900 p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mb-2">
                      <p className="text-sm font-medium text-gray-700">Subject: {message.subject}</p>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{message.message}</p>
                    <p className="text-xs text-gray-400">{new Date(message.timestamp).toLocaleDateString()}</p>
                  </div>
                ))}
                {messages.length === 0 && (
                  <p className="text-gray-500 text-center py-8">No messages yet</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Storage Management Tab */}
        {activeTab === 'storage' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Storage Management</h3>
              <p className="text-sm text-gray-600 mt-1">Manage your website's localStorage data and prevent quota exceeded errors. <strong>Your blog posts are never automatically deleted.</strong></p>
            </div>
            <div className="p-6">
              {storageInfo && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <Settings className="h-8 w-8 text-blue-600" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-blue-800">Total Keys</p>
                        <p className="text-2xl font-bold text-blue-900">{storageInfo.totalKeys}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <TrendingUp className="h-8 w-8 text-green-600" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-green-800">Storage Used</p>
                        <p className="text-2xl font-bold text-green-900">{storageInfo.totalSizeMB} MB</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className={`p-4 rounded-lg ${storageInfo.isNearLimit ? 'bg-red-50' : 'bg-gray-50'}`}>
                    <div className="flex items-center">
                      <div className={`h-8 w-8 ${storageInfo.isNearLimit ? 'text-red-600' : 'text-gray-600'}`}>
                        {storageInfo.isNearLimit ? '⚠️' : '✅'}
                      </div>
                      <div className="ml-3">
                        <p className={`text-sm font-medium ${storageInfo.isNearLimit ? 'text-red-800' : 'text-gray-800'}`}>
                          Status
                        </p>
                        <p className={`text-lg font-bold ${storageInfo.isNearLimit ? 'text-red-900' : 'text-gray-900'}`}>
                          {storageInfo.isNearLimit ? 'Near Limit' : 'Healthy'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-green-800 mb-2">Storage Status</h4>
                  <p className="text-sm text-green-700 mb-3">
                    <strong>No automatic cleanup is performed.</strong> All your data (posts, comments, likes, views) is preserved. Nothing is removed automatically.
                  </p>
                  <button
                    onClick={handleCleanupStorage}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                  >
                    Check Status
                  </button>
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-orange-800 mb-2">Storage Quota Management</h4>
                  <p className="text-sm text-orange-700 mb-3">
                    If you get "quota exceeded" errors, your posts will be automatically saved to temporary storage. Create a backup and clear some data to continue using permanent storage.
                  </p>
                  <div className="text-xs text-orange-600">
                    <strong>Note:</strong> Temporary storage (sessionStorage) is cleared when you close your browser. Always create backups!
                  </div>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-red-800 mb-2">Clear All Data</h4>
                  <p className="text-sm text-red-700 mb-3">
                    <strong>Warning:</strong> This will permanently delete all blog posts, comments, likes, views, donations, and messages. This action cannot be undone.
                  </p>
                  <button
                    onClick={handleClearAllData}
                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                  >
                    Clear All Data
                  </button>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-800 mb-2">Refresh Storage Info</h4>
                  <p className="text-sm text-blue-700 mb-3">
                    Update the storage information displayed above.
                  </p>
                  <button
                    onClick={updateStorageInfo}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Refresh Info
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Post Modal */}
      <AddPostModal
        isOpen={isAddPostModalOpen}
        onClose={() => setIsAddPostModalOpen(false)}
        onSave={handleSavePost}
      />

      {/* Edit Post Modal */}
      <EditPostModal
        isOpen={isEditPostModalOpen}
        onClose={() => setIsEditPostModalOpen(false)}
        onSave={handleUpdatePost}
        post={selectedPost}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirmPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Post</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{deleteConfirmPost.title}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setDeleteConfirmPost(null)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeletePost}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Background Settings Modal */}
      <BackgroundSettingsModal
        isOpen={isBackgroundModalOpen}
        onClose={() => setIsBackgroundModalOpen(false)}
        onSave={handleSaveBackground}
        currentBackground={backgroundSettings?.imageUrl}
      />

      {/* Logo Settings Modal */}
      <LogoSettingsModal
        isOpen={isLogoModalOpen}
        onClose={() => setIsLogoModalOpen(false)}
        onSave={handleSaveLogo}
        currentLogo={logoSettings?.logoUrl}
      />

      {/* Social Settings Modal */}
      <SocialSettingsModal
        isOpen={isSocialModalOpen}
        onClose={() => setIsSocialModalOpen(false)}
        onSave={handleSaveSocial}
      />
    </div>
  );
};

export default Dashboard;
