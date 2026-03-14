import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  MessageCircle,
  Sparkles
} from 'lucide-react';
import AddPostModal from '../components/AddPostModal';
import EditPostModal from '../components/EditPostModal';
import BackgroundSettingsModal from '../components/BackgroundSettingsModal';
import LogoSettingsModal from '../components/LogoSettingsModal';
import SocialSettingsModal from '../components/SocialSettingsModal';
import BibleVerseManager from '../components/BibleVerseManager';
import ContentSettingsModal from '../components/ContentSettingsModal';
import DashboardOverview from '../components/DashboardOverview';
import PostsManager from '../components/PostsManager';
import CommentsManager from '../components/CommentsManager';
import DonationsManager from '../components/DonationsManager';
import MessagesManager from '../components/MessagesManager';
import StorageManager from '../components/StorageManager';
import PrayerManager from '../components/PrayerManager';
import EventManager from '../components/EventManager';
import DevotionalManager from '../components/DevotionalManager';
import ForumManager from '../components/ForumManager';
import UserManager from '../components/UserManager';
import NotificationCenter from '../components/NotificationCenter';
import FooterSettingsModal from '../components/FooterSettingsModal';
import AddEventModal from '../components/AddEventModal';
import AddDevotionalModal from '../components/AddDevotionalModal';
import ForumCategoryModal from '../components/ForumCategoryModal';
import WhatsAppSettingsModal from '../components/WhatsAppSettingsModal';
import { useBackgroundSettings } from '../hooks/useBackgroundSettings';
import { useLogoSettings } from '../hooks/useLogoSettings';
import { useSocialSettings } from '../hooks/useSocialSettings';
import { getStorageInfo, clearAllBlogData } from '../utils/storageManager';
// @ts-ignore
import { blogAPI, contactAPI, donationsAPI, prayerAPI, eventAPI, devotionalAPI, forumAPI, userAPI, statsAPI } from '../services/api';
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
  totalScheduled: number;
  totalUsers?: number;
  soulsActive?: number;
  chartData?: any[];
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
  status: string;
  publishedAt?: string;
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
  console.log('Dashboard component function is executing');
  const { isAuthenticated, user, logout } = useAuth();
  console.log('Dashboard auth state:', { isAuthenticated, user: user?.email });
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
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [isLoadingEditPost, setIsLoadingEditPost] = useState(false);
  const [isAddPostModalOpen, setIsAddPostModalOpen] = useState(false);
  const [isEditPostModalOpen, setIsEditPostModalOpen] = useState(false);
  const [isBackgroundModalOpen, setIsBackgroundModalOpen] = useState(false);
  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);
  const [isSocialModalOpen, setIsSocialModalOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isDevotionalModalOpen, setIsDevotionalModalOpen] = useState(false);
  const [isForumModalOpen, setIsForumModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [selectedDevotional, setSelectedDevotional] = useState<any>(null);
  const [selectedForumCategory, setSelectedForumCategory] = useState<any>(null);
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
    recentMessages: 0,
    totalScheduled: 0,
    chartData: []
  });

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [prayers, setPrayers] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [devotionals, setDevotionals] = useState<any[]>([]);
  const [forumCategories, setForumCategories] = useState<any[]>([]);
  const [forumTopics, setForumTopics] = useState<any[]>([]);
  
  const [showAllPrayers, setShowAllPrayers] = useState(false);

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
    // Redirect to homepage
    window.location.href = '/';
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
    const token = localStorage.getItem('token');
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
        comments: post._count?.comments || 0,
        status: post.status,
        publishedAt: post.publishedAt
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

      // Load Prayers
      let prayersData: any[] = [];
      try {
        const res = await prayerAPI.adminGetAll();
        prayersData = res.data?.requests || [];
      } catch (err) { console.warn('Prayers API failed'); }

      // Load Events
      let eventsData: any[] = [];
      try {
        const res = await eventAPI.getEvents();
        eventsData = res.data || [];
      } catch (err) { console.warn('Events API failed'); }

      // Load Devotionals
      let devotionalsData: any[] = [];
      try {
        const res = await devotionalAPI.getArchive();
        devotionalsData = res.data || [];
      } catch (err) { console.warn('Devotionals API failed'); }

      // Load Forum
      let categoriesData: any[] = [];
      try {
        const res = await forumAPI.getCategories();
        categoriesData = res.data || [];
      } catch (err) { console.warn('Forum categories API failed'); }

      setPosts(transformedPosts);
      setComments(transformedComments);
      setDonations(transformedDonations);
      setMessages(transformedMessages);
      setPrayers(prayersData);
      setEvents(eventsData);
      setDevotionals(devotionalsData);
      setForumCategories(categoriesData);
      
      // Load Users
      let usersData: any[] = [];
      try {
        const res = await userAPI.adminGetAll();
        usersData = res.data?.users || [];
      } catch (err) { console.warn('Users API failed'); }
      setAllUsers(usersData);

      // Calculate/Fetch stats
      let blogStats: any = {};
      try {
        const statsRes = await blogAPI.getStats();
        if (statsRes.success) blogStats = statsRes.data;
      } catch (err) {
        console.warn('Blog stats API failed, using calculation fallback');
      }

      let donationStats: any = {};
      try {
        const statsRes = await donationsAPI.getStats();
        if (statsRes.success) donationStats = statsRes.data;
      } catch (err) {
        console.warn('Donation stats API failed');
      }

      let platformStats: any = {};
      try {
        const statsRes = await statsAPI.getPlatformSummary();
        if (statsRes.success) platformStats = statsRes.data;
      } catch (err) {
        console.warn('Platform stats API failed');
      }

      setStats({
        totalPosts: blogStats.totalPosts || transformedPosts.length,
        totalViews: blogStats.totalViews || transformedPosts.reduce((sum: number, post: any) => sum + post.views, 0),
        totalLikes: blogStats.totalLikes || transformedPosts.reduce((sum: number, post: any) => sum + post.likes, 0),
        totalComments: blogStats.totalComments || transformedComments.length,
        totalDonations: donationStats.totalAmount || transformedDonations.reduce((sum: number, donation: Donation) => sum + donation.amount, 0),
        recentMessages: contactStats.newMessages || transformedMessages.filter(m => !m.isRead).length,
        totalScheduled: blogStats.scheduledPosts || transformedPosts.filter(p => p.status === 'PUBLISHED' && p.publishedAt && new Date(p.publishedAt) > new Date()).length,
        totalUsers: platformStats.totalUsers || usersData.length,
        soulsActive: platformStats.soulsActive || (transformedPosts.length * 3 + transformedMessages.length),
        chartData: blogStats.chartData || []
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
        recentMessages: 0,
        totalScheduled: 0
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
    <div className="h-screen bg-[#0a0a0c] flex overflow-hidden selection:bg-amber-200 dark:selection:bg-amber-900/40">

      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-80' : 'w-24'} bg-black/40 backdrop-blur-2xl border-r border-white/5 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] flex-shrink-0 flex flex-col relative z-30`}>
        {/* Sidebar Header */}
        <div className="p-10 border-b border-white/5 flex-shrink-0 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-amber-500/10 to-transparent"></div>
          <div className="flex items-center justify-between relative z-10">
            {sidebarOpen && (
              <div className="flex items-center space-x-5">
                <div className="relative">
                  <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-amber-600 rounded-[1.25rem] flex items-center justify-center shadow-2xl shadow-amber-500/20 ring-4 ring-white/10 group-hover:rotate-12 transition-transform duration-500">
                    <span className="text-white font-black text-2xl font-serif">T</span>
                  </div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-4 border-[#0a0a0c] shadow-[0_0_15px_rgba(34,197,94,0.5)]"></div>
                </div>
                <div className="leading-tight">
                  <span className="text-xl font-serif font-black text-white tracking-tight">{logoSettings.logoText}</span>
                  <p className="text-[10px] text-amber-500/70 font-black uppercase tracking-[0.2em] mt-0.5">Sanctuary Alpha</p>
                </div>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-3 text-white/50 hover:text-amber-500 hover:bg-white/5 rounded-2xl transition-all border border-white/5 hover:border-amber-500/30 group"
              title={sidebarOpen ? 'Collapse' : 'Expand'}
            >
              <Layout className={`h-6 w-6 transition-transform duration-500 ${sidebarOpen ? '' : 'rotate-180'}`} />
            </button>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 relative overflow-hidden py-8">
          <nav className="px-6 space-y-2 h-full overflow-y-auto no-scrollbar">
            <div className="mb-10">
              {sidebarOpen && (
                <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-6 px-6">
                  Core Operations
                </h3>
              )}
              <div className="space-y-2">
                {[
                  { id: 'overview', label: 'Monitor', icon: BarChart3, color: 'text-amber-500' },
                  { id: 'posts', label: 'Editorial', icon: BookOpen, color: 'text-emerald-500' },
                  { id: 'comments', label: 'Echoes', icon: MessageSquare, color: 'text-purple-500' },
                  { id: 'donations', label: 'Seeds', icon: DollarSign, color: 'text-blue-500' },
                  { id: 'messages', label: 'Scrolls', icon: Mail, color: 'text-indigo-500' },
                  { id: 'bible-verses', label: 'Wisdom', icon: Sparkles, color: 'text-amber-500' },
                  { id: 'prayers', label: 'Intercessions', icon: Heart, color: 'text-red-500' },
                  { id: 'events', label: 'Gatherings', icon: Users, color: 'text-emerald-500' },
                  { id: 'devotionals', label: 'Manna', icon: BookOpen, color: 'text-indigo-400' },
                  { id: 'forum', label: 'Spheres', icon: MessageCircle, color: 'text-purple-400' },
                  { id: 'users', label: 'Disciples', icon: Users, color: 'text-amber-600' }
                ].map(({ id, label, icon: Icon, color }) => (
                  <motion.button
                    key={id}
                    whileHover={{ x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveTab(id)}
                    className={`w-full flex items-center ${sidebarOpen ? 'space-x-4 px-6' : 'justify-center px-2'} py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all duration-300 group ${activeTab === id
                      ? 'bg-amber-600 text-white shadow-2xl shadow-amber-600/30'
                      : 'text-white/50 hover:text-white hover:bg-white/5'
                      }`}
                  >
                    <Icon className={`h-5 w-5 ${activeTab === id ? 'text-white' : color} transition-colors group-hover:scale-110 duration-300`} />
                    {sidebarOpen && <span>{label}</span>}
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="mt-12">
              {sidebarOpen && (
                <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-6 px-6">
                  Sanctuary
                </h3>
              )}
              <div className="space-y-2">
                <motion.button 
                  whileHover={{ x: 5 }}
                  onClick={() => setIsBackgroundModalOpen(true)}
                  className={`w-full flex items-center ${sidebarOpen ? 'space-x-4 px-6' : 'justify-center px-2'} py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-white/50 hover:text-white hover:bg-white/5 transition-all`}
                >
                  <Palette className="w-5 h-5 text-amber-500" />
                  {sidebarOpen && <span>Ambience</span>}
                </motion.button>
                <div className="relative">
                  <motion.button 
                    whileHover={{ x: 5 }}
                    onClick={() => setSettingsDropdownOpen(!settingsDropdownOpen)}
                    className={`w-full flex items-center ${sidebarOpen ? 'space-x-4 px-6' : 'justify-center px-2'} py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-white/50 hover:text-white hover:bg-white/5 transition-all ${settingsDropdownOpen ? 'bg-white/10 text-white' : ''}`}
                  >
                    <Settings className="w-5 h-5 text-blue-500" />
                    {sidebarOpen && (
                      <div className="flex-1 flex items-center justify-between">
                        <span>Systems</span>
                        <ChevronDown className={`h-4 w-4 transition-transform ${settingsDropdownOpen ? 'rotate-180' : ''}`} />
                      </div>
                    )}
                  </motion.button>
                  
                  {settingsDropdownOpen && sidebarOpen && (
                    <div className="mt-2 ml-10 space-y-1 border-l border-white/10 pl-4 py-2">
                      {[
                        { label: 'Storage', icon: HardDrive, onClick: () => setActiveTab('storage') },
                        { label: 'Logo', icon: Image, onClick: () => setIsLogoModalOpen(true) },
                        { label: 'WhatsApp', icon: MessageCircle, onClick: () => setIsWhatsAppModalOpen(true) },
                        { label: 'Footer', icon: Share2, onClick: () => setIsFooterModalOpen(true) }
                      ].map((item, idx) => (
                        <button
                          key={idx}
                          onClick={item.onClick}
                          className="w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-amber-500 transition-colors flex items-center gap-3"
                        >
                          <item.icon className="w-3.5 h-3.5 opacity-50" />
                          {item.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </nav>
        </div>

        {/* Logout Action */}
        {sidebarOpen && (
          <div className="p-10 border-t border-white/5 flex-shrink-0">
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-4 px-10 py-5 text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-[2rem] transition-all border border-transparent hover:border-red-500/20 group"
            >
              <LogOut className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-black text-[10px] uppercase tracking-[0.2em]">Exit Sanctuary</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        {/* Top Header */}
        <div className="bg-black/20 backdrop-blur-xl border-b border-white/5 px-10 py-8 flex-shrink-0 relative">
          <div className="flex items-center justify-between relative z-10">
            {/* Left Section - Mobile Menu */}
            <div className="flex items-center space-x-8">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-3 text-white/50 hover:text-amber-500 hover:bg-white/5 rounded-2xl transition-all border border-white/5"
              >
                <Layout className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-4xl font-serif text-white tracking-tight">Elysium</h1>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                  <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Vitals Synchronized</p>
                </div>
              </div>
            </div>

            {/* Center Section - Search */}
            <div className="flex-1 max-w-xl mx-20 hidden xl:block">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-white/20 group-focus-within:text-amber-500 transition-colors" />
                </div>
                <input
                  type="text"
                  placeholder="Query records..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-16 pr-8 py-5 bg-white/5 border border-white/5 rounded-[2rem] text-sm text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:bg-white/10 transition-all duration-500 backdrop-blur-md"
                />
              </div>
            </div>

            {/* Right Section - Notifications and User Profile */}
            <div className="flex items-center space-x-8">
              {/* Notifications */}
              <NotificationCenter />

              {/* Admin User Profile */}
              <div className="relative user-dropdown">
                <button
                  onClick={toggleUserDropdown}
                  className="w-14 h-14 premium-gradient rounded-2xl flex items-center justify-center shadow-2xl shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all group relative"
                >
                  <span className="text-white font-black text-xl font-serif">A</span>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-4 border-[#0a0a0c]"></div>
                </button>

                {/* User Dropdown */}
                {showUserDropdown && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute right-0 top-[4.5rem] w-80 glass-card p-4 z-50 border border-white/10"
                  >
                    <div className="p-6 bg-white/5 rounded-3xl border border-white/5 mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-14 h-14 premium-gradient rounded-2xl flex items-center justify-center text-white font-black text-xl">
                          A
                        </div>
                        <div>
                          <p className="text-lg font-serif text-white">{user?.name || 'Administrator'}</p>
                          <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">{user?.email || 'root@elysium.com'}</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      {[
                        { label: 'Neural Profile', icon: Users },
                        { label: 'Security Protocols', icon: Settings },
                        { label: 'Support uplink', icon: Mail }
                      ].map((item, idx) => (
                        <button key={idx} className="w-full flex items-center gap-4 px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/50 hover:text-amber-500 hover:bg-white/5 rounded-2xl transition-all">
                          <item.icon className="w-4 h-4" />
                          {item.label}
                        </button>
                      ))}
                      <div className="h-px bg-white/5 my-2"></div>
                      <button onClick={handleLogout} className="w-full flex items-center gap-4 px-6 py-4 text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500/10 rounded-2xl transition-all">
                        <LogOut className="w-4 h-4" />
                        Sever Connection
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-4 overflow-auto">

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <DashboardOverview
              user={user}
              stats={stats}
              comments={comments}
              setActiveTab={setActiveTab}
              setShowAddPostConfirm={setShowAddPostConfirm}
              setIsBackgroundModalOpen={setIsBackgroundModalOpen}
            />
          )}

          {/* Posts Tab */}
          {
            activeTab === 'posts' && (
              <PostsManager
                posts={posts}
                setShowAddPostConfirm={setShowAddPostConfirm}
                setSelectedPost={setSelectedPost}
                setShowEditPostConfirm={setShowEditPostConfirm}
                handleDeletePost={handleDeletePost}
              />
            )
          }

          {/* Comments Tab */}
          {
            activeTab === 'comments' && (
              <CommentsManager
                comments={comments}
                showAllComments={showAllComments}
                expandedComments={expandedComments}
                toggleAllComments={toggleAllComments}
                toggleCommentExpansion={toggleCommentExpansion}
                approveComment={approveComment}
                deleteComment={deleteComment}
              />
            )
          }

          {/* Donations Tab */}
          {
            activeTab === 'donations' && (
              <DonationsManager
                donations={donations}
                stats={stats}
                showAllDonations={showAllDonations}
                toggleAllDonations={toggleAllDonations}
                updateDonationStatus={updateDonationStatus}
                deleteDonation={deleteDonation}
                refreshDonations={loadDashboardData}
              />
            )
          }

          {/* Messages Tab */}
          {
            activeTab === 'messages' && (
              <MessagesManager
                messages={messages}
                showAllMessages={showAllMessages}
                isLoading={isLoading}
                expandedMessages={expandedMessages}
                setShowAllMessages={setShowAllMessages}
                toggleMessageExpansion={toggleMessageExpansion}
                markMessageAsRead={markMessageAsRead}
                deleteMessage={deleteMessage}
              />
            )
          }

          {/* Storage Management Tab */}
          {
            activeTab === 'storage' && (
              <StorageManager
                storageInfo={storageInfo}
                handleCleanupStorage={handleCleanupStorage}
                handleClearAllData={handleClearAllData}
                updateStorageInfo={updateStorageInfo}
              />
            )
          }

          {/* Prayers Tab */}
          {activeTab === 'prayers' && (
            <PrayerManager
              requests={prayers}
              showAll={showAllPrayers}
              toggleAll={() => setShowAllPrayers(!showAllPrayers)}
              togglePraise={async (id) => {
                await prayerAPI.praise(id);
                loadDashboardData();
              }}
              deleteRequest={async (id) => {
                if (window.confirm('Exile this intercession?')) {
                  await prayerAPI.adminDelete(id);
                  loadDashboardData();
                }
              }}
              refresh={loadDashboardData}
            />
          )}

          {/* Events Tab */}
          {activeTab === 'events' && (
            <EventManager
              events={events}
              onAdd={() => {
                setSelectedEvent(null);
                setIsEventModalOpen(true);
              }}
              onEdit={(event) => {
                setSelectedEvent(event);
                setIsEventModalOpen(true);
              }}
              onDelete={async (id) => {
                if (window.confirm('Silence this gathering?')) {
                  await eventAPI.delete(id);
                  loadDashboardData();
                }
              }}
            />
          )}

          {/* Devotionals Tab */}
          {activeTab === 'devotionals' && (
            <DevotionalManager
              devotionals={devotionals}
              onAdd={() => {
                setSelectedDevotional(null);
                setIsDevotionalModalOpen(true);
              }}
              onEdit={(dev) => {
                setSelectedDevotional(dev);
                setIsDevotionalModalOpen(true);
              }}
              onDelete={async (id) => {
                if (window.confirm('Exile this manuscript?')) {
                  await devotionalAPI.delete(id);
                  loadDashboardData();
                }
              }}
            />
          )}

          {/* Forum Tab */}
          {activeTab === 'forum' && (
            <ForumManager
              categories={forumCategories}
              topics={forumTopics}
              onAddCategory={() => {
                setSelectedForumCategory(null);
                setIsForumModalOpen(true);
              }}
              onEditCategory={(cat) => {
                setSelectedForumCategory(cat);
                setIsForumModalOpen(true);
              }}
              onDeleteCategory={async (id) => {
                if (window.confirm('Shatter this sphere?')) {
                  await forumAPI.adminDeleteCategory(id);
                  loadDashboardData();
                }
              }}
              onDeleteTopic={async (id) => {
                if (window.confirm('Silence this discourse?')) {
                  await forumAPI.deleteTopic(id);
                  loadDashboardData();
                }
              }}
              onToggleLock={async (id) => {
                // Topic locking protocol
                const topic = forumTopics.find(t => t.id === id);
                if (topic) {
                   // Add lock logic here if API supports it
                   console.log('Locking topic:', id);
                }
              }}
            />
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <UserManager
              users={allUsers}
              onUpdateRole={async (id, role) => {
                await userAPI.adminUpdateRole(id, role);
                loadDashboardData();
              }}
              onDelete={async (id) => {
                if (window.confirm('Excommunicate this soul from the registry?')) {
                  await userAPI.adminDelete(id);
                  loadDashboardData();
                }
              }}
            />
          )}
        </div >
      </div >

      {/* Add Post Modal */}
      < AddPostModal
        isOpen={isAddPostModalOpen}
        onClose={() => setIsAddPostModalOpen(false)}
        onSave={handleSavePost}
      />

      {/* Edit Post Modal */}
      < EditPostModal
        isOpen={isEditPostModalOpen}
        onClose={() => setIsEditPostModalOpen(false)}
        onSave={handleUpdatePost}
        post={selectedPost}
      />

      {/* Delete Confirmation Modal */}
      {
        deleteConfirmPost && (
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
        )
      }

      {/* Add Post Confirmation Modal */}
      {
        showAddPostConfirm && (
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
        )
      }

      {/* Edit Post Confirmation Modal */}
      {
        showEditPostConfirm && selectedPost && (
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
        )
      }

      {/* Edit Post Success Modal */}
      {
        showEditSuccessModal && (
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
        )
      }

      {/* Add Post Success Modal */}
      {
        showAddPostSuccessModal && (
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
        )
      }

      {/* Delete Post Success Modal */}
      {
        showDeleteSuccessModal && (
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
        )
      }

      {/* Delete Donation Success Modal */}
      {
        showDeleteDonationSuccess && deletedDonationDetails && (
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
        )
      }

      {/* Delete Comment Success Modal */}
      {
        showDeleteCommentSuccess && deletedCommentDetails && (
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
        )
      }

      {/* Delete Message Success Modal */}
      {
        showDeleteMessageSuccess && deletedMessageDetails && (
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
        )
      }

      {/* Bible Verses Tab */}
      {
        activeTab === 'bible-verses' && (
          <BibleVerseManager />
        )
      }

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
      {
        showLogoutConfirm && (
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
        )
      }

      {/* Delete Donation Confirmation Modal */}
      {
        showDeleteDonationModal && donationToDelete && (
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
        )
      }
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

      <AddEventModal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        onSave={loadDashboardData}
        eventToEdit={selectedEvent}
      />

      <AddDevotionalModal
        isOpen={isDevotionalModalOpen}
        onClose={() => setIsDevotionalModalOpen(false)}
        onSave={loadDashboardData}
        devotionalToEdit={selectedDevotional}
      />

      <ForumCategoryModal
        isOpen={isForumModalOpen}
        onClose={() => setIsForumModalOpen(false)}
        onSave={loadDashboardData}
        categoryToEdit={selectedForumCategory}
      />
    </div >
  );
};

export default Dashboard;

