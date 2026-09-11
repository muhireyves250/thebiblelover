import React from 'react';
import PageHeader from '../components/PageHeader';
import SEO from '../components/SEO';
import { Heart, ShieldCheck, Users, Handshake, Info, UserCheck, Ban, Copyright, XCircle, Scale, RefreshCw } from 'lucide-react';

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

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
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

                <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-6 md:p-8 mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2.5">
                        <UserCheck className="w-5 h-5 text-amber-700" /> Eligibility &amp; Registration
                    </h2>
                    <p className="text-gray-700 leading-relaxed">
                        You must be at least 13 years old to create an account. When you register, you agree to provide accurate information and to keep it up to date. We may suspend or terminate accounts that are found to be fraudulent, impersonating another person, or created in violation of these terms.
                    </p>
                </div>

                <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-6 md:p-8 mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2.5">
                        <Ban className="w-5 h-5 text-amber-700" /> Prohibited Conduct
                    </h2>
                    <p className="text-gray-700 leading-relaxed mb-5">
                        To keep this a safe and edifying space, you agree not to:
                    </p>
                    <ul className="space-y-3 text-gray-700">
                        <li className="flex gap-3">
                            <div className="mt-2 h-1.5 w-1.5 rounded-full bg-amber-700 shrink-0" />
                            <span>Post content that is defamatory, obscene, hateful, or discriminatory toward any person or group.</span>
                        </li>
                        <li className="flex gap-3">
                            <div className="mt-2 h-1.5 w-1.5 rounded-full bg-amber-700 shrink-0" />
                            <span>Impersonate another individual or misrepresent your affiliation with any person or organization.</span>
                        </li>
                        <li className="flex gap-3">
                            <div className="mt-2 h-1.5 w-1.5 rounded-full bg-amber-700 shrink-0" />
                            <span>Use the platform to distribute spam, malware, or unauthorized advertising.</span>
                        </li>
                        <li className="flex gap-3">
                            <div className="mt-2 h-1.5 w-1.5 rounded-full bg-amber-700 shrink-0" />
                            <span>Attempt to gain unauthorized access to other accounts, our systems, or any related network.</span>
                        </li>
                        <li className="flex gap-3">
                            <div className="mt-2 h-1.5 w-1.5 rounded-full bg-amber-700 shrink-0" />
                            <span>Scrape, copy, or redistribute our content for commercial purposes without written permission.</span>
                        </li>
                    </ul>
                </div>

                <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-6 md:p-8 mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2.5">
                        <Copyright className="w-5 h-5 text-amber-700" /> Intellectual Property
                    </h2>
                    <p className="text-gray-700 leading-relaxed">
                        Devotionals, articles, audio episodes, graphics, and the overall design of The Bible Lover are the property of The Bible Lover or its licensors, and are protected by copyright and other intellectual property laws. You may share our content for personal, non-commercial, and devotional use with appropriate attribution, but you may not republish, sell, or otherwise commercially exploit it without our prior written consent.
                    </p>
                </div>

                <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-6 md:p-8 mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2.5">
                        <XCircle className="w-5 h-5 text-amber-700" /> Suspension &amp; Termination
                    </h2>
                    <p className="text-gray-700 leading-relaxed">
                        We reserve the right to suspend or terminate your access to the platform, without prior notice, if we believe in good faith that you have violated these terms or that your conduct poses a risk to the community. You may also close your account at any time by contacting us.
                    </p>
                </div>

                <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-6 md:p-8 mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2.5">
                        <Scale className="w-5 h-5 text-amber-700" /> Disclaimer &amp; Limitation of Liability
                    </h2>
                    <p className="text-gray-700 leading-relaxed">
                        The Bible Lover is provided "as is" for devotional and informational purposes. While we strive for accuracy in every reflection and reference, we make no warranties regarding the completeness or reliability of the content. To the fullest extent permitted by law, The Bible Lover is not liable for any indirect, incidental, or consequential damages arising from your use of the platform.
                    </p>
                </div>

                <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-6 md:p-8 mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2.5">
                        <RefreshCw className="w-5 h-5 text-amber-700" /> Changes to These Terms
                    </h2>
                    <p className="text-gray-700 leading-relaxed">
                        We may update these terms from time to time to reflect changes to our community, features, or applicable law. When we do, we'll revise the "Last Updated" date above. Continued use of the platform after changes take effect constitutes your acceptance of the revised terms.
                    </p>
                </div>

                <p className="text-sm text-gray-400 text-center">
                    Questions regarding these terms? <a href="/contact" className="text-amber-700 font-bold hover:text-amber-800 hover:underline">Reach out to us</a>.
                </p>
            </main>
        </div>
    );
};

export default Terms;
