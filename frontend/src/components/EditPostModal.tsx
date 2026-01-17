import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Trash2, Edit } from 'lucide-react';
import { blogAPI } from '../services/api';

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
    date: '',
    status: 'DRAFT',
    category: 'OTHER',
    tags: '',
    seoTitle: '',
    seoDescription: '',
    isFeatured: false
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
        author: post.author?.name || '',
        image: post.featuredImage || '',
        readTime: post.readTime || '',
        date: post.publishedAt ? new Date(post.publishedAt).toISOString().split('T')[0] : '',
        status: (post.status || 'DRAFT'),
        category: (post.category || 'OTHER'),
        tags: post.tags ? post.tags.join(', ') : '',
        seoTitle: post.seoTitle || '',
        seoDescription: post.seoDescription || '',
        isFeatured: post.isFeatured || false
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
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

      const payload = {
        title: formData.title,
        slug: finalSlug,
        excerpt: formData.excerpt.trim(),
        content: formData.content,
        featuredImage: formData.image,
        readTime: parseInt((formData.readTime || '5').toString()) || 5,
        status: formData.status,
        category: formData.category,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
        seoTitle: formData.seoTitle || null,
        seoDescription: formData.seoDescription || null,
        isFeatured: formData.isFeatured
      } as any;

      const response = await blogAPI.updatePost(post.id, payload);
      const updatedFromServer = response?.data?.post;

      onSave(updatedFromServer || { ...post, title: formData.title, slug: finalSlug });
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
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 border-b border-blue-200 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                <Edit className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Edit Post</h2>
                <p className="text-sm text-gray-600 font-medium">Update your blog post content and settings</p>
                {post && (
                  <div className="flex items-center space-x-6 mt-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-semibold text-gray-700">👁️ {post.views || 0} views</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-sm font-semibold text-gray-700">❤️ {post.likes || 0} likes</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <span className="text-sm font-semibold text-gray-700">💬 {post.comments || 0} comments</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-3 text-gray-500 hover:text-gray-700 hover:bg-white rounded-xl transition-all duration-200 hover:shadow-md border border-gray-200 hover:border-gray-300"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label htmlFor="title" className="block text-sm font-bold text-gray-700 mb-3">
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white focus:bg-white"
                placeholder="Enter post title"
              />
            </div>

            <div>
              <label htmlFor="author" className="block text-sm font-bold text-gray-700 mb-3">
                Author *
              </label>
              <input
                type="text"
                id="author"
                name="author"
                value={formData.author}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white focus:bg-white"
                placeholder="Author name"
              />
            </div>
          </div>

          {/* Slug Preview */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">
              Generated Slug
            </label>
            <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-700">
              {formData.title ? generateSlug(formData.title) : 'Enter title to generate slug'}
            </div>
            {post && formData.title && generateSlug(formData.title) !== post.slug && (
              <div className="mt-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">!</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-yellow-800 mb-1">URL Change Warning</p>
                    <p className="text-sm text-yellow-700">
                      Changing the title will change the post URL. The old URL will no longer work and statistics (views, likes, comments) will be preserved.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="subtitle" className="block text-sm font-bold text-gray-700 mb-3">
              Subtitle (Optional)
            </label>
            <input
              type="text"
              id="subtitle"
              name="subtitle"
              value={formData.subtitle}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white focus:bg-white"
              placeholder="Optional subtitle for the post"
            />
          </div>

          <div>
            <label htmlFor="excerpt" className="block text-sm font-bold text-gray-700 mb-3">
              Excerpt *
            </label>
            <textarea
              id="excerpt"
              name="excerpt"
              value={formData.excerpt}
              onChange={handleChange}
              required
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white focus:bg-white resize-none"
              placeholder="Brief description of the post"
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-bold text-gray-700 mb-3">
              Content *
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              required
              rows={8}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white focus:bg-white resize-none"
              placeholder="Write your post content here..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <label htmlFor="readTime" className="block text-sm font-bold text-gray-700 mb-3">
                Read Time
              </label>
              <input
                type="text"
                id="readTime"
                name="readTime"
                value={formData.readTime}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white focus:bg-white"
                placeholder="e.g., 5 min read"
              />
            </div>

            <div>
              <label htmlFor="date" className="block text-sm font-bold text-gray-700 mb-3">
                Publication Date
              </label>
              <input
                type="text"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white focus:bg-white"
                placeholder="e.g., Mar 22, 2023"
              />
            </div>

            <div>
              <label htmlFor="image" className="block text-sm font-bold text-gray-700 mb-3">
                Image URL
              </label>
              <input
                type="url"
                id="image"
                name="image"
                value={formData.image}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white focus:bg-white"
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label htmlFor="status" className="block text-sm font-bold text-gray-700 mb-3">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white focus:bg-white"
              >
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-bold text-gray-700 mb-3">
                Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white focus:bg-white"
              >
                <option value="FAITH">Faith</option>
                <option value="BIBLE_STUDY">Bible Study</option>
                <option value="PRAYER">Prayer</option>
                <option value="TESTIMONY">Testimony</option>
                <option value="REFLECTION">Reflection</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="faith, bible, prayer"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white focus:bg-white"
            />
          </div>

          {/* SEO Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">
                SEO Title
              </label>
              <input
                type="text"
                name="seoTitle"
                value={formData.seoTitle}
                onChange={handleChange}
                placeholder="SEO optimized title"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">
                Featured Post
              </label>
              <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={formData.isFeatured}
                  onChange={handleChange}
                  className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="text-sm font-semibold text-gray-700">
                  Mark as featured post
                </label>
              </div>
            </div>
          </div>

          {/* SEO Description */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">
              SEO Description
            </label>
            <textarea
              name="seoDescription"
              value={formData.seoDescription}
              onChange={handleChange}
              placeholder="SEO meta description"
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white focus:bg-white resize-none"
            />
          </div>

          {/* Image Upload Section */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">
              Or Upload Image
            </label>
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={handleUploadClick}
                disabled={isUploading}
                className="flex items-center space-x-3 px-6 py-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 bg-white hover:shadow-md transition-all duration-200"
              >
                <Upload className="h-5 w-5" />
                <span className="font-semibold">{isUploading ? 'Uploading...' : 'Upload Image'}</span>
              </button>
              {uploadedImageUrl && (
                <button
                  type="button"
                  onClick={removeUploadedImage}
                  className="flex items-center space-x-3 px-6 py-3 text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 rounded-xl transition-all duration-200 border border-red-200 hover:border-red-300"
                >
                  <Trash2 className="h-5 w-5" />
                  <span className="font-semibold">Remove</span>
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
              <div className="mt-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                <img
                  src={uploadedImageUrl}
                  alt="Uploaded preview"
                  className="w-40 h-40 object-cover rounded-xl border-2 border-white shadow-lg"
                />
              </div>
            )}
          </div>

          {/* Current Image Preview */}
          {formData.image && !uploadedImageUrl && (
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">
                Current Image
              </label>
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                <img
                  src={formData.image}
                  alt="Current post image"
                  className="w-40 h-40 object-cover rounded-xl border-2 border-white shadow-lg"
                />
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-4 pt-8 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-200 font-semibold hover:shadow-md border border-gray-200 hover:border-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 rounded-xl transition-all duration-200 flex items-center space-x-3 disabled:opacity-50 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <Edit className="h-5 w-5" />
                  <span>Update Post</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPostModal;
