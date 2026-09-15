import { DollarSign, TrendingUp, BarChart3, Heart, CreditCard, Trash2, Check, RefreshCw } from 'lucide-react';

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
        <div className="space-y-4">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                    { label: 'Total Raised', value: `$${stats.totalDonations}`, icon: DollarSign },
                    { label: 'Total Count', value: donations.length, icon: TrendingUp },
                    { label: 'Average', value: `$${donations.length > 0 ? Math.round(stats.totalDonations / donations.length) : 0}`, icon: BarChart3 },
                    { label: 'This Month', value: donations.filter(d => new Date(d.timestamp) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length, icon: Heart },
                ].map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div key={stat.label} className="bg-white dark:bg-[#141417] border border-gray-400 dark:border-white/20 rounded-lg shadow-sm p-3">
                            <div className="w-8 h-8 bg-amber-50 dark:bg-amber-900/20 rounded-lg flex items-center justify-center mb-2">
                                <Icon className="h-4 w-4 text-amber-700" />
                            </div>
                            <p className="text-lg font-black text-gray-900 dark:text-white">{stat.value}</p>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">{stat.label}</p>
                        </div>
                    );
                })}
            </div>

            {/* Donations List */}
            <div className="bg-white dark:bg-[#141417] border border-gray-400 dark:border-white/20 rounded-lg shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-300 dark:border-white/15 flex items-center justify-between">
                    <h4 className="text-sm font-black uppercase tracking-tight text-gray-900 dark:text-white">Recent Donations</h4>
                    {refreshDonations && (
                        <button
                            onClick={refreshDonations}
                            className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors"
                            title="Refresh donations"
                        >
                            <RefreshCw className="h-3.5 w-3.5" />
                        </button>
                    )}
                </div>

                <div className="max-h-64 overflow-y-auto">
                    {donations.slice(0, showAllDonations ? donations.length : 5).map((donation) => (
                        <div key={donation.id} className="p-3 border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 bg-amber-50 dark:bg-amber-900/20 rounded-lg flex items-center justify-center shrink-0">
                                    <span className="text-amber-700 font-bold text-xs">
                                        {(donation.donorName || 'A').charAt(0).toUpperCase()}
                                    </span>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h5 className="text-xs font-bold text-gray-900 dark:text-white truncate">
                                            {donation.donorName || 'Anonymous'}
                                        </h5>
                                        {donation.status === 'COMPLETED' || !donation.status ? (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 uppercase">
                                                Completed
                                            </span>
                                        ) : donation.status === 'PENDING' ? (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40 uppercase">
                                                Pending
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/40 uppercase">
                                                Failed
                                            </span>
                                        )}
                                    </div>

                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 line-clamp-1">
                                        {donation.message || 'Thank you for your generous donation!'}
                                    </p>

                                    <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-50 dark:bg-amber-900/20 rounded-full">
                                                <DollarSign className="h-2.5 w-2.5 text-amber-700" />
                                                <span className="font-bold text-amber-700">${donation.amount}</span>
                                            </div>
                                            <div className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 dark:bg-white/10 rounded-full">
                                                <CreditCard className="h-2.5 w-2.5" />
                                                <span className="font-medium">{donation.paymentMethod || 'OTHER'}</span>
                                            </div>
                                            <span>{new Date(donation.timestamp).toLocaleDateString()}</span>
                                        </div>

                                        <div className="flex items-center gap-1">
                                            {donation.status === 'PENDING' && (
                                                <button
                                                    onClick={() => updateDonationStatus(donation.id, 'COMPLETED')}
                                                    className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                                                    title="Mark as completed"
                                                >
                                                    <Check className="h-3.5 w-3.5" />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => deleteDonation(donation.id)}
                                                className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                title="Delete donation"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {donations.length === 0 && (
                        <div className="text-center py-10">
                            <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                                <DollarSign className="h-6 w-6 text-amber-700" />
                            </div>
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">No Donations Yet</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Donations from supporters will appear here</p>
                        </div>
                    )}
                </div>

                {donations.length > 5 && (
                    <div className="p-3 bg-gray-50 dark:bg-white/5 border-t border-gray-300 dark:border-white/15 flex items-center justify-between">
                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                            {showAllDonations
                                ? `Showing all ${donations.length} donations`
                                : `Showing 5 of ${donations.length} donations`
                            }
                        </p>
                        <button
                            onClick={toggleAllDonations}
                            className="px-3 py-1.5 text-xs text-white bg-amber-700 hover:bg-amber-800 font-bold rounded-lg transition-colors"
                        >
                            {showAllDonations ? 'Show Less' : 'View All Donations'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DonationsManager;
