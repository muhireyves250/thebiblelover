import React, { useState, useRef } from 'react';
import { X, Upload, Save, Image as ImageIcon } from 'lucide-react';
import { cleanupOldStorage } from '../utils/storageManager';
import { blogAPI } from '../services/api';

interface AddPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (post: any) => void;
}

const AddPostModal: React.FC<AddPostModalProps> = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    excerpt: '',
    content: '',
    author: 'Admin',
    image: 'https://images.pexels.com/photos/1370295/pexels-photo-1370295.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    readTime: '1 min read'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPG, PNG, GIF, etc.)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setIsUploading(true);

    try {
      // Convert file to base64 for local storage
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64String = event.target?.result as string;
        setUploadedImageUrl(base64String);
        setFormData(prev => ({
          ...prev,
          image: base64String
        }));
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image. Please try again.');
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

      const slug = generateSlug(formData.title);
      
      // Prepare post data for API
      const postData = {
        title: formData.title,
        slug: slug,
        excerpt: formData.excerpt.trim(),
        content: formData.content,
        featuredImage: formData.image,
        readTime: parseInt((formData.readTime || '5').toString()) || 5,
        status: 'PUBLISHED',
        category: 'OTHER',
        tags: [],
        seoTitle: formData.title,
        seoDescription: formData.excerpt.trim(),
        isFeatured: false
      };

      console.log('Saving post to database:', postData);

      // Save to database via API
      const response = await blogAPI.createPost(postData);
      
      if (response.success && response.data?.post) {
        const savedPost = response.data.post;
        console.log('Post saved successfully to database:', savedPost);
        
        // Clean up old storage data
        cleanupOldStorage();

        // Also save to localStorage for local caching
        try {
          const existingPosts = JSON.parse(localStorage.getItem('blogPosts') || '[]');
          existingPosts.push(savedPost);
          localStorage.setItem('blogPosts', JSON.stringify(existingPosts));
        } catch (quotaError) {
          console.warn('Failed to save to localStorage:', quotaError);
        }

        // Initialize post statistics in localStorage
        localStorage.setItem(`post:${slug}:views`, '0');
        localStorage.setItem(`post:${slug}:likes`, '0');
        localStorage.setItem(`post:${slug}:comments`, '[]');

        onSave(savedPost);
      } else {
        console.error('Failed to save post to database:', response);
        throw new Error(response.message || 'Failed to save post to database');
      }
      
      // Reset form
      setFormData({
        title: '',
        subtitle: '',
        excerpt: '',
        content: '',
        author: 'Admin',
        image: 'https://images.pexels.com/photos/1370295/pexels-photo-1370295.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        readTime: '1 min read'
      });
      setUploadedImageUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      onClose();
    } catch (error) {
      console.error('Error saving post:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        formData: formData
      });
      alert(`Error saving post: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-8 border-b border-amber-200 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                <Save className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Add New Post</h2>
                <p className="text-sm text-gray-600 font-medium">Create a new blog post for your website</p>
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
                Post Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                autoComplete="off"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 bg-gray-50 hover:bg-white focus:bg-white"
                placeholder="Enter post title"
              />
            </div>

            <div>
              <label htmlFor="author" className="block text-sm font-bold text-gray-700 mb-3">
                Author
              </label>
              <input
                type="text"
                id="author"
                name="author"
                value={formData.author}
                onChange={handleChange}
                autoComplete="name"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 bg-gray-50 hover:bg-white focus:bg-white"
                placeholder="Author name"
              />
            </div>
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
              autoComplete="off"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 bg-gray-50 hover:bg-white focus:bg-white"
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
              autoComplete="off"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 bg-gray-50 hover:bg-white focus:bg-white resize-none"
              placeholder="Brief description of the post..."
            />
          </div>

          <div>
            <label htmlFor="image" className="block text-sm font-bold text-gray-700 mb-3">
              Featured Image
            </label>
            
            {/* Upload Section */}
            <div className="mb-6">
              <div className="flex space-x-4">
                <input
                  type="url"
                  id="image"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  autoComplete="url"
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 bg-gray-50 hover:bg-white focus:bg-white"
                  placeholder="https://example.com/image.jpg"
                />
                <button
                  type="button"
                  onClick={handleUploadClick}
                  disabled={isUploading}
                  className="px-6 py-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 bg-white hover:shadow-md"
                >
                  {isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                      <span className="font-semibold">Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-5 w-5" />
                      <span className="font-semibold">Upload</span>
                    </>
                  )}
                </button>
              </div>
              
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                name="featuredImage"
                autoComplete="off"
                onChange={handleFileUpload}
                className="hidden"
              />
              
              <p className="text-sm text-gray-600 mt-3 font-medium">
                Upload an image (JPG, PNG, GIF) or paste an image URL. Max size: 5MB
              </p>
            </div>

            {/* Image Preview */}
            {formData.image && (
              <div className="relative bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                <div className="flex items-start space-x-4">
                  <img
                    src={formData.image}
                    alt="Preview"
                    className="w-40 h-24 object-cover rounded-xl border-2 border-white shadow-lg"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className={`w-3 h-3 rounded-full ${uploadedImageUrl ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                      <p className="text-sm font-semibold text-gray-700">
                        {uploadedImageUrl ? 'Uploaded image' : 'Image from URL'}
                      </p>
                    </div>
                    {uploadedImageUrl && (
                      <button
                        type="button"
                        onClick={removeUploadedImage}
                        className="text-red-600 hover:text-red-800 text-sm flex items-center space-x-2 font-medium hover:bg-red-50 px-3 py-1 rounded-lg transition-all duration-200"
                      >
                        <X className="h-4 w-4" />
                        <span>Remove uploaded image</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Upload Area (when no image) */}
            {!formData.image && (
              <div 
                onClick={handleUploadClick}
                className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-amber-400 hover:bg-amber-50 transition-all duration-300 cursor-pointer group"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:from-amber-100 group-hover:to-amber-200 transition-all duration-300">
                  <ImageIcon className="h-8 w-8 text-gray-500 group-hover:text-amber-600 transition-colors duration-300" />
                </div>
                <p className="text-base font-semibold text-gray-700 mb-2">Click to upload an image</p>
                <p className="text-sm text-gray-500">or drag and drop</p>
              </div>
            )}
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
              rows={12}
              autoComplete="off"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 bg-gray-50 hover:bg-white focus:bg-white resize-none"
              placeholder="Write your post content here..."
            />
            <p className="text-sm text-gray-600 mt-3 font-medium">
              You can use HTML tags for formatting (e.g., &lt;p&gt;, &lt;h3&gt;, &lt;blockquote&gt;)
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                autoComplete="off"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 bg-gray-50 hover:bg-white focus:bg-white"
                placeholder="e.g., 5 min read"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">
                Generated Slug
              </label>
              <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-700">
                {formData.title ? generateSlug(formData.title) : 'Enter title to generate slug'}
              </div>
            </div>
          </div>

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
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 rounded-xl transition-all duration-200 flex items-center space-x-3 disabled:opacity-50 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  <span>Save Post</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPostModal;
