import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, CheckCircle2, AlertCircle } from 'lucide-react';
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
    <section className="relative overflow-hidden isolate bg-gradient-to-br from-gray-950 via-gray-950 to-amber-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="flex flex-col lg:flex-row items-center gap-10">
          <div className="flex-1 text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-2 mb-3">
              <span className="w-1 h-4 bg-amber-500 rounded-sm" />
              <span className="text-xs font-black uppercase tracking-[0.2em] text-amber-400">Stay Inspired</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white leading-snug">
              Get the latest reflections straight to your inbox
            </h2>
            <p className="text-sm text-gray-400 mt-3 max-w-md mx-auto lg:mx-0">
              Join our community and receive weekly spiritual insights, book reflections, and exclusive teachings.
            </p>
          </div>

          <div className="w-full max-w-sm bg-black/30 border border-white/10 rounded-lg p-8 text-center shrink-0">
            <span className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-white mb-5">
              <Mail className="w-5 h-5 text-amber-700" />
            </span>

            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                disabled={status === 'loading'}
                className="w-full px-4 py-3 bg-gray-950 border border-gray-700 focus:border-amber-500 rounded-md text-white placeholder-gray-500 focus:outline-none transition-colors disabled:opacity-50 text-sm"
                placeholder="name@example.com"
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full py-3 bg-amber-700 text-white text-xs font-bold uppercase tracking-widest rounded-md hover:bg-amber-800 transition-colors disabled:opacity-50"
              >
                {status === 'loading' ? 'Joining...' : 'Subscribe Now'}
              </button>
            </form>

            <AnimatePresence mode="wait">
              {status === 'success' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-3 bg-emerald-950/50 rounded-md border border-emerald-800 flex items-center gap-2 text-left"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <p className="text-emerald-300 text-xs font-bold">{message}</p>
                </motion.div>
              )}

              {status === 'error' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-3 bg-red-950/50 rounded-md border border-red-800 flex items-center gap-2 text-left text-red-400 text-xs font-bold"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {message}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
