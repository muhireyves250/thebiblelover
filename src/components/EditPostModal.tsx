import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Trash2 } from 'lucide-react';
import { cleanupOldStorage } from '../utils/storageManager';

interface EditPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedPost: any) => void;
  post: any;
}

const EditPostModal: React.FC<EditPostModalProps> = ({ isOpen, onClose, onSave, post }) => {
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    excerpt: '',
    content: '',
    author: '',
    image: '',
    readTime: '',
    date: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (post && isOpen) {
      setFormData({
        title: post.title || '',
        subtitle: post.subtitle || '',
        excerpt: post.excerpt || '',
        content: post.content || '',
        author: post.author || '',
        image: post.image || '',
        readTime: post.readTime || '',
        date: post.date || ''
      });
    }
  }, [post, isOpen]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setUploadedImageUrl(result);
        setFormData(prev => ({ ...prev, image: result }));
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading file:', error);
      setIsUploading(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const removeUploadedImage = () => {
    setUploadedImageUrl(null);
    setFormData(prev => ({ 
      ...prev, 
      image: 'https://images.pexels.com/photos/1370295/pexels-photo-1370295.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' 
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!formData.title.trim()) {
        alert('Please enter a title for the post.');
        setIsSubmitting(false);
        return;
      }
      
      if (!formData.excerpt.trim()) {
        alert('Please enter an excerpt for the post.');
        setIsSubmitting(false);
        return;
      }
      
      if (!formData.content.trim()) {
        alert('Please enter content for the post.');
        setIsSubmitting(false);
        return;
      }

      const newSlug = generateSlug(formData.title);
      const oldSlug = post.slug;
      
      // Check if slug has changed and handle potential conflicts
      let finalSlug = newSlug;
      if (newSlug !== oldSlug) {
        const existingPosts = JSON.parse(localStorage.getItem('blogPosts') || '[]');
        const slugExists = existingPosts.some((p: any) => p.slug === newSlug && p.id !== post.id);
        
        if (slugExists) {
          // Add timestamp to make slug unique
          finalSlug = `${newSlug}-${Date.now()}`;
        }
        
        // If slug changed, we need to update localStorage keys for views, likes, comments
        if (finalSlug !== oldSlug) {
          const views = localStorage.getItem(`post:${oldSlug}:views`);
          const likes = localStorage.getItem(`post:${oldSlug}:likes`);
          const comments = localStorage.getItem(`post:${oldSlug}:comments`);
          
          if (views) localStorage.setItem(`post:${finalSlug}:views`, views);
          if (likes) localStorage.setItem(`post:${finalSlug}:likes`, likes);
          if (comments) localStorage.setItem(`post:${finalSlug}:comments`, comments);
          
          // Remove old keys
          localStorage.removeItem(`post:${oldSlug}:views`);
          localStorage.removeItem(`post:${oldSlug}:likes`);
          localStorage.removeItem(`post:${oldSlug}:comments`);
        }
      }

      const updatedPost = {
        ...post,
        title: formData.title,
        subtitle: formData.subtitle.trim(),
        slug: finalSlug,
        excerpt: formData.excerpt.trim(),
        content: formData.content,
        author: formData.author,
        readTime: formData.readTime,
        image: formData.image,
        date: formData.date,
        // Preserve existing stats
        views: post.views || 0,
        likes: post.likes || 0,
        comments: post.comments || 0
      };

      console.log('Updating post with excerpt:', updatedPost.excerpt);

      // Clean up old storage data before saving
      cleanupOldStorage();

      // Update localStorage with quota handling
      try {
        const existingPosts = JSON.parse(localStorage.getItem('blogPosts') || '[]');
        const updatedPosts = existingPosts.map((p: any) => 
          p.id === post.id ? updatedPost : p
        );
        localStorage.setItem('blogPosts', JSON.stringify(updatedPosts));
        console.log('Post updated successfully:', updatedPost);
      } catch (quotaError) {
        console.error('Storage quota exceeded:', quotaError);
        
        // Try to save with compressed data
        try {
          const existingPosts = JSON.parse(localStorage.getItem('blogPosts') || '[]');
          const updatedPosts = existingPosts.map((p: any) => 
            p.id === post.id ? updatedPost : p
          );
          
          // Compress the data by removing unnecessary whitespace
          const compressedData = JSON.stringify(updatedPosts);
          localStorage.setItem('blogPosts', compressedData);
          console.log('Post updated with compressed data');
        } catch (compressionError) {
          console.error('Compression also failed:', compressionError);
          
          // Last resort: save to sessionStorage as backup
          try {
            const existingPosts = JSON.parse(localStorage.getItem('blogPosts') || '[]');
            const updatedPosts = existingPosts.map((p: any) => 
              p.id === post.id ? updatedPost : p
            );
            sessionStorage.setItem('blogPosts_backup', JSON.stringify(updatedPosts));
            
            alert('Storage quota exceeded! Your post has been saved to temporary storage. Please create a backup and clear some data to continue using localStorage.');
          } catch (sessionError) {
            console.error('Session storage also failed:', sessionError);
            alert('Unable to save post due to storage limitations. Please clear some data or create a backup.');
            setIsSubmitting(false);
            return;
          }
        }
      }

      onSave(updatedPost);
      onClose();
    } catch (error) {
      console.error('Error updating post:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        formData: formData
      });
      alert(`Error updating post: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Edit Post</h2>
            {post && (
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                <span>👁️ {post.views || 0} views</span>
                <span>❤️ {post.likes || 0} likes</span>
                <span>💬 {post.comments || 0} comments</span>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-amber-500 focus:border-transparent"
                placeholder="Enter post title"
              />
            </div>

            <div>
              <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-2">
                Author *
              </label>
              <input
                type="text"
                id="author"
                name="author"
                value={formData.author}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-amber-500 focus:border-transparent"
                placeholder="Author name"
              />
            </div>
          </div>

          {/* Slug Preview */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Generated Slug
            </label>
            <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-sm text-gray-600">
              {formData.title ? generateSlug(formData.title) : 'Enter title to generate slug'}
            </div>
            {post && formData.title && generateSlug(formData.title) !== post.slug && (
              <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800">
                  <strong>Warning:</strong> Changing the title will change the post URL. 
                  The old URL will no longer work and statistics (views, likes, comments) will be preserved.
                </p>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="subtitle" className="block text-sm font-medium text-gray-700 mb-2">
              Subtitle (Optional)
            </label>
            <input
              type="text"
              id="subtitle"
              name="subtitle"
              value={formData.subtitle}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-amber-500 focus:border-transparent"
              placeholder="Optional subtitle for the post"
            />
          </div>

          <div>
            <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-2">
              Excerpt *
            </label>
            <textarea
              id="excerpt"
              name="excerpt"
              value={formData.excerpt}
              onChange={handleChange}
              required
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-amber-500 focus:border-transparent"
              placeholder="Brief description of the post"
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              Content *
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              required
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-amber-500 focus:border-transparent"
              placeholder="Write your post content here..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="readTime" className="block text-sm font-medium text-gray-700 mb-2">
                Read Time
              </label>
              <input
                type="text"
                id="readTime"
                name="readTime"
                value={formData.readTime}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-amber-500 focus:border-transparent"
                placeholder="e.g., 5 min read"
              />
            </div>

            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                Publication Date
              </label>
              <input
                type="text"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-amber-500 focus:border-transparent"
                placeholder="e.g., Mar 22, 2023"
              />
            </div>

            <div>
              <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
                Image URL
              </label>
              <input
                type="url"
                id="image"
                name="image"
                value={formData.image}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-amber-500 focus:border-transparent"
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>

          {/* Image Upload Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Or Upload Image
            </label>
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={handleUploadClick}
                disabled={isUploading}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:ring-1 focus:ring-amber-500 focus:border-transparent disabled:opacity-50"
              >
                <Upload className="h-4 w-4" />
                <span>{isUploading ? 'Uploading...' : 'Upload Image'}</span>
              </button>
              {uploadedImageUrl && (
                <button
                  type="button"
                  onClick={removeUploadedImage}
                  className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:text-red-800"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Remove</span>
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            {uploadedImageUrl && (
              <div className="mt-4">
                <img
                  src={uploadedImageUrl}
                  alt="Uploaded preview"
                  className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                />
              </div>
            )}
          </div>

          {/* Current Image Preview */}
          {formData.image && !uploadedImageUrl && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Image
              </label>
              <img
                src={formData.image}
                alt="Current post image"
                className="w-32 h-32 object-cover rounded-lg border border-gray-200"
              />
            </div>
          )}

          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-amber-700 text-white rounded-md hover:bg-amber-800 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Updating...' : 'Update Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPostModal;
