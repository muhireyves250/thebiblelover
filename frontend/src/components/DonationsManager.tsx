import { DollarSign, TrendingUp, BarChart3, Heart, CreditCard, Trash2 } from 'lucide-react';

interface DonationsManagerProps {
    donations: any[];
    stats: any;
    showAllDonations: boolean;
    toggleAllDonations: () => void;
    updateDonationStatus: (id: string, status: string) => void;
    deleteDonation: (id: string) => void;
    refreshDonations?: () => void;
}

const DonationsManager = ({
    donations,
    stats,
    showAllDonations,
    toggleAllDonations,
    updateDonationStatus,
    deleteDonation,
    refreshDonations
}: DonationsManagerProps) => {
    return (
        <div className="space-y-6">
            {/* Professional Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-md border border-green-200 p-2 hover:shadow-lg transition-all duration-300">
                    <div className="text-center">
                        <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
                            <DollarSign className="h-3 w-3 text-white" />
                        </div>
                        <p className="text-lg font-bold text-green-900">${stats.totalDonations}</p>
                        <p className="text-xs font-semibold text-green-700">Total Raised</p>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-md border border-blue-200 p-2 hover:shadow-lg transition-all duration-300">
                    <div className="text-center">
                        <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                            <TrendingUp className="h-3 w-3 text-white" />
                        </div>
                        <p className="text-lg font-bold text-blue-900">{donations.length}</p>
                        <p className="text-xs font-semibold text-blue-700">Total Count</p>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg shadow-md border border-purple-200 p-2 hover:shadow-lg transition-all duration-300">
                    <div className="text-center">
                        <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-2">
                            <BarChart3 className="h-3 w-3 text-white" />
                        </div>
                        <p className="text-lg font-bold text-purple-900">
                            ${donations.length > 0 ? Math.round(stats.totalDonations / donations.length) : 0}
                        </p>
                        <p className="text-xs font-semibold text-purple-700">Average</p>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg shadow-md border border-emerald-200 p-2 hover:shadow-lg transition-all duration-300">
                    <div className="text-center">
                        <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
                            <Heart className="h-3 w-3 text-white" />
                        </div>
                        <p className="text-lg font-bold text-emerald-900">
                            {donations.filter(d => new Date(d.timestamp) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length}
                        </p>
                        <p className="text-xs font-semibold text-emerald-700">This Month</p>
                    </div>
                </div>
            </div>

            {/* Professional Donations List */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-50 to-green-50 px-3 py-2 border-b border-emerald-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-green-500 rounded-lg flex items-center justify-center shadow-md">
                                <DollarSign className="h-3 w-3 text-white" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-gray-900">Recent Donations</h4>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            {refreshDonations && (
                                <button
                                    onClick={refreshDonations}
                                    className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100 rounded-lg transition-all duration-200"
                                    title="Refresh donations"
                                >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                </button>
                            )}
                            <div className="flex items-center space-x-1 px-2 py-1 bg-green-50 rounded-full border border-green-200">
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                <span className="text-xs font-bold text-green-700">{donations.filter(d => d.status === 'COMPLETED' || !d.status).length}</span>
                            </div>
                            <div className="flex items-center space-x-1 px-2 py-1 bg-yellow-50 rounded-full border border-yellow-200">
                                <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div>
                                <span className="text-xs font-bold text-yellow-700">{donations.filter(d => d.status === 'PENDING').length}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="relative">
                    {/* Scroll Fade Indicators */}
                    <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-white to-transparent z-10 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-white to-transparent z-10 pointer-events-none"></div>

                    <div className="max-h-64 overflow-y-auto scroll-smooth" style={{
                        scrollbarWidth: 'thin',
                        scrollbarColor: '#d1d5db #f3f4f6'
                    }}>
                        {donations.slice(0, showAllDonations ? donations.length : 5).map((donation) => (
                            <div key={donation.id} className="p-2 border-b border-gray-100 hover:bg-gradient-to-r hover:from-gray-50 hover:to-emerald-50 transition-all duration-300 group">
                                <div className="flex items-start space-x-3">
                                    {/* Donor Avatar */}
                                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-500 rounded-lg flex items-center justify-center shadow-md flex-shrink-0 group-hover:shadow-lg transition-all duration-300">
                                        <span className="text-white font-bold text-xs">
                                            {(donation.donorName || 'A').charAt(0).toUpperCase()}
                                        </span>
                                    </div>

                                    {/* Donation Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center space-x-2 mb-1">
                                            <h5 className="text-xs font-bold text-gray-900 truncate group-hover:text-emerald-600 transition-colors duration-200">
                                                {donation.donorName || 'Anonymous'}
                                            </h5>
                                            {donation.status === 'COMPLETED' || !donation.status ? (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300">
                                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></div>
                                                    ✓ Completed
                                                </span>
                                            ) : donation.status === 'PENDING' ? (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border border-yellow-300">
                                                    <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mr-1"></div>
                                                    ⏳ Pending
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r from-red-100 to-red-200 text-red-800 border border-red-300">
                                                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full mr-1"></div>
                                                    ✗ Failed
                                                </span>
                                            )}
                                        </div>

                                        <p className="text-xs text-gray-700 mb-2 line-clamp-1 group-hover:text-gray-900 transition-colors duration-200">
                                            {donation.message || 'Thank you for your generous donation!'}
                                        </p>

                                        <div className="flex items-center justify-between text-xs text-gray-500">
                                            <div className="flex items-center space-x-2">
                                                <div className="flex items-center space-x-1 px-2 py-0.5 bg-emerald-100 rounded-full">
                                                    <DollarSign className="h-2 w-2" />
                                                    <span className="font-bold text-emerald-700">${donation.amount}</span>
                                                </div>
                                                <span>•</span>
                                                <div className="flex items-center space-x-1 px-2 py-0.5 bg-gray-100 rounded-full">
                                                    <CreditCard className="h-2 w-2" />
                                                    <span className="font-medium">{donation.paymentMethod || 'STRIPE'}</span>
                                                </div>
                                                <span>•</span>
                                                <span className="text-gray-400">{new Date(donation.timestamp).toLocaleDateString()}</span>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center space-x-1">
                                                {donation.status === 'PENDING' && (
                                                    <button
                                                        onClick={() => updateDonationStatus(donation.id, 'COMPLETED')}
                                                        className="p-1.5 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-all duration-200 hover:shadow-md"
                                                        title="Mark as completed"
                                                    >
                                                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => deleteDonation(donation.id)}
                                                    className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200 hover:shadow-md"
                                                    title="Delete donation"
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {donations.length === 0 && (
                            <div className="text-center py-8">
                                <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-green-100 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-md">
                                    <DollarSign className="h-6 w-6 text-emerald-400" />
                                </div>
                                <h3 className="text-sm font-bold text-gray-900 mb-1">No Donations Yet</h3>
                                <p className="text-xs text-gray-500">Donations from supporters will appear here</p>
                            </div>
                        )}

                        {donations.length > 5 && (
                            <div className="p-2 bg-gradient-to-r from-emerald-50 to-green-50 border-t border-emerald-200">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                                        <p className="text-xs font-semibold text-gray-700">
                                            {showAllDonations
                                                ? `Showing all ${donations.length} donations`
                                                : `Showing 5 of ${donations.length} donations`
                                            }
                                        </p>
                                    </div>
                                    <button
                                        onClick={toggleAllDonations}
                                        className="px-3 py-1.5 text-xs text-white bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 font-semibold rounded-lg transition-all duration-200 hover:shadow-md"
                                    >
                                        {showAllDonations ? 'Show Less' : 'View All Donations'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DonationsManager;
