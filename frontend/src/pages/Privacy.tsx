import React from 'react';
import SEO from '../components/SEO';
import AutoText from '../components/AutoText';
import { Shield, Lock, Eye, Globe, Mail } from 'lucide-react';

const SectionEyebrow = ({ label }: { label: string }) => (
    <div className="flex items-center gap-2 mb-4">
        <span className="w-1 h-4 bg-amber-700 rounded-sm" />
        <AutoText as="span" className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{label}</AutoText>
    </div>
);

const Privacy: React.FC = () => {
    return (
        <div className="bg-white dark:bg-transparent min-h-screen">
            <SEO title="Privacy Policy" description="How we protect your data at The Bible Lover." />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 md:py-16">
                <div className="md:hidden mb-3">
                    <div className="flex items-center gap-2 mb-1.5">
                        <span className="w-1 h-4 bg-amber-700 rounded-sm" />
                        <AutoText as="span" className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-700">Protecting Your Spiritual Data</AutoText>
                    </div>
                    <AutoText as="h1" className="text-2xl font-black uppercase tracking-tight text-gray-900 dark:text-white">Privacy Policy</AutoText>
                </div>

                <p className="text-xs md:text-sm text-gray-400 dark:text-gray-500 mb-4 md:mb-8">Last Updated: March 12, 2026</p>

                <div className="bg-white dark:bg-[#141417] border border-gray-300 dark:border-white/10 rounded-lg shadow-sm dark:bg-[#141417] dark:border-white/10 p-4 md:p-8 mb-4 md:mb-8">
                    <h2 className="text-base md:text-xl font-bold text-gray-900 dark:text-white mb-3 md:mb-4 flex items-center gap-2.5">
                        <Shield className="w-5 h-5 text-amber-700" /> <AutoText as="span">Our Pillar of Trust</AutoText>
                    </h2>
                    <AutoText as="p" className="text-sm md:text-base text-gray-700 dark:text-gray-200 leading-relaxed">
                        At The Bible Lover, we understand that your spiritual journey is deeply personal. We are committed to maintaining the trust and confidence of our visitors to our web site. In this Privacy Policy, we've provided detailed information on when and why we collect your personal information, how we use it, and how we keep it secure.
                    </AutoText>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6 mb-4 md:mb-8">
                    <div className="bg-white dark:bg-[#141417] border border-gray-300 dark:border-white/10 rounded-lg shadow-sm dark:bg-[#141417] dark:border-white/10 p-4 md:p-6">
                        <Mail className="w-6 h-6 text-amber-700 mb-3" />
                        <AutoText as="h3" className="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white mb-2">Data Collection</AutoText>
                        <AutoText as="p" className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                            We only collect information you provide directly to us: your name, email, and preferences when you register or subscribe to our newsletter.
                        </AutoText>
                    </div>
                    <div className="bg-white dark:bg-[#141417] border border-gray-300 dark:border-white/10 rounded-lg shadow-sm dark:bg-[#141417] dark:border-white/10 p-4 md:p-6">
                        <Lock className="w-6 h-6 text-amber-700 mb-3" />
                        <AutoText as="h3" className="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white mb-2">Security First</AutoText>
                        <AutoText as="p" className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                            Your data is encrypted and stored in secure environments. Access is strictly limited to essential services only.
                        </AutoText>
                    </div>
                </div>

                <div className="bg-white dark:bg-[#141417] border border-gray-300 dark:border-white/10 rounded-lg shadow-sm dark:bg-[#141417] dark:border-white/10 p-4 md:p-8 mb-4 md:mb-8">
                    <h2 className="text-base md:text-xl font-bold text-gray-900 dark:text-white mb-3 md:mb-4 flex items-center gap-2.5">
                        <Eye className="w-5 h-5 text-amber-700" /> <AutoText as="span">Transparency in Use</AutoText>
                    </h2>
                    <AutoText as="p" className="text-sm md:text-base text-gray-700 dark:text-gray-200 leading-relaxed mb-3 md:mb-5">
                        We use your data primarily to:
                    </AutoText>
                    <ul className="space-y-2 md:space-y-3 text-gray-700 dark:text-gray-200 text-sm md:text-base">
                        <li className="flex gap-3">
                            <div className="mt-2 h-1.5 w-1.5 rounded-full bg-amber-700 shrink-0"></div>
                            <AutoText as="span">Personalize your experience on the platform.</AutoText>
                        </li>
                        <li className="flex gap-3">
                            <div className="mt-2 h-1.5 w-1.5 rounded-full bg-amber-700 shrink-0"></div>
                            <AutoText as="span">Send community updates and "Grains of Wisdom" via our newsletter.</AutoText>
                        </li>
                        <li className="flex gap-3">
                            <div className="mt-2 h-1.5 w-1.5 rounded-full bg-amber-700 shrink-0"></div>
                            <AutoText as="span">Notify you of upcoming Gatherings (Events).</AutoText>
                        </li>
                    </ul>
                </div>

                <div className="bg-white dark:bg-[#141417] border border-gray-300 dark:border-white/10 rounded-lg shadow-sm dark:bg-[#141417] dark:border-white/10 p-4 md:p-8">
                    <SectionEyebrow label="No Third-Party Sharing" />
                    <div className="flex items-start gap-3">
                        <Globe className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                        <AutoText as="p" className="text-sm md:text-base text-gray-700 dark:text-gray-200 leading-relaxed">
                            We do not sell, rent or trade your personal information with any third party. Your trust is our greatest asset, and we guard it with technical and spiritual integrity.
                        </AutoText>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Privacy;
