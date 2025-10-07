// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Helper function to set auth token
const setAuthToken = (token) => {
  localStorage.setItem('authToken', token);
};

// Helper function to remove auth token
const removeAuthToken = () => {
  localStorage.removeItem('authToken');
};

// Helper function to get headers
const getHeaders = (includeAuth = true) => {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }
  
  return headers;
};

// Generic API request function
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: getHeaders(options.includeAuth !== false),
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      // Handle validation errors specifically
      if (data.errors && Array.isArray(data.errors)) {
        const errorMessages = data.errors.map(err => err.msg || err.message).join(', ');
        throw new Error(errorMessages || data.message || `HTTP error! status: ${response.status}`);
      }
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};

// Authentication API
export const authAPI = {
  // Login user
  login: async (email, password) => {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      includeAuth: false,
    });
    
    if (response.success && response.data.token) {
      setAuthToken(response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response;
  },

  // Register user
  register: async (name, email, password) => {
    const response = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
      includeAuth: false,
    });
    
    if (response.success && response.data.token) {
      setAuthToken(response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response;
  },

  // Get current user profile
  getProfile: async () => {
    return await apiRequest('/auth/me');
  },

  // Update user profile
  updateProfile: async (profileData) => {
    return await apiRequest('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },

  // Change password
  changePassword: async (currentPassword, newPassword) => {
    return await apiRequest('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },

  // Logout user
  logout: async () => {
    try {
      await apiRequest('/auth/logout', {
        method: 'POST',
      });
    } finally {
      removeAuthToken();
      localStorage.removeItem('user');
    }
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = getAuthToken();
    const user = localStorage.getItem('user');
    return !!(token && user);
  },

  // Get current user from localStorage
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
};

// Blog API
export const blogAPI = {
  // Get all published blog posts
  getPosts: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    const endpoint = queryParams ? `/blog?${queryParams}` : '/blog';
    return await apiRequest(endpoint, { includeAuth: false });
  },

  // Get single blog post by slug
  getPost: async (slug) => {
    return await apiRequest(`/blog/${slug}`, { includeAuth: false });
  },

  // Create new blog post (admin only)
  createPost: async (postData) => {
    return await apiRequest('/blog', {
      method: 'POST',
      body: JSON.stringify(postData),
    });
  },

  // Update blog post (admin only)
  updatePost: async (id, postData) => {
    return await apiRequest(`/blog/${id}`, {
      method: 'PUT',
      body: JSON.stringify(postData),
    });
  },

  // Delete blog post (admin only)
  deletePost: async (id) => {
    return await apiRequest(`/blog/${id}`, {
      method: 'DELETE',
    });
  },

  // Get all blog posts (admin only)
  getAllPosts: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    const endpoint = queryParams ? `/blog/admin/all?${queryParams}` : '/blog/admin/all';
    return await apiRequest(endpoint);
  },

  // Get single blog post (admin only)
  getAdminPost: async (id) => {
    return await apiRequest(`/blog/admin/${id}`);
  },

  // Get blog statistics (admin only)
  getStats: async () => {
    return await apiRequest('/blog/admin/stats');
  },

  // Like a blog post
  likePost: async (id) => {
    return await apiRequest(`/blog/${id}/like`, {
      method: 'POST',
      includeAuth: false,
    });
  },

  // Unlike a blog post
  unlikePost: async (id) => {
    return await apiRequest(`/blog/${id}/unlike`, {
      method: 'POST',
      includeAuth: false,
    });
  },

  // Public comments
  getComments: async (id) => {
    return await apiRequest(`/blog/${id}/comments`, { includeAuth: false });
  },
  addComment: async (id, { authorName, authorEmail, content }) => {
    return await apiRequest(`/blog/${id}/comments`, {
      method: 'POST',
      includeAuth: false,
      body: JSON.stringify({ authorName, authorEmail, content })
    });
  },

  // Admin comments
  getAdminComments: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    const endpoint = queryParams ? `/blog/admin/comments?${queryParams}` : '/blog/admin/comments';
    return await apiRequest(endpoint);
  },
  getAdminPostComments: async (postId) => {
    return await apiRequest(`/blog/admin/${postId}/comments`);
  },
  approveComment: async (commentId) => {
    return await apiRequest(`/blog/admin/comments/${commentId}/approve`, { method: 'PUT' });
  },
  deleteCommentAdmin: async (commentId) => {
    return await apiRequest(`/blog/admin/comments/${commentId}`, { method: 'DELETE' });
  },
};

// Contact API
export const contactAPI = {
  // Submit contact form
  submitContact: async (contactData) => {
    return await apiRequest('/contact', {
      method: 'POST',
      body: JSON.stringify(contactData),
      includeAuth: false,
    });
  },

  // Get all contact messages (admin only)
  getContacts: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    const endpoint = queryParams ? `/contact?${queryParams}` : '/contact';
    return await apiRequest(endpoint);
  },

  // Get single contact message (admin only)
  getContact: async (id) => {
    return await apiRequest(`/contact/${id}`);
  },

  // Update contact status (admin only)
  updateContactStatus: async (id, status, replyMessage = null) => {
    return await apiRequest(`/contact/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, replyMessage }),
    });
  },

  // Mark contact message as read (admin only)
  markContactAsRead: async (id) => {
    return await apiRequest(`/contact/${id}/read`, {
      method: 'PUT',
    });
  },

  // Delete contact message (admin only)
  deleteContact: async (id) => {
    return await apiRequest(`/contact/${id}`, {
      method: 'DELETE',
    });
  },

  // Get contact statistics (admin only)
  getStats: async () => {
    return await apiRequest('/contact/admin/stats');
  },
};

// Donations API
export const donationsAPI = {
  // Submit donation
  submitDonation: async (donationData) => {
    return await apiRequest('/donations', {
      method: 'POST',
      body: JSON.stringify(donationData),
      includeAuth: false,
    });
  },

  // Get all donations (admin only)
  getDonations: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    const endpoint = queryParams ? `/donations?${queryParams}` : '/donations';
    return await apiRequest(endpoint);
  },

  // Get single donation (admin only)
  getDonation: async (id) => {
    return await apiRequest(`/donations/${id}`);
  },

  // Update donation status (admin only)
  updateDonationStatus: async (id, status) => {
    return await apiRequest(`/donations/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  // Get donation statistics (admin only)
  getStats: async () => {
    return await apiRequest('/donations/admin/stats');
  },

  // Delete donation (admin only)
  deleteDonation: async (id) => {
    return await apiRequest(`/donations/${id}`, {
      method: 'DELETE'
    });
  },
};

// Settings API
export const settingsAPI = {
  // Get all settings
  getSettings: async () => {
    return await apiRequest('/settings', { includeAuth: false });
  },

  // Get specific setting category
  getSettingCategory: async (category) => {
    return await apiRequest(`/settings/${category}`, { includeAuth: false });
  },

  // Update settings (admin only)
  updateSettings: async (category, settings) => {
    return await apiRequest(`/settings/${category}`, {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  },

  // Reset settings to default (admin only)
  resetSettings: async () => {
    return await apiRequest('/settings/reset', {
      method: 'POST',
    });
  },
};

// Bible Verses API
export const bibleVersesAPI = {
  // Get all Bible verses
  getVerses: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    const endpoint = queryParams ? `/bible-verses?${queryParams}` : '/bible-verses';
    return await apiRequest(endpoint, { includeAuth: false });
  },

  // Get single Bible verse by ID
  getVerse: async (id) => {
    return await apiRequest(`/bible-verses/${id}`, { includeAuth: false });
  },

  // Create new Bible verse (admin only)
  createVerse: async (verseData) => {
    return await apiRequest('/bible-verses', {
      method: 'POST',
      body: JSON.stringify(verseData),
    });
  },

  // Update Bible verse (admin only)
  updateVerse: async (id, verseData) => {
    return await apiRequest(`/bible-verses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(verseData),
    });
  },

  // Delete Bible verse (admin only)
  deleteVerse: async (id) => {
    return await apiRequest(`/bible-verses/${id}`, {
      method: 'DELETE',
    });
  },

  // Get verse of the day
  getVerseOfTheDay: async () => {
    return await apiRequest('/bible-verses/verse-of-the-day', { includeAuth: false });
  },

  // Get featured verses
  getFeaturedVerses: async () => {
    return await apiRequest('/bible-verses?featured=true', { includeAuth: false });
  },

  // Get featured verse (single)
  getFeaturedVerse: async () => {
    return await apiRequest('/bible-verses/featured', { includeAuth: false });
  },

  // Share Bible verse
  shareVerse: async (verseId, shareData = {}) => {
    return await apiRequest(`/bible-verses/${verseId}/share`, {
      method: 'POST',
      body: JSON.stringify(shareData),
      includeAuth: false
    });
  },

  // Get share statistics for a verse (admin only)
  getVerseShares: async (verseId, params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    const endpoint = queryParams ? `/bible-verses/${verseId}/shares?${queryParams}` : `/bible-verses/${verseId}/shares`;
    return await apiRequest(endpoint);
  },
};

// Upload API
export const uploadAPI = {
  // Upload single image
  uploadImage: async (file, isBibleVerseImage = false) => {
    const formData = new FormData();
    formData.append('image', file);
    
    const token = getAuthToken();
    const headers = {
      'Authorization': `Bearer ${token}`
    };
    
    // Add header to indicate this is a bible verse image
    if (isBibleVerseImage) {
      headers['x-bible-verse-image'] = 'true';
    }
    
    const response = await fetch(`${API_BASE_URL}/upload/image`, {
      method: 'POST',
      headers: headers,
      body: formData
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Upload failed');
    }
    
    return data;
  }
};

// Health check
export const healthAPI = {
  check: async () => {
    return await apiRequest('/health', { includeAuth: false });
  },
};

// Export default API object
export default {
  auth: authAPI,
  blog: blogAPI,
  contact: contactAPI,
  donations: donationsAPI,
  bibleVerses: bibleVersesAPI,
  settings: settingsAPI,
  upload: uploadAPI,
  health: healthAPI,
};
