// TypeScript declarations for API service

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Array<{ msg: string; message: string }>;
}

export interface ViewHistory {
  id: string;
  type: 'POST' | 'FORUM' | 'DEVOTIONAL';
  itemId: string;
  title: string;
  link: string;
  viewedAt: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  authorId: string;
  category: string;
  tags: string[];
  status: string;
  publishedAt?: string;
  readTime: number;
  views: number;
  likes: number;
  isFeatured: boolean;
  isPremium: boolean;
  seoTitle?: string;
  seoDescription?: string;
  createdAt: string;
  updatedAt: string;
  author?: {
    id: string;
    name: string;
    email: string;
    profileImage?: string;
  };
  _count?: {
    comments: number;
  };
}

export interface Comment {
  id: string;
  content: string;
  authorName: string;
  authorEmail: string;
  postId: string;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
  post?: {
    id: string;
    slug: string;
    title: string;
  };
}

export interface Donation {
  id: string;
  donorName: string;
  email: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  paymentId: string;
  status: string;
  message?: string;
  isAnonymous: boolean;
  receiptSent: boolean;
  receiptEmail?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  isRead: boolean;
  repliedAt?: string;
  replyMessage?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BibleVerse {
  id: string;
  title?: string;
  book: string;
  chapter: number;
  verse: number;
  text: string;
  translation: string;
  image?: string;
  isActive: boolean;
  isFeatured: boolean;
  shareCount: number;
  displayDate?: string;
  createdAt: string;
  updatedAt: string;
}

// API function types
export interface BlogAPI {
  getPosts: (params?: any) => Promise<ApiResponse<{ posts: BlogPost[]; pagination: any }>>;
  getPost: (slug: string) => Promise<ApiResponse<{ post: BlogPost }>>;
  createPost: (postData: any) => Promise<ApiResponse<{ post: BlogPost }>>;
  updatePost: (id: string, postData: any) => Promise<ApiResponse<{ post: BlogPost }>>;
  deletePost: (id: string) => Promise<ApiResponse>;
  getAllPosts: (params?: any) => Promise<ApiResponse<{ posts: BlogPost[]; pagination: any }>>;
  getAdminPost: (id: string) => Promise<ApiResponse<{ post: BlogPost }>>;
  getStats: () => Promise<ApiResponse<any>>;
  likePost: (id: string) => Promise<ApiResponse>;
  unlikePost: (id: string) => Promise<ApiResponse>;
  getComments: (id: string) => Promise<ApiResponse<{ comments: Comment[] }>>;
  addComment: (id: string, data: { authorName: string; authorEmail: string; content: string }) => Promise<ApiResponse>;
  getAdminComments: (params?: any) => Promise<ApiResponse<{ comments: Comment[] }>>;
  getAdminPostComments: (postId: string) => Promise<ApiResponse<{ comments: Comment[] }>>;
  approveComment: (commentId: string) => Promise<ApiResponse>;
  deleteCommentAdmin: (commentId: string) => Promise<ApiResponse>;
}

export interface ContactAPI {
  submitContact: (contactData: any) => Promise<ApiResponse>;
  getContacts: (params?: any) => Promise<ApiResponse<{ contacts: ContactMessage[] }>>;
  getContact: (id: string) => Promise<ApiResponse<{ contact: ContactMessage }>>;
  updateContactStatus: (id: string, status: string, replyMessage?: string) => Promise<ApiResponse>;
  markContactAsRead: (id: string) => Promise<ApiResponse>;
  deleteContact: (id: string) => Promise<ApiResponse>;
  getStats: () => Promise<ApiResponse<any>>;
}

export interface DonationsAPI {
  submitDonation: (donationData: any) => Promise<ApiResponse>;
  createPaymentIntent: (data: { amount: number; currency?: string; donorName?: string; email?: string; message?: string }) => Promise<ApiResponse<{ clientSecret: string }>>;
  getDonations: (params?: any) => Promise<ApiResponse<{ donations: Donation[] }>>;
  getDonation: (id: string) => Promise<ApiResponse<{ donation: Donation }>>;
  updateDonationStatus: (id: string, status: string) => Promise<ApiResponse>;
  getStats: () => Promise<ApiResponse<any>>;
  deleteDonation: (id: string) => Promise<ApiResponse>;
  getRecentDonations: (params?: { limit?: string }) => Promise<ApiResponse<{ donations: Donation[] }>>;
}

export interface BibleVerseParams {
  page?: number;
  limit?: number;
  featured?: string;
  includeInactive?: string;
  search?: string;
  book?: string;
  chapter?: string | number;
  verse?: string | number;
}

export interface BibleVersesAPI {
  getVerses: (params?: BibleVerseParams) => Promise<ApiResponse<{ verses: BibleVerse[]; pagination: any }>>;
  getVerse: (id: string) => Promise<ApiResponse<{ verse: BibleVerse }>>;
  createVerse: (verseData: any) => Promise<ApiResponse<{ verse: BibleVerse }>>;
  updateVerse: (id: string, verseData: any) => Promise<ApiResponse<{ verse: BibleVerse }>>;
  deleteVerse: (id: string) => Promise<ApiResponse>;
  getVerseOfTheDay: () => Promise<ApiResponse<{ verse: BibleVerse }>>;
  getFeaturedVerses: () => Promise<ApiResponse<{ verses: BibleVerse[] }>>;
}

export interface AuthAPI {
  login: (email: string, password: string) => Promise<ApiResponse<{ token: string; user: any }>>;
  register: (name: string, email: string, password: string) => Promise<ApiResponse<{ token: string; user: any }>>;
  getProfile: () => Promise<ApiResponse<{ user: any }>>;
  updateProfile: (profileData: any) => Promise<ApiResponse<{ user: any }>>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<ApiResponse>;
  logout: () => Promise<void>;
  isAuthenticated: () => boolean;
  getCurrentUser: () => any;
  getUserRole: () => string | null;
  isAdmin: () => boolean;
  forgotPassword: (email: string) => Promise<ApiResponse<{ message: string }>>;
  resetPassword: (token: string, newPassword: string) => Promise<ApiResponse<{ message: string }>>;
}

export interface SettingsAPI {
  getSettings: () => Promise<ApiResponse<any>>;
  getSettingCategory: (category: string) => Promise<ApiResponse<any>>;
  updateSettings: (category: string, settings: any) => Promise<ApiResponse>;
  resetSettings: () => Promise<ApiResponse>;
}

export interface HealthAPI {
  check: () => Promise<ApiResponse<{ status: string; message: string; timestamp: string; environment: string }>>;
}

export interface UploadAPI {
  uploadImage: (file: File) => Promise<ApiResponse<{ url: string; filename: string; fullUrl: string }>>;
  uploadProfileImage: (file: File) => Promise<ApiResponse<{ url: string; filename: string }>>;
  uploadVideo: (file: File) => Promise<ApiResponse<{ url: string; filename: string; fullUrl: string }>>;
}

export interface NewsletterAPI {
  subscribe: (email: string) => Promise<ApiResponse<{ subscriber: any }>>;
  unsubscribe: (email: string) => Promise<ApiResponse<{ subscriber: any }>>;
  getSubscribers: (params?: any) => Promise<ApiResponse<{ subscribers: any[] }>>;
}

export interface UserAPI {
  getDashboardData: () => Promise<ApiResponse<{
    likedPosts: BlogPost[];
    savedVerses: BibleVerse[];
    newsletterSubscription: boolean;
    forumActivity: (ForumPost & { topic: { id: string, title: string } })[];
    joinedEvents: Event[];
    stats: {
      posts: number;
      prayers: number;
      events: number;
    };
    preferences: {
      receiveNewsletter: boolean;
      receivePrayerAlerts: boolean;
    };
  }>>;
  saveVerse: (verseId: string) => Promise<ApiResponse>;
  removeSavedVerse: (verseId: string) => Promise<ApiResponse>;
  updatePreferences: (preferences: { receiveNewsletter?: boolean; receivePrayerAlerts?: boolean }) => Promise<ApiResponse>;
  updateProfile: (data: { name?: string; profileImage?: string }) => Promise<ApiResponse>;
  adminGetAll: () => Promise<ApiResponse<{ users: any[] }>>;
  adminUpdateRole: (id: string, role: string) => Promise<ApiResponse<any>>;
  adminDelete: (id: string) => Promise<ApiResponse<void>>;
}

export interface PrayerRequest {
  id: string;
  userId: string;
  title: string;
  content: string;
  category: string;
  isAnonymous: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    name: string;
    profileImage?: string;
  };
  _count?: {
    supports: number;
  };
}

