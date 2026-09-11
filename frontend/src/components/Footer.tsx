import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, CheckCircle2 } from 'lucide-react';
import { useLogoSettings } from '../hooks/useLogoSettings';
import { useContentSettings } from '../hooks/useContentSettings';
import { newsletterAPI } from '../services/api';

const Footer = () => {
  const { logoSettings } = useLogoSettings();
  const { settings: contentSettings } = useContentSettings();
  const { footerSettings } = contentSettings;

  const [email, setEmail] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !agreed) return;

    setStatus('loading');
    try {
      const response = await newsletterAPI.subscribe(email);
      if (response.success) {
        setStatus('success');
        setMessage(response.message || 'Thank you for subscribing!');
        setEmail('');
        setAgreed(false);
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
    <footer className="bg-white border-t border-gray-200 pt-14 pb-8 isolate">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-10 gap-x-10 mb-12">
          {/* Brand */}
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
            <p className="text-gray-500 text-sm leading-relaxed max-w-sm">
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
                  className="w-9 h-9 rounded-md border border-gray-300 flex items-center justify-center hover:border-amber-700 hover:bg-amber-50 transition-colors group"
                  aria-label={social.label}
                >
                  <social.icon className="h-4 w-4 text-gray-500 group-hover:text-amber-700" />
                </a>
              ))}
            </div>
          </div>

          {/* Navigate */}
          <div className="lg:col-span-2">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-amber-700 mb-5">Navigate</h3>
            <ul className="space-y-3">
              {['Home', 'About', 'Contact', 'Donate'].map((item) => (
                <li key={item}>
                  <Link
                    to={item === 'Home' ? '/' : `/${item.toLowerCase()}`}
                    className="text-gray-600 hover:text-amber-700 transition-colors text-sm"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal / Connect */}
          <div className="lg:col-span-2">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-amber-700 mb-5">Company</h3>
            <ul className="space-y-3">
              <li><Link to="/terms" className="text-gray-600 hover:text-amber-700 transition-colors text-sm">Terms of Service</Link></li>
              <li><Link to="/privacy" className="text-gray-600 hover:text-amber-700 transition-colors text-sm">Privacy Policy</Link></li>
              <li><span className="text-gray-600 text-sm">{footerSettings.email}</span></li>
              <li><span className="text-gray-600 text-sm">{footerSettings.location}</span></li>
            </ul>
          </div>

          {/* Newsletter card */}
          <div className="lg:col-span-4">
            <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-6">
              <span className="text-xs font-black uppercase tracking-[0.2em] text-amber-700 block mb-2">Stay Inspired</span>
              <p className="text-sm text-gray-600 mb-4">
                Join our community and receive weekly spiritual insights, book reflections, and exclusive teachings.
              </p>

              {status === 'success' ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-md p-3 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                  <p className="text-emerald-700 text-xs font-medium">{message}</p>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="space-y-3">
                  <div>
                    <label htmlFor="footer-email" className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5">
                      Email <span className="text-amber-700">*</span>
                    </label>
                    <input
                      id="footer-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full bg-white border border-gray-300 rounded-md py-2.5 px-3 text-gray-900 text-sm placeholder-gray-400 focus:border-amber-600 focus:outline-none transition-colors"
                    />
                  </div>
                  <label className="flex items-start gap-2 text-xs text-gray-500 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                      required
                      className="mt-0.5 accent-amber-700"
                    />
                    I agree to receive newsletter updates from {logoSettings.logoText}. I can unsubscribe at any time.
                  </label>
                  {status === 'error' && (
                    <p className="text-red-600 text-xs">{message}</p>
                  )}
                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="px-6 py-2.5 bg-amber-700 text-white text-xs font-bold uppercase tracking-widest rounded-md hover:bg-amber-800 transition-colors disabled:opacity-50"
                  >
                    {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 pt-6 flex flex-col md:flex-row justify-between items-center gap-3">
          <div className="text-gray-400 text-[11px] font-medium tracking-wide">
            {footerSettings.copyrightText}
          </div>
          <div className="flex items-center gap-3 text-gray-400 text-[11px] font-medium">
            <span>{footerSettings.email}</span>
            <span>·</span>
            <span>{footerSettings.location}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
