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
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white dark:bg-[#141417] border border-gray-300 dark:border-white/10 rounded-lg shadow-sm p-4 md:p-5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h3 className="text-base font-black uppercase tracking-tight text-gray-900 dark:text-white">Bible Verses</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Manage daily Bible verses and inspirational content</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-amber-700 hover:bg-amber-800 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm font-bold">Add Verse</span>
          </button>
        </div>
      </div>

      {/* Verses List */}
      <div className="bg-white dark:bg-[#141417] border border-gray-300 dark:border-white/10 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-white/10">
            <thead className="bg-gray-50 dark:bg-white/5">
              <tr>
                <th className="px-4 py-2.5 text-left text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                  Verse
                </th>
                <th className="px-4 py-2.5 text-left text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                  Reference
                </th>
                <th className="px-4 py-2.5 text-left text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                  Image
                </th>
                <th className="px-4 py-2.5 text-left text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                  Status
                </th>
                <th className="px-4 py-2.5 text-left text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                  Created
                </th>
                <th className="px-4 py-2.5 text-left text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {verses.map((verse) => (
                <tr key={verse.id} className={`hover:bg-gray-50 dark:hover:bg-white/5 transition-colors ${!verse.isActive ? 'bg-gray-50/60 dark:bg-white/[0.02]' : ''}`}>
                  <td className="px-4 py-3">
                    <div className="max-w-xs">
                      <p className={`text-xs leading-relaxed line-clamp-2 ${!verse.isActive ? 'text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                        {verse.text}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-xs font-bold text-gray-900 dark:text-white">
                      {verse.book} {verse.chapter}:{verse.verse}
                    </span>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-widest">{verse.translation}</p>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {verse.image ? (
                      <img
                        src={verse.image}
                        alt="Verse"
                        className="w-11 h-11 object-cover rounded-md border border-gray-200 dark:border-white/10"
                        crossOrigin="anonymous"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-11 h-11 bg-gray-100 dark:bg-white/5 rounded-md flex items-center justify-center border border-gray-200 dark:border-white/10">
                        <ImageIcon className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => toggleActive(verse)}
                        className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest transition-colors ${
                          verse.isActive
                            ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40'
                            : 'bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-white/10'
                        }`}
                      >
                        {verse.isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        {verse.isActive ? 'Active' : 'Inactive'}
                      </button>
                      {verse.isFeatured && (
                        <span className="flex items-center gap-1 px-2 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40 rounded-full text-[10px] font-bold uppercase tracking-widest">
                          <Star className="w-3 h-3" />
                          Featured
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-400 dark:text-gray-500">
                    {new Date(verse.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEdit(verse)}
                        className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors"
                        title="Edit verse"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => toggleFeatured(verse)}
                        className={`p-1.5 rounded-lg transition-colors ${verse.isFeatured ? 'text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-900/20' : 'text-gray-400 dark:text-gray-500 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-900/20'}`}
                        title="Toggle featured"
                      >
                        {verse.isFeatured ? <Star className="w-3.5 h-3.5" /> : <StarOff className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(verse.id)}
                        className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Delete verse"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {verses.length === 0 && (
            <div className="text-center py-10">
              <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                <ImageIcon className="h-6 w-6 text-amber-700" />
              </div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">No Verses Yet</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Add your first Bible verse to get started</p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || editingVerse) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#141417] border border-gray-300 dark:border-white/10 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-black uppercase tracking-tight text-gray-900 dark:text-white mb-4">
              {editingVerse ? 'Edit Bible Verse' : 'Add New Bible Verse'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">
                  Bible Verse Text *
                </label>
                <textarea
                  value={formData.text}
                  onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                  rows={4}
                  placeholder="Enter the Bible verse text..."
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">
                    Book *
                  </label>
                  <input
                    type="text"
                    value={formData.book}
                    onChange={(e) => setFormData({ ...formData, book: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="e.g., John"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">
                    Chapter *
                  </label>
                  <input
                    type="number"
                    value={formData.chapter}
                    onChange={(e) => setFormData({ ...formData, chapter: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">
                    Verse *
                  </label>
                  <input
                    type="number"
                    value={formData.verse}
                    onChange={(e) => setFormData({ ...formData, verse: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    min="1"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">
                  Translation
                </label>
                <select
                  value={formData.translation}
                  onChange={(e) => setFormData({ ...formData, translation: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
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

              <div className="flex items-center gap-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="mr-2 accent-amber-700"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-200">Active</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="mr-2 accent-amber-700"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-200">Featured</span>
                </label>
              </div>

              {formData.isActive && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/40 rounded-lg p-3">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-blue-400 dark:text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-bold text-blue-800 dark:text-blue-300">
                        Single Active Verse
                      </h3>
                      <div className="mt-1 text-sm text-blue-700 dark:text-blue-400">
                        <p>Only one Bible verse can be active at a time. Setting this verse as active will automatically deactivate all other verses.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
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
                  className="px-4 py-2 text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-white/10 rounded-lg hover:bg-gray-200 dark:hover:bg-white/20 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-700 text-white rounded-lg hover:bg-amber-800 transition-colors font-bold"
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#141417] border border-gray-300 dark:border-white/10 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-base font-black uppercase tracking-tight text-gray-900 dark:text-white mb-3">Delete Bible Verse</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Are you sure you want to delete this Bible verse? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-white/10 rounded-lg hover:bg-gray-200 dark:hover:bg-white/20 transition-colors font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-bold"
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
