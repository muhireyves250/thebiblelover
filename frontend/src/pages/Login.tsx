import React, { useRef, useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { authAPI } from '../services/api';
import { useAuth } from '../hooks/useAPI';
import SEO from '../components/SEO';
import AutoText from '../components/AutoText';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user, isAuthenticated, login } = useAuth();
  const hasNavigatedRef = useRef(false);

  // Navigate once when authenticated (prevents rapid re-navigation loops)
  useEffect(() => {
    if (isAuthenticated && !hasNavigatedRef.current && user) {
      hasNavigatedRef.current = true;
      const destination = user.role === 'ADMIN' ? '/dashboard' : '/member-dashboard';
      navigate(destination, { replace: true });
    }
  }, [isAuthenticated, navigate, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await authAPI.login(email, password);

      if (response.success && response.data) {
        login(response.data.user, response.data.token);
        // navigation handled by effect to avoid duplicate navigations
      } else {
        setError(response.message || 'Login failed');
      }
    } catch (error: any) {
      setError(error.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] md:min-h-screen bg-white dark:bg-[#141417] flex items-center justify-center p-3 sm:p-4">
      <SEO title="Sign In" description="Sign in to your Bible Lover account." />

      <div className="max-w-4xl w-full">
      <div className="bg-white dark:bg-[#141417] border border-gray-300 dark:border-white/10 rounded-lg shadow-sm dark:bg-[#141417] dark:border-white/10 overflow-hidden grid grid-cols-1 lg:grid-cols-2 items-stretch">
        {/* Photo */}
        <div className="hidden lg:block relative">
          <img
            src="/images/about.png"
            alt="The Bible Lover"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-10 left-10 right-10">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1 h-4 bg-amber-500 rounded-sm" />
              <span className="text-xs font-black uppercase tracking-[0.2em] text-amber-400">The Bible Lover</span>
            </div>
            <AutoText as="h2" className="text-2xl font-serif text-white leading-snug">
              A community built around God's Word
            </AutoText>
          </div>
        </div>

        {/* Login form */}
        <div className="flex items-center justify-center p-5 sm:p-8 md:p-10">
      <div className="max-w-md w-full">
        <div className="text-center mb-2 md:mb-4">
          <div className="flex items-center justify-center gap-2 mb-1.5 md:mb-1">
            <span className="w-1 h-3.5 bg-amber-700 rounded-sm" />
            <AutoText as="span" className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-700">Sign In</AutoText>
          </div>
          <AutoText as="p" className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
            Sign in to your Bible Lover account
          </AutoText>
        </div>

        <div>
          <form className="space-y-2.5 md:space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 md:px-4 py-2.5 md:py-3 rounded-md text-xs md:text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1 md:mb-1.5">
                <AutoText>Email address</AutoText>
              </label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500 transition-colors group-focus-within:text-amber-600" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white dark:bg-[#141417] border border-gray-300 dark:border-white/10 rounded-md py-2 md:py-2.5 pl-9 pr-3 text-xs md:text-sm focus:border-amber-600 focus:outline-none transition-colors"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1 md:mb-1.5">
                <AutoText>Password</AutoText>
              </label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500 transition-colors group-focus-within:text-amber-600" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white dark:bg-[#141417] border border-gray-300 dark:border-white/10 rounded-md py-2 md:py-2.5 pl-9 pr-10 text-xs md:text-sm focus:border-amber-600 focus:outline-none transition-colors"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 dark:text-gray-500 hover:text-gray-600 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 accent-amber-700 rounded cursor-pointer"
                />
                <label htmlFor="remember-me" className="text-xs md:text-sm text-gray-600 dark:text-gray-300 cursor-pointer">
                  <AutoText>Remember me</AutoText>
                </label>
              </div>

              <Link to="/forgot-password" className="text-xs md:text-sm font-bold text-amber-700 hover:text-amber-800 transition-colors">
                <AutoText>Forgot your password?</AutoText>
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-amber-700 text-white py-2.5 md:py-3 rounded-md text-xs md:text-sm font-bold uppercase tracking-widest hover:bg-amber-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <AutoText as="span">Signing in...</AutoText>
                </>
              ) : (
                <AutoText as="span">Sign In</AutoText>
              )}
            </button>
          </form>

          <div className="mt-2 pt-2 md:mt-4 md:pt-4 border-t border-gray-100 dark:border-white/5">
            <AutoText as="p" className="hidden md:block text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 text-center mb-2">Demo Credentials</AutoText>
            <div className="bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 py-1 px-2 md:p-3 rounded-md">
              <p className="text-[10px] md:text-sm text-gray-600 dark:text-gray-300 text-center leading-snug">
                <strong className="text-gray-900 dark:text-white">admin@biblelover.com</strong> / <strong className="text-gray-900 dark:text-white">admin123</strong>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-2.5 md:mt-4 text-center bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-md p-3">
          <p className="text-[11px] md:text-sm text-gray-500 dark:text-gray-400">
            <AutoText as="span">Don't have an account?</AutoText>{' '}
            <Link to="/register" className="font-bold text-amber-700 hover:text-amber-800 transition-colors">
              <AutoText>Join the family</AutoText>
            </Link>
          </p>
        </div>

        <div className="mt-3 flex justify-center items-center gap-4 text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest">
          <Link to="/terms" className="hover:text-amber-700 transition-colors"><AutoText>Terms</AutoText></Link>
          <div className="w-1 h-1 bg-gray-200 dark:bg-white/10 rounded-full"></div>
          <Link to="/privacy" className="hover:text-amber-700 transition-colors"><AutoText>Privacy</AutoText></Link>
        </div>
      </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default Login;
