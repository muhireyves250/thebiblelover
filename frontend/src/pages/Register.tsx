import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { authAPI } from '../services/api';
import { useAuth } from '../hooks/useAPI';

const Register: React.FC = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setIsLoading(true);
        try {
            const response = await authAPI.register(name, email, password);
            if (response.success && response.data) {
                setIsSuccess(true);
                // Wait briefly for success animation then login
                setTimeout(() => {
                    login(response.data.user, response.data.token);
                    navigate('/member-dashboard');
                }, 2000);
            } else {
                setError(response.message || 'Registration failed');
            }
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-[75vh] md:min-h-screen bg-white flex items-center justify-center p-4">
                <div className="max-w-md w-full text-center space-y-6 bg-white border border-gray-300 rounded-lg shadow-sm p-8 animate-in fade-in zoom-in duration-700">
                    <div className="w-16 h-16 bg-amber-50 border border-amber-100 rounded-full flex items-center justify-center mx-auto text-amber-700">
                        <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-black uppercase tracking-tight text-gray-900">Welcome Home!</h2>
                        <p className="text-gray-500 text-sm">Your spiritual journey with our community begins now.</p>
                    </div>
                    <div className="pt-2 flex justify-center">
                        <div className="w-6 h-6 border-2 border-amber-700 border-t-transparent animate-spin rounded-full"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[75vh] md:min-h-screen bg-white flex items-center justify-center p-3 sm:p-4">
            <div className="max-w-xl w-full grid grid-cols-1 lg:grid-cols-2 bg-white border border-gray-300 rounded-lg shadow-sm overflow-hidden">
                {/* Left Side: Branding/Visual */}
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
                        <h2 className="text-2xl font-serif text-white leading-snug italic">
                            "Come to me, all you who are weary and burdened, and I will give you rest."
                        </h2>
                        <p className="text-gray-300 text-sm font-medium mt-2">— Matthew 11:28</p>
                    </div>
                </div>

                {/* Right Side: Form */}
                <div className="p-5 sm:p-8 md:p-10">
                    <div className="mb-4 sm:mb-8 text-center lg:text-left">
                        <div className="hidden lg:flex items-center gap-2 mb-2">
                            <span className="w-1 h-4 bg-amber-700 rounded-sm" />
                            <span className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">Register</span>
                        </div>
                        <div className="lg:hidden flex items-center justify-center gap-2 mb-1.5">
                            <span className="w-1 h-3.5 bg-amber-700 rounded-sm" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-700">Register</span>
                        </div>
                        <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-gray-900 mb-1">Join the Family</h1>
                        <p className="text-gray-500 text-xs sm:text-sm">Create your disciple profile today.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">
                        {error && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-xs sm:text-sm animate-shake">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2.5 sm:space-y-3.5">
                            <div className="relative group">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 transition-colors group-focus-within:text-amber-600" />
                                <input
                                    type="text"
                                    placeholder="Full Name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className="w-full bg-white border border-gray-300 rounded-md py-2.5 pl-9 pr-3 text-sm focus:border-amber-600 focus:outline-none transition-colors"
                                />
                            </div>

                            <div className="relative group">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 transition-colors group-focus-within:text-amber-600" />
                                <input
                                    type="email"
                                    placeholder="Email Address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full bg-white border border-gray-300 rounded-md py-2.5 pl-9 pr-3 text-sm focus:border-amber-600 focus:outline-none transition-colors"
                                />
                            </div>

                            <div className="relative group">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 transition-colors group-focus-within:text-amber-600" />
                                <input
                                    type="password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full bg-white border border-gray-300 rounded-md py-2.5 pl-9 pr-3 text-sm focus:border-amber-600 focus:outline-none transition-colors"
                                />
                            </div>

                            <div className="relative group">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 transition-colors group-focus-within:text-amber-600" />
                                <input
                                    type="password"
                                    placeholder="Confirm Password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    className="w-full bg-white border border-gray-300 rounded-md py-2.5 pl-9 pr-3 text-sm focus:border-amber-600 focus:outline-none transition-colors"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-amber-700 hover:bg-amber-800 text-white rounded-md py-2.5 sm:py-3 px-6 font-bold text-xs sm:text-sm uppercase tracking-widest transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isLoading ? 'Creating Profile...' : (
                                <>
                                    Begin Journey <ArrowRight className="h-4 w-4" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-3.5 sm:mt-6 text-center bg-gray-50 border border-gray-100 rounded-md p-3">
                        <p className="text-xs sm:text-sm text-gray-500">
                            Already part of the family?{' '}
                            <Link to="/login" className="text-amber-700 font-bold hover:text-amber-800 transition-colors">Sign In</Link>
                        </p>
                    </div>

                    <div className="mt-3 sm:mt-4 flex justify-center items-center gap-4 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                        <Link to="/terms" className="hover:text-amber-700 transition-colors">Terms</Link>
                        <div className="w-1 h-1 bg-gray-200 rounded-full"></div>
                        <Link to="/privacy" className="hover:text-amber-700 transition-colors">Privacy</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
