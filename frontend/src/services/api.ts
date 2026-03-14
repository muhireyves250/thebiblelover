import {
  ApiResponse,
  AuthAPI,
  BlogAPI,
  BibleVersesAPI,
  ContactAPI,
  DonationsAPI,
  SettingsAPI,
  UploadAPI,
  HealthAPI,
  NewsletterAPI,
  UserAPI,
  PrayerAPI,
  ForumAPI,
  DevotionalAPI,
  EventAPI,
  NotificationAPI,
  SearchAPI,
  StatsAPI,
  API
} from './api.d';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthToken = () => localStorage.getItem('token');

async function apiRequest<T = any>(endpoint: string, options: any = {}): Promise<ApiResponse<T>> {
  const token = getAuthToken();
  const headers: any = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  // If Content-Type is explicitly undefined, remove it to allow browser to set boundary (for FormData)
  if (options.headers && options.headers['Content-Type'] === undefined) {
    delete headers['Content-Type'];
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    return {
      success: false,
      message: data.message || 'Something went wrong',
      errors: data.errors,
    };
  }

  return {
    success: true,
    data: data.data,
  };
}

export const authAPI: AuthAPI = {
  login: (email, password) => apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }),
  register: (name, email, password) => apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  }),
  getProfile: () => apiRequest('/auth/me'),
  updateProfile: (data) => apiRequest('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  changePassword: (currentPassword, newPassword) => apiRequest('/auth/change-password', {
    method: 'PUT',
    body: JSON.stringify({ currentPassword, newPassword }),
  }),
  logout: async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  isAuthenticated: () => !!getAuthToken(),
  getCurrentUser: () => {
    const userString = localStorage.getItem('user');
    return userString ? JSON.parse(userString) : null;
  },
  getUserRole: () => {
    const userString = localStorage.getItem('user');
    if (!userString) return null;
    const user = JSON.parse(userString);
    return user.role || null;
  },
  isAdmin: () => {
    const userString = localStorage.getItem('user');
    if (!userString) return false;
    const user = JSON.parse(userString);
    return user.role === 'ADMIN';
  },
  forgotPassword: (email) => apiRequest('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  }),
  resetPassword: (token, newPassword) => apiRequest('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, newPassword }),
  }),
};

export const blogAPI: BlogAPI = {
  getPosts: (params) => {
    const query = new URLSearchParams(params as any).toString();
    return apiRequest(`/blog?${query}`);
  },
  getPost: (slug) => apiRequest(`/blog/${slug}`),
  createPost: (data) => apiRequest('/blog', { method: 'POST', body: JSON.stringify(data) }),
  updatePost: (id, data) => apiRequest(`/blog/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deletePost: (id) => apiRequest(`/blog/${id}`, { method: 'DELETE' }),
  getAllPosts: (params) => {
    const query = new URLSearchParams(params as any).toString();
    return apiRequest(`/blog/admin/all?${query}`);
  },
  getAdminPost: (id) => apiRequest(`/blog/admin/${id}`),
  getStats: () => apiRequest('/blog/admin/stats'),
  likePost: (id) => apiRequest(`/blog/${id}/like`, { method: 'POST' }),
  unlikePost: (id) => apiRequest(`/blog/${id}/unlike`, { method: 'POST' }),
  getComments: (id) => apiRequest(`/blog/${id}/comments`),
  addComment: (id, data) => apiRequest(`/blog/${id}/comments`, { method: 'POST', body: JSON.stringify(data) }),
  getAdminComments: (params) => {
    const query = new URLSearchParams(params as any).toString();
    return apiRequest(`/blog/admin/comments?${query}`);
  },
  getAdminPostComments: (postId) => apiRequest(`/blog/admin/${postId}/comments`),
  approveComment: (commentId) => apiRequest(`/blog/admin/comments/${commentId}/approve`, { method: 'PUT' }),
  deleteCommentAdmin: (commentId) => apiRequest(`/blog/admin/comments/${commentId}`, { method: 'DELETE' }),
};

export const contactAPI: ContactAPI = {
  submitContact: (data) => apiRequest('/contact', { method: 'POST', body: JSON.stringify(data) }),
  getContacts: (params) => {
    const query = new URLSearchParams(params as any).toString();
    return apiRequest(`/contact?${query}`);
  },
  getContact: (id) => apiRequest(`/contact/${id}`),
  updateContactStatus: (id, status, replyMessage) => apiRequest(`/contact/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status, replyMessage })
  }),
  markContactAsRead: (id) => apiRequest(`/contact/${id}/read`, { method: 'PUT' }),
  deleteContact: (id) => apiRequest(`/contact/${id}`, { method: 'DELETE' }),
  getStats: () => apiRequest('/contact/stats'),
};