export interface PrayerAPI {
  createRequest: (data: { title: string; content: string; category?: string; isAnonymous?: boolean }) => Promise<ApiResponse<{ request: PrayerRequest }>>;
  getRequests: (params?: { category?: string; page?: number; limit?: number }) => Promise<ApiResponse<{ requests: PrayerRequest[]; pagination: any }>>;
  pray: (id: string) => Promise<ApiResponse<{ supported: boolean }>>;
  getMyRequests: () => Promise<ApiResponse<{ requests: PrayerRequest[] }>>;
  praise: (id: string) => Promise<ApiResponse<{ data: PrayerRequest }>>;
  adminGetAll: (params?: { status?: string; category?: string; page?: number; limit?: number }) => Promise<ApiResponse<{ requests: PrayerRequest[]; pagination: any }>>;
  adminDelete: (id: string) => Promise<ApiResponse>;
}

export interface ForumCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  order: number;
  _count?: { topics: number };
  topics?: ForumTopic[];
}

export interface ForumTopic {
  id: string;
  categoryId: string;
  authorId: string;
  title: string;
  content: string;
  isLocked: boolean;
  isSticky: boolean;
  views: number;
  createdAt: string;
  updatedAt: string;
  author?: {
    name: string;
    profileImage?: string;
    _count?: {
        forumPosts: number;
        prayerSupports: number;
    };
  };
  category?: ForumCategory;
  posts?: ForumPost[];
  _count?: { posts: number };
}

