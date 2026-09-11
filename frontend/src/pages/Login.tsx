import React, { useRef, useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { authAPI } from '../services/api';
import { useAuth } from '../hooks/useAPI';
import SEO from '../components/SEO';

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
    <div className="bg-white">
      <SEO title="Sign In" description="Sign in to your Bible Lover account." />

      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[80vh]">
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
            <h2 className="text-2xl font-serif text-white leading-snug">
              A community built around God's Word
            </h2>
          </div>
        </div>

        {/* Login form */}
        <div className="flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-4">
          <p className="text-sm text-gray-500">
            Sign in to your Bible Lover account
          </p>
        </div>

        <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-5 md:p-6">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:border-amber-600 focus:outline-none transition-colors"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2.5 pr-10 border border-gray-300 rounded-md text-sm focus:border-amber-600 focus:outline-none transition-colors"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
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
                <label htmlFor="remember-me" className="text-sm text-gray-600 cursor-pointer">
                  Remember me
                </label>
              </div>

              <Link to="/forgot-password" className="text-sm font-bold text-amber-700 hover:text-amber-800 transition-colors">
                Forgot your password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-amber-700 text-white py-3 rounded-md text-sm font-bold uppercase tracking-widest hover:bg-amber-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Signing in...</span>
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 text-center mb-2">Demo Credentials</p>
            <div className="bg-gray-50 border border-gray-100 p-3 rounded-md">
              <p className="text-sm text-gray-600 text-center leading-relaxed">
                <strong className="text-gray-900">Email:</strong> admin@biblelover.com<br />
                <strong className="text-gray-900">Password:</strong> admin123
              </p>
            </div>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-amber-700 hover:text-amber-800 transition-colors">
            Join the family
          </Link>
        </p>
      </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
