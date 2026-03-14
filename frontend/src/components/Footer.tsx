import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Heart, Instagram, Send, CheckCircle2 } from 'lucide-react';
import { useLogoSettings } from '../hooks/useLogoSettings';
import { useContentSettings } from '../hooks/useContentSettings';
import { newsletterAPI } from '../services/api';

const Footer = () => {
  const { logoSettings } = useLogoSettings();
  const { settings: contentSettings } = useContentSettings();
  const { footerSettings } = contentSettings;

  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    try {
      const response = await newsletterAPI.subscribe(email);
      if (response.success) {
        setStatus('success');
        setMessage(response.message || 'Thank you for subscribing!');
        setEmail('');
      } else {
        setStatus('error');
        setMessage(response.message || 'Subscription failed.');
      }
    } catch (error) {
      setStatus('error');
      setMessage('An error occurred. Please try again.');
    }
  };

  return (
    <footer className="bg-gray-900 pt-20 pb-10 relative overflow-hidden">
      {/* Texture Layer */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('data:image/svg+xml,%3Csvg%20viewBox%3D%220%200%20200%20200%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cfilter%20id%3D%22noiseFilter%22%3E%3CfeTurbulence%20type%3D%22fractalNoise%22%20baseFrequency%3D%220.65%22%20numOctaves%3D%223%22%20stitchTiles%3D%22stitch%22/%3E%3C/filter%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20filter%3D%22url(%23noiseFilter)%22/%3E%3C/svg%3E')]"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Section */}
          <div className="flex flex-col space-y-6">
            <div className="flex items-center space-x-2">
              {logoSettings.logoUrl && logoSettings.showText ? (
                <>
                  <img
                    src={logoSettings.logoUrl}
                    alt="Logo"
                    className="w-10 h-10 object-contain"
                  />
                  <span className="text-2xl font-serif text-white tracking-wide">{logoSettings.logoText}</span>
                </>
              ) : logoSettings.logoUrl ? (
                <img
                  src={logoSettings.logoUrl}
                  alt="Logo"
                  className="h-10 object-contain"
                />
              ) : (
                <>
                  <div className="w-10 h-10 bg-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-900/20">
                    <span className="text-white font-bold text-lg">T</span>
                  </div>
                  <span className="text-2xl font-serif text-white tracking-wide">{logoSettings.logoText}</span>
                </>
              )}
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              {footerSettings.description}
            </p>
            <div className="flex items-center gap-3">
              {[
                { icon: Facebook, href: footerSettings.facebook, label: 'Facebook' },
                { icon: Twitter, href: footerSettings.twitter, label: 'Twitter' },
                { icon: Instagram, href: footerSettings.instagram, label: 'Instagram' }
              ].map((social, i) => social.href && (
                <a
                  key={i}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center hover:bg-amber-600 transition-all duration-300 group"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5 text-gray-400 group-hover:text-white" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:pl-8">
            <h3 className="text-white font-bold mb-6 text-sm uppercase tracking-widest">Navigation</h3>
            <ul className="space-y-4">
              {['Home', 'About', 'Contact', 'Donate'].map((item) => (
                <li key={item}>
                  <Link
                    to={item === 'Home' ? '/' : `/${item.toLowerCase()}`}
                    className="text-gray-400 hover:text-amber-500 transition-colors text-sm flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-700 group-hover:bg-amber-500 transition-all"></span>
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-bold mb-6 text-sm uppercase tracking-widest">Connect</h3>
            <div className="space-y-4">
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 uppercase mb-1">Email Support</span>
                <p className="text-gray-300 text-sm font-medium">{footerSettings.email}</p>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 uppercase mb-1">Our Location</span>
                <p className="text-gray-300 text-sm font-medium">{footerSettings.location}</p>
              </div>
            </div>
          </div>

          {/* Newsletter Section */}
          <div className="relative">
            <h3 className="text-white font-bold mb-6 text-sm uppercase tracking-widest">Stay Rooted</h3>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              Join our community and receive weekly grains of wisdom.
            </p>

            {status === 'success' ? (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-center gap-3 animate-in fade-in zoom-in duration-300">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                <p className="text-emerald-400 text-xs font-medium">{message}</p>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-3">
                <div className="relative group">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-gray-800 border-gray-700 rounded-2xl py-3 px-4 text-white text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all outline-none"
                  />
                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="absolute right-2 top-1.5 p-2 bg-amber-600 text-white rounded-xl hover:bg-amber-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-900/20 group-hover:scale-105 active:scale-95"
                  >
                    {status === 'loading' ? (
                      <div className="h-4 w-4 border-2 border-white border-t-transparent animate-spin rounded-full" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {status === 'error' && (
                  <p className="text-rose-500 text-xs mt-2 pl-1 italic">{message}</p>
                )}
              </form>
            )}
          </div>
        </div>

        {/* Bottom Bar Containerized */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
            <div className="text-gray-500 text-[11px] font-medium tracking-wide">
              {footerSettings.copyrightText}
            </div>
            <div className="flex items-center gap-4">
              <Link to="/terms" className="text-[10px] font-bold text-gray-500 hover:text-amber-600 uppercase tracking-widest transition-colors">Terms of Service</Link>
              <Link to="/privacy" className="text-[10px] font-bold text-gray-500 hover:text-amber-600 uppercase tracking-widest transition-colors">Privacy Policy</Link>
            </div>
          </div>
          <div className="flex items-center gap-2 text-gray-500 text-[11px] font-medium opacity-80">
            <span>{footerSettings.madeWithText}</span>
            <Heart className="h-3 w-3 text-rose-500 fill-rose-500/20" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;