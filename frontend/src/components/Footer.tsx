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
    <footer className="bg-white border-t border-gray-200 pt-16 pb-8 isolate">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-y-10 gap-x-8 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-4 flex flex-col space-y-5">
            <div className="flex items-center space-x-2">
              {logoSettings.logoUrl && logoSettings.showText ? (
                <>
                  <img src={logoSettings.logoUrl} alt="Logo" className="w-9 h-9 object-contain" />
                  <span className="text-xl font-sans font-extrabold text-gray-900 tracking-tight">{logoSettings.logoText}</span>
                </>
              ) : logoSettings.logoUrl ? (
                <img src={logoSettings.logoUrl} alt="Logo" className="h-9 object-contain" />
              ) : (
                <span className="text-xl font-sans font-extrabold text-gray-900 tracking-tight">{logoSettings.logoText}</span>
              )}
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">
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
                  className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center hover:border-amber-700 hover:bg-amber-50 transition-colors group"
                  aria-label={social.label}
                >
                  <social.icon className="h-4 w-4 text-gray-500 group-hover:text-amber-700" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2 lg:border-l lg:border-gray-200 lg:pl-8">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-amber-700 mb-5">Navigation</h3>
            <ul className="space-y-3">
              {['Home', 'About', 'Contact', 'Donate'].map((item) => (
                <li key={item}>
                  <Link
                    to={item === 'Home' ? '/' : `/${item.toLowerCase()}`}
                    className="text-gray-600 hover:text-amber-700 transition-colors text-sm flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-amber-700 transition-colors" />
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="lg:col-span-3 lg:border-l lg:border-gray-200 lg:pl-8">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-amber-700 mb-5">Connect</h3>
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-1">Email Support</span>
                <p className="text-gray-800 text-sm font-medium">{footerSettings.email}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-1">Our Location</span>
                <p className="text-gray-800 text-sm font-medium">{footerSettings.location}</p>
              </div>
            </div>
          </div>

          {/* Newsletter Section */}
          <div className="lg:col-span-3 lg:border-l lg:border-gray-200 lg:pl-8">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-amber-700 mb-5">Stay Rooted</h3>
            <p className="text-gray-500 text-sm mb-4 leading-relaxed">
              Join our community and receive weekly grains of wisdom.
            </p>

            {status === 'success' ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-md p-3 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                <p className="text-emerald-700 text-xs font-medium">{message}</p>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="relative">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-white border border-gray-300 rounded-md py-2.5 pl-3 pr-11 text-gray-900 text-sm placeholder-gray-400 focus:border-amber-600 focus:outline-none transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="absolute right-1.5 top-1.5 bottom-1.5 px-2.5 bg-amber-700 text-white rounded hover:bg-amber-800 transition-colors disabled:opacity-50"
                  >
                    {status === 'loading' ? (
                      <div className="h-4 w-4 border-2 border-white border-t-transparent animate-spin rounded-full" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {status === 'error' && (
                  <p className="text-red-600 text-xs pl-1">{message}</p>
                )}
              </form>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col md:flex-row items-center gap-3 md:gap-6">
            <div className="text-gray-400 text-[11px] font-medium tracking-wide">
              {footerSettings.copyrightText}
            </div>
            <div className="flex items-center gap-4">
              <Link to="/terms" className="text-[10px] font-bold text-gray-500 hover:text-amber-700 uppercase tracking-widest transition-colors">Terms of Service</Link>
              <Link to="/privacy" className="text-[10px] font-bold text-gray-500 hover:text-amber-700 uppercase tracking-widest transition-colors">Privacy Policy</Link>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-gray-400 text-[11px] font-medium">
            <span>{footerSettings.madeWithText}</span>
            <Heart className="h-3 w-3 text-red-500 fill-red-500/20" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
