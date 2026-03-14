import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Lock, ArrowRight, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';
import { authAPI } from '../services/api';

const ResetPassword: React.FC = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        if (!token) {
            setError('Missing or invalid reset token. Please request a new one.');
        }
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (!token) {
            setError('Invalid reset token');
            return;
        }

        setIsLoading(true);
        try {
            const response = await authAPI.resetPassword(token, password);
            if (response.success) {
                setIsSuccess(true);
                setTimeout(() => navigate('/login'), 3000);
            } else {
                setError(response.message || 'Reset failed');
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 md:p-12 border border-gray-100 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-32 h-32 bg-amber-50 rounded-br-[5rem] -ml-8 -mt-8 opacity-50 z-0"></div>

                    <div className="relative z-10">
                        <div className="text-center mb-10">
                            <div className="w-16 h-16 bg-amber-600 rounded-2xl flex items-center justify-center mx-auto text-white mb-6 shadow-xl shadow-amber-900/20">
                                <ShieldCheck className="w-8 h-8" />
                            </div>
                            <h1 className="text-3xl font-serif text-gray-900 mb-2">New Strength</h1>
                            <p className="text-gray-500 text-sm">Secure your account's return</p>
                        </div>

                        {isSuccess ? (
                            <div className="text-center space-y-6 animate-in fade-in zoom-in duration-500">
                                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                                    <CheckCircle2 className="w-8 h-8" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-bold text-gray-900">Renewal Complete</h3>
                                    <p className="text-gray-500 text-sm">Your password has been successfully restored.</p>
                                </div>
                                <div className="pt-4 flex items-center justify-center gap-3">
                                    <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">Redirecting to login</span>
                                    <div className="w-4 h-4 border-2 border-amber-600 border-t-transparent animate-spin rounded-full"></div>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {error && (
                                    <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-3 animate-shake">
                                        <AlertCircle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                                        <p className="text-rose-600 text-xs font-bold leading-relaxed">{error}</p>
                                    </div>
                                )}

                                {!token ? (
                                    <Link 
                                        to="/forgot-password"
                                        className="w-full inline-flex items-center justify-center py-4 px-6 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all"
                                    >
                                        Request New Token
                                    </Link>
                                ) : (
                                    <>
                                        <div className="space-y-4">
                                            <div className="relative group">
                                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-amber-600" />
                                                <input 
                                                    type="password"
                                                    placeholder="New Password"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    required
                                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-6 text-sm focus:bg-white focus:ring-4 focus:ring-amber-50 transition-all outline-none"
                                                />
                                            </div>

                                            <div className="relative group">
                                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-amber-600" />
                                                <input 
                                                    type="password"
                                                    placeholder="Confirm New Password"
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
                                            className="w-full bg-gray-900 hover:bg-black text-white rounded-2xl py-4 px-6 font-bold text-sm shadow-xl transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 group"
                                        >
                                            {isLoading ? 'Processing...' : (
                                                <>
                                                    Update Password <ArrowRight className="h-4 w-4 group-hover:translate-x-1" />
                                                </>
                                            )}
                                        </button>
                                    </>
                                )}
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
