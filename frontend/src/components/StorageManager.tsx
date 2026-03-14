import { Settings, TrendingUp } from 'lucide-react';

interface StorageManagerProps {
    storageInfo: any;
    handleCleanupStorage: () => void;
    handleClearAllData: () => void;
    updateStorageInfo: () => void;
}

const StorageManager = ({
    storageInfo,
    handleCleanupStorage,
    handleClearAllData,
    updateStorageInfo
}: StorageManagerProps) => {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Storage Management</h3>
                <p className="text-sm text-gray-600 mt-1">Manage your website's localStorage data and prevent quota exceeded errors. <strong>Your blog posts are never automatically deleted.</strong></p>
            </div>
            <div className="p-6">
                {storageInfo && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <div className="flex items-center">
                                <Settings className="h-8 w-8 text-blue-600" />
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-blue-800">Total Keys</p>
                                    <p className="text-2xl font-bold text-blue-900">{storageInfo.totalKeys}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-green-50 p-4 rounded-lg">
                            <div className="flex items-center">
                                <TrendingUp className="h-8 w-8 text-green-600" />
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-green-800">Storage Used</p>
                                    <p className="text-2xl font-bold text-green-900">{storageInfo.totalSizeMB} MB</p>
                                </div>
                            </div>
                        </div>

                        <div className={`p-4 rounded-lg ${storageInfo.isNearLimit ? 'bg-red-50' : 'bg-gray-50'}`}>
                            <div className="flex items-center">
                                <div className={`h-8 w-8 ${storageInfo.isNearLimit ? 'text-red-600' : 'text-gray-600'}`}>
                                    {storageInfo.isNearLimit ? '⚠️' : '✅'}
                                </div>
                                <div className="ml-3">
                                    <p className={`text-sm font-medium ${storageInfo.isNearLimit ? 'text-red-800' : 'text-gray-800'}`}>
                                        Status
                                    </p>
                                    <p className={`text-lg font-bold ${storageInfo.isNearLimit ? 'text-red-900' : 'text-gray-900'}`}>
                                        {storageInfo.isNearLimit ? 'Near Limit' : 'Healthy'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-green-800 mb-2">Storage Status</h4>
                        <p className="text-sm text-green-700 mb-3">
                            <strong>No automatic cleanup is performed.</strong> All your data (posts, comments, likes, views) is preserved. Nothing is removed automatically.
                        </p>
                        <button
                            onClick={handleCleanupStorage}
                            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                        >
                            Check Status
                        </button>
                    </div>

                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-orange-800 mb-2">Storage Quota Management</h4>
                        <p className="text-sm text-orange-700 mb-3">
                            If you get "quota exceeded" errors, your posts will be automatically saved to temporary storage. Create a backup and clear some data to continue using permanent storage.
                        </p>
                        <div className="text-xs text-orange-600">
                            <strong>Note:</strong> Temporary storage (sessionStorage) is cleared when you close your browser. Always create backups!
                        </div>
                    </div>

                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-red-800 mb-2">Clear All Data</h4>
                        <p className="text-sm text-red-700 mb-3">
                            <strong>Warning:</strong> This will permanently delete all blog posts, comments, likes, views, donations, and messages. This action cannot be undone.
                        </p>
                        <button
                            onClick={handleClearAllData}
                            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                        >
                            Clear All Data
                        </button>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-blue-800 mb-2">Refresh Storage Info</h4>
                        <p className="text-sm text-blue-700 mb-3">
                            Update the storage information displayed above.
                        </p>
                        <button
                            onClick={updateStorageInfo}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                        >
                            Refresh Info
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StorageManager;
