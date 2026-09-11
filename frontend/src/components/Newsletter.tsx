import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle } from 'lucide-react';
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
    <section className="py-20 bg-gray-950 isolate">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="w-1 h-4 bg-amber-500 rounded-sm" />
            <span className="text-xs font-black uppercase tracking-[0.2em] text-amber-500">Stay Inspired</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-white">
            Get The Latest Reflections <span className="text-amber-500">Straight To Your Inbox</span>
          </h2>
          <p className="text-sm text-gray-400 mt-2 max-w-xl mx-auto">
            Join our community and receive weekly spiritual insights, book reflections, and exclusive teachings.
          </p>
        </div>

        <div className="max-w-2xl mx-auto bg-gray-900 border border-gray-800 rounded-lg shadow-sm p-8 md:p-10">
          <form onSubmit={handleSubmit}>
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
                className="w-full pl-5 pr-28 py-4 bg-gray-950 border border-gray-700 focus:border-amber-500 rounded-md text-white placeholder-gray-500 focus:outline-none transition-colors disabled:opacity-50"
                placeholder="name@example.com"
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="absolute right-1.5 top-1.5 bottom-1.5 px-6 bg-amber-700 text-white text-xs font-bold uppercase tracking-widest rounded hover:bg-amber-800 transition-colors disabled:opacity-50"
              >
                {status === 'loading' ? 'Joining...' : 'Join'}
              </button>
            </div>

            <AnimatePresence mode="wait">
              {status === 'success' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-4 bg-emerald-950/50 rounded-md border border-emerald-800 flex items-center gap-3"
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  <div>
                    <p className="text-emerald-300 font-bold text-sm">Welcome to the inner circle!</p>
                    <p className="text-emerald-400/70 text-xs">{message}</p>
                  </div>
                </motion.div>
              )}

              {status === 'error' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-4 bg-red-950/50 rounded-md border border-red-800 flex items-center gap-3 text-red-400 text-sm font-bold"
                >
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  {message}
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
