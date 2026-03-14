import React from 'react';
import PageHeader from '../components/PageHeader';
import SEO from '../components/SEO';
import { Scale, Heart, ShieldCheck, Users, Handshake, Info } from 'lucide-react';

const Terms: React.FC = () => {
    return (
        <div className="bg-white min-h-screen">
            <SEO title="Terms of Service" description="Guidelines for the Bible Lover community." />
            <PageHeader title="Terms of Service" subtitle="WALKING TOGETHER IN UNITY" />

            <main className="max-w-4xl mx-auto px-4 py-24">
                <div className="prose prose-lg prose-stone max-w-none font-serif">
                    <p className="text-gray-500 italic mb-12">Last Updated: March 12, 2026</p>

                    <div className="bg-amber-50 rounded-3xl p-10 border border-amber-100 mb-16 relative overflow-hidden group">
                        <Scale className="absolute top-8 right-8 h-24 w-24 text-amber-200/50 -rotate-12 transition-transform group-hover:rotate-0 duration-700" />
                        <div className="relative z-10">
                            <h2 className="text-3xl font-serif text-amber-900 m-0 mb-6">Fellowship Guidelines</h2>
                            <p className="text-amber-900/80 leading-relaxed italic m-0">
                                "Let all that you do be done in love." — 1 Corinthians 16:14. By using this platform, you agree to walk with us in this spirit of mutual respect and spiritual growth.
                            </p>
                        </div>
                    </div>

                    <section className="mb-16">
                        <h3 className="text-2xl font-serif text-gray-900 mb-6 flex items-center gap-3">
                            <Users className="w-6 h-6 text-amber-600" /> Community Conduct
                        </h3>
                        <p className="text-gray-700 leading-relaxed">
                            The Bible Lover is a sanctuary for believers to gather, learn, and grow. We welcome diverse perspectives shared with kindness. Harassment, hate speech, or intentionally disruptive behavior will result in immediate removal from the fellowship.
                        </p>
                    </section>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                        <div className="p-8 border border-gray-100 rounded-3xl hover:bg-gray-50 transition-colors">
                            <Heart className="w-8 h-8 text-amber-600 mb-4" />
                            <h4 className="text-lg font-bold text-gray-900 mb-2">Respectful Dialogue</h4>
                            <p className="text-sm text-gray-500 leading-relaxed">All forum posts and comments should be constructive and uplifting to the body of Christ.</p>
                        </div>
                        <div className="p-8 border border-gray-100 rounded-3xl hover:bg-gray-50 transition-colors">
                            <ShieldCheck className="w-8 h-8 text-amber-600 mb-4" />
                            <h4 className="text-lg font-bold text-gray-900 mb-2">Content Ownership</h4>
                            <p className="text-sm text-gray-500 leading-relaxed">You retain ownership of your testimonies, but grant us license to display them within our community.</p>
                        </div>
                    </div>

                    <section className="mb-16">
                        <h3 className="text-2xl font-serif text-gray-900 mb-6 flex items-center gap-3">
                            <Handshake className="w-6 h-6 text-amber-600" /> Usage Agreement
                        </h3>
                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <Info className="w-5 h-5 text-amber-500 shrink-0 mt-1" />
                                <div>
                                    <h5 className="font-bold text-gray-900 mb-1">Account Responsibility</h5>
                                    <p className="text-sm text-gray-600 m-0">You are responsible for the security of your account credentials and any activity under your name.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <Info className="w-5 h-5 text-amber-500 shrink-0 mt-1" />
                                <div>
                                    <h5 className="font-bold text-gray-900 mb-1">Spiritual Integrity</h5>
                                    <p className="text-sm text-gray-600 m-0">Content must align with our core mission of promoting biblical wisdom and community support.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <div className="mt-20 pt-10 border-t border-gray-100 text-center">
                        <p className="text-sm text-gray-400">
                            Questions regarding these terms? <a href="/contact" className="text-amber-600 font-bold hover:underline">Reach out to us</a>.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Terms;
