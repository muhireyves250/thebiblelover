import { useState, useEffect } from 'react';
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
  ExternalLink,
  Search,
  Bell,
  ChevronDown,
  CreditCard,
  HardDrive,
  Image,
  Share2,
  LogOut,
  Layout,
  MessageCircle
} from 'lucide-react';
import AddPostModal from '../components/AddPostModal';
import EditPostModal from '../components/EditPostModal';
import BackgroundSettingsModal from '../components/BackgroundSettingsModal';
import LogoSettingsModal from '../components/LogoSettingsModal';
import SocialSettingsModal from '../components/SocialSettingsModal';
import BibleVerseManager from '../components/BibleVerseManager';
import ContentSettingsModal from '../components/ContentSettingsModal';
import WhatsAppSettingsModal from '../components/WhatsAppSettingsModal';
import FooterSettingsModal from '../components/FooterSettingsModal';
import { useBackgroundSettings } from '../hooks/useBackgroundSettings';
import { useLogoSettings } from '../hooks/useLogoSettings';
import { useSocialSettings } from '../hooks/useSocialSettings';
import { getStorageInfo, clearAllBlogData } from '../utils/storageManager';
// @ts-ignore
import { blogAPI, contactAPI, donationsAPI } from '../services/api';
// @ts-ignore
import { useAuth } from '../hooks/useAPI';
import { useContentSettings } from '../hooks/useContentSettings';

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
  authorName: string;
  authorEmail: string;
  isApproved: boolean;
}

interface Donation {
  id: string;
  amount: number;
  timestamp: string;
  donorName?: string;
  email?: string;
  message?: string;
  status?: string;
  paymentMethod?: string;
  currency?: string;
  isAnonymous?: boolean;
}

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  timestamp: string;
  isRead?: boolean;
  status?: string;
}

