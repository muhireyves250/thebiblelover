// TypeScript declarations for API service

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Array<{ msg: string; message: string }>;
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
  getDonations: (params?: any) => Promise<ApiResponse<{ donations: Donation[] }>>;
  getDonation: (id: string) => Promise<ApiResponse<{ donation: Donation }>>;
  updateDonationStatus: (id: string, status: string) => Promise<ApiResponse>;
  getStats: () => Promise<ApiResponse<any>>;
  deleteDonation: (id: string) => Promise<ApiResponse>;
}

export interface BibleVersesAPI {
  getVerses: (params?: any) => Promise<ApiResponse<{ verses: BibleVerse[]; pagination: any }>>;
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
  logout: () => Promise<ApiResponse>;
  isAuthenticated: () => boolean;
  getCurrentUser: () => any;
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
  uploadImage: (file: File) => Promise<ApiResponse<{ url: string; fullUrl: string }>>;
  uploadVideo: (file: File) => Promise<ApiResponse<{ url: string; fullUrl: string }>>;
}

// Export the API types
export declare const blogAPI: BlogAPI;
export declare const contactAPI: ContactAPI;
export declare const donationsAPI: DonationsAPI;
export declare const bibleVersesAPI: BibleVersesAPI;
export declare const authAPI: AuthAPI;
export declare const settingsAPI: SettingsAPI;
export declare const uploadAPI: UploadAPI;
export declare const healthAPI: HealthAPI;

// Default export
declare const api: {
  auth: AuthAPI;
  blog: BlogAPI;
  contact: ContactAPI;
  donations: DonationsAPI;
  bibleVerses: BibleVersesAPI;
  settings: SettingsAPI;
  upload: UploadAPI;
  health: HealthAPI;
};

export default api;
