import React from 'react';
import SEO from '../components/SEO';
import { Shield, Lock, Eye, Globe, Mail } from 'lucide-react';

const SectionEyebrow = ({ label }: { label: string }) => (
    <div className="flex items-center gap-2 mb-4">
        <span className="w-1 h-4 bg-amber-700 rounded-sm" />
        <span className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{label}</span>
    </div>
);

const Privacy: React.FC = () => {
    return (
        <div className="bg-white min-h-screen">
            <SEO title="Privacy Policy" description="How we protect your data at The Bible Lover." />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <p className="text-sm text-gray-400 mb-8">Last Updated: March 12, 2026</p>

                <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-6 md:p-8 mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2.5">
                        <Shield className="w-5 h-5 text-amber-700" /> Our Pillar of Trust
                    </h2>
                    <p className="text-gray-700 leading-relaxed">
                        At The Bible Lover, we understand that your spiritual journey is deeply personal. We are committed to maintaining the trust and confidence of our visitors to our web site. In this Privacy Policy, we've provided detailed information on when and why we collect your personal information, how we use it, and how we keep it secure.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-6">
                        <Mail className="w-6 h-6 text-amber-700 mb-3" />
                        <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 mb-2">Data Collection</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            We only collect information you provide directly to us: your name, email, and preferences when you register or subscribe to our newsletter.
                        </p>
                    </div>
                    <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-6">
                        <Lock className="w-6 h-6 text-amber-700 mb-3" />
                        <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 mb-2">Security First</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            Your data is encrypted and stored in secure environments. Access is strictly limited to essential services only.
                        </p>
                    </div>
                </div>

                <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-6 md:p-8 mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2.5">
                        <Eye className="w-5 h-5 text-amber-700" /> Transparency in Use
                    </h2>
                    <p className="text-gray-700 leading-relaxed mb-5">
                        We use your data primarily to:
                    </p>
                    <ul className="space-y-3 text-gray-700">
                        <li className="flex gap-3">
                            <div className="mt-2 h-1.5 w-1.5 rounded-full bg-amber-700 shrink-0"></div>
                            <span>Personalize your experience on the platform.</span>
                        </li>
                        <li className="flex gap-3">
                            <div className="mt-2 h-1.5 w-1.5 rounded-full bg-amber-700 shrink-0"></div>
                            <span>Send community updates and "Grains of Wisdom" via our newsletter.</span>
                        </li>
                        <li className="flex gap-3">
                            <div className="mt-2 h-1.5 w-1.5 rounded-full bg-amber-700 shrink-0"></div>
                            <span>Notify you of upcoming Gatherings (Events).</span>
                        </li>
                    </ul>
                </div>

                <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-6 md:p-8">
                    <SectionEyebrow label="No Third-Party Sharing" />
                    <div className="flex items-start gap-3">
                        <Globe className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                        <p className="text-gray-700 leading-relaxed">
                            We do not sell, rent or trade your personal information with any third party. Your trust is our greatest asset, and we guard it with technical and spiritual integrity.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Privacy;
