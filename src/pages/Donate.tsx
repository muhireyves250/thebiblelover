import React, { useState, useEffect } from 'react';
import { Heart, CreditCard, DollarSign, Gift } from 'lucide-react';
import { useBackgroundSettings } from '../hooks/useBackgroundSettings';

const Donate = () => {
  const [offset, setOffset] = useState(0);
  const { getBackgroundStyle, getOverlayStyle } = useBackgroundSettings();
  
  useEffect(() => {
    const onScroll = () => setOffset(window.scrollY * 0.25);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const getParallaxStyle = () => {
    const baseStyle = getBackgroundStyle();
    return {
      ...baseStyle,
      backgroundPosition: `center calc(50% + ${offset}px)`,
      backgroundAttachment: 'fixed'
    };
  };

  const [donationAmount, setDonationAmount] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [donorInfo, setDonorInfo] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    
    // Validation
    if (!amount) {
      alert('Please select or enter a donation amount.');
      return;
    }
    
    if (Number(amount) <= 0) {
      alert('Please enter a valid donation amount.');
      return;
    }
    
    if (Number(amount) > 10000) {
      alert('Donation amount cannot exceed $10,000. Please contact us for larger donations.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log('Processing donation:', { amount, donorInfo });
      
      // Save donation to localStorage for dashboard
      const donation = {
        id: Date.now().toString(),
        amount: Number(amount),
        donorName: donorInfo.name || 'Anonymous',
        donorEmail: donorInfo.email || '',
        donorMessage: donorInfo.message || '',
        timestamp: new Date().toISOString(),
        date: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })
      };
      
      // Save with error handling
      try {
        const existingDonations = JSON.parse(localStorage.getItem('donations') || '[]');
        existingDonations.push(donation);
        localStorage.setItem('donations', JSON.stringify(existingDonations));
      } catch (storageError) {
        console.error('Storage error:', storageError);
        // Try sessionStorage as backup
        try {
          const existingDonations = JSON.parse(sessionStorage.getItem('donations_backup') || '[]');
          existingDonations.push(donation);
          sessionStorage.setItem('donations_backup', JSON.stringify(existingDonations));
        } catch (sessionError) {
          console.error('Session storage also failed:', sessionError);
        }
      }
      
      // Success message
      const donorName = donorInfo.name || 'Anonymous';
      alert(`Thank you, ${donorName}! Your donation of $${amount} has been received. Your support helps keep The Bible Lover running and sharing inspiring content with our community.`);
      
      // Reset form
      setDonationAmount('');
      setCustomAmount('');
      setDonorInfo({ name: '', email: '', message: '' });
      
    } catch (error) {
      console.error('Error processing donation:', error);
      alert('There was an error processing your donation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative h-[520px] bg-cover bg-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-fixed"
          style={getParallaxStyle()}
        >
        </div>
        
        {/* Overlay */}
        <div 
          className="absolute inset-0"
          style={getOverlayStyle()}
        />
        
        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="bg-white border border-gray-200 px-10 md:px-16 py-10 text-center">
            <h1 className="text-3xl md:text-5xl font-serif mb-4 tracking-wider text-gray-900">
              DONATE
            </h1>
            <p className="text-xs md:text-sm font-light tracking-[0.35em] uppercase text-gray-700">
              SUPPORT THE MISSION
            </p>
          </div>
        </div>
      </section>

      {/* Donation Content */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-3xl font-serif text-gray-900 mb-6">
              Support The Bible Lover
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed max-w-2xl mx-auto">
              Your donation helps us continue sharing inspiring content, book reviews, and faith-based insights with our community of readers.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Donation Form */}
            <div>
              <h3 className="text-xl font-serif text-gray-900 mb-6">Make a Donation</h3>
              
              {/* Amount Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Amount
                </label>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {['10', '25', '50'].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => handleAmountSelect(amount)}
                      className={`p-3 border rounded-md text-center transition-colors ${
                        donationAmount === amount
                          ? 'border-amber-500 bg-amber-50 text-amber-700'
                          : 'border-gray-300 hover:border-amber-300'
                      }`}
                    >
                      <DollarSign className="h-4 w-4 mx-auto mb-1" />
                      <span className="text-sm font-medium">${amount}</span>
                    </button>
                  ))}
                </div>
                
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {['100', '250'].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => handleAmountSelect(amount)}
                      className={`p-3 border rounded-md text-center transition-colors ${
                        donationAmount === amount
                          ? 'border-amber-500 bg-amber-50 text-amber-700'
                          : 'border-gray-300 hover:border-amber-300'
                      }`}
                    >
                      <DollarSign className="h-4 w-4 mx-auto mb-1" />
                      <span className="text-sm font-medium">${amount}</span>
                    </button>
                  ))}
                </div>

                <div>
                  <label htmlFor="customAmount" className="block text-sm font-medium text-gray-700 mb-2">
                    Custom Amount
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="number"
                      id="customAmount"
                      value={customAmount}
                      onChange={handleCustomAmount}
                      placeholder="Enter amount"
                      className="w-full pl-9 pr-4 py-3 border border-gray-300 rounded-md focus:ring-1 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Donor Information */}
              <div className="mb-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Donor Information (Optional)</h4>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="donorName" className="block text-sm font-medium text-gray-700 mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      id="donorName"
                      name="name"
                      value={donorInfo.name}
                      onChange={handleDonorInfoChange}
                      placeholder="Your name (optional)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="donorEmail" className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      id="donorEmail"
                      name="email"
                      value={donorInfo.email}
                      onChange={handleDonorInfoChange}
                      placeholder="your@email.com (optional)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="donorMessage" className="block text-sm font-medium text-gray-700 mb-2">
                      Message
                    </label>
                    <textarea
                      id="donorMessage"
                      name="message"
                      value={donorInfo.message}
                      onChange={handleDonorInfoChange}
                      rows={3}
                      placeholder="Leave a message (optional)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleDonate}
                disabled={isSubmitting}
                className="w-full bg-amber-700 text-white py-3 px-6 rounded-md hover:bg-amber-800 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Heart className="h-4 w-4" />
                <span>{isSubmitting ? 'Processing...' : 'Donate Now'}</span>
              </button>
            </div>

            {/* Donation Info */}
            <div>
              <h3 className="text-xl font-serif text-gray-900 mb-6">How Your Donation Helps</h3>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <Gift className="h-6 w-6 text-amber-700" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Content Creation</h4>
                    <p className="text-gray-600 text-sm">
                      Support the creation of high-quality book reviews, faith-based articles, and inspiring content.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <CreditCard className="h-6 w-6 text-amber-700" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Platform Maintenance</h4>
                    <p className="text-gray-600 text-sm">
                      Help maintain the website, hosting, and technical infrastructure.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <Heart className="h-6 w-6 text-amber-700" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Community Building</h4>
                    <p className="text-gray-600 text-sm">
                      Foster a community of book lovers and faith seekers through engagement and outreach.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-6 bg-gray-50 rounded-md">
                <h4 className="font-medium text-gray-900 mb-3">Thank You</h4>
                <p className="text-gray-600 text-sm">
                  Every donation, no matter the size, makes a difference. Your support allows us to continue 
                  sharing the joy of reading and faith with our community.
                </p>
              </div>

              {/* Recent Donations */}
              <div className="mt-8">
                <h4 className="font-medium text-gray-900 mb-4">Recent Donations</h4>
                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {(() => {
                    try {
                      const donations = JSON.parse(localStorage.getItem('donations') || '[]');
                      const recentDonations = donations.slice(-5).reverse(); // Show last 5, most recent first
                      
                      if (recentDonations.length === 0) {
                        return (
                          <p className="text-sm text-gray-500 italic">No donations yet. Be the first to support us!</p>
                        );
                      }
                      
                      return recentDonations.map((donation: any) => (
                        <div key={donation.id} className="flex justify-between items-center p-3 bg-white rounded-md border border-gray-200">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {donation.donorName || 'Anonymous'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {donation.date || new Date(donation.timestamp).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-amber-700">${donation.amount}</p>
                            {donation.donorMessage && (
                              <p className="text-xs text-gray-500 italic max-w-32 truncate">
                                "{donation.donorMessage}"
                              </p>
                            )}
                          </div>
                        </div>
                      ));
                    } catch {
                      return (
                        <p className="text-sm text-gray-500 italic">Unable to load recent donations.</p>
                      );
                    }
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Donate;
