import React from 'react';
import PageHeader from '../components/PageHeader';
import SEO from '../components/SEO';
import { Heart, ShieldCheck, Users, Handshake, Info } from 'lucide-react';

const SectionEyebrow = ({ label }: { label: string }) => (
    <div className="flex items-center gap-2 mb-4">
        <span className="w-1 h-4 bg-amber-700 rounded-sm" />
        <span className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">{label}</span>
    </div>
);

const Terms: React.FC = () => {
    return (
        <div className="bg-white min-h-screen">
            <SEO title="Terms of Service" description="Guidelines for the Bible Lover community." />
            <PageHeader title="Terms of Service" subtitle="WALKING TOGETHER IN UNITY" />

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <p className="text-sm text-gray-400 mb-8">Last Updated: March 12, 2026</p>

                <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-6 md:p-8 mb-8">
                    <SectionEyebrow label="Fellowship Guidelines" />
                    <p className="text-gray-700 leading-relaxed italic">
                        "Let all that you do be done in love." — 1 Corinthians 16:14. By using this platform, you agree to walk with us in this spirit of mutual respect and spiritual growth.
                    </p>
                </div>

                <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-6 md:p-8 mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2.5">
                        <Users className="w-5 h-5 text-amber-700" /> Community Conduct
                    </h2>
                    <p className="text-gray-700 leading-relaxed">
                        The Bible Lover is a sanctuary for believers to gather, learn, and grow. We welcome diverse perspectives shared with kindness. Harassment, hate speech, or intentionally disruptive behavior will result in immediate removal from the fellowship.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-6">
                        <Heart className="w-6 h-6 text-amber-700 mb-3" />
                        <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 mb-2">Respectful Dialogue</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">All comments should be constructive and uplifting to the body of Christ.</p>
                    </div>
                    <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-6">
                        <ShieldCheck className="w-6 h-6 text-amber-700 mb-3" />
                        <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 mb-2">Content Ownership</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">You retain ownership of your testimonies, but grant us license to display them within our community.</p>
                    </div>
                </div>

                <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-6 md:p-8 mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2.5">
                        <Handshake className="w-5 h-5 text-amber-700" /> Usage Agreement
                    </h2>
                    <div className="space-y-5">
                        <div className="flex gap-3 pb-5 border-b border-gray-100">
                            <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                            <div>
                                <h3 className="font-bold text-gray-900 text-sm mb-1">Account Responsibility</h3>
                                <p className="text-sm text-gray-600">You are responsible for the security of your account credentials and any activity under your name.</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                            <div>
                                <h3 className="font-bold text-gray-900 text-sm mb-1">Spiritual Integrity</h3>
                                <p className="text-sm text-gray-600">Content must align with our core mission of promoting biblical wisdom and community support.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <p className="text-sm text-gray-400 text-center">
                    Questions regarding these terms? <a href="/contact" className="text-amber-700 font-bold hover:text-amber-800 hover:underline">Reach out to us</a>.
                </p>
            </main>
        </div>
    );
};

export default Terms;
