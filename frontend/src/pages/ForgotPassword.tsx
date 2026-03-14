import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send, CheckCircle2, BookOpen } from 'lucide-react';
import { authAPI } from '../services/api';

const ForgotPassword: React.FC = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await authAPI.forgotPassword(email);
            if (response.success) {
                setIsSuccess(true);
            } else {
                setError(response.message || 'Failed to send reset link');
            }
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 md:p-12 border border-solid border-gray-100 relative overflow-hidden">
                    {/* Decorative Background */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-bl-[5rem] -mr-8 -mt-8 opacity-50 z-0"></div>
                    
                    <div className="relative z-10 text-center">
                        <div className="mb-8">
                            <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto text-amber-600 mb-6 shadow-lg shadow-amber-900/10">
                                <BookOpen className="w-8 h-8 rotate-3" />
                            </div>
                            <h1 className="text-3xl font-serif text-gray-900 mb-2">Restoration</h1>
                            <p className="text-gray-500 text-sm">Return to the Word</p>
                        </div>

                        {isSuccess ? (
                            <div className="space-y-6 animate-in fade-in zoom-in duration-500">
                                <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto text-emerald-600">
                                    <CheckCircle2 className="w-8 h-8" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-bold text-gray-900">Check Your Sanctuary</h3>
                                    <p className="text-gray-500 text-sm leading-relaxed">
                                        If an account exists for <strong>{email}</strong>, we've sent instructions to restore your access.
                                    </p>
                                </div>
                                <Link 
                                    to="/login"
                                    className="inline-flex items-center gap-2 text-amber-600 font-bold text-sm hover:underline"
                                >
                                    <ArrowLeft className="h-4 w-4" /> Back to Login
                                </Link>
                            </div>
                        ) : (
                            <>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {error && (
                                        <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-xs font-bold animate-shake">
                                            {error}
                                        </div>
                                    )}

                                    <div className="text-left">
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
                                        <div className="relative group">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-amber-600 transition-colors" />
                                            <input 
                                                type="email"
                                                placeholder="Enter your registered email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-6 text-sm focus:bg-white focus:ring-4 focus:ring-amber-50 transition-all outline-none"
                                            />
                                        </div>
                                    </div>

                                    <button 
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full bg-amber-600 hover:bg-amber-700 text-white rounded-2xl py-4 px-6 font-bold text-sm shadow-xl shadow-amber-900/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 group"
                                    >
                                        {isLoading ? 'Searching...' : (
                                            <>
                                                Send Reset Link <Send className="h-4 w-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                            </>
                                        )}
                                    </button>
                                </form>

                                <div className="mt-10">
                                    <Link 
                                        to="/login"
                                        className="inline-flex items-center gap-2 text-gray-400 hover:text-amber-600 font-bold text-xs uppercase tracking-widest transition-colors"
                                    >
                                        <ArrowLeft className="h-4 w-4" /> Go back to Login
                                    </Link>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <p className="mt-8 text-center text-gray-400 text-xs">
                    Trouble accessing? <Link to="/contact" className="text-amber-600 font-bold hover:underline">Support Help</Link>
                </p>
            </div>
        </div>
    );
};

export default ForgotPassword;
