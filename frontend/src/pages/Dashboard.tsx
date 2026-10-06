import { useState, useEffect, useRef } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Users,
  MessageSquare,
  Heart,
  DollarSign,
  Plus,
  Edit,
  Trash2,
  Mail,
  BookOpen,
  Settings,
  Palette,
  Search,
  HardDrive,
  Image,
  Share2,
  LogOut,
  Layout,
  MessageCircle,
  Sparkles,
  Mic,
  Menu,
  X,
  Home,
  Calendar,
  User as UserIcon
} from 'lucide-react';
import AddPostModal from '../components/AddPostModal';
import EditPostModal from '../components/EditPostModal';
import BackgroundSettingsModal from '../components/BackgroundSettingsModal';
import LogoSettingsModal from '../components/LogoSettingsModal';
import SocialSettingsModal from '../components/SocialSettingsModal';
import BibleVerseManager from '../components/BibleVerseManager';
import AudioEpisodeManager from '../components/AudioEpisodeManager';
import ContentSettingsModal from '../components/ContentSettingsModal';
import DashboardOverview from '../components/DashboardOverview';
import PostsManager from '../components/PostsManager';
import CommentsManager from '../components/CommentsManager';
import DonationsManager from '../components/DonationsManager';
import MessagesManager from '../components/MessagesManager';
import StorageManager from '../components/StorageManager';
import PrayerManager from '../components/PrayerManager';
import EventManager from '../components/EventManager';
import UserManager from '../components/UserManager';
import NewsletterManager from '../components/NewsletterManager';
import NotificationCenter from '../components/NotificationCenter';
import ThemeToggle from '../components/ThemeToggle';
import FooterSettingsModal from '../components/FooterSettingsModal';
import AddEventModal from '../components/AddEventModal';
import WhatsAppSettingsModal from '../components/WhatsAppSettingsModal';
import { useBackgroundSettings } from '../hooks/useBackgroundSettings';
import { useLogoSettings } from '../hooks/useLogoSettings';
import { useSocialSettings } from '../hooks/useSocialSettings';
import { getStorageInfo, clearAllBlogData } from '../utils/storageManager';
// @ts-ignore
import { blogAPI, contactAPI, donationsAPI, prayerAPI, eventAPI, userAPI, statsAPI, bibleVersesAPI, audioEpisodesAPI, newsletterAPI, uploadAPI } from '../services/api';
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

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'posts', label: 'Posts', icon: BookOpen },
  { id: 'comments', label: 'Comments', icon: MessageSquare },
  { id: 'donations', label: 'Donations', icon: DollarSign },
  { id: 'messages', label: 'Messages', icon: Mail },
  { id: 'bible-verses', label: 'Bible Verses', icon: Sparkles },
  { id: 'audio-episodes', label: 'Devotionals', icon: Mic },
  { id: 'prayers', label: 'Prayer Wall', icon: Heart },
  { id: 'events', label: 'Events', icon: Calendar },
];

const NAV_LABELS: Record<string, string> = {
  ...Object.fromEntries(NAV_ITEMS.map(({ id, label }) => [id, label])),
  storage: 'Storage',
  users: 'Users',
  newsletter: 'Newsletter',
};

