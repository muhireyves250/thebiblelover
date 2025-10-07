import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, Star, StarOff, Image as ImageIcon } from 'lucide-react';
import { useAPI } from '../hooks/useAPI';
// @ts-ignore
import { bibleVersesAPI } from '../services/api';
import ImageUpload from './ImageUpload';

interface BibleVerse {
  id: string;
  text: string;
  book: string;
  chapter: number;
  verse: number;
  translation: string;
  image?: string;
  isActive: boolean;
  isFeatured: boolean;
  shareCount: number;
  createdAt: string;
}

const BibleVerseManager = () => {
  const [verses, setVerses] = useState<BibleVerse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingVerse, setEditingVerse] = useState<BibleVerse | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const { del } = useAPI();

  // Form state
  const [formData, setFormData] = useState({
    text: '',
    book: '',
    chapter: 1,
    verse: 1,
    translation: 'NIV',
    image: '',
    isActive: true,
    isFeatured: false
  });

  const loadVerses = async () => {
    try {
      setLoading(true);
      const response = await bibleVersesAPI.getVerses({ limit: 50, includeInactive: true });
      if (response.success && response.data) {
        setVerses(response.data.verses);
      }
    } catch (error) {
      console.error('Failed to load Bible verses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVerses();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingVerse) {
        const response = await bibleVersesAPI.updateVerse(editingVerse.id, formData);
        if (response.success) {
          await loadVerses();
          setEditingVerse(null);
          setFormData({
            text: '',
            book: '',
            chapter: 1,
            verse: 1,
            translation: 'NIV',
            image: '',
            isActive: true,
            isFeatured: false
          });
        }
      } else {
        const response = await bibleVersesAPI.createVerse(formData);
        if (response.success) {
          await loadVerses();
          setShowAddModal(false);
          setFormData({
            text: '',
            book: '',
            chapter: 1,
            verse: 1,
            translation: 'NIV',
            image: '',
            isActive: true,
            isFeatured: false
          });
        }
      }
    } catch (error) {
      console.error('Failed to save Bible verse:', error);
    }
  };

  const handleEdit = (verse: BibleVerse) => {
    setEditingVerse(verse);
    setFormData({
      text: verse.text,
      book: verse.book,
      chapter: verse.chapter,
      verse: verse.verse,
      translation: verse.translation,
      image: verse.image || '',
      isActive: verse.isActive,
      isFeatured: verse.isFeatured
    });
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await del(`/bible-verses/${id}`);
      if (response.success) {
        await loadVerses();
        setDeleteConfirm(null);
      }
    } catch (error) {
      console.error('Failed to delete Bible verse:', error);
    }
  };

  const toggleActive = async (verse: BibleVerse) => {
    try {
      // If we're activating this verse, we need to deactivate all others first
      const newActiveState = !verse.isActive;
      
      const response = await bibleVersesAPI.updateVerse(verse.id, {
        isActive: newActiveState
      });
      
      if (response.success) {
        await loadVerses();
        
        // Show user feedback
        if (newActiveState) {
          alert(`"${verse.book} ${verse.chapter}:${verse.verse}" is now the active verse. All other verses have been deactivated.`);
        } else {
          alert(`"${verse.book} ${verse.chapter}:${verse.verse}" has been deactivated.`);
        }
      }
    } catch (error) {
      console.error('Failed to toggle active status:', error);
      alert('Failed to update verse status. Please try again.');
    }
  };

  const toggleFeatured = async (verse: BibleVerse) => {
    try {
      const response = await bibleVersesAPI.updateVerse(verse.id, {
        isFeatured: !verse.isFeatured
      });
      if (response.success) {
        await loadVerses();
      }
    } catch (error) {
      console.error('Failed to toggle featured status:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-700"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Bible Verses</h2>
          <p className="text-gray-600">Manage daily Bible verses and inspirational content</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center px-4 py-2 bg-amber-700 text-white rounded-md hover:bg-amber-800 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Verse
        </button>
      </div>

      {/* Verses List */}
      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Verse
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reference
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Image
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                   Created
                 </th>
                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                   Actions
                 </th>
              </tr>
            </thead>
             <tbody className="bg-white divide-y divide-gray-200">
               {verses.map((verse) => (
                 <tr key={verse.id} className={`hover:bg-gray-50 ${!verse.isActive ? 'bg-gray-50 opacity-75' : ''}`}>
                   <td className="px-6 py-4">
                     <div className="max-w-xs">
                       <p className={`text-sm line-clamp-2 ${!verse.isActive ? 'text-gray-500' : 'text-gray-900'}`}>
                         {verse.text}
                       </p>
                       {!verse.isActive && (
                         <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-200 text-gray-600 mt-1">
                           Inactive
                         </span>
                       )}
                     </div>
                   </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">
                      {verse.book} {verse.chapter}:{verse.verse}
                    </span>
                    <p className="text-xs text-gray-500">{verse.translation}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {verse.image ? (
                      <img 
                        src={verse.image}
                        alt="Verse image" 
                        className="w-12 h-12 object-cover rounded-md border"
                        crossOrigin="anonymous"
                        onError={(e) => {
                          console.error('Image load error for verse:', verse.id, e);
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center">
                        <ImageIcon className="w-4 h-4 text-gray-400" />
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleActive(verse)}
                        className={`flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          verse.isActive
                            ? 'bg-green-100 text-green-800 hover:bg-green-200 border border-green-300'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300'
                        }`}
                      >
                        {verse.isActive ? <Eye className="w-3 h-3 mr-1" /> : <EyeOff className="w-3 h-3 mr-1" />}
                        {verse.isActive ? 'ACTIVE' : 'Inactive'}
                      </button>
                      {verse.isFeatured && (
                        <span className="flex items-center px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                          <Star className="w-3 h-3 mr-1" />
                          Featured
                        </span>
                      )}
                    </div>
                  </td>
                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                     {new Date(verse.createdAt).toLocaleDateString()}
                   </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(verse)}
                        className="text-amber-600 hover:text-amber-900"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toggleFeatured(verse)}
                        className={verse.isFeatured ? 'text-yellow-600 hover:text-yellow-900' : 'text-gray-400 hover:text-yellow-600'}
                      >
                        {verse.isFeatured ? <Star className="w-4 h-4" /> : <StarOff className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(verse.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || editingVerse) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              {editingVerse ? 'Edit Bible Verse' : 'Add New Bible Verse'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bible Verse Text *
                </label>
                <textarea
                  value={formData.text}
                  onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                  rows={4}
                  placeholder="Enter the Bible verse text..."
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Book *
                  </label>
                  <input
                    type="text"
                    value={formData.book}
                    onChange={(e) => setFormData({ ...formData, book: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="e.g., John"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chapter *
                  </label>
                  <input
                    type="number"
                    value={formData.chapter}
                    onChange={(e) => setFormData({ ...formData, chapter: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Verse *
                  </label>
                  <input
                    type="number"
                    value={formData.verse}
                    onChange={(e) => setFormData({ ...formData, verse: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    min="1"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Translation
                </label>
                <select
                  value={formData.translation}
                  onChange={(e) => setFormData({ ...formData, translation: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="NIV">NIV</option>
                  <option value="ESV">ESV</option>
                  <option value="KJV">KJV</option>
                  <option value="NASB">NASB</option>
                  <option value="MSG">MSG</option>
                </select>
              </div>

              <div>
                <ImageUpload
                  value={formData.image}
                  onChange={(imageUrl) => setFormData({ ...formData, image: imageUrl })}
                  onError={(error) => console.error('Upload error:', error)}
                  isBibleVerseImage={true}
                />
              </div>

              <div className="flex items-center space-x-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Active</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Featured</span>
                </label>
              </div>
              
              {formData.isActive && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800">
                        Single Active Verse
                      </h3>
                      <div className="mt-1 text-sm text-blue-700">
                        <p>Only one Bible verse can be active at a time. Setting this verse as active will automatically deactivate all other verses.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingVerse(null);
                     setFormData({
                       text: '',
                       book: '',
                       chapter: 1,
                       verse: 1,
                       translation: 'NIV',
                       image: '',
                       isActive: true,
                       isFeatured: false
                     });
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-700 text-white rounded-md hover:bg-amber-800 transition-colors"
                >
                  {editingVerse ? 'Update Verse' : 'Add Verse'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Delete Bible Verse</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this Bible verse? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BibleVerseManager;
