import { Link } from 'react-router-dom';
import { Facebook, Twitter, Heart, Instagram, Linkedin, Youtube } from 'lucide-react';
import { useLogoSettings } from '../hooks/useLogoSettings';
import { useSocialSettings } from '../hooks/useSocialSettings';
import { useContentSettings } from '../hooks/useContentSettings';

const Footer = () => {
  const { logoSettings } = useLogoSettings();
  const { getSocialLinks } = useSocialSettings();
  const { settings: contentSettings } = useContentSettings();
  const { footerSettings } = contentSettings;

  const socialLinks = getSocialLinks();
  return (
    <footer className="bg-gray-900 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Section */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              {logoSettings.logoUrl && logoSettings.showText ? (
                <>
                  <img
                    src={logoSettings.logoUrl}
                    alt="Logo"
                    className="w-8 h-8 object-contain"
                  />
                  <span className="text-xl font-serif text-white tracking-wide">{logoSettings.logoText}</span>
                </>
              ) : logoSettings.logoUrl ? (
                <img
                  src={logoSettings.logoUrl}
                  alt="Logo"
                  className="h-8 object-contain"
                />
              ) : (
                <>
                  <div className="w-8 h-8 bg-amber-700 rounded flex items-center justify-center">
                    <span className="text-white font-bold text-sm">T</span>
                  </div>
                  <span className="text-xl font-serif text-white tracking-wide">{logoSettings.logoText}</span>
                </>
              )}
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-md">
              {footerSettings.description}
            </p>
            <div className="flex items-center space-x-4">
              {socialLinks.facebook !== '#' && (
                <a
                  href={socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500"
                  aria-label="Facebook"
                >
                  <Facebook className="h-5 w-5 text-gray-300 hover:text-white transition-colors" />
                </a>
              )}
              {socialLinks.twitter !== '#' && (
                <a
                  href={socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500"
                  aria-label="Twitter"
                >
                  <Twitter className="h-5 w-5 text-gray-300 hover:text-white transition-colors" />
                </a>
              )}
              {socialLinks.instagram !== '#' && (
                <a
                  href={socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500"
                  aria-label="Instagram"
                >
                  <Instagram className="h-5 w-5 text-gray-300 hover:text-white transition-colors" />
                </a>
              )}
              {socialLinks.linkedin !== '#' && (
                <a
                  href={socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="h-5 w-5 text-gray-300 hover:text-white transition-colors" />
                </a>
              )}
              {socialLinks.youtube !== '#' && (
                <a
                  href={socialLinks.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500"
                  aria-label="YouTube"
                >
                  <Youtube className="h-5 w-5 text-gray-300 hover:text-white transition-colors" />
                </a>
              )}
              {socialLinks.tiktok !== '#' && (
                <a
                  href={socialLinks.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500"
                  aria-label="TikTok"
                >
                  <svg className="h-5 w-5 text-gray-300 hover:text-white transition-colors" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                  </svg>
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-medium mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-400 hover:text-white transition-colors text-sm">
                  About
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/donate" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Donate
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-medium mb-4">Get in Touch</h3>
            <div className="space-y-3">
              <p className="text-gray-400 text-sm">
                {footerSettings.email}
              </p>
              <p className="text-gray-400 text-sm">
                {footerSettings.location}
              </p>
              <p className="text-gray-400 text-sm">
                {footerSettings.responseTime}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              {footerSettings.copyrightText}
            </div>
            <div className="flex items-center space-x-1 text-gray-400 text-sm">
              <span>{footerSettings.madeWithText}</span>
              <Heart className="h-4 w-4 text-red-500" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;