const Dashboard = () => {
  console.log('Dashboard component function is executing');
  const { isAuthenticated, user, logout } = useAuth();
  console.log('Dashboard auth state:', { isAuthenticated, user: user?.email });
  const isPastor = user?.role === 'PASTOR';
  const canAccessAdminDashboard = user?.role === 'ADMIN' || isPastor;
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [isFooterModalOpen, setIsFooterModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: '', profileImage: '', bio: '' });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUploadingProfileImage, setIsUploadingProfileImage] = useState(false);
  const profileFileInputRef = useRef<HTMLInputElement>(null);
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

  const [showAllPrayers, setShowAllPrayers] = useState(false);
  const [versesCount, setVersesCount] = useState(0);
  const [episodesCount, setEpisodesCount] = useState(0);
  const [subscribersCount, setSubscribersCount] = useState(0);

  useEffect(() => {
    console.log('Dashboard useEffect - isAuthenticated:', isAuthenticated, 'user:', user);

    if (isAuthenticated) {
      loadDashboardData();
    } else {
      // Not authenticated (shouldn't normally happen - ProtectedRoute
      // handles the redirect) - don't leave the skeleton stuck forever.
      setIsLoading(false);
    }
    updateStorageInfo();
  }, [isAuthenticated]);

  // Pastors can't see Overview (its stats need admin-only endpoints), so
  // send them straight to Posts once we know their role.
  useEffect(() => {
    if (isPastor && activeTab === 'overview') {
      setActiveTab('posts');
    }
  }, [isPastor]);

  useEffect(() => {
    if (user) {
      setProfileForm({ name: user.name || '', profileImage: user.profileImage || '', bio: user.bio || '' });
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    try {
      const response = await userAPI.updateProfile(profileForm);
      if (response.success) {
        setIsProfileModalOpen(false);
        const updatedUser = { ...user, ...profileForm };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        window.location.reload();
      }
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      alert(error.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingProfileImage(true);
    try {
      const response = await uploadAPI.uploadProfileImage(file);
      if (response.success && response.data) {
        const url = response.data.url;
        setProfileForm(prev => ({ ...prev, profileImage: url }));
      }
    } catch (error) {
      console.error('Image upload failed:', error);
    } finally {
      setIsUploadingProfileImage(false);
    }
  };

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

    // Every call below is independent of every other - they were
    // previously awaited one at a time, turning ~12 network round trips
    // into a strictly sequential chain (the actual cause of the long
    // load). Firing them all at once cuts total wait time down to
    // whichever single call is slowest, instead of the sum of all of
    // them. `safe()` preserves the old per-call fallback-on-failure
    // behavior that the individual try/catch blocks used to provide.
    const safe = async <T,>(promise: Promise<T>, fallback: T, label: string): Promise<T> => {
      try {
        return await promise;
      } catch (error: any) {
        console.warn(`${label} API failed:`, error?.message);
        return fallback;
      }
    };

    try {
      const [
        postsResponse,
        commentsResponse,
        donationsResponse,
        messagesResponse,
        prayersRes,
        eventsRes,
        versesRes,
        episodesRes,
        subscribersRes,
        usersRes,
        blogStatsRes,
        donationStatsRes,
        platformStatsRes,
        contactStatsRes
      ] = await Promise.all([
        safe(blogAPI.getAllPosts(), { success: false } as any, 'Posts'),
        // Comments/donations/messages/prayers/events/users/stats are all
        // admin-only endpoints a Pastor can't use (and never sees, since
        // those tabs are hidden for them) - skip the requests entirely
        // instead of letting them 403.
        isPastor ? Promise.resolve({ success: false } as any) : safe(blogAPI.getAdminComments(), { success: false } as any, 'Comments'),
        isPastor ? Promise.resolve({ success: false } as any) : safe(donationsAPI.getDonations(), { success: false } as any, 'Donations'),
        isPastor ? Promise.resolve({ success: false } as any) : safe(contactAPI.getContacts(), { success: false } as any, 'Contact messages'),
        isPastor ? Promise.resolve({ success: false } as any) : safe(prayerAPI.adminGetAll(), { success: false } as any, 'Prayers'),
        isPastor ? Promise.resolve({ success: false } as any) : safe(eventAPI.getEvents(), { success: false } as any, 'Events'),
        safe(bibleVersesAPI.getVerses({ includeInactive: true }), { success: false } as any, 'Bible verses'),
        safe(audioEpisodesAPI.getAllEpisodes(), { success: false } as any, 'Audio episodes'),
        isPastor ? Promise.resolve({ success: false } as any) : safe(newsletterAPI.getSubscribers(), { success: false } as any, 'Newsletter subscribers'),
        isPastor ? Promise.resolve({ success: false } as any) : safe(userAPI.adminGetAll(), { success: false } as any, 'Users'),
        isPastor ? Promise.resolve({ success: false } as any) : safe(blogAPI.getStats(), { success: false } as any, 'Blog stats'),
        isPastor ? Promise.resolve({ success: false } as any) : safe(donationsAPI.getStats(), { success: false } as any, 'Donation stats'),
        isPastor ? Promise.resolve({ success: false } as any) : safe(statsAPI.getPlatformSummary(), { success: false } as any, 'Platform stats'),
        isPastor ? Promise.resolve({ success: false } as any) : safe(contactAPI.getStats(), { success: false } as any, 'Contact stats')
      ]);

      const postsData = postsResponse.data?.posts || [];
      const allComments = commentsResponse.data?.comments || [];
      const donationsData = donationsResponse.data?.donations || [];
      const messagesData = messagesResponse.data?.contacts || [];
      const prayersData = prayersRes.data?.requests || [];
      const eventsData = eventsRes.data || [];

      setVersesCount(versesRes.data?.verses?.length ?? 0);
      setEpisodesCount(episodesRes.data?.episodes?.length ?? 0);
      if (!isPastor) setSubscribersCount(subscribersRes.data?.subscribers?.length ?? 0);

      const usersData = usersRes.data?.users || [];
      const blogStats: any = blogStatsRes.success ? blogStatsRes.data : {};
      const donationStats: any = donationStatsRes.success ? donationStatsRes.data : {};
      const platformStats: any = platformStatsRes.success ? platformStatsRes.data : {};
      const contactStats: any = contactStatsRes.success ? contactStatsRes.data : {};

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

      setPosts(transformedPosts);
      setComments(transformedComments);
      setDonations(transformedDonations);
      setMessages(transformedMessages);
      setPrayers(prayersData);
      setEvents(eventsData);
      setAllUsers(usersData);

      setStats({
        totalPosts: blogStats.totalPosts || transformedPosts.length,
        totalViews: blogStats.totalViews || transformedPosts.reduce((sum: number, post: any) => sum + post.views, 0),
        totalLikes: blogStats.totalLikes || transformedPosts.reduce((sum: number, post: any) => sum + post.likes, 0),
        totalComments: blogStats.totalComments || transformedComments.length,
        totalDonations: donationStats.totalAmount || transformedDonations.reduce((sum: number, donation: Donation) => sum + donation.amount, 0),
        recentMessages: contactStats.newMessages || transformedMessages.filter(m => !m.isRead).length,
        totalScheduled: blogStats.scheduledPosts || transformedPosts.filter(p => p.status === 'PUBLISHED' && p.publishedAt && new Date(p.publishedAt) > new Date()).length,
        totalUsers: platformStats.totalUsers || usersData.length,
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
    } finally {
      // Only matters the first time - after that isLoading is already
      // false, so later refreshes (post save/delete etc.) are a no-op
      // here instead of re-flashing the full-page skeleton.
      setIsLoading(false);
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

  // Quick hide/unhide (DRAFT <-> PUBLISHED) without opening the full edit
  // form - mainly so Admin can take down a Pastor's post in one click.
  const handleToggleHidePost = async (post: any) => {
    try {
      const newStatus = post.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
      await blogAPI.updatePost(post.id, { status: newStatus });
      await loadDashboardData();
    } catch (error) {
      console.error('Error toggling post visibility:', error);
      alert('Failed to update post visibility. Please try again.');
    }
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


  // Members (and anyone without Admin/Pastor privileges) don't get this
  // console - send them to their own dashboard instead. Relying on
  // client-side role alone is fine here since every actual admin action
  // is still enforced server-side.
  if (!canAccessAdminDashboard) {
    return <Navigate to="/member-dashboard" replace />;
  }

  return (
    <div className="h-screen bg-white dark:bg-[#0a0a0a] flex overflow-hidden">

      {/* Mobile drawer backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar (desktop: persistent; mobile: slide-out drawer) */}
      <div className={`fixed lg:static inset-y-0 right-0 lg:right-auto lg:left-0 z-50 w-72 bg-white dark:bg-[#0a0a0a] border-l lg:border-l-0 lg:border-r border-gray-300 dark:border-white/15 flex-shrink-0 flex flex-col transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}>
        {/* Sidebar Header */}
        <div className="h-20 px-5 flex-shrink-0 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 min-w-0">
            <img src="/images/logo.png" alt="Ihema" className="h-14 w-auto max-w-full object-contain dark:hidden" />
            <img src="/images/logo-dark.png" alt="Ihema" className="h-14 w-auto max-w-full object-contain hidden dark:block" />
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 pt-3 md:pt-4 pb-5 space-y-6">
          <div>
            <div className="space-y-1">
              {(isPastor ? NAV_ITEMS.filter(({ id }) => ['posts', 'bible-verses', 'audio-episodes'].includes(id)) : NAV_ITEMS).map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => { setActiveTab(id); setSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-bold transition-colors ${activeTab === id
                    ? 'bg-amber-700 text-white border border-amber-700'
                    : 'border border-gray-300 dark:border-white/15 bg-white dark:bg-[#141417] text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10'
                    }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {!isPastor && (
          <div>
            <p className="px-3 mb-2 text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">Settings</p>
            <div className="space-y-1">
              <button
                onClick={() => { setActiveTab('users'); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-bold transition-colors ${activeTab === 'users'
                  ? 'bg-amber-700 text-white border border-amber-700'
                  : 'border border-gray-300 dark:border-white/15 bg-white dark:bg-[#141417] text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10'
                  }`}
              >
                <Users className="h-4 w-4 shrink-0" />
                Users
              </button>
              <button
                onClick={() => { setActiveTab('newsletter'); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-bold transition-colors ${activeTab === 'newsletter'
                  ? 'bg-amber-700 text-white border border-amber-700'
                  : 'border border-gray-300 dark:border-white/15 bg-white dark:bg-[#141417] text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10'
                  }`}
              >
                <Mail className="h-4 w-4 shrink-0" />
                Newsletter
              </button>
              <button
                onClick={() => setIsBackgroundModalOpen(true)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md border border-gray-300 dark:border-white/15 bg-white dark:bg-[#141417] text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
              >
                <Palette className="h-4 w-4 shrink-0" />
                Background
              </button>
              <button
                onClick={() => { setActiveTab('storage'); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-bold transition-colors ${activeTab === 'storage'
                  ? 'bg-amber-700 text-white border border-amber-700'
                  : 'border border-gray-300 dark:border-white/15 bg-white dark:bg-[#141417] text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10'
                  }`}
              >
                <HardDrive className="h-4 w-4 shrink-0" />
                Storage
              </button>
              <button
                onClick={() => setIsLogoModalOpen(true)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md border border-gray-300 dark:border-white/15 bg-white dark:bg-[#141417] text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
              >
                <Image className="h-4 w-4 shrink-0" />
                Logo
              </button>
              <button
                onClick={() => setIsSocialModalOpen(true)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md border border-gray-300 dark:border-white/15 bg-white dark:bg-[#141417] text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
              >
                <Share2 className="h-4 w-4 shrink-0" />
                Social Links
              </button>
              <button
                onClick={() => setIsWhatsAppModalOpen(true)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md border border-gray-300 dark:border-white/15 bg-white dark:bg-[#141417] text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
              >
                <MessageCircle className="h-4 w-4 shrink-0" />
                WhatsApp
              </button>
              <button
                onClick={() => setIsFooterModalOpen(true)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md border border-gray-300 dark:border-white/15 bg-white dark:bg-[#141417] text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
              >
                <Layout className="h-4 w-4 shrink-0" />
                Footer
              </button>
              <button
                onClick={() => setIsContentModalOpen(true)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md border border-gray-300 dark:border-white/15 bg-white dark:bg-[#141417] text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
              >
                <Settings className="h-4 w-4 shrink-0" />
                Page Content
              </button>
            </div>
          </div>
          )}
        </nav>

        {/* Footer actions */}
        <div className="p-3 border-t border-gray-300 dark:border-white/15 flex-shrink-0 space-y-1">
          <Link
            to="/"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md border border-gray-300 dark:border-white/15 bg-white dark:bg-[#141417] text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
          >
            <Home className="h-4 w-4 shrink-0" />
            Back to Site
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Sign Out
          </button>
        </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top Header */}
        <div className="h-20 bg-white dark:bg-[#0a0a0a] border-b-2 border-gray-300 dark:border-white/15 px-4 md:px-8 flex-shrink-0 flex items-center">
          {/* Mobile bar: logo / title / notifications / profile / menu */}
          <div className="lg:hidden flex items-center gap-2 w-full">
            <Link to="/" className="shrink-0">
              <img src="/images/logo.png" alt="Ihema" className="h-8 w-auto object-contain dark:hidden" />
              <img src="/images/logo-dark.png" alt="Ihema" className="h-8 w-auto object-contain hidden dark:block" />
            </Link>

            <div className="flex-1 min-w-0 bg-white dark:bg-[#141417] border border-gray-400 dark:border-white/20 rounded-lg shadow-sm px-3 py-2">
              <h1 className="text-base font-black uppercase tracking-tight text-gray-900 dark:text-white truncate">
                {NAV_LABELS[activeTab] || 'Dashboard'}
              </h1>
            </div>

            <ThemeToggle />

            <NotificationCenter />

            <div className="relative user-dropdown shrink-0">
              <button
                onClick={toggleUserDropdown}
                className="w-9 h-9 bg-amber-700 rounded-full flex items-center justify-center text-white font-bold text-sm hover:bg-amber-800 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-600/50"
              >
                {(user?.name || 'A').charAt(0).toUpperCase()}
              </button>

              {showUserDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 top-12 w-64 bg-white dark:bg-[#141417] border border-gray-400 dark:border-white/20 rounded-lg shadow-lg py-2 z-50"
                >
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-white/10">
                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user?.name || 'Administrator'}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                  </div>
                  <button
                    onClick={() => { setIsProfileModalOpen(true); setShowUserDropdown(false); }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                  >
                    <UserIcon className="w-4 h-4" />
                    Edit Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </motion.div>
              )}
            </div>

            <button
              onClick={() => setSidebarOpen(true)}
              className="shrink-0 p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-600/50"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>

          {/* Desktop bar */}
          <div className="hidden lg:flex items-center justify-between gap-3 w-full">
            <div className="bg-white dark:bg-[#141417] border border-gray-400 dark:border-white/20 rounded-lg shadow-sm px-4 py-2">
              <h1 className="text-xl font-black uppercase tracking-tight text-gray-900 dark:text-white truncate">
                {NAV_LABELS[activeTab] || 'Dashboard'}
              </h1>
            </div>

            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-400 dark:border-white/20 bg-white dark:bg-[#141417] text-gray-900 dark:text-white rounded-md focus:outline-none focus:border-amber-600 transition-colors"
                />
              </div>
            </div>

            <div className="flex items-center gap-4 shrink-0">
              <ThemeToggle />
              <NotificationCenter />
              <div className="relative user-dropdown">
                <button
                  onClick={toggleUserDropdown}
                  className="w-10 h-10 bg-amber-700 rounded-full flex items-center justify-center text-white font-bold text-sm hover:bg-amber-800 transition-colors"
                >
                  {(user?.name || 'A').charAt(0).toUpperCase()}
                </button>

                {showUserDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute right-0 top-12 w-64 bg-white dark:bg-[#141417] border border-gray-400 dark:border-white/20 rounded-lg shadow-lg py-2 z-50"
                  >
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-white/10">
                      <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user?.name || 'Administrator'}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                    </div>
                    <button
                      onClick={() => { setIsProfileModalOpen(true); setShowUserDropdown(false); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                    >
                      <UserIcon className="w-4 h-4" />
                      Edit Profile
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 px-4 md:px-8 pt-3 md:pt-4 pb-20 lg:pb-8 overflow-auto">

          {/* Content skeleton - shown while loadDashboardData() is still
              in flight. Sidebar/header stay mounted and interactive the
              whole time; only this area swaps for a layout matching the
              Overview tab (what Admin/Pastor land on first). */}
          {isLoading && (
            <div className="space-y-4 md:space-y-6 animate-pulse">
              <div className="h-20 bg-gray-100 dark:bg-white/10 rounded-lg border border-gray-300 dark:border-white/15" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-24 bg-gray-100 dark:bg-white/10 rounded-lg border border-gray-300 dark:border-white/15" />
                ))}
              </div>
              <div className="h-64 bg-gray-100 dark:bg-white/10 rounded-lg border border-gray-300 dark:border-white/15" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="h-48 bg-gray-100 dark:bg-white/10 rounded-lg border border-gray-300 dark:border-white/15" />
                <div className="h-48 bg-gray-100 dark:bg-white/10 rounded-lg border border-gray-300 dark:border-white/15" />
              </div>
            </div>
          )}

          {/* Overview Tab */}
          {!isLoading && activeTab === 'overview' && (
            <DashboardOverview
              user={user}
              stats={stats}
              comments={comments}
              donationsCount={donations.length}
              messagesCount={messages.length}
              prayersCount={prayers.length}
              eventsCount={events.length}
              usersCount={allUsers.length}
              versesCount={versesCount}
              episodesCount={episodesCount}
              subscribersCount={subscribersCount}
              setActiveTab={setActiveTab}
              setShowAddPostConfirm={setShowAddPostConfirm}
              setIsBackgroundModalOpen={setIsBackgroundModalOpen}
            />
          )}

          {/* Posts Tab */}
          {
            !isLoading && activeTab === 'posts' && (
              <PostsManager
                posts={posts}
                setShowAddPostConfirm={setShowAddPostConfirm}
                setSelectedPost={setSelectedPost}
                setShowEditPostConfirm={setShowEditPostConfirm}
                handleDeletePost={handleDeletePost}
                handleToggleHidePost={handleToggleHidePost}
              />
            )
          }

          {/* Comments Tab */}
          {
            !isLoading && activeTab === 'comments' && (
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
            !isLoading && activeTab === 'donations' && (
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
            !isLoading && activeTab === 'messages' && (
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
            !isLoading && activeTab === 'storage' && (
              <StorageManager
                storageInfo={storageInfo}
                handleCleanupStorage={handleCleanupStorage}
                handleClearAllData={handleClearAllData}
                updateStorageInfo={updateStorageInfo}
              />
            )
          }

          {/* Prayers Tab */}
          {!isLoading && activeTab === 'prayers' && (
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
          {!isLoading && activeTab === 'events' && (
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

          {/* Users Tab */}
          {!isLoading && activeTab === 'users' && (
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
              onPastorRequest={async (id, action) => {
                await userAPI.adminPastorRequest(id, action);
                loadDashboardData();
              }}
            />
          )}

          {/* Newsletter Tab */}
          {!isLoading && activeTab === 'newsletter' && (
            <NewsletterManager />
          )}

          {/* Bible Verses Tab */}
          {!isLoading && activeTab === 'bible-verses' && (
            <BibleVerseManager />
          )}

          {/* Audio Episodes Tab */}
          {!isLoading && activeTab === 'audio-episodes' && (
            <AudioEpisodeManager />
          )}
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed inset-x-3 bottom-0 z-40 pb-[env(safe-area-inset-bottom)]" aria-label="Dashboard">
        <div className="relative flex items-stretch justify-around gap-0.5 px-2 bg-white/95 dark:bg-[#0e0e10]/95 backdrop-blur-xl rounded-t-[2.5rem] rounded-b-none border-2 border-b-0 border-gray-400 dark:border-white/20 shadow-2xl overflow-hidden">
          <span className="absolute inset-x-6 bottom-0 h-px bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />
          {(isPastor ? [
            { id: 'posts', label: 'Posts', icon: BookOpen },
            { id: 'bible-verses', label: 'Verses', icon: Sparkles },
            { id: 'audio-episodes', label: 'Audio', icon: Mic },
          ] : [
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'posts', label: 'Posts', icon: BookOpen },
            { id: 'comments', label: 'Comments', icon: MessageSquare },
            { id: 'prayers', label: 'Prayers', icon: Heart },
          ]).map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => { setActiveTab(id); setSidebarOpen(false); }}
                className="flex flex-1 items-center justify-center py-1.5 min-w-0"
              >
                <span
                  className={`flex w-full flex-col items-center justify-center gap-1 px-2 py-2 rounded-full border-2 bg-white dark:bg-[#141417] transition-colors ${isActive ? 'border-amber-700 text-amber-700' : 'border-transparent text-gray-600 dark:text-gray-300'
                    }`}
                >
                  <Icon className={`h-5 w-5 transition-colors ${isActive ? 'text-amber-700' : ''}`} strokeWidth={isActive ? 2.75 : 2.25} />
                  <span className={`text-[10px] tracking-wide truncate transition-colors ${isActive ? 'text-amber-700 font-bold' : 'text-gray-600 dark:text-gray-300 font-semibold'
                    }`}>
                    {label}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </nav>

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
            <div className="bg-white dark:bg-[#141417] rounded-lg max-w-md w-full p-8 shadow-2xl border border-gray-400 dark:border-white/20">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Trash2 className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-lg font-black uppercase tracking-tight text-gray-900 dark:text-white mb-4">Delete Post</h3>
                <div className="bg-red-50 dark:bg-red-900/10 rounded-md p-4 mb-6 border border-red-200 dark:border-red-900/30">
                  <p className="text-sm font-bold text-red-700 dark:text-red-400 mb-2">Post Title:</p>
                  <p className="text-base text-gray-900 dark:text-white font-medium">"{deleteConfirmPost.title}"</p>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                  Are you sure you want to delete this post? This action cannot be undone and will permanently remove the post from your blog.
                </p>
                <div className="flex space-x-4">
                  <button
                    onClick={() => setDeleteConfirmPost(null)}
                    className="flex-1 px-6 py-3 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-white/15 bg-white dark:bg-[#141417] hover:bg-gray-100 dark:hover:bg-white/10 rounded-md font-black uppercase tracking-widest text-xs transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDeletePost}
                    className="flex-1 px-6 py-3 bg-red-600 text-white hover:bg-red-700 rounded-md font-black uppercase tracking-widest text-xs transition-colors"
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
            <div className="bg-white dark:bg-[#141417] rounded-lg max-w-md w-full p-8 shadow-2xl border border-gray-400 dark:border-white/20">
              <div className="text-center">
                <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Plus className="h-8 w-8 text-amber-700" />
                </div>
                <h3 className="text-lg font-black uppercase tracking-tight text-gray-900 dark:text-white mb-4">Create New Post</h3>
                <div className="bg-emerald-50 dark:bg-emerald-900/10 rounded-md p-4 mb-6 border border-emerald-200 dark:border-emerald-900/30">
                  <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400 mb-2">Ready to create?</p>
                  <p className="text-base text-gray-900 dark:text-white font-medium">You're about to create a new blog post for your website</p>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                  This will open the post editor where you can add your title, content, images, and other post details.
                </p>
                <div className="flex space-x-4">
                  <button
                    onClick={cancelAddPost}
                    className="flex-1 px-6 py-3 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-white/15 bg-white dark:bg-[#141417] hover:bg-gray-100 dark:hover:bg-white/10 rounded-md font-black uppercase tracking-widest text-xs transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmAddPost}
                    className="flex-1 px-6 py-3 bg-amber-700 text-white hover:bg-amber-800 rounded-md font-black uppercase tracking-widest text-xs transition-colors"
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
            <div className="bg-white dark:bg-[#141417] rounded-lg max-w-md w-full p-8 shadow-2xl border border-gray-400 dark:border-white/20">
              <div className="text-center">
                <div className="w-16 h-16 bg-amber-50 dark:bg-amber-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Edit className="h-8 w-8 text-amber-700" />
                </div>
                <h3 className="text-lg font-black uppercase tracking-tight text-gray-900 dark:text-white mb-4">Edit Post</h3>
                <div className="bg-amber-50 dark:bg-amber-900/10 rounded-md p-4 mb-6 border border-amber-200 dark:border-amber-900/30">
                  <p className="text-sm font-bold text-amber-700 dark:text-amber-400 mb-2">Post Title:</p>
                  <p className="text-base text-gray-900 dark:text-white font-medium">"{selectedPost.title}"</p>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                  You're about to edit this blog post. Any changes you make will be saved and published to your website.
                </p>
                <div className="flex space-x-4">
                  <button
                    onClick={cancelEditPost}
                    className="flex-1 px-6 py-3 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-white/15 bg-white dark:bg-[#141417] hover:bg-gray-100 dark:hover:bg-white/10 rounded-md font-black uppercase tracking-widest text-xs transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmEditPost}
                    disabled={isLoadingEditPost}
                    className="flex-1 px-6 py-3 bg-amber-700 text-white hover:bg-amber-800 rounded-md font-black uppercase tracking-widest text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
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
            <div className="bg-white dark:bg-[#141417] rounded-lg max-w-md w-full p-8 shadow-2xl border border-gray-400 dark:border-white/20">
              <div className="text-center">
                <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-lg font-black uppercase tracking-tight text-gray-900 dark:text-white mb-4">Post Updated Successfully!</h3>
                <div className="bg-emerald-50 dark:bg-emerald-900/10 rounded-md p-4 mb-6 border border-emerald-200 dark:border-emerald-900/30">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                    <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">Changes Saved</p>
                  </div>
                  <p className="text-base text-gray-900 dark:text-white font-medium">Your blog post has been updated and is now live on your website</p>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                  The post has been successfully updated with all your changes. You can continue editing other posts or manage your blog content.
                </p>
                <div className="flex space-x-4">
                  <button
                    onClick={closeEditSuccessModal}
                    className="flex-1 px-6 py-3 bg-amber-700 text-white hover:bg-amber-800 rounded-md font-black uppercase tracking-widest text-xs transition-colors"
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
            <div className="bg-white dark:bg-[#141417] rounded-lg max-w-md w-full p-8 shadow-2xl border border-gray-400 dark:border-white/20">
              <div className="text-center">
                <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-lg font-black uppercase tracking-tight text-gray-900 dark:text-white mb-4">Post Created Successfully!</h3>
                <div className="bg-emerald-50 dark:bg-emerald-900/10 rounded-md p-4 mb-6 border border-emerald-200 dark:border-emerald-900/30">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                    <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">Post Published</p>
                  </div>
                  <p className="text-base text-gray-900 dark:text-white font-medium">Your new blog post has been created and is now live on your website</p>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                  The post has been successfully saved to the database and published. You can continue creating more posts or manage your existing content.
                </p>
                <div className="flex space-x-4">
                  <button
                    onClick={closeAddPostSuccessModal}
                    className="flex-1 px-6 py-3 bg-amber-700 text-white hover:bg-amber-800 rounded-md font-black uppercase tracking-widest text-xs transition-colors"
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
            <div className="bg-white dark:bg-[#141417] rounded-lg max-w-md w-full p-8 shadow-2xl border border-gray-400 dark:border-white/20">
              <div className="text-center">
                <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-lg font-black uppercase tracking-tight text-gray-900 dark:text-white mb-4">Post Deleted Successfully!</h3>
                <div className="bg-emerald-50 dark:bg-emerald-900/10 rounded-md p-4 mb-6 border border-emerald-200 dark:border-emerald-900/30">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                    <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">Post Removed</p>
                  </div>
                  <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400 mb-2">Deleted Post:</p>
                  <p className="text-base text-gray-900 dark:text-white font-medium">"{deletedPostTitle}"</p>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                  The post has been permanently removed from your blog. The content is no longer accessible to your website visitors.
                </p>
                <div className="flex space-x-4">
                  <button
                    onClick={closeDeleteSuccessModal}
                    className="flex-1 px-6 py-3 bg-amber-700 text-white hover:bg-amber-800 rounded-md font-black uppercase tracking-widest text-xs transition-colors"
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
            <div className="bg-white dark:bg-[#141417] rounded-lg max-w-md w-full p-8 shadow-2xl border border-gray-400 dark:border-white/20">
              <div className="text-center">
                <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-lg font-black uppercase tracking-tight text-gray-900 dark:text-white mb-4">Donation Deleted Successfully!</h3>
                <div className="bg-emerald-50 dark:bg-emerald-900/10 rounded-md p-4 mb-6 border border-emerald-200 dark:border-emerald-900/30">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                    <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">Donation Removed</p>
                  </div>
                  <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400 mb-2">Deleted Donation:</p>
                  <p className="text-base text-gray-900 dark:text-white font-medium mb-1">
                    {deletedDonationDetails.donorName}
                  </p>
                  <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                    ${deletedDonationDetails.amount}
                  </p>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                  The donation has been permanently removed from your records. This action cannot be undone and the donation data is no longer accessible.
                </p>
                <div className="flex space-x-4">
                  <button
                    onClick={closeDeleteDonationSuccessModal}
                    className="flex-1 px-6 py-3 bg-amber-700 text-white hover:bg-amber-800 rounded-md font-black uppercase tracking-widest text-xs transition-colors"
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
            <div className="bg-white dark:bg-[#141417] rounded-lg max-w-md w-full p-8 shadow-2xl border border-gray-400 dark:border-white/20">
              <div className="text-center">
                <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-lg font-black uppercase tracking-tight text-gray-900 dark:text-white mb-4">Comment Deleted Successfully!</h3>
                <div className="bg-emerald-50 dark:bg-emerald-900/10 rounded-md p-4 mb-6 border border-emerald-200 dark:border-emerald-900/30">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                    <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">Comment Removed</p>
                  </div>
                  <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400 mb-2">Deleted Comment:</p>
                  <p className="text-base text-gray-900 dark:text-white font-medium mb-2">
                    by <span className="font-semibold">{deletedCommentDetails.authorName}</span>
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 italic bg-white dark:bg-white/5 rounded-lg p-3 border border-gray-200 dark:border-white/10">
                    "{deletedCommentDetails.content}"
                  </p>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                  The comment has been permanently removed from your blog. The content is no longer visible to your website visitors.
                </p>
                <div className="flex space-x-4">
                  <button
                    onClick={closeDeleteCommentSuccessModal}
                    className="flex-1 px-6 py-3 bg-amber-700 text-white hover:bg-amber-800 rounded-md font-black uppercase tracking-widest text-xs transition-colors"
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
            <div className="bg-white dark:bg-[#141417] rounded-lg max-w-md w-full p-8 shadow-2xl border border-gray-400 dark:border-white/20">
              <div className="text-center">
                <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-lg font-black uppercase tracking-tight text-gray-900 dark:text-white mb-4">Message Deleted Successfully!</h3>
                <div className="bg-emerald-50 dark:bg-emerald-900/10 rounded-md p-4 mb-6 border border-emerald-200 dark:border-emerald-900/30">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                    <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">Message Removed</p>
                  </div>
                  <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400 mb-2">Deleted Message:</p>
                  <p className="text-base text-gray-900 dark:text-white font-medium mb-1">
                    from <span className="font-semibold">{deletedMessageDetails.senderName}</span>
                  </p>
                  <p className="text-sm text-gray-700 italic">
                    "{deletedMessageDetails.subject}"
                  </p>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                  The contact message has been permanently removed from your records. The content is no longer accessible and cannot be recovered.
                </p>
                <div className="flex space-x-4">
                  <button
                    onClick={closeDeleteMessageSuccessModal}
                    className="flex-1 px-6 py-3 bg-amber-700 text-white hover:bg-amber-800 rounded-md font-black uppercase tracking-widest text-xs transition-colors"
                  >
                    Continue
                  </button>
                </div>
              </div>
            </div>
          </div>
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
            <div className="bg-white dark:bg-[#141417] rounded-lg max-w-md w-full p-8 shadow-2xl border border-gray-400 dark:border-white/20">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <LogOut className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-lg font-black uppercase tracking-tight text-gray-900 dark:text-white mb-4">Sign Out</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                  Are you sure you want to sign out of your account? You'll need to log in again to access the dashboard.
                </p>
                <div className="flex space-x-4">
                  <button
                    onClick={cancelLogout}
                    className="flex-1 px-6 py-3 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-white/15 bg-white dark:bg-[#141417] hover:bg-gray-100 dark:hover:bg-white/10 rounded-md font-black uppercase tracking-widest text-xs transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmLogout}
                    className="flex-1 px-6 py-3 bg-red-600 text-white hover:bg-red-700 rounded-md font-black uppercase tracking-widest text-xs transition-colors"
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
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-[#141417] rounded-lg shadow-2xl border border-gray-400 dark:border-white/20 max-w-md w-full p-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Trash2 className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-lg font-black uppercase tracking-tight text-gray-900 dark:text-white mb-4">
                  Delete Donation
                </h3>

                <div className="bg-red-50 dark:bg-red-900/10 rounded-md p-4 mb-6 border border-red-200 dark:border-red-900/30 text-left">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">Donor</span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      {donationToDelete.donorName || 'Anonymous'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">Amount</span>
                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      ${donationToDelete.amount}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">Date</span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      {new Date(donationToDelete.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  {donationToDelete.message && (
                    <div className="mt-3 pt-3 border-t border-red-200 dark:border-red-900/30">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">Message</span>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 italic">
                        "{donationToDelete.message}"
                      </p>
                    </div>
                  )}
                </div>

                <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                  Are you sure you want to delete this donation? This action cannot be undone.
                </p>

                <div className="flex space-x-4">
                  <button
                    onClick={cancelDeleteDonation}
                    className="flex-1 px-6 py-3 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-white/15 bg-white dark:bg-[#141417] hover:bg-gray-100 dark:hover:bg-white/10 rounded-md font-black uppercase tracking-widest text-xs transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDeleteDonation}
                    className="flex-1 px-6 py-3 bg-red-600 text-white hover:bg-red-700 rounded-md font-black uppercase tracking-widest text-xs transition-colors"
                  >
                    Delete Donation
                  </button>
                </div>
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

      {/* Edit Profile Modal */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div
            onClick={() => setIsProfileModalOpen(false)}
            className="absolute inset-0 bg-gray-950/60"
          />
          <div className="relative w-full max-w-md bg-white dark:bg-[#141417] border border-gray-300 dark:border-white/20 rounded-lg shadow-2xl overflow-hidden">
            <div className="p-8">
              <h2 className="text-xl font-black uppercase tracking-tight text-gray-900 dark:text-white mb-1">Edit Profile</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Update your name, photo, and public bio.</p>

              <form onSubmit={handleUpdateProfile} className="space-y-5">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 ml-0.5">Full Name</label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-300 dark:border-white/15 rounded-md px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-amber-700 transition-colors font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 ml-0.5">Profile Image</label>
                  <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-white/5 border border-gray-300 dark:border-white/15 rounded-md">
                    <div className="relative w-14 h-14 rounded-md overflow-hidden bg-amber-100 flex-shrink-0">
                      {profileForm.profileImage ? (
                        <img src={profileForm.profileImage} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-amber-700 font-bold text-xl">
                          {profileForm.name.charAt(0) || 'A'}
                        </div>
                      )}
                      {isUploadingProfileImage && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <input
                        type="file"
                        ref={profileFileInputRef}
                        onChange={handleProfileImageUpload}
                        accept="image/*"
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => profileFileInputRef.current?.click()}
                        disabled={isUploadingProfileImage}
                        className="w-full py-2 bg-white dark:bg-[#141417] text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-white/15 rounded-md text-xs font-bold hover:bg-gray-50 dark:hover:bg-white/10 transition-colors disabled:opacity-50"
                      >
                        {isUploadingProfileImage ? 'Uploading...' : 'Upload New Photo'}
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 ml-0.5">
                    Bio <span className="text-gray-300 dark:text-gray-600">(shown on your public profile)</span>
                  </label>
                  <textarea
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                    rows={3}
                    maxLength={300}
                    placeholder="A few sentences introducing yourself..."
                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-300 dark:border-white/15 rounded-md px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-amber-700 transition-colors font-medium resize-none"
                  />
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1.5">{profileForm.bio.length}/300</p>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsProfileModalOpen(false)}
                    className="flex-1 py-3 border border-gray-300 dark:border-white/15 bg-white dark:bg-[#141417] text-gray-600 dark:text-gray-300 rounded-md font-black uppercase tracking-widest text-xs hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdatingProfile}
                    className="flex-1 py-3 bg-amber-700 text-white rounded-md font-black uppercase tracking-widest text-xs hover:bg-amber-800 transition-colors disabled:opacity-50"
                  >
                    {isUpdatingProfile ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div >
  );
};

export default Dashboard;