export interface ForumPost {
  id: string;
  topicId: string;
  authorId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  author?: {
    name: string;
    profileImage?: string;
    role: string;
    _count?: {
        forumPosts: number;
        prayerSupports: number;
    }
  };
}

export interface Devotional {
  id: string;
  date: string;
  title: string;
  content: string;
  scripture: string;
  reflectionQuestions?: string;
  authorId: string;
  author?: {
    name: string;
    profileImage?: string;
  };
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  type: 'STUDY' | 'WORSHIP' | 'COMMUNITY' | 'YOUTH';
  thumbnail?: string;
  authorId: string;
  author?: {
    name: string;
    profileImage?: string;
  };
  rsvps?: {
    id: string;
    name: string;
    profileImage?: string;
  }[];
  _count?: {
    rsvps: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface EventAPI {
  getEvents: () => Promise<ApiResponse<Event[]>>;
  getEvent: (id: string) => Promise<ApiResponse<Event>>;
  rsvp: (id: string) => Promise<ApiResponse<{ rsvpStatus: boolean }>>;
  create: (data: Partial<Event>) => Promise<ApiResponse<Event>>;
  update: (id: string, data: Partial<Event>) => Promise<ApiResponse<Event>>;
  delete: (id: string) => Promise<ApiResponse<void>>;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'FORUM_REPLY' | 'EVENT_UPDATE' | 'PRAYER_SUPPORT' | 'ADMIN_MESSAGE';
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationAPI {
  getNotifications: () => Promise<ApiResponse<{ notifications: Notification[]; unreadCount: number }>>;
  markAsRead: (id: string) => Promise<ApiResponse<Notification>>;
  markAllAsRead: () => Promise<ApiResponse<void>>;
  deleteNotification: (id: string) => Promise<ApiResponse<void>>;
}

export interface DevotionalAPI {
  getToday: () => Promise<ApiResponse<Devotional>>;
  getArchive: (params?: { page?: number; limit?: number }) => Promise<ApiResponse<Devotional[]>>;
  create: (data: Partial<Devotional>) => Promise<ApiResponse<Devotional>>;
  update: (id: string, data: Partial<Devotional>) => Promise<ApiResponse<Devotional>>;
  delete: (id: string) => Promise<ApiResponse<void>>;
  addComment: (devotionalId: string, content: string) => Promise<ApiResponse<any>>;
}

export interface ForumAPI {
  getCategories: () => Promise<ApiResponse<ForumCategory[]>>;
  getCategoryTopics: (id: string, params?: { page?: number; limit?: number }) => Promise<ApiResponse<{ topics: ForumTopic[]; pagination: any }>>;
  getTopic: (id: string) => Promise<ApiResponse<ForumTopic>>;
  createTopic: (data: { categoryId: string; title: string; content: string }) => Promise<ApiResponse<ForumTopic>>;
  deleteTopic: (id: string) => Promise<ApiResponse<void>>;
  createPost: (topicId: string, data: { content: string }) => Promise<ApiResponse<ForumPost>>;
  deletePost: (id: string) => Promise<ApiResponse<void>>;
  adminCreateCategory: (data: Partial<ForumCategory>) => Promise<ApiResponse<ForumCategory>>;
  adminUpdateCategory: (id: string, data: Partial<ForumCategory>) => Promise<ApiResponse<ForumCategory>>;
  adminDeleteCategory: (id: string) => Promise<ApiResponse<void>>;
}

export interface SearchAPI {
  search: (query: string) => Promise<ApiResponse<{ posts: any[]; topics: any[]; devotionals: any[]; events: any[] }>>;
  getRecommendations: () => Promise<ApiResponse<any[]>>;
  getHistory: () => Promise<ApiResponse<ViewHistory[]>>;
  recordHistory: (data: { type: string; itemId: string; title: string; link: string }) => Promise<ApiResponse<void>>;
}

export interface ActivityAPI {
  getRecent: (limit?: number) => Promise<ApiResponse<{ activity: any[] }>>;
}

// Export the API types
export interface StatsAPI {
  getPlatformSummary: () => Promise<ApiResponse<PlatformSummary>>;
}

export declare const statsAPI: StatsAPI;
export declare const blogAPI: BlogAPI;
export declare const contactAPI: ContactAPI;
export declare const donationsAPI: DonationsAPI;
export declare const bibleVersesAPI: BibleVersesAPI;
export declare const authAPI: AuthAPI;
export declare const settingsAPI: SettingsAPI;
export declare const uploadAPI: UploadAPI;
export declare const healthAPI: HealthAPI;
export declare const newsletterAPI: NewsletterAPI;
export declare const userAPI: UserAPI;
export declare const prayerAPI: PrayerAPI;
export declare const forumAPI: ForumAPI;
export declare const devotionalAPI: DevotionalAPI;
export declare const eventAPI: EventAPI;
export declare const searchAPI: SearchAPI;

// Default export
export interface API {
  auth: AuthAPI;
  blog: BlogAPI;
  contact: ContactAPI;
  donations: DonationsAPI;
  bibleVerses: BibleVersesAPI;
  settings: SettingsAPI;
  upload: UploadAPI;
  newsletter: NewsletterAPI;
  health: HealthAPI;
  user: UserAPI;
  prayer: PrayerAPI;
  forum: ForumAPI;
  devotionals: DevotionalAPI;
  events: EventAPI;
  notifications: NotificationAPI;
  search: SearchAPI;
  activity: ActivityAPI;
  stats: StatsAPI;
}

declare const api: API;

export default api;
