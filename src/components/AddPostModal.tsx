import React, { useState, useRef } from 'react';
import { X, Upload, Save, Image as ImageIcon } from 'lucide-react';
import { cleanupOldStorage } from '../utils/storageManager';

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
      const newPost = {
        id: Date.now().toString(),
        title: formData.title,
        subtitle: formData.subtitle.trim(),
        slug: slug,
        excerpt: formData.excerpt.trim(),
        content: formData.content,
        author: formData.author,
        date: new Date().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        }),
        readTime: formData.readTime,
        image: formData.image,
        views: 0,
        likes: 0,
        comments: 0
      };

      console.log('Saving post with excerpt:', newPost.excerpt);

      // Clean up old storage data before saving
      cleanupOldStorage();

      // Save to localStorage with quota handling
      try {
        const existingPosts = JSON.parse(localStorage.getItem('blogPosts') || '[]');
        existingPosts.push(newPost);
        localStorage.setItem('blogPosts', JSON.stringify(existingPosts));
      } catch (quotaError) {
        console.error('Storage quota exceeded:', quotaError);
        
        // Try to save with compressed data
        try {
          const existingPosts = JSON.parse(localStorage.getItem('blogPosts') || '[]');
          existingPosts.push(newPost);
          
          // Compress the data by removing unnecessary whitespace
          const compressedData = JSON.stringify(existingPosts);
          localStorage.setItem('blogPosts', compressedData);
        } catch (compressionError) {
          console.error('Compression also failed:', compressionError);
          
          // Last resort: save to sessionStorage as backup
          try {
            const existingPosts = JSON.parse(localStorage.getItem('blogPosts') || '[]');
            existingPosts.push(newPost);
            sessionStorage.setItem('blogPosts_backup', JSON.stringify(existingPosts));
            
            alert('Storage quota exceeded! Your post has been saved to temporary storage. Please create a backup and clear some data to continue using localStorage.');
          } catch (sessionError) {
            console.error('Session storage also failed:', sessionError);
            throw new Error('Unable to save post due to storage limitations. Please clear some data or create a backup.');
          }
        }
      }

      // Initialize post data in localStorage
      localStorage.setItem(`post:${slug}:views`, '0');
      localStorage.setItem(`post:${slug}:likes`, '0');
      localStorage.setItem(`post:${slug}:comments`, '[]');

      console.log('Post saved successfully:', newPost);
      onSave(newPost);
      
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
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Add New Post</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Post Title *
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
                Author
              </label>
              <input
                type="text"
                id="author"
                name="author"
                value={formData.author}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-amber-500 focus:border-transparent"
                placeholder="Author name"
              />
            </div>
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-amber-500 focus:border-transparent resize-none"
              placeholder="Brief description of the post..."
            />
          </div>

          <div>
            <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
              Featured Image
            </label>
            
            {/* Upload Section */}
            <div className="mb-4">
              <div className="flex space-x-3">
                <input
                  type="url"
                  id="image"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-amber-500 focus:border-transparent"
                  placeholder="https://example.com/image.jpg"
                />
                <button
                  type="button"
                  onClick={handleUploadClick}
                  disabled={isUploading}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center space-x-2 disabled:opacity-50"
                >
                  {isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      <span>Upload</span>
                    </>
                  )}
                </button>
              </div>
              
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              
              <p className="text-xs text-gray-500 mt-1">
                Upload an image (JPG, PNG, GIF) or paste an image URL. Max size: 5MB
              </p>
            </div>

            {/* Image Preview */}
            {formData.image && (
              <div className="relative">
                <div className="flex items-start space-x-3">
                  <img
                    src={formData.image}
                    alt="Preview"
                    className="w-32 h-20 object-cover rounded border"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-2">
                      {uploadedImageUrl ? 'Uploaded image' : 'Image from URL'}
                    </p>
                    {uploadedImageUrl && (
                      <button
                        type="button"
                        onClick={removeUploadedImage}
                        className="text-red-600 hover:text-red-800 text-sm flex items-center space-x-1"
                      >
                        <X className="h-3 w-3" />
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
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-amber-400 hover:bg-amber-50 transition-colors cursor-pointer"
              >
                <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-600 mb-1">Click to upload an image</p>
                <p className="text-xs text-gray-500">or drag and drop</p>
              </div>
            )}
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
              rows={12}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-amber-500 focus:border-transparent resize-none"
              placeholder="Write your post content here..."
            />
            <p className="text-xs text-gray-500 mt-1">
              You can use HTML tags for formatting (e.g., &lt;p&gt;, &lt;h3&gt;, &lt;blockquote&gt;)
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Generated Slug
              </label>
              <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-sm text-gray-600">
                {formData.title ? generateSlug(formData.title) : 'Enter title to generate slug'}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-amber-700 text-white hover:bg-amber-800 rounded-md transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>{isSubmitting ? 'Saving...' : 'Save Post'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPostModal;
