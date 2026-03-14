import React, { useState, useRef } from 'react';
import { X, Upload, Save, Image as ImageIcon, Share2 } from 'lucide-react';
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
    readTime: '1 min read',
    publishedAt: '',
    isPremium: false
  });

  const [isScheduled, setIsScheduled] = useState(false);

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
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
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
        isFeatured: false,
        isPremium: formData.isPremium
      };

      if (isScheduled && formData.publishedAt) {
        postData.publishedAt = formData.publishedAt;
      }

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
        readTime: '1 min read',
        publishedAt: '',
        isPremium: false
      });
      setIsScheduled(false);
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

          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Schedule Post</h3>
                <p className="text-sm text-gray-500">Publish this post at a future date and time</p>
              </div>
              <button
                type="button"
                onClick={() => setIsScheduled(!isScheduled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 ${isScheduled ? 'bg-amber-600' : 'bg-gray-200'
                  }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isScheduled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                />
              </button>
            </div>

            {isScheduled && (
              <div className="space-y-4 animate-fadeIn">
                <div className="pt-4 border-t border-gray-200">
                  <label htmlFor="publishedAt" className="block text-sm font-bold text-gray-700 mb-3">
                    Publication Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    id="publishedAt"
                    name="publishedAt"
                    value={formData.publishedAt}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 bg-white hover:border-gray-300"
                  />
                </div>

                {formData.publishedAt && (
                  <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg flex items-center space-x-3">
                    <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                    <p className="text-xs font-semibold text-amber-800">
                      {new Date(formData.publishedAt) > new Date() ? (
                        <>Will publish in {Math.ceil((new Date(formData.publishedAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days</>
                      ) : (
                        <span className="text-red-600">Selected date is in the past!</span>
                      )}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Social Preview Section */}
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <div className="mb-6">
              <h3 className="text-sm font-bold text-gray-900 flex items-center space-x-2">
                <Share2 className="h-4 w-4 text-amber-600" />
                <span>Live Social Preview</span>
              </h3>
              <p className="text-sm text-gray-500">How your post will look when shared on WhatsApp & Facebook</p>
            </div>

            <div className="max-w-sm mx-auto bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden transform hover:scale-[1.02] transition-transform duration-300">
              <div className="h-48 overflow-hidden bg-gray-100">
                <img
                  src={formData.image || 'https://images.pexels.com/photos/1370295/pexels-photo-1370295.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'}
                  alt="SEO Preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4 bg-gray-50 border-t border-gray-100">
                <div className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-1">thebiblelover.com</div>
                <h4 className="text-base font-bold text-gray-900 line-clamp-1 mb-1">
                  {formData.title || "Your Post Title"}
                </h4>
                <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                  {formData.excerpt || "A haven for those who seek the wisdom, comfort, and inspiration of the Holy Bible..."}
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-center space-x-8">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                </div>
                <span className="text-[10px] font-bold text-gray-500">FACEBOOK</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mb-2">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.246 2.248 3.484 5.232 3.483 8.413-.003 6.557-5.338 11.892-11.893 11.892-1.997-.001-3.951-.5-5.688-1.448l-6.308 1.654zm6.59-4.819c1.414.843 2.99 1.287 4.606 1.287h.005c5.312 0 9.637-4.325 9.64-9.637 0-2.573-1.002-4.991-2.822-6.811-1.821-1.82-4.239-2.822-6.811-2.822-5.312 0-9.637 4.326-9.64 9.637 0 1.714.454 3.385 1.311 4.85l-.503 1.838 1.871-.491z" /></svg>
                </div>
                <span className="text-[10px] font-bold text-gray-500">WHATSAPP</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center mb-2">
                  <svg className="w-5 h-5 text-sky-500" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" /></svg>
                </div>
                <span className="text-[10px] font-bold text-gray-500">TWITTER</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Premium Content</h3>
                <p className="text-sm text-gray-500">Only accessible to registered members</p>
              </div>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, isPremium: !prev.isPremium }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 ${formData.isPremium ? 'bg-amber-600' : 'bg-gray-200'
                  }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.isPremium ? 'translate-x-6' : 'translate-x-1'
                    }`}
                />
              </button>
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
      </div >
    </div >
  );
};

export default AddPostModal;