const Dashboard = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [settingsDropdownOpen, setSettingsDropdownOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showAddPostConfirm, setShowAddPostConfirm] = useState(false);
  const [showEditPostConfirm, setShowEditPostConfirm] = useState(false);
  const [showEditSuccessModal, setShowEditSuccessModal] = useState(false);
  const [showAddPostSuccessModal, setShowAddPostSuccessModal] = useState(false);
  const [showDeleteSuccessModal, setShowDeleteSuccessModal] = useState(false);
  const [deletedPostTitle, setDeletedPostTitle] = useState('');
  const [showAllComments, setShowAllComments] = useState(false);
  const [showAllDonations, setShowAllDonations] = useState(false);
  const [showAllMessages, setShowAllMessages] = useState(false);
  const [showDeleteDonationModal, setShowDeleteDonationModal] = useState(false);
  const [donationToDelete, setDonationToDelete] = useState<Donation | null>(null);
  const [showDeleteDonationSuccess, setShowDeleteDonationSuccess] = useState(false);
  const [deletedDonationDetails, setDeletedDonationDetails] = useState<{ donorName: string, amount: number } | null>(null);
  const [showDeleteCommentSuccess, setShowDeleteCommentSuccess] = useState(false);
  const [deletedCommentDetails, setDeletedCommentDetails] = useState<{ authorName: string, content: string } | null>(null);
  const [showDeleteMessageSuccess, setShowDeleteMessageSuccess] = useState(false);
  const [deletedMessageDetails, setDeletedMessageDetails] = useState<{ senderName: string, subject: string } | null>(null);
  const [expandedMessages, setExpandedMessages] = useState<Set<string>>(new Set());
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [isLoadingEditPost, setIsLoadingEditPost] = useState(false);
  const [isAddPostModalOpen, setIsAddPostModalOpen] = useState(false);
  const [isEditPostModalOpen, setIsEditPostModalOpen] = useState(false);
  const [isBackgroundModalOpen, setIsBackgroundModalOpen] = useState(false);
  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);
  const [isSocialModalOpen, setIsSocialModalOpen] = useState(false);
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [isFooterModalOpen, setIsFooterModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [deleteConfirmPost, setDeleteConfirmPost] = useState<any>(null);
  const [storageInfo, setStorageInfo] = useState<any>(null);

  const { backgroundSettings, saveBackgroundSettings } = useBackgroundSettings();
  const { settings: contentSettings, saveSection } = useContentSettings();
  const { logoSettings, saveLogoSettings } = useLogoSettings();
  const { saveSocialSettings } = useSocialSettings();
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
    console.log('Dashboard useEffect - isAuthenticated:', isAuthenticated, 'user:', user);

    // Set loading to false after a short delay to prevent rapid re-renders
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);

    if (isAuthenticated) {
      loadDashboardData();
    }
    updateStorageInfo();

    return () => clearTimeout(timer);
  }, [isAuthenticated]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsDropdownOpen && !(event.target as Element).closest('.settings-dropdown')) {
        setSettingsDropdownOpen(false);
      }
      if (showUserDropdown && !(event.target as Element).closest('.user-dropdown')) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [settingsDropdownOpen, showUserDropdown]);

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

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    logout();
    setShowLogoutConfirm(false);
    // Redirect to login page
    window.location.href = '/login';
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  const toggleUserDropdown = () => {
    setShowUserDropdown(!showUserDropdown);
  };

  const confirmAddPost = () => {
    setShowAddPostConfirm(false);
    setIsAddPostModalOpen(true);
  };

  const cancelAddPost = () => {
    setShowAddPostConfirm(false);
  };

  const confirmEditPost = async () => {
    setShowEditPostConfirm(false);
    setIsLoadingEditPost(true);

    if (selectedPost) {
      try {
        // Fetch the complete post data from the server using admin endpoint
        const response = await blogAPI.getAdminPost(selectedPost.id);
        if (response.success && response.data?.post) {
          setSelectedPost(response.data.post);
          setIsEditPostModalOpen(true);
        } else {
          console.error('Failed to fetch post data:', response);
          alert('Failed to load post data for editing');
        }
      } catch (error) {
        console.error('Error fetching post for editing:', error);
        alert('Failed to load post data for editing');
      } finally {
        setIsLoadingEditPost(false);
      }
    }
  };

  const cancelEditPost = () => {
    setShowEditPostConfirm(false);
    setIsLoadingEditPost(false);
  };

  const closeEditSuccessModal = () => {
    setShowEditSuccessModal(false);
  };

  const closeAddPostSuccessModal = () => {
    setShowAddPostSuccessModal(false);
  };

  const closeDeleteSuccessModal = () => {
    setShowDeleteSuccessModal(false);
    setDeletedPostTitle('');
  };

  const toggleAllComments = () => {
    setShowAllComments(!showAllComments);
  };

  const toggleAllDonations = () => {
    setShowAllDonations(!showAllDonations);
  };

  const updateDonationStatus = async (donationId: string, status: string) => {
    try {
      const response = await donationsAPI.updateDonationStatus(donationId, status);
      if (response.success) {
        // Reload donations to reflect the change
        await loadDashboardData();
      }
    } catch (error) {
      console.error('Failed to update donation status:', error);
      alert('Failed to update donation status. Please try again.');
    }
  };

  const deleteDonation = async (donationId: string) => {
    const donation = donations.find(d => d.id === donationId);
    if (donation) {
      setDonationToDelete(donation);
      setShowDeleteDonationModal(true);
    }
  };

  const confirmDeleteDonation = async () => {
    if (!donationToDelete) return;

    try {
      const response = await donationsAPI.deleteDonation(donationToDelete.id);
      if (response.success) {
        // Store donation details for success modal
        setDeletedDonationDetails({
          donorName: donationToDelete.donorName || 'Anonymous',
          amount: donationToDelete.amount
        });

        // Reload donations to reflect the change
        await loadDashboardData();
        setShowDeleteDonationModal(false);
        setDonationToDelete(null);
        setShowDeleteDonationSuccess(true);
      } else {
        alert('Failed to delete donation. Please try again.');
      }
    } catch (error) {
      console.error('Failed to delete donation:', error);
      alert('Failed to delete donation. Please try again.');
    }
  };

  const cancelDeleteDonation = () => {
    setShowDeleteDonationModal(false);
    setDonationToDelete(null);
  };

  const closeDeleteDonationSuccessModal = () => {
    setShowDeleteDonationSuccess(false);
    setDeletedDonationDetails(null);
  };

  const closeDeleteCommentSuccessModal = () => {
    setShowDeleteCommentSuccess(false);
    setDeletedCommentDetails(null);
  };

  const closeDeleteMessageSuccessModal = () => {
    setShowDeleteMessageSuccess(false);
    setDeletedMessageDetails(null);
  };

  const toggleMessageExpansion = (messageId: string) => {
    setExpandedMessages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
  };

  const toggleCommentExpansion = (commentId: string) => {
    setExpandedComments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  const loadDashboardData = async () => {
    // Only load data if user is authenticated
    if (!isAuthenticated) {
      console.log('User not authenticated, skipping data load');
      return;
    }

    // Debug: Check if token exists
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');
    console.log('Token exists:', !!token, 'Token preview:', token ? token.substring(0, 20) + '...' : 'No token');
    console.log('User exists:', !!user, 'User:', user);

    try {
      // Test API connection first
      console.log('Testing API connection...');

      // Load blog posts from API
      console.log('Loading blog posts...');
      const postsResponse = await blogAPI.getAllPosts();
      console.log('Posts response:', postsResponse);
      const postsData = postsResponse.data?.posts || [];

      // Load comments from API (with fallback)
      console.log('Loading comments...');
      let allComments: any[] = [];
      try {
        const commentsResponse = await blogAPI.getAdminComments();
        console.log('Comments response:', commentsResponse);
        allComments = commentsResponse.data?.comments || [];
      } catch (error: any) {
        console.warn('Comments API failed, using empty array:', error.message);
        console.log('This is likely a server route issue. The /api/blog/admin/comments endpoint may not be registered.');
        allComments = [];
      }

      // Load donations from API (with fallback)
      let donationsData: any[] = [];
      try {
        const donationsResponse = await donationsAPI.getDonations();
        donationsData = donationsResponse.data?.donations || [];
      } catch (error: any) {
        console.warn('Donations API failed, using empty array:', error.message);
        donationsData = [];
      }

      // Load contact messages from API (with fallback)
      let messagesData: any[] = [];
      try {
        const messagesResponse = await contactAPI.getContacts();
        messagesData = messagesResponse.data?.contacts || [];
      } catch (error: any) {
        console.warn('Contact messages API failed, using empty array:', error.message);
        messagesData = [];
      }

      // Transform data to match component interfaces
      const transformedPosts: BlogPost[] = postsData.map((post: any) => ({
        id: post.id,
        title: post.title,
        slug: post.slug,
        author: post.author?.name || 'Admin',
        date: new Date(post.createdAt).toLocaleDateString(),
        views: post.views || 0,
        likes: post.likes || 0,
        comments: post._count?.comments || 0
      }));

      const transformedComments: Comment[] = allComments.map((comment: any) => ({
        id: comment.id,
        postSlug: comment.post?.slug || 'unknown',
        content: comment.content,
        timestamp: comment.createdAt,
        authorName: comment.authorName || 'Anonymous',
        authorEmail: comment.authorEmail || '',
        isApproved: comment.isApproved || false
      }));

      const transformedDonations: Donation[] = donationsData.map((donation: any) => ({
        id: donation.id,
        amount: donation.amount,
        timestamp: donation.createdAt,
        donorName: donation.donorName,
        email: donation.email,
        message: donation.message,
        status: donation.status,
        paymentMethod: donation.paymentMethod,
        currency: donation.currency,
        isAnonymous: donation.isAnonymous
      }));

      const transformedMessages: ContactMessage[] = messagesData.map((message: any) => ({
        id: message.id,
        name: message.name,
        email: message.email,
        subject: message.subject,
        message: message.message,
        timestamp: message.createdAt || message.timestamp || new Date().toISOString(),
        isRead: message.isRead || false,
        status: message.status || 'Pending'
      }));

      setPosts(transformedPosts);
      setComments(transformedComments);
      setDonations(transformedDonations);
      setMessages(transformedMessages);

      // Calculate stats
      const totalViews = transformedPosts.reduce((sum: number, post: any) => sum + post.views, 0);
      const totalLikes = transformedPosts.reduce((sum: number, post: any) => sum + post.likes, 0);
      const totalComments = transformedComments.length;
      const totalDonations = transformedDonations.reduce((sum: number, donation: Donation) => sum + donation.amount, 0);

      setStats({
        totalPosts: transformedPosts.length,
        totalComments,
        totalLikes,
        totalViews,
        totalDonations,
        recentMessages: transformedMessages.length
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Fallback to empty data if API fails
      setPosts([]);
      setComments([]);
      setDonations([]);
      setMessages([]);
      setStats({
        totalPosts: 0,
        totalComments: 0,
        totalLikes: 0,
        totalViews: 0,
        totalDonations: 0,
        recentMessages: 0
      });
    }
  };

  const handleSavePost = () => {
    loadDashboardData(); // Refresh the dashboard data
    setShowAddPostSuccessModal(true); // Show success modal
  };


  const handleUpdatePost = (updatedPost: any) => {
    console.log('Post updated successfully:', updatedPost);
    loadDashboardData(); // Refresh the dashboard data
    // Show success modal
    setShowEditSuccessModal(true);
  };

  const handleDeletePost = (post: any) => {
    setDeleteConfirmPost(post);
  };

  const confirmDeletePost = async () => {
    if (deleteConfirmPost) {
      try {
        await blogAPI.deletePost(deleteConfirmPost.id);
        await loadDashboardData();
        setDeletedPostTitle(deleteConfirmPost.title);
        setDeleteConfirmPost(null);
        // Show success modal
        setShowDeleteSuccessModal(true);
      } catch (error) {
        console.error('Error deleting post:', error);
        alert('Failed to delete post. Please try again.');
      }
    }
  };

  const deleteComment = async (commentId: string) => {
    try {
      // Find the comment to get its details before deletion
      const comment = comments.find(c => c.id === commentId);

      await blogAPI.deleteCommentAdmin(commentId);
      await loadDashboardData();

      // Store comment details for success modal
      if (comment) {
        setDeletedCommentDetails({
          authorName: comment.authorName,
          content: comment.content.length > 50 ? comment.content.substring(0, 50) + '...' : comment.content
        });
        setShowDeleteCommentSuccess(true);
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Failed to delete comment. Please try again.');
    }
  };

  const approveComment = async (commentId: string) => {
    try {
      await blogAPI.approveComment(commentId);
      await loadDashboardData();
      alert('Comment approved successfully!');
    } catch (error) {
      console.error('Error approving comment:', error);
      alert('Failed to approve comment. Please try again.');
    }
  };

  const deleteMessage = async (messageId: string) => {
    try {
      // Find the message to get its details before deletion
      const message = messages.find(m => m.id === messageId);

      // Call the delete API endpoint
      const response = await contactAPI.deleteContact(messageId);
      if (response.success) {
        // Store message details for success modal
        if (message) {
          setDeletedMessageDetails({
            senderName: message.name,
            subject: message.subject
          });
          setShowDeleteMessageSuccess(true);
        }

        // Reload data to reflect the change
        await loadDashboardData();
      } else {
        alert('Failed to delete message. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      alert('Failed to delete message. Please try again.');
    }
  };

  const markMessageAsRead = async (messageId: string) => {
    try {
      // Update local state immediately for better UX
      setMessages(prevMessages =>
        prevMessages.map(msg =>
          msg.id === messageId ? { ...msg, isRead: true } : msg
        )
      );

      // Call the mark as read API endpoint
      const response = await contactAPI.markContactAsRead(messageId);
      if (!response.success) {
        // Revert the optimistic update on API failure
        await loadDashboardData();
        alert('Failed to mark message as read. Please try again.');
      }
    } catch (error) {
      console.error('Error marking message as read:', error);
      // Revert the optimistic update on error
      await loadDashboardData();
      alert('Failed to mark message as read. Please try again.');
    }
  };

  const handleSaveBackground = async (backgroundData: any) => {
    await saveBackgroundSettings(backgroundData);
  };

  const handleSaveLogo = (logoData: any) => {
    saveLogoSettings(logoData);
  };

  const handleSaveSocial = (socialData: any) => {
    saveSocialSettings(socialData);
  };


  // Show loading screen while authentication is being checked
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">

      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-72' : 'w-16'} bg-white shadow-2xl border-r border-gray-100 transition-all duration-300 flex-shrink-0 flex flex-col relative z-30`}>
        {/* Sidebar Header */}
        <div className="p-8 border-b border-gray-100 flex-shrink-0 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <div className="flex items-center space-x-4">
                {logoSettings.logoUrl && logoSettings.showText ? (
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <img
                        src={logoSettings.logoUrl}
                        alt="Logo"
                        className="w-12 h-12 object-contain rounded-xl shadow-lg ring-2 ring-gray-100"
                      />
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                    <div>
                      <span className="text-2xl font-bold text-gray-900">{logoSettings.logoText}</span>
                      <p className="text-sm text-gray-600 font-medium">Admin Panel</p>
                    </div>
                  </div>
                ) : logoSettings.logoUrl ? (
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <img
                        src={logoSettings.logoUrl}
                        alt="Logo"
                        className="h-12 object-contain rounded-xl shadow-lg ring-2 ring-gray-100"
                      />
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                    <div>
                      <span className="text-2xl font-bold text-gray-900">{logoSettings.logoText}</span>
                      <p className="text-sm text-gray-600 font-medium">Admin Panel</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg ring-2 ring-amber-100">
                        <span className="text-white font-bold text-xl">T</span>
                      </div>
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                    <div>
                      <span className="text-2xl font-bold text-gray-900">{logoSettings.logoText}</span>
                      <p className="text-sm text-gray-600 font-medium">Admin Panel</p>
                    </div>
                  </div>
                )}
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="relative p-3 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-300 hover:shadow-lg border border-gray-200 hover:border-gray-300 group"
              title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              <div className="relative w-6 h-6 flex flex-col justify-center items-center">
                <span className={`block w-5 h-0.5 bg-current transition-all duration-300 ${sidebarOpen ? 'rotate-45 translate-y-1' : 'translate-y-0'}`}></span>
                <span className={`block w-5 h-0.5 bg-current transition-all duration-300 ${sidebarOpen ? 'opacity-0' : 'opacity-100'} mt-1`}></span>
                <span className={`block w-5 h-0.5 bg-current transition-all duration-300 ${sidebarOpen ? '-rotate-45 -translate-y-1' : 'translate-y-0'} mt-1`}></span>
              </div>
            </button>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 relative overflow-hidden">
          {/* Scroll Fade Indicators */}
          <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-white to-transparent z-10 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white to-transparent z-10 pointer-events-none"></div>

          <nav
            className="p-6 space-y-3 h-full overflow-y-auto scroll-smooth"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#d1d5db #f3f4f6',
              maxHeight: 'calc(100vh - 200px)'
            }}
          >
            <div className="mb-8">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 px-4">
                {sidebarOpen ? 'Dashboard' : ''}
              </h3>
              <div className="space-y-3">
                {[
                  { id: 'overview', label: 'Overview', icon: BarChart3, color: 'text-blue-500', bgColor: 'bg-blue-50', activeBg: 'bg-blue-100' },
                  { id: 'posts', label: 'Posts', icon: BookOpen, color: 'text-green-500', bgColor: 'bg-green-50', activeBg: 'bg-green-100' },
                  { id: 'comments', label: 'Comments', icon: MessageSquare, color: 'text-purple-500', bgColor: 'bg-purple-50', activeBg: 'bg-purple-100' },
                  { id: 'donations', label: 'Donations', icon: DollarSign, color: 'text-emerald-500', bgColor: 'bg-emerald-50', activeBg: 'bg-emerald-100' },
                  { id: 'messages', label: 'Messages', icon: Mail, color: 'text-indigo-500', bgColor: 'bg-indigo-50', activeBg: 'bg-indigo-100' },
                  { id: 'bible-verses', label: 'Bible Verses', icon: BookOpen, color: 'text-amber-500', bgColor: 'bg-amber-50', activeBg: 'bg-amber-100' }
                ].map(({ id, label, icon: Icon, color, bgColor, activeBg }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`w-full flex items-center ${sidebarOpen ? 'space-x-4 px-4' : 'justify-center px-2'} py-4 rounded-2xl font-semibold text-sm transition-all duration-300 group ${activeTab === id
                      ? `bg-gradient-to-r from-amber-50 to-amber-100 text-amber-800 border-2 border-amber-200 shadow-lg transform scale-[1.02]`
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50 hover:shadow-md hover:transform hover:scale-[1.01] border-2 border-transparent hover:border-gray-100'
                      }`}
                    title={!sidebarOpen ? label : ''}
                  >
                    <div className={`${sidebarOpen ? 'p-2.5' : 'p-3'} rounded-xl shadow-sm ${activeTab === id ? 'bg-amber-200 shadow-md' : `${bgColor} group-hover:${activeBg} group-hover:shadow-md`} transition-all duration-300 flex items-center justify-center`}>
                      <Icon className={`h-5 w-5 ${activeTab === id ? 'text-amber-700' : color} transition-colors duration-300`} />
                    </div>
                    {sidebarOpen && (
                      <div className="flex-1 text-left">
                        <span className="block font-semibold">{label}</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Settings Section */}
            <div className="mt-12">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 px-4">
                {sidebarOpen ? 'Configuration' : ''}
              </h3>
              <div className="relative settings-dropdown">
                <button
                  onClick={() => setSettingsDropdownOpen(!settingsDropdownOpen)}
                  className={`w-full flex items-center ${sidebarOpen ? 'space-x-4 px-4' : 'justify-center px-2'} py-4 rounded-2xl font-semibold text-sm transition-all duration-300 group ${settingsDropdownOpen
                    ? 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-800 border-2 border-gray-200 shadow-lg transform scale-[1.02]'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50 hover:shadow-md hover:transform hover:scale-[1.01] border-2 border-transparent hover:border-gray-100'
                    }`}
                  title={!sidebarOpen ? 'Settings' : ''}
                >
                  <div className={`${sidebarOpen ? 'p-2.5' : 'p-3'} rounded-xl shadow-sm ${settingsDropdownOpen ? 'bg-gray-200 shadow-md' : 'bg-gray-100 group-hover:bg-gray-200 group-hover:shadow-md'} transition-all duration-300 flex items-center justify-center`}>
                    <Settings className="h-5 w-5 text-gray-600" />
                  </div>
                  {sidebarOpen && (
                    <div className="flex-1 text-left flex items-center justify-between">
                      <span className="font-semibold">Settings</span>
                      <ChevronDown className={`h-5 w-5 transition-transform duration-300 ${settingsDropdownOpen ? 'rotate-180' : ''}`} />
                    </div>
                  )}
                </button>

                {/* Dropdown Menu */}
                {settingsDropdownOpen && (
                  <div className={`${sidebarOpen ? 'ml-4 mr-4' : 'ml-0 mr-0'} mt-4 space-y-3 bg-gradient-to-br from-gray-50 to-white rounded-2xl p-4 shadow-lg border border-gray-100 relative z-50 w-full max-w-xs`}>
                    <button
                      onClick={() => {
                        setActiveTab('storage');
                        setSettingsDropdownOpen(false);
                      }}
                      className={`w-full flex items-center space-x-4 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${activeTab === 'storage'
                        ? 'bg-amber-100 text-amber-800 shadow-md border border-amber-200'
                        : 'text-gray-700 hover:text-gray-900 hover:bg-white hover:shadow-md hover:border hover:border-gray-200'
                        }`}
                    >
                      <div className="p-2 rounded-lg bg-gray-200 shadow-sm">
                        <HardDrive className="h-4 w-4 text-gray-600" />
                      </div>
                      <span>Storage</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsBackgroundModalOpen(true);
                        setSettingsDropdownOpen(false);
                      }}
                      className="w-full flex items-center space-x-4 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-white hover:shadow-md hover:border hover:border-gray-200 transition-all duration-300"
                    >
                      <div className="p-2 rounded-lg bg-gray-200 shadow-sm">
                        <Palette className="h-4 w-4 text-gray-600" />
                      </div>
                      <span>Background</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsLogoModalOpen(true);
                        setSettingsDropdownOpen(false);
                      }}
                      className="w-full flex items-center space-x-4 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-white hover:shadow-md hover:border hover:border-gray-200 transition-all duration-300"
                    >
                      <div className="p-2 rounded-lg bg-gray-200 shadow-sm">
                        <Image className="h-4 w-4 text-gray-600" />
                      </div>
                      <span>Logo</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsWhatsAppModalOpen(true);
                        setSettingsDropdownOpen(false);
                      }}
                      className="w-full flex items-center space-x-4 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-white hover:shadow-md hover:border hover:border-gray-200 transition-all duration-300"
                    >
                      <div className="p-2 rounded-lg bg-gray-200 shadow-sm">
                        <MessageCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <span>WhatsApp</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsContentModalOpen(true);
                        setSettingsDropdownOpen(false);
                      }}
                      className="w-full flex items-center space-x-4 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-white hover:shadow-md hover:border hover:border-gray-200 transition-all duration-300"
                    >
                      <div className="p-2 rounded-lg bg-gray-200 shadow-sm">
                        <Layout className="h-4 w-4 text-gray-600" />
                      </div>
                      <span>Site Content</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsFooterModalOpen(true);
                        setSettingsDropdownOpen(false);
                      }}
                      className="w-full flex items-center space-x-4 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-white hover:shadow-md hover:border hover:border-gray-200 transition-all duration-300"
                    >
                      <div className="p-2 rounded-lg bg-gray-200 shadow-sm">
                        <Share2 className="h-4 w-4 text-gray-600" />
                      </div>
                      <span>Social</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsFooterModalOpen(true);
                        setSettingsDropdownOpen(false);
                      }}
                      className="w-full flex items-center space-x-4 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-white hover:shadow-md hover:border hover:border-gray-200 transition-all duration-300"
                    >
                      <div className="p-2 rounded-lg bg-gray-200 shadow-sm">
                        <Layout className="h-4 w-4 text-gray-600" />
                      </div>
                      <span>Footer Content</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

          </nav>
        </div>

        {/* Logout Action */}
        {sidebarOpen && (
          <div className="p-6 border-t border-gray-100 flex-shrink-0 bg-gradient-to-r from-gray-50 to-white">
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-4 px-4 py-4 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-2xl transition-all duration-300 hover:shadow-lg group border-2 border-transparent hover:border-red-200"
            >
              <div className="p-2.5 rounded-xl bg-red-100 group-hover:bg-red-200 transition-all duration-300 shadow-sm group-hover:shadow-md">
                <LogOut className="h-5 w-5" />
              </div>
              <div className="flex-1 text-left">
                <span className="font-semibold block">Logout</span>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        {/* Top Header */}
        <div className="bg-white shadow-lg border-b border-gray-100 px-8 py-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            {/* Left Section - Mobile Menu */}
            <div className="flex items-center space-x-6">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden relative p-3 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-300 hover:shadow-lg border border-gray-200 hover:border-gray-300 group"
                title={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
              >
                <div className="relative w-6 h-6 flex flex-col justify-center items-center">
                  <span className={`block w-5 h-0.5 bg-current transition-all duration-300 ${sidebarOpen ? 'rotate-45 translate-y-1' : 'translate-y-0'}`}></span>
                  <span className={`block w-5 h-0.5 bg-current transition-all duration-300 ${sidebarOpen ? 'opacity-0' : 'opacity-100'} mt-1`}></span>
                  <span className={`block w-5 h-0.5 bg-current transition-all duration-300 ${sidebarOpen ? '-rotate-45 -translate-y-1' : 'translate-y-0'} mt-1`}></span>
                </div>
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              </div>
            </div>

            {/* Center Section - Search */}
            <div className="flex-1 max-w-lg mx-12 hidden md:block">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search posts, comments, messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-2xl text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 bg-gray-50 hover:bg-white focus:bg-white"
                />
              </div>
            </div>

            {/* Right Section - Notifications and User Profile */}
            <div className="flex items-center space-x-6">
              {/* Search Icon for Mobile */}
              <button className="md:hidden p-3 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:shadow-md border border-gray-200 hover:border-gray-300">
                <Search className="h-5 w-5" />
              </button>

              {/* Notifications */}
              <button className="relative p-3 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:shadow-md border border-gray-200 hover:border-gray-300">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-lg">
                  3
                </span>
              </button>

              {/* Admin User Profile */}
              <div className="relative user-dropdown">
                <button
                  onClick={toggleUserDropdown}
                  className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg ring-2 ring-amber-200 hover:shadow-xl transition-all duration-200 hover:scale-105"
                >
                  <span className="text-white font-bold text-lg">A</span>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
                </button>

                {/* User Dropdown */}
                {showUserDropdown && (
                  <div className="absolute right-0 top-14 w-64 bg-white rounded-2xl shadow-2xl border border-gray-200 py-4 z-50">
                    <div className="px-6 py-4 border-b border-gray-100">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg ring-2 ring-amber-200">
                          <span className="text-white font-bold text-lg">A</span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">Admin User</p>
                          <p className="text-xs text-gray-500 font-medium">admin@bibleproject.com</p>
                        </div>
                      </div>
                    </div>
                    <div className="px-2 py-2">
                      <button className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-colors">
                        Profile Settings
                      </button>
                      <button className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-colors">
                        Account Settings
                      </button>
                      <button className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-colors">
                        Help & Support
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-4 overflow-auto">

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-4 h-full">
              {/* Welcome Section */}
              <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50 rounded-2xl p-8 border border-amber-200 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                        <TrendingUp className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name || 'Admin'}!</h2>
                        <p className="text-gray-600 font-medium">Here's what's happening with your website today.</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6 mt-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium text-gray-700">All systems operational</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-700">3 new notifications</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-700">99.9% uptime</span>
                      </div>
                    </div>
                  </div>
                  <div className="hidden lg:block">
                    <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl flex items-center justify-center shadow-lg">
                      <TrendingUp className="h-10 w-10 text-amber-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Key Metrics Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 group">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300">
                      <BookOpen className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Posts</p>
                      <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalPosts}</p>
                      <div className="flex items-center space-x-1 mt-2">
                        <TrendingUp className="h-3 w-3 text-green-500" />
                        <p className="text-sm font-semibold text-green-600">+12%</p>
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 group">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300">
                      <Eye className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Views</p>
                      <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalViews.toLocaleString()}</p>
                      <div className="flex items-center space-x-1 mt-2">
                        <TrendingUp className="h-3 w-3 text-green-500" />
                        <p className="text-sm font-semibold text-green-600">+8%</p>
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full" style={{ width: '60%' }}></div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 group">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300">
                      <Heart className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Engagement</p>
                      <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalLikes + stats.totalComments}</p>
                      <div className="flex items-center space-x-1 mt-2">
                        <TrendingUp className="h-3 w-3 text-green-500" />
                        <p className="text-sm font-semibold text-green-600">+15%</p>
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 group">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300">
                      <DollarSign className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Revenue</p>
                      <p className="text-3xl font-bold text-gray-900 mt-1">${stats.totalDonations}</p>
                      <div className="flex items-center space-x-1 mt-2">
                        <TrendingUp className="h-3 w-3 text-green-500" />
                        <p className="text-sm font-semibold text-green-600">+22%</p>
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-gradient-to-r from-amber-500 to-amber-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                  </div>
                </div>
              </div>

              {/* Performance Overview */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Content Performance */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                        <BarChart3 className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">Content Performance</h3>
                        <p className="text-sm text-gray-500">Real-time analytics</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 px-3 py-1 bg-green-100 rounded-full">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs font-semibold text-green-700">Live</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200 hover:shadow-md transition-all duration-300 group">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                          <BookOpen className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <p className="text-base font-bold text-gray-900">Blog Posts</p>
                          <p className="text-sm text-gray-600">Published content</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">{stats.totalPosts}</p>
                        <div className="flex items-center space-x-1 mt-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <p className="text-sm font-semibold text-green-600">Active</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200 hover:shadow-md transition-all duration-300 group">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                          <Eye className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <p className="text-base font-bold text-gray-900">Page Views</p>
                          <p className="text-sm text-gray-600">Total traffic</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">{stats.totalViews.toLocaleString()}</p>
                        <div className="flex items-center space-x-1 mt-1">
                          <TrendingUp className="h-3 w-3 text-green-500" />
                          <p className="text-sm font-semibold text-green-600">Growing</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl border border-purple-200 hover:shadow-md transition-all duration-300 group">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                          <MessageSquare className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <p className="text-base font-bold text-gray-900">Comments</p>
                          <p className="text-sm text-gray-600">User engagement</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">{stats.totalComments}</p>
                        <div className="flex items-center space-x-1 mt-1">
                          <TrendingUp className="h-3 w-3 text-green-500" />
                          <p className="text-sm font-semibold text-green-600">+5 this week</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Plus className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Quick Actions</h3>
                      <p className="text-sm text-gray-500">Manage your content</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <button
                      onClick={() => setShowAddPostConfirm(true)}
                      className="w-full flex items-center space-x-4 p-4 bg-gradient-to-r from-amber-50 to-amber-100 hover:from-amber-100 hover:to-amber-200 rounded-xl transition-all duration-300 group border border-amber-200 hover:border-amber-300 hover:shadow-md"
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                        <Plus className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-left flex-1">
                        <p className="text-base font-bold text-gray-900">Create New Post</p>
                        <p className="text-sm text-gray-600">Add fresh content to your blog</p>
                      </div>
                      <div className="text-amber-600 group-hover:text-amber-700">
                        <Plus className="h-5 w-5" />
                      </div>
                    </button>

                    <button
                      onClick={() => setActiveTab('bible-verses')}
                      className="w-full flex items-center space-x-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group"
                    >
                      <div className="w-8 h-8 bg-blue-100 group-hover:bg-blue-200 rounded-lg flex items-center justify-center transition-colors">
                        <BookOpen className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium text-gray-900">Manage Bible Verses</p>
                        <p className="text-xs text-gray-500">Update featured verses</p>
                      </div>
                    </button>

                    <button
                      onClick={() => setIsBackgroundModalOpen(true)}
                      className="w-full flex items-center space-x-3 p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors group"
                    >
                      <div className="w-8 h-8 bg-green-100 group-hover:bg-green-200 rounded-lg flex items-center justify-center transition-colors">
                        <Palette className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium text-gray-900">Customize Theme</p>
                        <p className="text-xs text-gray-500">Change background and logo</p>
                      </div>
                    </button>

                    <button
                      onClick={() => setActiveTab('messages')}
                      className="w-full flex items-center space-x-3 p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors group"
                    >
                      <div className="w-8 h-8 bg-purple-100 group-hover:bg-purple-200 rounded-lg flex items-center justify-center transition-colors">
                        <Mail className="h-4 w-4 text-purple-600" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium text-gray-900">View Messages</p>
                        <p className="text-xs text-gray-500">{stats.recentMessages} new messages</p>
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Recent Activity & Analytics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Recent Activity */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-semibold text-gray-900">Recent Activity</h3>
                    <button
                      onClick={() => setActiveTab('comments')}
                      className="text-xs text-amber-600 hover:text-amber-700 font-medium"
                    >
                      View all
                    </button>
                  </div>

                  <div className="space-y-2">
                    {comments.slice(0, 2).map((comment) => (
                      <div key={comment.id} className="flex items-start space-x-3 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <MessageSquare className="h-3 w-3 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-xs font-medium text-gray-900">{comment.authorName}</span>
                            {comment.isApproved ? (
                              <span className="inline-flex items-center px-1 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                ✓
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-1 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                ⏳
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 truncate">{comment.content}</p>
                          <p className="text-xs text-gray-400">on {comment.postSlug}</p>
                        </div>
                      </div>
                    ))}
                    {comments.length === 0 && (
                      <div className="text-center py-4">
                        <MessageSquare className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-xs text-gray-500">No recent activity</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Analytics Summary */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <h3 className="text-base font-semibold text-gray-900 mb-4">Analytics Summary</h3>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-gray-600">Engagement Rate</p>
                        <p className="text-xl font-bold text-gray-900">
                          {stats.totalViews > 0 ? Math.round(((stats.totalLikes + stats.totalComments) / stats.totalViews) * 100) : 0}%
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                        <TrendingUp className="h-6 w-6 text-white" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">Avg views/post</span>
                        <span className="text-sm font-medium text-gray-900">
                          {stats.totalPosts > 0 ? Math.round(stats.totalViews / stats.totalPosts) : 0}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">Comments/post</span>
                        <span className="text-sm font-medium text-gray-900">
                          {stats.totalPosts > 0 ? Math.round(stats.totalComments / stats.totalPosts) : 0}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">Likes/post</span>
                        <span className="text-sm font-medium text-gray-900">
                          {stats.totalPosts > 0 ? Math.round(stats.totalLikes / stats.totalPosts) : 0}
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-600">Total Revenue</span>
                        <span className="text-sm font-bold text-green-600">${stats.totalDonations}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-green-500 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min((stats.totalDonations / 1000) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Progress towards $1,000 goal</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Stats Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-blue-800">Top Performing Post</p>
                      <p className="text-sm font-bold text-blue-900 truncate">
                        {posts.length > 0 ? posts.reduce((max, post) => post.views > max.views ? post : max).title : 'No posts yet'}
                      </p>
                      <p className="text-xs text-blue-600">
                        {posts.length > 0 ? posts.reduce((max, post) => post.views > max.views ? post : max).views : 0} views
                      </p>
                    </div>
                    <TrendingUp className="h-6 w-6 text-blue-600" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-green-800">Community Growth</p>
                      <p className="text-sm font-bold text-green-900">{stats.totalComments + stats.totalLikes}</p>
                      <p className="text-xs text-green-600">Total interactions</p>
                    </div>
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-lg p-4 border border-amber-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-amber-800">Support Received</p>
                      <p className="text-sm font-bold text-amber-900">{donations.length}</p>
                      <p className="text-xs text-amber-600">Generous donations</p>
                    </div>
                    <Heart className="h-6 w-6 text-amber-600" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Posts Tab */}
          {activeTab === 'posts' && (
            <div className="space-y-4">
              {/* Posts Header - Ultra Compact */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-md">
                      <BookOpen className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Blog Posts</h3>
                      <p className="text-xs text-gray-600">Manage your blog content and articles</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAddPostConfirm(true)}
                    className="flex items-center space-x-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-4 py-2 rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    <Plus className="h-4 w-4" />
                    <span className="text-sm font-semibold">New Post</span>
                  </button>
                </div>
              </div>

              {/* Posts Table - Ultra Compact */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="overflow-hidden">
                  <table className="w-full divide-y divide-gray-200">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Title</th>
                        <th className="px-3 py-2 text-left text-xs font-bold text-gray-600 uppercase tracking-wider hidden md:table-cell">Author</th>
                        <th className="px-3 py-2 text-left text-xs font-bold text-gray-600 uppercase tracking-wider hidden lg:table-cell">Stats</th>
                        <th className="px-3 py-2 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {posts.map((post) => (
                        <tr key={post.id} className="hover:bg-gray-50 transition-colors duration-200 group">
                          <td className="px-3 py-2">
                            <div className="flex items-center space-x-2">
                              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                                <BookOpen className="h-3 w-3 text-white" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="text-xs font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate">{post.title}</div>
                                <div className="text-xs text-gray-500">{post.date}</div>
                                {/* Mobile stats */}
                                <div className="flex items-center space-x-3 mt-1 md:hidden">
                                  <div className="flex items-center space-x-1">
                                    <Eye className="h-2 w-2 text-green-500" />
                                    <span className="text-xs font-semibold text-gray-700">{post.views}</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <Heart className="h-2 w-2 text-red-500" />
                                    <span className="text-xs font-semibold text-gray-700">{post.likes}</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <MessageSquare className="h-2 w-2 text-purple-500" />
                                    <span className="text-xs font-semibold text-gray-700">{post.comments}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-2 hidden md:table-cell">
                            <div className="flex items-center space-x-2">
                              <div className="w-5 h-5 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center">
                                <span className="text-white font-bold text-xs">{post.author.charAt(0)}</span>
                              </div>
                              <span className="text-xs font-semibold text-gray-900 truncate">{post.author}</span>
                            </div>
                          </td>
                          <td className="px-3 py-2 hidden lg:table-cell">
                            <div className="flex items-center space-x-3">
                              <div className="flex items-center space-x-1">
                                <Eye className="h-3 w-3 text-green-500" />
                                <span className="text-xs font-bold text-gray-900">{post.views}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Heart className="h-3 w-3 text-red-500" />
                                <span className="text-xs font-bold text-gray-900">{post.likes}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <MessageSquare className="h-3 w-3 text-purple-500" />
                                <span className="text-xs font-bold text-gray-900">{post.comments}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-2">
                            <div className="flex space-x-1">
                              <button
                                onClick={() => window.open(`/blog/${post.slug}`, '_blank')}
                                className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200"
                                title="Preview post"
                              >
                                <ExternalLink className="h-3 w-3" />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedPost(post);
                                  setShowEditPostConfirm(true);
                                }}
                                className="p-1.5 text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-all duration-200"
                                title="Edit post"
                              >
                                <Edit className="h-3 w-3" />
                              </button>
                              <button
                                onClick={() => handleDeletePost(post)}
                                className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                                title="Delete post"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Table Footer - Ultra Compact */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-3 py-2 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs font-semibold text-gray-700">Total: {posts.length}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-xs font-semibold text-gray-700">Active: {posts.length}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                      <span className="text-xs font-semibold text-gray-700">Updated: {new Date().toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Comments Tab */}
          {activeTab === 'comments' && (
            <div className="space-y-3">
              {/* Comments Header - Professional Ultra Compact */}
              <div className="bg-gradient-to-r from-white to-gray-50 rounded-lg shadow-md border border-gray-200 p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center shadow-lg">
                      <MessageSquare className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Comments Management</h3>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 px-3 py-1.5 bg-green-50 rounded-full border border-green-200">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-xs font-bold text-green-700">{comments.filter(c => c.isApproved).length} Approved</span>
                    </div>
                    <div className="flex items-center space-x-2 px-3 py-1.5 bg-yellow-50 rounded-full border border-yellow-200">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span className="text-xs font-bold text-yellow-700">{comments.filter(c => !c.isApproved).length} Pending</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Comments Stats - Professional Ultra Compact */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-md border border-blue-200 p-2 hover:shadow-lg transition-all duration-300">
                  <div className="text-center">
                    <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                      <MessageSquare className="h-3 w-3 text-white" />
                    </div>
                    <p className="text-lg font-bold text-blue-900">{comments.length}</p>
                    <p className="text-xs font-semibold text-blue-700">Total</p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-md border border-green-200 p-2 hover:shadow-lg transition-all duration-300">
                  <div className="text-center">
                    <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
                      <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-lg font-bold text-green-900">{comments.filter(c => c.isApproved).length}</p>
                    <p className="text-xs font-semibold text-green-700">Approved</p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg shadow-md border border-yellow-200 p-2 hover:shadow-lg transition-all duration-300">
                  <div className="text-center">
                    <div className="w-6 h-6 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-2">
                      <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-lg font-bold text-yellow-900">{comments.filter(c => !c.isApproved).length}</p>
                    <p className="text-xs font-semibold text-yellow-700">Pending</p>
                  </div>
                </div>
              </div>

              {/* Comments List - Professional Ultra Compact */}
              <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 px-3 py-2 border-b border-purple-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center shadow-md">
                        <MessageSquare className="h-3 w-3 text-white" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900">Recent Comments</h4>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1 px-2 py-1 bg-green-50 rounded-full border border-green-200">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                        <span className="text-xs font-bold text-green-700">{comments.filter(c => c.isApproved).length}</span>
                      </div>
                      <div className="flex items-center space-x-1 px-2 py-1 bg-yellow-50 rounded-full border border-yellow-200">
                        <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div>
                        <span className="text-xs font-bold text-yellow-700">{comments.filter(c => !c.isApproved).length}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  {/* Scroll Fade Indicators */}
                  <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-white to-transparent z-10 pointer-events-none"></div>
                  <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-white to-transparent z-10 pointer-events-none"></div>

                  <div className={`${showAllComments ? 'max-h-64 overflow-y-auto scroll-smooth' : 'max-h-48 overflow-y-auto scroll-smooth'}`}
                    style={{
                      scrollbarWidth: 'thin',
                      scrollbarColor: '#d1d5db #f3f4f6'
                    }}>
                    {comments.slice(0, showAllComments ? comments.length : 2).map((comment) => (
                      <div key={comment.id} className="p-2 border-b border-gray-100 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 transition-all duration-300 group">
                        <div className="flex items-start space-x-3">
                          {/* Author Avatar */}
                          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center shadow-md flex-shrink-0 group-hover:shadow-lg transition-all duration-300">
                            <span className="text-white font-bold text-xs">
                              {comment.authorName.charAt(0).toUpperCase()}
                            </span>
                          </div>

                          {/* Comment Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <h5 className="text-xs font-bold text-gray-900 truncate group-hover:text-purple-600 transition-colors duration-200">{comment.authorName}</h5>
                              {comment.isApproved ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300">
                                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></div>
                                  ✓ Approved
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border border-yellow-300">
                                  <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mr-1"></div>
                                  ⏳ Pending
                                </span>
                              )}
                            </div>

                            <div className="mb-2">
                              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                <p className="text-xs text-gray-700 leading-relaxed">
                                  {expandedComments.has(comment.id) ? (
                                    <>
                                      {comment.content}
                                      {comment.content.length > 100 && (
                                        <button
                                          onClick={() => toggleCommentExpansion(comment.id)}
                                          className="text-blue-600 hover:text-blue-700 ml-2 font-medium transition-colors duration-200"
                                        >
                                          Show less
                                        </button>
                                      )}
                                    </>
                                  ) : (
                                    <>
                                      {comment.content.length > 100 ? (
                                        <>
                                          {comment.content.substring(0, 100)}...
                                          <button
                                            onClick={() => toggleCommentExpansion(comment.id)}
                                            className="text-blue-600 hover:text-blue-700 ml-1 font-medium transition-colors duration-200"
                                          >
                                            Read more
                                          </button>
                                        </>
                                      ) : (
                                        comment.content
                                      )}
                                    </>
                                  )}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <div className="flex items-center space-x-2">
                                <div className="flex items-center space-x-1 px-2 py-0.5 bg-gray-100 rounded-full">
                                  <BookOpen className="h-2 w-2" />
                                  <span className="font-medium">{comment.postSlug}</span>
                                </div>
                                <span>•</span>
                                <span className="text-gray-400">{new Date(comment.timestamp).toLocaleDateString()}</span>
                              </div>

                              {/* Actions */}
                              <div className="flex items-center space-x-1">
                                {!comment.isApproved && (
                                  <button
                                    onClick={() => approveComment(comment.id)}
                                    className="p-1.5 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-all duration-200 hover:shadow-md"
                                    title="Approve comment"
                                  >
                                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                  </button>
                                )}
                                <button
                                  onClick={() => deleteComment(comment.id)}
                                  className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200 hover:shadow-md"
                                  title="Delete comment"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {comments.length === 0 && (
                      <div className="text-center py-8">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-md">
                          <MessageSquare className="h-6 w-6 text-purple-400" />
                        </div>
                        <h3 className="text-sm font-bold text-gray-900 mb-1">No Comments Yet</h3>
                        <p className="text-xs text-gray-500">Comments from your blog posts will appear here</p>
                      </div>
                    )}

                    {comments.length > 2 && (
                      <div className="p-2 bg-gradient-to-r from-purple-50 to-indigo-50 border-t border-purple-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                            <p className="text-xs font-semibold text-gray-700">
                              {showAllComments
                                ? `Showing all ${comments.length} comments`
                                : `Showing 2 of ${comments.length} comments`
                              }
                            </p>
                          </div>
                          <button
                            onClick={toggleAllComments}
                            className="px-3 py-1.5 text-xs text-white bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 font-semibold rounded-lg transition-all duration-200 hover:shadow-md"
                          >
                            {showAllComments ? 'Show Less' : 'View All Comments'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Donations Tab */}
          {activeTab === 'donations' && (
            <div className="space-y-6">
              {/* Professional Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-md border border-green-200 p-2 hover:shadow-lg transition-all duration-300">
                  <div className="text-center">
                    <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
                      <DollarSign className="h-3 w-3 text-white" />
                    </div>
                    <p className="text-lg font-bold text-green-900">${stats.totalDonations}</p>
                    <p className="text-xs font-semibold text-green-700">Total Raised</p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-md border border-blue-200 p-2 hover:shadow-lg transition-all duration-300">
                  <div className="text-center">
                    <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                      <TrendingUp className="h-3 w-3 text-white" />
                    </div>
                    <p className="text-lg font-bold text-blue-900">{donations.length}</p>
                    <p className="text-xs font-semibold text-blue-700">Total Count</p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg shadow-md border border-purple-200 p-2 hover:shadow-lg transition-all duration-300">
                  <div className="text-center">
                    <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-2">
                      <BarChart3 className="h-3 w-3 text-white" />
                    </div>
                    <p className="text-lg font-bold text-purple-900">
                      ${donations.length > 0 ? Math.round(stats.totalDonations / donations.length) : 0}
                    </p>
                    <p className="text-xs font-semibold text-purple-700">Average</p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg shadow-md border border-emerald-200 p-2 hover:shadow-lg transition-all duration-300">
                  <div className="text-center">
                    <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Heart className="h-3 w-3 text-white" />
                    </div>
                    <p className="text-lg font-bold text-emerald-900">
                      {donations.filter(d => new Date(d.timestamp) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length}
                    </p>
                    <p className="text-xs font-semibold text-emerald-700">This Month</p>
                  </div>
                </div>
              </div>

              {/* Professional Donations List */}
              <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-50 to-green-50 px-3 py-2 border-b border-emerald-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-green-500 rounded-lg flex items-center justify-center shadow-md">
                        <DollarSign className="h-3 w-3 text-white" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900">Recent Donations</h4>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1 px-2 py-1 bg-green-50 rounded-full border border-green-200">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                        <span className="text-xs font-bold text-green-700">{donations.filter(d => d.status === 'COMPLETED' || !d.status).length}</span>
                      </div>
                      <div className="flex items-center space-x-1 px-2 py-1 bg-yellow-50 rounded-full border border-yellow-200">
                        <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div>
                        <span className="text-xs font-bold text-yellow-700">{donations.filter(d => d.status === 'PENDING').length}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  {/* Scroll Fade Indicators */}
                  <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-white to-transparent z-10 pointer-events-none"></div>
                  <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-white to-transparent z-10 pointer-events-none"></div>

                  <div className="max-h-64 overflow-y-auto scroll-smooth" style={{
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#d1d5db #f3f4f6'
                  }}>
                    {donations.slice(0, showAllDonations ? donations.length : 5).map((donation) => (
                      <div key={donation.id} className="p-2 border-b border-gray-100 hover:bg-gradient-to-r hover:from-gray-50 hover:to-emerald-50 transition-all duration-300 group">
                        <div className="flex items-start space-x-3">
                          {/* Donor Avatar */}
                          <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-500 rounded-lg flex items-center justify-center shadow-md flex-shrink-0 group-hover:shadow-lg transition-all duration-300">
                            <span className="text-white font-bold text-xs">
                              {(donation.donorName || 'A').charAt(0).toUpperCase()}
                            </span>
                          </div>

                          {/* Donation Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <h5 className="text-xs font-bold text-gray-900 truncate group-hover:text-emerald-600 transition-colors duration-200">
                                {donation.donorName || 'Anonymous'}
                              </h5>
                              {donation.status === 'COMPLETED' || !donation.status ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300">
                                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></div>
                                  ✓ Completed
                                </span>
                              ) : donation.status === 'PENDING' ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border border-yellow-300">
                                  <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mr-1"></div>
                                  ⏳ Pending
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r from-red-100 to-red-200 text-red-800 border border-red-300">
                                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full mr-1"></div>
                                  ✗ Failed
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-gray-700 mb-2 line-clamp-1 group-hover:text-gray-900 transition-colors duration-200">
                              {donation.message || 'Thank you for your generous donation!'}
                            </p>

                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <div className="flex items-center space-x-2">
                                <div className="flex items-center space-x-1 px-2 py-0.5 bg-emerald-100 rounded-full">
                                  <DollarSign className="h-2 w-2" />
                                  <span className="font-bold text-emerald-700">${donation.amount}</span>
                                </div>
                                <span>•</span>
                                <div className="flex items-center space-x-1 px-2 py-0.5 bg-gray-100 rounded-full">
                                  <CreditCard className="h-2 w-2" />
                                  <span className="font-medium">{donation.paymentMethod || 'STRIPE'}</span>
                                </div>
                                <span>•</span>
                                <span className="text-gray-400">{new Date(donation.timestamp).toLocaleDateString()}</span>
                              </div>

                              {/* Actions */}
                              <div className="flex items-center space-x-1">
                                {donation.status === 'PENDING' && (
                                  <button
                                    onClick={() => updateDonationStatus(donation.id, 'COMPLETED')}
                                    className="p-1.5 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-all duration-200 hover:shadow-md"
                                    title="Mark as completed"
                                  >
                                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                  </button>
                                )}
                                <button
                                  onClick={() => deleteDonation(donation.id)}
                                  className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200 hover:shadow-md"
                                  title="Delete donation"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {donations.length === 0 && (
                      <div className="text-center py-8">
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-green-100 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-md">
                          <DollarSign className="h-6 w-6 text-emerald-400" />
                        </div>
                        <h3 className="text-sm font-bold text-gray-900 mb-1">No Donations Yet</h3>
                        <p className="text-xs text-gray-500">Donations from supporters will appear here</p>
                      </div>
                    )}

                    {donations.length > 5 && (
                      <div className="p-2 bg-gradient-to-r from-emerald-50 to-green-50 border-t border-emerald-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                            <p className="text-xs font-semibold text-gray-700">
                              {showAllDonations
                                ? `Showing all ${donations.length} donations`
                                : `Showing 5 of ${donations.length} donations`
                              }
                            </p>
                          </div>
                          <button
                            onClick={toggleAllDonations}
                            className="px-3 py-1.5 text-xs text-white bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 font-semibold rounded-lg transition-all duration-200 hover:shadow-md"
                          >
                            {showAllDonations ? 'Show Less' : 'View All Donations'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Messages Tab */}
          {activeTab === 'messages' && (
            <div className="space-y-6">
              {/* Contact Messages Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Messages</p>
                      <p className="text-2xl font-bold text-gray-900">{messages.length}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">This Month</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {messages.filter(msg => {
                          const msgDate = new Date(msg.timestamp);
                          const now = new Date();
                          return msgDate.getMonth() === now.getMonth() && msgDate.getFullYear() === now.getFullYear();
                        }).length}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Unread</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {messages.filter(msg => !msg.isRead).length}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6v-6H4v6zM4 5v6h6V5H4z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Average Response</p>
                      <p className="text-2xl font-bold text-gray-900">2.4h</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Messages List */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Contact Messages</h3>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setShowAllMessages(!showAllMessages)}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        {showAllMessages ? 'Show Recent Only' : 'View All Messages'}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="divide-y divide-gray-200">
                  {isLoading ? (
                    <div className="p-8 text-center">
                      <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-gray-500 bg-white transition ease-in-out duration-150">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Loading messages...
                      </div>
                    </div>
                  ) : (showAllMessages ? messages : messages.slice(0, 5)).length === 0 ? (
                    <div className="p-8 text-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
                      <p className="text-gray-500">Contact messages from your website visitors will appear here.</p>
                    </div>
                  ) : (
                    (showAllMessages ? messages : messages.slice(0, 5)).map((message) => (
                      <div key={message.id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                        <div className="flex items-start space-x-4">
                          {/* Avatar */}
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                              <span className="text-white font-semibold text-sm">
                                {message.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>

                          {/* Message Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <h4 className="text-sm font-semibold text-gray-900">{message.name}</h4>
                                {!message.isRead && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    New
                                  </span>
                                )}
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  {message.status || 'Pending'}
                                </span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <span className="text-xs text-gray-500">
                                  {new Date(message.timestamp).toLocaleDateString()}
                                </span>
                              </div>
                            </div>

                            <div className="mb-3">
                              <p className="text-sm font-medium text-gray-900 mb-1">{message.subject}</p>
                              <p className="text-xs text-gray-500">{message.email}</p>
                            </div>

                            <div className="mb-4">
                              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <p className="text-sm text-gray-700 leading-relaxed">
                                  {expandedMessages.has(message.id) ? (
                                    <>
                                      {message.message}
                                      {message.message.length > 150 && (
                                        <button
                                          onClick={() => toggleMessageExpansion(message.id)}
                                          className="text-blue-600 hover:text-blue-700 ml-2 font-medium transition-colors duration-200"
                                        >
                                          Show less
                                        </button>
                                      )}
                                    </>
                                  ) : (
                                    <>
                                      {message.message.length > 150 ? (
                                        <>
                                          {message.message.substring(0, 150)}...
                                          <button
                                            onClick={() => toggleMessageExpansion(message.id)}
                                            className="text-blue-600 hover:text-blue-700 ml-1 font-medium transition-colors duration-200"
                                          >
                                            Read more
                                          </button>
                                        </>
                                      ) : (
                                        message.message
                                      )}
                                    </>
                                  )}
                                </p>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => window.open(`mailto:${message.email}?subject=Re: ${message.subject}`, '_blank')}
                                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                                >
                                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                  </svg>
                                  Reply
                                </button>
                                <button
                                  onClick={() => markMessageAsRead(message.id)}
                                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200"
                                >
                                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  Mark Read
                                </button>
                              </div>
                              <button
                                onClick={() => deleteMessage(message.id)}
                                className="inline-flex items-center px-3 py-1.5 border border-red-300 shadow-sm text-xs font-medium rounded-lg text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200"
                              >
                                <Trash2 className="w-3 h-3 mr-1" />
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {!showAllMessages && messages.length > 5 && (
                  <div className="p-4 bg-gray-50 border-t border-gray-200">
                    <button
                      onClick={() => setShowAllMessages(true)}
                      className="w-full text-center text-sm text-gray-600 hover:text-gray-800 font-medium"
                    >
                      View all {messages.length} messages
                    </button>
                  </div>
                )}
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
          <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl border border-gray-100">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trash2 className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Delete Post</h3>
              <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-4 mb-6 border border-red-200">
                <p className="text-sm font-semibold text-red-800 mb-2">Post Title:</p>
                <p className="text-base text-gray-900 font-medium">"{deleteConfirmPost.title}"</p>
              </div>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Are you sure you want to delete this post? This action cannot be undone and will permanently remove the post from your blog.
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={() => setDeleteConfirmPost(null)}
                  className="flex-1 px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold transition-all duration-200 hover:shadow-md"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeletePost}
                  className="flex-1 px-6 py-3 bg-red-600 text-white hover:bg-red-700 rounded-xl font-semibold transition-all duration-200 hover:shadow-md"
                >
                  Delete Post
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Post Confirmation Modal */}
      {showAddPostConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl border border-gray-100">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Plus className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Create New Post</h3>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 mb-6 border border-green-200">
                <p className="text-sm font-semibold text-green-800 mb-2">Ready to create?</p>
                <p className="text-base text-gray-900 font-medium">You're about to create a new blog post for your website</p>
              </div>
              <p className="text-gray-600 mb-8 leading-relaxed">
                This will open the post editor where you can add your title, content, images, and other post details.
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={cancelAddPost}
                  className="flex-1 px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold transition-all duration-200 hover:shadow-md"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmAddPost}
                  className="flex-1 px-6 py-3 bg-green-600 text-white hover:bg-green-700 rounded-xl font-semibold transition-all duration-200 hover:shadow-md"
                >
                  Create Post
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Post Confirmation Modal */}
      {showEditPostConfirm && selectedPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl border border-gray-100">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Edit className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Edit Post</h3>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 mb-6 border border-blue-200">
                <p className="text-sm font-semibold text-blue-800 mb-2">Post Title:</p>
                <p className="text-base text-gray-900 font-medium">"{selectedPost.title}"</p>
              </div>
              <p className="text-gray-600 mb-8 leading-relaxed">
                You're about to edit this blog post. Any changes you make will be saved and published to your website.
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={cancelEditPost}
                  className="flex-1 px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold transition-all duration-200 hover:shadow-md"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmEditPost}
                  disabled={isLoadingEditPost}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white hover:bg-blue-700 rounded-xl font-semibold transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isLoadingEditPost ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Loading...</span>
                    </>
                  ) : (
                    <span>Edit Post</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Post Success Modal */}
      {showEditSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl border border-gray-100">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Post Updated Successfully!</h3>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 mb-6 border border-green-200">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <p className="text-sm font-semibold text-green-800">Changes Saved</p>
                </div>
                <p className="text-base text-gray-900 font-medium">Your blog post has been updated and is now live on your website</p>
              </div>
              <p className="text-gray-600 mb-8 leading-relaxed">
                The post has been successfully updated with all your changes. You can continue editing other posts or manage your blog content.
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={closeEditSuccessModal}
                  className="flex-1 px-6 py-3 bg-green-600 text-white hover:bg-green-700 rounded-xl font-semibold transition-all duration-200 hover:shadow-md"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Post Success Modal */}
      {showAddPostSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl border border-gray-100">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Post Created Successfully!</h3>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 mb-6 border border-green-200">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <p className="text-sm font-semibold text-green-800">Post Published</p>
                </div>
                <p className="text-base text-gray-900 font-medium">Your new blog post has been created and is now live on your website</p>
              </div>
              <p className="text-gray-600 mb-8 leading-relaxed">
                The post has been successfully saved to the database and published. You can continue creating more posts or manage your existing content.
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={closeAddPostSuccessModal}
                  className="flex-1 px-6 py-3 bg-green-600 text-white hover:bg-green-700 rounded-xl font-semibold transition-all duration-200 hover:shadow-md"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Post Success Modal */}
      {showDeleteSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl border border-gray-100">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Post Deleted Successfully!</h3>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 mb-6 border border-green-200">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <p className="text-sm font-semibold text-green-800">Post Removed</p>
                </div>
                <p className="text-sm font-semibold text-green-800 mb-2">Deleted Post:</p>
                <p className="text-base text-gray-900 font-medium">"{deletedPostTitle}"</p>
              </div>
              <p className="text-gray-600 mb-8 leading-relaxed">
                The post has been permanently removed from your blog. The content is no longer accessible to your website visitors.
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={closeDeleteSuccessModal}
                  className="flex-1 px-6 py-3 bg-green-600 text-white hover:bg-green-700 rounded-xl font-semibold transition-all duration-200 hover:shadow-md"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Donation Success Modal */}
      {showDeleteDonationSuccess && deletedDonationDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl border border-gray-100">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Donation Deleted Successfully!</h3>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 mb-6 border border-green-200">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <p className="text-sm font-semibold text-green-800">Donation Removed</p>
                </div>
                <p className="text-sm font-semibold text-green-800 mb-2">Deleted Donation:</p>
                <p className="text-base text-gray-900 font-medium mb-1">
                  {deletedDonationDetails.donorName}
                </p>
                <p className="text-lg font-bold text-emerald-600">
                  ${deletedDonationDetails.amount}
                </p>
              </div>
              <p className="text-gray-600 mb-8 leading-relaxed">
                The donation has been permanently removed from your records. This action cannot be undone and the donation data is no longer accessible.
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={closeDeleteDonationSuccessModal}
                  className="flex-1 px-6 py-3 bg-green-600 text-white hover:bg-green-700 rounded-xl font-semibold transition-all duration-200 hover:shadow-md"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Comment Success Modal */}
      {showDeleteCommentSuccess && deletedCommentDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl border border-gray-100">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Comment Deleted Successfully!</h3>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 mb-6 border border-green-200">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <p className="text-sm font-semibold text-green-800">Comment Removed</p>
                </div>
                <p className="text-sm font-semibold text-green-800 mb-2">Deleted Comment:</p>
                <p className="text-base text-gray-900 font-medium mb-2">
                  by <span className="font-semibold">{deletedCommentDetails.authorName}</span>
                </p>
                <p className="text-sm text-gray-700 italic bg-white rounded-lg p-3 border border-gray-200">
                  "{deletedCommentDetails.content}"
                </p>
              </div>
              <p className="text-gray-600 mb-8 leading-relaxed">
                The comment has been permanently removed from your blog. The content is no longer visible to your website visitors.
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={closeDeleteCommentSuccessModal}
                  className="flex-1 px-6 py-3 bg-green-600 text-white hover:bg-green-700 rounded-xl font-semibold transition-all duration-200 hover:shadow-md"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Message Success Modal */}
      {showDeleteMessageSuccess && deletedMessageDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl border border-gray-100">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Message Deleted Successfully!</h3>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 mb-6 border border-green-200">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <p className="text-sm font-semibold text-green-800">Message Removed</p>
                </div>
                <p className="text-sm font-semibold text-green-800 mb-2">Deleted Message:</p>
                <p className="text-base text-gray-900 font-medium mb-1">
                  from <span className="font-semibold">{deletedMessageDetails.senderName}</span>
                </p>
                <p className="text-sm text-gray-700 italic">
                  "{deletedMessageDetails.subject}"
                </p>
              </div>
              <p className="text-gray-600 mb-8 leading-relaxed">
                The contact message has been permanently removed from your records. The content is no longer accessible and cannot be recovered.
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={closeDeleteMessageSuccessModal}
                  className="flex-1 px-6 py-3 bg-green-600 text-white hover:bg-green-700 rounded-xl font-semibold transition-all duration-200 hover:shadow-md"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bible Verses Tab */}
      {activeTab === 'bible-verses' && (
        <BibleVerseManager />
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

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl border border-gray-100">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <LogOut className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Sign Out</h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Are you sure you want to sign out of your account? You'll need to log in again to access the dashboard.
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={cancelLogout}
                  className="flex-1 px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold transition-all duration-200 hover:shadow-md"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmLogout}
                  className="flex-1 px-6 py-3 bg-red-600 text-white hover:bg-red-700 rounded-xl font-semibold transition-all duration-200 hover:shadow-md"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Donation Confirmation Modal */}
      {showDeleteDonationModal && donationToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>

            <div className="text-center mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Delete Donation
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Are you sure you want to delete this donation? This action cannot be undone.
              </p>

              {/* Donation Details */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Donor:</span>
                  <span className="text-sm text-gray-900">
                    {donationToDelete.donorName || 'Anonymous'}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Amount:</span>
                  <span className="text-sm font-bold text-emerald-600">
                    ${donationToDelete.amount}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Date:</span>
                  <span className="text-sm text-gray-900">
                    {new Date(donationToDelete.timestamp).toLocaleDateString()}
                  </span>
                </div>
                {donationToDelete.message && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <span className="text-sm font-medium text-gray-700">Message:</span>
                    <p className="text-sm text-gray-600 mt-1 italic">
                      "{donationToDelete.message}"
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={cancelDeleteDonation}
                className="flex-1 px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold transition-all duration-200 hover:shadow-md"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteDonation}
                className="flex-1 px-6 py-3 bg-red-600 text-white hover:bg-red-700 rounded-xl font-semibold transition-all duration-200 hover:shadow-md"
              >
                Delete Donation
              </button>
            </div>
          </div>
        </div>
      )}
      <ContentSettingsModal
        isOpen={isContentModalOpen}
        onClose={() => setIsContentModalOpen(false)}
      />
      <WhatsAppSettingsModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
      />
      <FooterSettingsModal
        isOpen={isFooterModalOpen}
        onClose={() => setIsFooterModalOpen(false)}
        onSave={(data) => saveSection('footerSettings', data)}
        initialSettings={contentSettings.footerSettings}
      />
    </div>
  );
};

export default Dashboard;

