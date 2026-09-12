import React, { useState, useEffect } from 'react';
import { Heart, Gift, CheckCircle, AlertCircle, ShieldCheck, Globe, Users, ArrowRight } from 'lucide-react';
import SEO from '../components/SEO';
// @ts-ignore
import { donationsAPI } from '../services/api';

const DonationForm = ({ loadRecentDonations }: { loadRecentDonations: () => Promise<void> }) => {
  const [donationAmount, setDonationAmount] = useState('25');
  const [customAmount, setCustomAmount] = useState('');
  const [donorInfo, setDonorInfo] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = customAmount || donationAmount;
    setError('');
    setSuccess('');

    if (!amount || Number(amount) <= 0) {
      setError('Please enter a valid donation amount.');
      return;
    }

    setIsSubmitting(true);

    try {
      const donationData = {
        donorName: donorInfo.name || 'Anonymous',
        email: donorInfo.email || '',
        amount: Number(amount),
        currency: 'USD',
        message: donorInfo.message || '',
        isAnonymous: !donorInfo.name,
      };

      const response = await donationsAPI.submitDonation(donationData);

      if (response.success) {
        setSuccess(`Thank you for your generous pledge of $${amount}! We'll be in touch to arrange your gift.`);
        setDonationAmount('25');
        setCustomAmount('');
        setDonorInfo({ name: '', email: '', message: '' });
        await loadRecentDonations();
        setTimeout(() => setSuccess(''), 8000);
      } else {
        setError(response.message || 'Failed to submit your pledge. Please try again.');
      }
    } catch (err: any) {
      console.error('Donation error:', err);
      setError(err.message || 'Error processing donation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const AmountButton = ({ amount }: { amount: string }) => (
    <button
      type="button"
      onClick={() => handleAmountSelect(amount)}
      className={`relative py-4 px-2 rounded-md border transition-colors font-bold text-lg ${donationAmount === amount
        ? 'border-amber-700 bg-amber-50 text-amber-700'
        : 'border-gray-300 bg-white text-gray-500 hover:border-gray-400'
        }`}
    >
      ${amount}
      {donationAmount === amount && (
        <div className="absolute -top-2 -right-2 bg-amber-700 text-white rounded-full p-1 shadow-sm">
          <CheckCircle className="w-3 h-3" />
        </div>
      )}
    </button>
  );

  return (
    <form onSubmit={handleDonate} className="space-y-8">
      {success && (
        <div className="p-5 bg-green-50 border border-green-200 rounded-lg flex items-center gap-4">
          <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white flex-shrink-0">
            <CheckCircle className="w-5 h-5" />
          </div>
          <p className="text-green-800 text-sm font-medium">{success}</p>
        </div>
      )}

      {error && (
        <div className="p-5 bg-red-50 border border-red-200 rounded-lg flex items-center gap-4">
          <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white flex-shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <p className="text-red-800 text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Amount Selector */}
      <div>
        <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-4">Choose an Amount</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          <AmountButton amount="10" />
          <AmountButton amount="25" />
          <AmountButton amount="50" />
          <AmountButton amount="100" />
        </div>
        <div className="flex items-center gap-4">
          <div className="h-px bg-gray-200 flex-1"></div>
          <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">or</span>
          <div className="h-px bg-gray-200 flex-1"></div>
        </div>
        <div className="mt-5">
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</div>
            <input
              type="number"
              value={customAmount}
              onChange={handleCustomAmount}
              placeholder="Enter custom amount"
              className="w-full border border-gray-300 rounded-md py-3 pl-8 pr-4 text-lg font-bold text-gray-800 focus:border-amber-600 focus:outline-none transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Donor Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5">Your Name</label>
          <input
            type="text"
            name="name"
            value={donorInfo.name}
            onChange={handleDonorInfoChange}
            placeholder="Public or Anonymous"
            className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:border-amber-600 focus:outline-none transition-colors"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5">Email Address</label>
          <input
            type="email"
            name="email"
            value={donorInfo.email}
            onChange={handleDonorInfoChange}
            placeholder="So we can follow up"
            required
            className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:border-amber-600 focus:outline-none transition-colors"
          />
        </div>
      </div>

      <div>
        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5">Leave a Message</label>
        <textarea
          name="message"
          value={donorInfo.message}
          onChange={handleDonorInfoChange}
          rows={3}
          placeholder="What inspired your gift?"
          className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:border-amber-600 focus:outline-none transition-colors resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-amber-700 text-white rounded-md py-3.5 px-10 font-bold text-sm uppercase tracking-widest hover:bg-amber-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {isSubmitting ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            <span>Submitting...</span>
          </div>
        ) : (
          <>
            <span>Pledge This Gift</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>

      <p className="text-center text-sm text-gray-400 -mt-4">
        We'll reach out by email with instructions to complete your gift.
      </p>

      <div className="flex items-center justify-center gap-6 pt-4 text-gray-400">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wider">Your Info Stays Private</span>
        </div>
      </div>
    </form>
  );
};

const Donate = () => {
  const [recentDonations, setRecentDonations] = useState<any[]>([]);
  const [loadingDonations, setLoadingDonations] = useState(true);

  // Load recent donations
  const loadRecentDonations = async () => {
    setLoadingDonations(true);
    try {
      const response = await donationsAPI.getRecentDonations({ limit: '6' });
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

  return (
    <div className="bg-white min-h-screen">
      <SEO
        title="Support the Mission"
        description="Your generosity helps us spread the word of God. Partner with The Bible Lover to build community and provide spiritual resources globally."
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

          {/* Left Column: Form Section */}
          <div className="lg:col-span-7">
            <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-6 md:p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-11 h-11 bg-amber-700 rounded-lg flex items-center justify-center text-white shrink-0">
                  <Heart className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Partner With Us</h2>
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Your gift impacts lives globally</p>
                </div>
              </div>

              <DonationForm loadRecentDonations={loadRecentDonations} />
            </div>
          </div>

          {/* Right Column: Info & Recent Section */}
          <div className="lg:col-span-5 space-y-6">
            {/* Why Donate Section */}
            <section className="bg-white border border-gray-300 rounded-lg shadow-sm p-6">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-amber-700 mb-6">The Impact of Your Gift</h3>
              <div className="space-y-5">
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-amber-50 border border-amber-100 rounded-lg flex items-center justify-center text-amber-700 flex-shrink-0">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm mb-1">Spread the Word</h4>
                    <p className="text-gray-500 text-sm leading-relaxed">Helping us share Bible insights and wisdom with thousands of readers around the globe every day.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-amber-50 border border-amber-100 rounded-lg flex items-center justify-center text-amber-700 flex-shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm mb-1">Build Community</h4>
                    <p className="text-gray-500 text-sm leading-relaxed">Supporting events, community prayer, and interactive content that brings believers together.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-amber-50 border border-amber-100 rounded-lg flex items-center justify-center text-amber-700 flex-shrink-0">
                    <Gift className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm mb-1">New Resources</h4>
                    <p className="text-gray-500 text-sm leading-relaxed">Funding the development of new tools, study guides, and mobile apps for the Bible Project.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Wall of Support */}
            <section className="bg-white border border-gray-300 rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">Wall of Support</h3>
                <div className="w-2 h-2 bg-amber-600 rounded-full animate-pulse"></div>
              </div>

              <div className="space-y-3">
                {loadingDonations ? (
                  [1, 2, 3].map(i => (
                    <div key={i} className="border border-gray-100 h-20 rounded-lg animate-pulse bg-gray-50"></div>
                  ))
                ) : recentDonations.length === 0 ? (
                  <div className="text-center py-8">
                    <Heart className="w-8 h-8 text-gray-200 mx-auto mb-3" />
                    <p className="text-sm text-gray-500 italic">No donations yet. Be the first!</p>
                  </div>
                ) : (
                  recentDonations.map((donation: any) => (
                    <div key={donation.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center justify-between gap-4 mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-amber-100 rounded-full flex items-center justify-center text-amber-800 font-bold text-sm shrink-0">
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
                        <div className="text-amber-700 font-black text-base">${donation.amount}</div>
                      </div>
                      {donation.message && (
                        <p className="text-xs text-gray-500 italic line-clamp-2 mt-1.5">"{donation.message}"</p>
                      )}
                    </div>
                  ))
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200 text-center">
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