export const donationsAPI: DonationsAPI = {
  submitDonation: (data) => apiRequest('/donations', { method: 'POST', body: JSON.stringify(data) }),
  createPaymentIntent: (data) => apiRequest('/donations/create-payment-intent', { method: 'POST', body: JSON.stringify(data) }),
  getDonations: (params) => {
    const query = new URLSearchParams(params as any).toString();
    return apiRequest(`/donations?${query}`);
  },
  getDonation: (id) => apiRequest(`/donations/${id}`),
  updateDonationStatus: (id, status) => apiRequest(`/donations/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status })
  }),
  getStats: () => apiRequest('/donations/admin/stats'),
  deleteDonation: (id) => apiRequest(`/donations/${id}`, { method: 'DELETE' }),
  getRecentDonations: (params) => {
    const query = new URLSearchParams(params as any).toString();
    return apiRequest(`/donations/recent?${query}`);
  },
};

export const bibleVersesAPI: BibleVersesAPI = {
  getVerses: (params) => {
    const query = new URLSearchParams(params as any).toString();
    return apiRequest(`/bible-verses?${query}`);
  },
  getVerse: (id) => apiRequest(`/bible-verses/${id}`),
  createVerse: (data) => apiRequest('/bible-verses', { method: 'POST', body: JSON.stringify(data) }),
  updateVerse: (id, data) => apiRequest(`/bible-verses/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteVerse: (id) => apiRequest(`/bible-verses/${id}`, { method: 'DELETE' }),
  getVerseOfTheDay: () => apiRequest('/bible-verses/votd'),
  getFeaturedVerse: () => apiRequest('/bible-verses/featured'),
  getFeaturedVerses: () => apiRequest('/bible-verses/featured'),
};

export const settingsAPI: SettingsAPI = {
  getSettings: () => apiRequest('/settings'),
  getSettingCategory: (category) => apiRequest(`/settings/${category}`),
  updateSettings: (category, settings) => apiRequest(`/settings/${category}`, {
    method: 'PATCH',
    body: JSON.stringify(settings)
  }),
  resetSettings: () => apiRequest('/settings/reset', { method: 'POST' }),
};

export const healthAPI: HealthAPI = {
  check: () => apiRequest('/health'),
};

export const uploadAPI: UploadAPI = {
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return apiRequest('/upload/image', {
      method: 'POST',
      body: formData,
      headers: { 'Content-Type': undefined },
    });
  },
  uploadVideo: (file) => {
    const formData = new FormData();
    formData.append('video', file);
    return apiRequest('/upload/video', {
      method: 'POST',
      body: formData,
      headers: { 'Content-Type': undefined },
    });
  },
  uploadProfileImage: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return apiRequest('/upload/profile-image', {
      method: 'POST',
      body: formData,
      headers: { 'Content-Type': undefined },
    });
  },
};

export const newsletterAPI: NewsletterAPI = {
  subscribe: (email) => apiRequest('/newsletter/subscribe', { method: 'POST', body: JSON.stringify({ email }) }),
  unsubscribe: (email) => apiRequest('/newsletter/unsubscribe', { method: 'POST', body: JSON.stringify({ email }) }),
  getSubscribers: (params) => {
    const query = new URLSearchParams(params as any).toString();
    return apiRequest(`/newsletter/subscribers?${query}`);
  },
};

export const userAPI: UserAPI = {
  getDashboardData: () => apiRequest('/user/dashboard'),
  saveVerse: (id) => apiRequest(`/user/saved-verses/${id}`, { method: 'POST' }),
  removeSavedVerse: (id) => apiRequest(`/user/saved-verses/${id}`, { method: 'DELETE' }),
  updatePreferences: (preferences) => apiRequest('/user/preferences', {
    method: 'PATCH',
    body: JSON.stringify(preferences)
  }),
  updateProfile: (data) => apiRequest('/user/profile', {
    method: 'PATCH',
    body: JSON.stringify(data)
  }),
  adminGetAll: () => apiRequest('/user/admin/all'),
  adminUpdateRole: (id, role) => apiRequest(`/user/admin/${id}/role`, { 
    method: 'PATCH', 
    body: JSON.stringify({ role }) 
  }),
  adminDelete: (id) => apiRequest(`/user/admin/${id}`, { method: 'DELETE' }),
};

