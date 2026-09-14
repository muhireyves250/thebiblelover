import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send, CheckCircle2, BookOpen } from 'lucide-react';
import { authAPI } from '../services/api';
import AutoText from '../components/AutoText';

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
        <div className="min-h-[75vh] md:min-h-screen bg-white dark:bg-[#141417] flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <div className="bg-white dark:bg-[#141417] border border-gray-300 dark:border-white/10 rounded-lg shadow-sm dark:bg-[#141417] dark:border-white/10 p-6 md:p-10">
                    <div className="text-center">
                        <div className="mb-5 md:mb-8">
                            <div className="w-14 h-14 md:w-16 md:h-16 bg-amber-50 border border-amber-100 rounded-full flex items-center justify-center mx-auto text-amber-700 mb-4 md:mb-6">
                                <BookOpen className="w-6 h-6 md:w-8 md:h-8" />
                            </div>
                            <div className="flex items-center justify-center gap-2 mb-1.5">
                                <span className="w-1 h-3.5 bg-amber-700 rounded-sm" />
                                <AutoText as="span" className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-700">Restoration</AutoText>
                            </div>
                            <AutoText as="h1" className="text-xl md:text-2xl font-black uppercase tracking-tight text-gray-900 dark:text-white mb-1">Restoration</AutoText>
                            <AutoText as="p" className="text-gray-500 dark:text-gray-400 text-xs md:text-sm">Return to the Word</AutoText>
                        </div>

                        {isSuccess ? (
                            <div className="space-y-4 md:space-y-6 animate-in fade-in zoom-in duration-500">
                                <div className="w-14 h-14 md:w-16 md:h-16 bg-amber-50 border border-amber-100 rounded-full flex items-center justify-center mx-auto text-amber-700">
                                    <CheckCircle2 className="w-6 h-6 md:w-8 md:h-8" />
                                </div>
                                <div className="space-y-1.5 md:space-y-2">
                                    <AutoText as="h3" className="text-base md:text-xl font-bold text-gray-900 dark:text-white">Check Your Sanctuary</AutoText>
                                    <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm leading-relaxed">
                                        <AutoText as="span">If an account exists for</AutoText> <strong className="text-gray-900 dark:text-white">{email}</strong>, <AutoText as="span">we've sent instructions to restore your access.</AutoText>
                                    </p>
                                </div>
                                <Link
                                    to="/login"
                                    className="inline-flex items-center gap-2 text-amber-700 font-bold text-xs md:text-sm hover:text-amber-800 transition-colors"
                                >
                                    <ArrowLeft className="h-4 w-4" /> <AutoText as="span">Back to Login</AutoText>
                                </Link>
                            </div>
                        ) : (
                            <>
                                <form onSubmit={handleSubmit} className="space-y-3.5 md:space-y-5">
                                    {error && (
                                        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-xs md:text-sm animate-shake">
                                            {error}
                                        </div>
                                    )}

                                    <div className="text-left">
                                        <label className="block text-[9px] md:text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1 md:mb-1.5"><AutoText>Email Address</AutoText></label>
                                        <div className="relative group">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500 group-focus-within:text-amber-600 transition-colors" />
                                            <input
                                                type="email"
                                                placeholder="Enter your registered email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                                className="w-full bg-white dark:bg-[#141417] border border-gray-300 dark:border-white/10 rounded-md py-2.5 pl-9 pr-3 text-sm focus:border-amber-600 focus:outline-none transition-colors"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full bg-amber-700 hover:bg-amber-800 text-white rounded-md py-2.5 md:py-3 px-6 font-bold text-xs md:text-sm uppercase tracking-widest transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {isLoading ? <AutoText as="span">Searching...</AutoText> : (
                                            <>
                                                <AutoText as="span">Send Reset Link</AutoText> <Send className="h-4 w-4" />
                                            </>
                                        )}
                                    </button>
                                </form>

                                <div className="mt-5 md:mt-8">
                                    <Link
                                        to="/login"
                                        className="inline-flex items-center gap-2 text-gray-400 dark:text-gray-500 hover:text-amber-700 font-bold text-[10px] md:text-xs uppercase tracking-widest transition-colors"
                                    >
                                        <ArrowLeft className="h-4 w-4" /> <AutoText as="span">Go back to Login</AutoText>
                                    </Link>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <p className="mt-4 md:mt-6 text-center text-gray-400 dark:text-gray-500 text-[11px] md:text-xs">
                    <AutoText as="span">Trouble accessing?</AutoText> <Link to="/contact" className="text-amber-700 font-bold hover:text-amber-800 transition-colors"><AutoText>Support Help</AutoText></Link>
                </p>
            </div>
        </div>
    );
};

export default ForgotPassword;
