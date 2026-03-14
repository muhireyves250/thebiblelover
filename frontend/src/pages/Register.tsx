import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, BookOpen, ArrowRight, CheckCircle2 } from 'lucide-react';
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
            <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-700">
                    <div className="w-20 h-20 bg-emerald-100 rounded-3xl flex items-center justify-center mx-auto text-emerald-600 shadow-xl shadow-emerald-900/10">
                        <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-3xl font-serif text-gray-900">Welcome Home!</h2>
                        <p className="text-gray-500">Your spiritual journey with our community begins now.</p>
                    </div>
                    <div className="pt-8 flex justify-center">
                        <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent animate-spin rounded-full"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
            <div className="max-w-xl w-full grid grid-cols-1 lg:grid-cols-2 bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100">
                {/* Left Side: Branding/Visual */}
                <div className="hidden lg:block relative bg-gray-900 p-12">
                    <div className="absolute inset-0 opacity-40">
                        <img 
                            src="https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&q=80&w=1000" 
                            alt="Spiritual path" 
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent"></div>
                    </div>
                    <div className="relative h-full flex flex-col justify-between z-10">
                        <div className="flex items-center gap-3">
                            <BookOpen className="h-8 w-8 text-amber-500" />
                            <span className="text-white font-serif text-xl tracking-tight">The Bible Lover</span>
                        </div>
                        <div className="space-y-4">
                            <h2 className="text-3xl font-serif text-white leading-tight italic">"Come to me, all you who are weary and burdened, and I will give you rest."</h2>
                            <p className="text-gray-400 text-sm font-medium">— Matthew 11:28</p>
                        </div>
                    </div>
                </div>

                {/* Right Side: Form */}
                <div className="p-8 md:p-12">
                    <div className="mb-10 text-center lg:text-left">
                        <h1 className="text-3xl font-serif text-gray-900 mb-2">Join the Family</h1>
                        <p className="text-gray-500 text-sm">Create your disciple profile today.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-xs font-bold animate-shake">
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 transition-colors group-focus-within:text-amber-600" />
                                <input 
                                    type="text"
                                    placeholder="Full Name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-6 text-sm focus:bg-white focus:ring-4 focus:ring-amber-50 transition-all outline-none"
                                />
                            </div>

                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 transition-colors group-focus-within:text-amber-600" />
                                <input 
                                    type="email"
                                    placeholder="Email Address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-6 text-sm focus:bg-white focus:ring-4 focus:ring-amber-50 transition-all outline-none"
                                />
                            </div>

                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 transition-colors group-focus-within:text-amber-600" />
                                <input 
                                    type="password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-6 text-sm focus:bg-white focus:ring-4 focus:ring-amber-50 transition-all outline-none"
                                />
                            </div>

                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 transition-colors group-focus-within:text-amber-600" />
                                <input 
                                    type="password"
                                    placeholder="Confirm Password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-6 text-sm focus:bg-white focus:ring-4 focus:ring-amber-50 transition-all outline-none"
                                />
                            </div>
                        </div>

                        <button 
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-amber-600 hover:bg-amber-700 text-white rounded-2xl py-4 px-6 font-bold text-sm shadow-xl shadow-amber-900/10 transition-all group active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isLoading ? 'Creating Profile...' : (
                                <>
                                    Begin Journey <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center bg-gray-50 rounded-2xl p-4">
                        <p className="text-xs text-gray-500">
                            Already part of the family?{' '}
                            <Link to="/login" className="text-amber-600 font-bold hover:underline">Sign In</Link>
                        </p>
                    </div>

                    <div className="mt-6 flex justify-center items-center gap-4 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                        <Link to="/terms" className="hover:text-gray-600">Terms</Link>
                        <div className="w-1 h-1 bg-gray-200 rounded-full"></div>
                        <Link to="/privacy" className="hover:text-gray-600">Privacy</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
