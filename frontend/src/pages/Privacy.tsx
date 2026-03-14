import React from 'react';
import PageHeader from '../components/PageHeader';
import SEO from '../components/SEO';
import { Shield, Lock, Eye, Globe, Mail } from 'lucide-react';

const Privacy: React.FC = () => {
    return (
        <div className="bg-white min-h-screen">
            <SEO title="Privacy Policy" description="How we protect your data at The Bible Lover." />
            <PageHeader title="Privacy Policy" subtitle="PROTECTING YOUR SPIRITUAL DATA" />

            <main className="max-w-4xl mx-auto px-4 py-24">
                <div className="prose prose-lg prose-stone max-w-none font-serif">
                    <p className="text-gray-500 italic mb-12">Last Updated: March 12, 2026</p>

                    <section className="mb-16">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
                                <Shield className="w-6 h-6" />
                            </div>
                            <h2 className="text-3xl font-serif text-gray-900 m-0">Our Pillar of Trust</h2>
                        </div>
                        <p className="text-gray-700 leading-relaxed">
                            At **The Bible Lover**, we understand that your spiritual journey is deeply personal. We are committed to maintaining the trust and confidence of our visitors to our web site. In this Privacy Policy, we’ve provided detailed information on when and why we collect your personal information, how we use it, and how we keep it secure.
                        </p>
                    </section>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                        <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-amber-600 shadow-sm mb-6">
                                <Mail className="w-5 h-5" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Data Collection</h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                We only collect information you provide directly to us: your name, email, and preferences when you register or subscribe to our newsletter.
                            </p>
                        </div>
                        <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-amber-600 shadow-sm mb-6">
                                <Lock className="w-5 h-5" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Security First</h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                Your data is encrypted and stored in secure environments. Access is strictly limited to essential services only.
                            </p>
                        </div>
                    </div>

                    <section className="mb-16">
                        <h3 className="text-2xl font-serif text-gray-900 mb-6 flex items-center gap-3">
                            <Eye className="w-5 h-5 text-amber-600" /> Transparency in Use
                        </h3>
                        <p className="text-gray-700 leading-relaxed mb-6">
                            We use your data primarily to:
                        </p>
                        <ul className="space-y-4 text-gray-700">
                            <li className="flex gap-4">
                                <div className="mt-2 h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0"></div>
                                <span>Personalize your experience on the platform.</span>
                            </li>
                            <li className="flex gap-4">
                                <div className="mt-2 h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0"></div>
                                <span>Send community updates and "Grains of Wisdom" via our newsletter.</span>
                            </li>
                            <li className="flex gap-4">
                                <div className="mt-2 h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0"></div>
                                <span>Notify you of upcoming Gatherings (Events) and new Manna (Devotionals).</span>
                            </li>
                        </ul>
                    </section>

                    <div className="p-8 bg-amber-900 rounded-[2.5rem] text-white">
                        <div className="flex items-center gap-4 mb-6">
                            <Globe className="w-8 h-8 text-amber-400" />
                            <h3 className="text-2xl font-serif m-0">No Third-Party Sharing</h3>
                        </div>
                        <p className="text-amber-100/80 leading-relaxed m-0 italic">
                            We do not sell, rent or trade your personal information with any third party. Your trust is our greatest asset, and we guard it with technical and spiritual integrity.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Privacy;
