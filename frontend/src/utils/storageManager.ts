// Storage Manager Utility
// Handles localStorage quota management and cleanup

export const STORAGE_LIMITS = {
  MAX_POSTS: 1000, // Increased to prevent deletion
  MAX_POST_DATA_ENTRIES: 100,
  MAX_STORAGE_SIZE: 8 * 1024 * 1024, // 8MB - increased to prevent deletion
};

export const cleanupOldStorage = () => {
  // NO AUTOMATIC CLEANUP - PRESERVE ALL DATA
  console.log('No automatic cleanup performed. All data is preserved.');
};

export const managePostsStorage = (newPost: any) => {
  try {
    const existingPosts = JSON.parse(localStorage.getItem('blogPosts') || '[]');
    existingPosts.push(newPost);
    
    // ALWAYS SAVE THE POST - NO AUTOMATIC DELETION
    localStorage.setItem('blogPosts', JSON.stringify(existingPosts));
    console.log('Post saved successfully. Total posts:', existingPosts.length);
    return existingPosts;
  } catch (storageError) {
    console.error('Storage error:', storageError);
    // If storage fails, show error but don't delete existing posts
    alert('Storage error occurred. Please try again or contact support.');
    throw storageError;
  }
};

export const clearAllBlogData = () => {
  try {
    // Get all localStorage keys
    const keys = Object.keys(localStorage);
    
    // Remove all blog-related data
    keys.forEach(key => {
      if (key.startsWith('post:') || key === 'blogPosts') {
        localStorage.removeItem(key);
      }
    });
    
    console.log('All blog data cleared from localStorage.');
    return true;
  } catch (error) {
    console.error('Error clearing blog data:', error);
    return false;
  }
};

export const getStorageInfo = () => {
  try {
    const keys = Object.keys(localStorage);
    const blogKeys = keys.filter(key => key.startsWith('post:') || key === 'blogPosts');
    
    let totalSize = 0;
    blogKeys.forEach(key => {
      const value = localStorage.getItem(key);
      if (value) {
        totalSize += value.length;
      }
    });
    
    return {
      totalKeys: blogKeys.length,
      totalSize: totalSize,
      totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
      isNearLimit: totalSize > STORAGE_LIMITS.MAX_STORAGE_SIZE * 0.8
    };
  } catch (error) {
    console.error('Error getting storage info:', error);
    return {
      totalKeys: 0,
      totalSize: 0,
      totalSizeMB: '0.00',
      isNearLimit: false
    };
  }
};
