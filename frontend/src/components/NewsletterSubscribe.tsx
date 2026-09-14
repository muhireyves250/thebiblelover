import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, CheckCircle2 } from 'lucide-react';
import { newsletterAPI } from '../services/api';

const NewsletterSubscribe = () => {
    const { t } = useTranslation();
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
        <div className="px-4 md:px-0">
            <div className="bg-white dark:bg-[#141417] border border-gray-300 dark:border-white/10 rounded-lg shadow-sm dark:bg-[#141417] dark:border-white/10 p-4 md:p-6">
                <div className="flex items-center gap-2 mb-1.5">
                    <span className="w-1 h-3.5 md:h-4 bg-amber-700 rounded-sm" />
                    <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-amber-700">{t('footer.stayInspired')}</span>
                </div>
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300 mb-3 md:mb-4">
                    {t('footer.newsletterBlurb')}
                </p>

                {status === 'success' ? (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-md p-3 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                        <p className="text-emerald-700 text-xs font-medium">{message}</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2.5">
                        <div className="relative flex-1 group">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500 transition-colors group-focus-within:text-amber-600" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder={t('footer.emailPlaceholder')}
                                className="w-full bg-white dark:bg-[#141417] border border-gray-300 dark:border-white/10 rounded-md py-2.5 pl-9 pr-3 text-sm placeholder-gray-400 focus:border-amber-600 focus:outline-none transition-colors"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={status === 'loading'}
                            className="shrink-0 px-6 py-2.5 bg-amber-700 text-white text-xs font-bold uppercase tracking-widest rounded-md hover:bg-amber-800 transition-colors disabled:opacity-50"
                        >
                            {status === 'loading' ? t('footer.subscribing') : t('footer.subscribe')}
                        </button>
                    </form>
                )}
                {status === 'error' && (
                    <p className="text-red-600 text-xs mt-2">{message}</p>
                )}
            </div>
        </div>
    );
};

export default NewsletterSubscribe;
