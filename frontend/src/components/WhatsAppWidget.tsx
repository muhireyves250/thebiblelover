import React from 'react';
import { useLocation } from 'react-router-dom';
import { useWhatsAppSettings } from '../hooks/useWhatsAppSettings';

const WhatsAppWidget: React.FC = () => {
    const { settings, loading } = useWhatsAppSettings();
    const location = useLocation();

    // Don't render if loading, not enabled, or on dashboard
    if (loading || !settings.enabled || !settings.phoneNumber || location.pathname.includes('/dashboard')) {
        return null;
    }

    const handleClick = () => {
        // Format phone number: remove non-numeric chars
        const phone = settings.phoneNumber.replace(/\D/g, '');
        const message = encodeURIComponent(settings.message || '');

        // Create WhatsApp URL
        const url = `https://wa.me/${phone}?text=${message}`;

        // Open in new tab
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    return (
        <button
            onClick={handleClick}
            className="fixed bottom-6 right-6 z-50 flex items-center justify-center transition-transform duration-300 hover:scale-110 group animate-in fade-in slide-in-from-bottom-4"
            aria-label="Chat on WhatsApp"
        >
            <div className="relative w-16 h-16 text-[#25D366] drop-shadow-lg">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fillRule="evenodd" clipRule="evenodd" className="fill-current w-full h-full animate-[bounce_3s_infinite]">
                    <path d="M18.403 5.633A8.919 8.919 0 0 0 12.053 3c-4.948 0-8.976 4.027-8.978 8.977 0 1.582.413 3.126 1.198 4.488L3 21.116l4.759-1.249a8.981 8.981 0 0 0 4.29 1.093h.004c4.947 0 8.975-4.027 8.977-8.977a8.926 8.926 0 0 0-2.627-6.35m-6.35 13.812h-.003a7.446 7.446 0 0 1-3.798-1.041l-.272-.162-2.824.741.753-2.753-.177-.282a7.448 7.448 0 0 1-1.141-3.971c.002-4.114 3.349-7.461 7.465-7.461a7.413 7.413 0 0 1 5.275 2.188 7.42 7.42 0 0 1 2.183 5.279c-.002 4.114-3.349 7.462-7.461 7.462m4.093-5.589c-.225-.113-1.327-.655-1.533-.73-.205-.075-.354-.112-.504.112-.149.224-.579.73-.709.88-.131.149-.261.169-.486.056-.224-.113-.953-.351-1.815-1.12-.673-.6-1.125-1.34-1.257-1.565-.131-.224-.014-.345.099-.458.101-.101.224-.262.336-.393.112-.131.149-.224.224-.374.075-.149.037-.28-.019-.393-.056-.113-.505-1.217-.692-1.666-.181-.435-.366-.377-.504-.383-.13-.006-.28-.006-.429-.006-.15 0-.393.056-.599.28-.206.225-.785.767-.785 1.871 0 1.104.804 2.17.916 2.32.112.15 1.582 2.415 3.832 3.387.536.231.954.369 1.279.473.537.171 1.026.146 1.413.089.431-.064 1.327-.542 1.514-1.066.187-.524.187-.973.131-1.066-.056-.094-.206-.15-.43-.262" />
                </svg>
                {/* Notification Badge */}
                <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                    1
                </div>
            </div>

            {/* Tooltip / Label */}
            <span className="absolute right-20 bg-white text-gray-800 px-3 py-1.5 rounded-lg text-sm font-medium shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-gray-100 dark:border-gray-800">
                Chat with us
                {/* Triangle arrow */}
                <span className="absolute top-1/2 -right-1.5 -translate-y-1/2 border-8 border-transparent border-l-white"></span>
            </span>
        </button>
    );
};

export default WhatsAppWidget;