export const prayerAPI: PrayerAPI = {
  createRequest: (data) => apiRequest('/prayer-requests', { method: 'POST', body: JSON.stringify(data) }),
  getRequests: (params) => {
    const query = new URLSearchParams(params as any).toString();
    return apiRequest(`/prayer-requests?${query}`);
  },
  pray: (id: string) => apiRequest(`/prayer-requests/${id}/pray`, { method: 'POST' }),
  getMyRequests: () => apiRequest('/prayer-requests/me'),
  praise: (id: string) => apiRequest(`/prayer-requests/${id}/praise`, { method: 'PATCH' }),
  adminGetAll: (params) => {
    const query = new URLSearchParams(params as any).toString();
    return apiRequest(`/prayer-requests/admin/all?${query}`);
  },
  adminDelete: (id: string) => apiRequest(`/prayer-requests/admin/${id}`, { method: 'DELETE' }),
};

export const forumAPI: ForumAPI = {
  getCategories: () => apiRequest('/forum/categories'),
  getCategoryTopics: (id, params) => {
    const query = new URLSearchParams(params as any).toString();
    return apiRequest(`/forum/categories/${id}/topics?${query}`);
  },
  getTopic: (id) => apiRequest(`/forum/topics/${id}`),
  createTopic: (data) => apiRequest('/forum/topics', { method: 'POST', body: JSON.stringify(data) }),
  deleteTopic: (id) => apiRequest(`/forum/topics/${id}`, { method: 'DELETE' }),
  createPost: (topicId, data) => apiRequest(`/forum/topics/${topicId}/posts`, { method: 'POST', body: JSON.stringify(data) }),
  deletePost: (id) => apiRequest(`/forum/posts/${id}`, { method: 'DELETE' }),
  adminCreateCategory: (data) => apiRequest('/forum/categories', { method: 'POST', body: JSON.stringify(data) }),
  adminUpdateCategory: (id, data) => apiRequest(`/forum/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  adminDeleteCategory: (id) => apiRequest(`/forum/categories/${id}`, { method: 'DELETE' }),
};

export const devotionalAPI: DevotionalAPI = {
  getToday: () => apiRequest('/devotionals/today'),
  getArchive: (params) => {
    const query = new URLSearchParams(params as any).toString();
    return apiRequest(`/devotionals/archive?${query}`);
  },
  create: (data) => apiRequest('/devotionals', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiRequest(`/devotionals/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => apiRequest(`/devotionals/${id}`, { method: 'DELETE' }),
  addComment: (id, content) => apiRequest(`/devotionals/${id}/comments`, { method: 'POST', body: JSON.stringify({ content }) }),
};

export const eventAPI: EventAPI = {
  getEvents: () => apiRequest('/events'),
  getEvent: (id) => apiRequest(`/events/${id}`),
  rsvp: (id) => apiRequest(`/events/${id}/rsvp`, { method: 'POST' }),
  create: (data) => apiRequest('/events', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiRequest(`/events/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => apiRequest(`/events/${id}`, { method: 'DELETE' }),
};

export const notificationAPI: NotificationAPI = {
  getNotifications: () => apiRequest('/notifications'),
  markAsRead: (id) => apiRequest(`/notifications/${id}/read`, { method: 'PUT' }),
  markAllAsRead: () => apiRequest('/notifications/read-all', { method: 'PUT' }),
  deleteNotification: (id) => apiRequest(`/notifications/${id}`, { method: 'DELETE' }),
};

export const searchAPI: SearchAPI = {
  search: (q) => apiRequest(`/search?q=${encodeURIComponent(q)}`),
  getRecommendations: () => apiRequest('/search/recommendations'),
  getHistory: () => apiRequest('/search/history'),
  recordHistory: (data) => apiRequest('/search/history', { method: 'POST', body: JSON.stringify(data) }),
};

export const activityAPI: ActivityAPI = {
  getRecent: (limit = 10) => apiRequest(`/activity?limit=${limit}`),
};

export const statsAPI: StatsAPI = {
  getPlatformSummary: () => apiRequest('/stats/summary'),
};

const apis: API = {
  auth: authAPI,
  blog: blogAPI,
  contact: contactAPI,
  donations: donationsAPI,
  bibleVerses: bibleVersesAPI,
  settings: settingsAPI,
  upload: uploadAPI,
  newsletter: newsletterAPI,
  health: healthAPI,
  user: userAPI,
  prayer: prayerAPI,
  forum: forumAPI,
  devotionals: devotionalAPI,
  events: eventAPI,
  notifications: notificationAPI,
  search: searchAPI,
  activity: activityAPI,
  stats: statsAPI,
};

export default apis;
