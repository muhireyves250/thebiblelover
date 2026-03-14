import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { newsletterAPI } from '../services/api';

const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    try {
      const response = await newsletterAPI.subscribe(email);
      if (response.success) {
        setStatus('success');
        setMessage(response.message || 'Successfully subscribed!');
        setEmail('');
      } else {
        setStatus('error');
        setMessage(response.message || 'Failed to subscribe. Please try again.');
      }
    } catch (error: any) {
      setStatus('error');
      setMessage(error.message || 'An unexpected error occurred.');
    }
  };

  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-full bg-[#faf9f6] dark:bg-gray-950 transition-colors duration-500"></div>
      <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[80%] bg-amber-200/40 dark:bg-amber-900/20 rounded-full blur-[160px] animate-pulse-slow"></div>
      <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[80%] bg-orange-100/30 dark:bg-orange-900/10 rounded-full blur-[160px] animate-pulse-slow"></div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white/40 backdrop-blur-xl border border-white/40 rounded-[3rem] p-12 md:p-20 shadow-2xl shadow-amber-900/5 text-center">
          <div className="max-w-2xl mx-auto">
            <span className="inline-block px-4 py-1.5 bg-amber-100 text-amber-700 text-[10px] font-bold uppercase tracking-[0.2em] rounded-full mb-8">
              Stay Inspired
            </span>
            <h2 className="text-4xl md:text-5xl font-serif text-gray-900 mb-6 leading-tight">
              Get the latest reflections <br className="hidden md:block" />
              <span className="text-amber-700">straight to your inbox</span>
            </h2>
            <p className="text-gray-500 mb-12 text-lg">
              Join our community and receive weekly spiritual insights, book reflections, and exclusive teachings.
            </p>

            <form onSubmit={handleSubmit} className="max-w-md mx-auto">
              <div className="relative group">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                  disabled={status === 'loading'}
                  className="w-full pl-6 pr-32 py-5 bg-white border-2 border-transparent focus:border-amber-600/20 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none transition-all shadow-sm group-hover:shadow-md disabled:opacity-50"
                  placeholder="name@example.com"
                />
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="absolute right-2 top-2 bottom-2 px-8 bg-amber-600 text-white font-bold rounded-xl hover:bg-amber-700 hover:shadow-lg transition-all active:scale-95 disabled:opacity-50"
                >
                  {status === 'loading' ? 'Joining...' : 'Join'}
                </button>
              </div>

              <AnimatePresence mode="wait">
                {status === 'success' && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="mt-10 p-6 bg-emerald-50 rounded-3xl border border-emerald-100 flex flex-col items-center gap-3"
                  >
                    <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div className="text-center">
                      <p className="text-emerald-900 font-bold mb-1">Welcome to the inner circle!</p>
                      <p className="text-emerald-700/70 text-sm">Grains of Wisdom will arrive in your inbox soon.</p>
                    </div>
                  </motion.div>
                )}

                {status === 'error' && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="mt-8 p-4 bg-red-50 rounded-2xl border border-red-100 flex items-center gap-3 text-red-600 text-sm font-bold"
                  >
                    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {message}
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;