import React, { useState, useEffect } from 'react';
import { Heart, CreditCard, DollarSign, Gift, CheckCircle, AlertCircle, ShieldCheck, Globe, Users, ArrowRight } from 'lucide-react';
import PageHeader from '../components/PageHeader';
// @ts-ignore
import { donationsAPI } from '../services/api';

const Donate = () => {
  const [donationAmount, setDonationAmount] = useState('25');
  const [customAmount, setCustomAmount] = useState('');
  const [donorInfo, setDonorInfo] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recentDonations, setRecentDonations] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loadingDonations, setLoadingDonations] = useState(true);

  // Load recent donations
  const loadRecentDonations = async () => {
    setLoadingDonations(true);
    try {
      const response = await donationsAPI.getDonations({ limit: 6 });
      if (response.success && response.data) {
        setRecentDonations(response.data.donations || []);
      }
    } catch (error) {
      console.error('Failed to load recent donations:', error);
      try {
        const localDonations = JSON.parse(localStorage.getItem('donations') || '[]');
        setRecentDonations(localDonations.slice(-6).reverse());
      } catch (localError) {
        setRecentDonations([]);
      }
    } finally {
      setLoadingDonations(false);
    }
  };

  useEffect(() => {
    loadRecentDonations();
  }, []);

  const handleAmountSelect = (amount: string) => {
    setDonationAmount(amount);
    setCustomAmount('');
  };

  const handleCustomAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomAmount(e.target.value);
    setDonationAmount('');
  };

  const handleDonorInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setDonorInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDonate = async () => {
    const amount = customAmount || donationAmount;
    setError('');
    setSuccess('');

    if (!amount || Number(amount) <= 0) {
      setError('Please enter a valid donation amount.');
      return;
    }

    if (Number(amount) > 10000) {
      setError('Donation amount cannot exceed $10,000.');
      return;
    }

    setIsSubmitting(true);

    try {
      const donationData = {
        donorName: donorInfo.name || 'Anonymous',
        email: donorInfo.email || '',
        amount: Number(amount),
        currency: 'USD',
        paymentMethod: 'STRIPE',
        paymentId: `donation_${Date.now()}`,
        message: donorInfo.message || '',
        isAnonymous: !donorInfo.name,
        status: 'PENDING'
      };

      const response = await donationsAPI.submitDonation(donationData);

      if (response.success) {
        setSuccess(`Thank you for your generous gift of $${amount}! Your support makes this mission possible.`);
        setDonationAmount('25');
        setCustomAmount('');
        setDonorInfo({ name: '', email: '', message: '' });
        await loadRecentDonations();
        setTimeout(() => setSuccess(''), 8000);
      } else {
        setError(response.message || 'Failed to process donation. Please try again.');
      }
    } catch (error: any) {
      setError(error.message || 'Error processing donation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const AmountButton = ({ amount }: { amount: string }) => (
    <button
      onClick={() => handleAmountSelect(amount)}
      className={`relative py-4 px-2 rounded-2xl border-2 transition-all duration-300 font-bold text-lg ${donationAmount === amount
        ? 'border-amber-600 bg-amber-50 text-amber-700 shadow-md shadow-amber-900/10'
        : 'border-gray-100 bg-white text-gray-400 hover:border-amber-200 hover:text-gray-600'
        }`}
    >
      ${amount}
      {donationAmount === amount && (
        <div className="absolute -top-2 -right-2 bg-amber-600 text-white rounded-full p-1 shadow-sm">
          <CheckCircle className="w-3 h-3" />
        </div>
      )}
    </button>
  );

  return (
    <div className="bg-white min-h-screen">
      <PageHeader title="Support the Word" subtitle="FOSTERING FAITH THROUGH YOUR GENEROSITY" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">

          {/* Left Column: Form Section */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-gray-200/50 p-8 md:p-12 relative overflow-hidden">
              {/* Decorative element */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-bl-[5rem] -mr-8 -mt-8 opacity-50 z-0"></div>

              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-amber-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-amber-900/20">
                    <Heart className="w-6 h-6 fill-current" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-serif text-gray-900">Partner With Us</h2>
                    <p className="text-gray-500 text-sm tracking-wide">YOUR GIFT IMPACTS LIVES GLOBALLY</p>
                  </div>
                </div>

                {success && (
                  <div className="mb-8 p-6 bg-green-50 border border-green-100 rounded-2xl flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white flex-shrink-0">
                      <CheckCircle className="w-6 h-6" />
                    </div>
                    <p className="text-green-800 font-medium">{success}</p>
                  </div>
                )}

                {error && (
                  <div className="mb-8 p-6 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-4">
                    <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white flex-shrink-0">
                      <AlertCircle className="w-6 h-6" />
                    </div>
                    <p className="text-red-800 font-medium">{error}</p>
                  </div>
                )}

                <div className="space-y-10">
                  {/* Amount Selector */}
                  <div>
                    <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Choose an Amount</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                      <AmountButton amount="10" />
                      <AmountButton amount="25" />
                      <AmountButton amount="50" />
                      <AmountButton amount="100" />
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="h-px bg-gray-100 flex-1"></div>
                      <span className="text-xs text-gray-300 font-bold uppercase tracking-widest">or</span>
                      <div className="h-px bg-gray-100 flex-1"></div>
                    </div>
                    <div className="mt-6">
                      <div className="relative">
                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xl">$</div>
                        <input
                          type="number"
                          value={customAmount}
                          onChange={handleCustomAmount}
                          placeholder="Enter custom amount"
                          className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl py-5 pl-12 pr-6 text-xl font-bold text-gray-800 focus:bg-white focus:ring-4 focus:ring-amber-50 transition-all outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Donor Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">Your Name</label>
                      <input
                        type="text"
                        name="name"
                        value={donorInfo.name}
                        onChange={handleDonorInfoChange}
                        placeholder="Public or Anonymous"
                        className="w-full bg-gray-50/50 border border-gray-100 rounded-xl py-4 px-6 focus:bg-white focus:ring-4 focus:ring-amber-50 transition-all outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">Email Address</label>
                      <input
                        type="email"
                        name="email"
                        value={donorInfo.email}
                        onChange={handleDonorInfoChange}
                        placeholder="For receipt only"
                        className="w-full bg-gray-50/50 border border-gray-100 rounded-xl py-4 px-6 focus:bg-white focus:ring-4 focus:ring-amber-50 transition-all outline-none"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">Leave a Message</label>
                      <textarea
                        name="message"
                        value={donorInfo.message}
                        onChange={handleDonorInfoChange}
                        rows={3}
                        placeholder="What inspired your gift?"
                        className="w-full bg-gray-50/50 border border-gray-100 rounded-xl py-4 px-6 focus:bg-white focus:ring-4 focus:ring-amber-50 transition-all outline-none resize-none"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleDonate}
                    disabled={isSubmitting}
                    className="w-full bg-amber-700 text-white rounded-2xl py-6 px-10 font-bold text-lg hover:bg-amber-800 transition-all shadow-xl shadow-amber-900/20 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Processing...</span>
                      </div>
                    ) : (
                      <>
                        <span>Complete Donation</span>
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-center gap-6 pt-4 text-gray-400">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase tracking-wider">Secure SSL</span>
                    </div>
                    <div className="w-px h-4 bg-gray-100"></div>
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase tracking-wider">Fast Checkout</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Info & Recent Section */}
          <div className="lg:col-span-5 space-y-12">
            {/* Why Donate Section */}
            <section>
              <h3 className="text-2xl font-serif text-gray-900 mb-8">The Impact of Your Gift</h3>
              <div className="space-y-8">
                <div className="flex gap-6 group">
                  <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 flex-shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                    <Globe className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Spread the Word</h4>
                    <p className="text-gray-500 text-sm leading-relaxed">Helping us share Bible insights and wisdom with thousands of readers around the globe every day.</p>
                  </div>
                </div>
                <div className="flex gap-6 group">
                  <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 flex-shrink-0 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Build Community</h4>
                    <p className="text-gray-500 text-sm leading-relaxed">Supporting events, discussion forums, and interactive content that brings believers together.</p>
                  </div>
                </div>
                <div className="flex gap-6 group">
                  <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 flex-shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                    <Gift className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">New Resources</h4>
                    <p className="text-gray-500 text-sm leading-relaxed">Funding the development of new tools, study guides, and mobile apps for the Bible Project.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Wall of Support */}
            <section className="bg-slate-50 rounded-[2rem] p-8 border border-gray-100">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-serif text-gray-900">Wall of Support</h3>
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
              </div>

              <div className="space-y-4">
                {loadingDonations ? (
                  [1, 2, 3].map(i => (
                    <div key={i} className="bg-white/50 h-20 rounded-2xl animate-pulse"></div>
                  ))
                ) : recentDonations.length === 0 ? (
                  <div className="text-center py-8">
                    <Heart className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                    <p className="text-sm text-gray-500 italic">No donations yet. Be the first!</p>
                  </div>
                ) : (
                  recentDonations.map((donation: any) => (
                    <div key={donation.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-50 group hover:border-amber-100 transition-colors">
                      <div className="flex items-center justify-between gap-4 mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 font-bold text-sm">
                            {(donation.isAnonymous || !donation.donorName) ? 'A' : donation.donorName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-sm">
                              {donation.isAnonymous ? 'Anonymous' : donation.donorName}
                            </p>
                            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                              {new Date(donation.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-amber-700 font-black text-lg">${donation.amount}</div>
                      </div>
                      {donation.message && (
                        <div className="ml-13 pl-13 border-l-2 border-gray-50">
                          <p className="text-xs text-gray-500 italic line-clamp-2">"{donation.message}"</p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              <div className="mt-8 pt-8 border-t border-gray-200/60 text-center">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                  Join {recentDonations.length > 50 ? '50+' : recentDonations.length || '0'} Supporters This Month
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Donate;
