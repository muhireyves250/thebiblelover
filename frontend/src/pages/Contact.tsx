import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import SEO from '../components/SEO';
import { contactAPI } from '../services/api';
import { useAPI } from '../hooks/useAPI';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { loading, error, execute } = useAPI();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Ensure subject has a default value if empty
      const submitData = {
        ...formData,
        subject: formData.subject.trim() || 'General Inquiry'
      };

      await execute(() => contactAPI.submitContact(submitData));
      setIsSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      console.error('Contact form error:', err);
    }
  };

  return (
    <div className="bg-white">
      <SEO 
        title="Contact Us" 
        description="Have a question or want to share your thoughts? Get in touch with The Bible Lover. We'd love to hear from you."
      />
      <PageHeader title="CONTACT" subtitle="GET IN TOUCH" />

      {/* Contact Content */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1 h-4 bg-amber-700 rounded-sm" />
              <span className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">Get In Touch</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-gray-900 mb-3">
              Let's Connect
            </h2>
            <p className="text-gray-600 leading-relaxed max-w-2xl">
              Have a question about a book, want to collaborate, or just want to share your thoughts? I'd love to hear from you.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Contact Form */}
            <div className="lg:col-span-2 bg-white border border-gray-300 rounded-lg shadow-sm p-6 md:p-8">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-amber-700 mb-6">Send a Message</h3>

              {isSubmitted && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 text-sm rounded-md">
                  Thank you for your message! I'll get back to you soon.
                </div>
              )}

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5">
                      Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:border-amber-600 focus:outline-none transition-colors"
                      placeholder="Your name"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:border-amber-600 focus:outline-none transition-colors"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5">
                    Subject (Optional)
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:border-amber-600 focus:outline-none transition-colors"
                    placeholder="What's this about?"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:border-amber-600 focus:outline-none transition-colors resize-none"
                    placeholder="Tell me what's on your mind..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-amber-700 text-white py-3 px-6 rounded-md text-sm font-bold uppercase tracking-widest hover:bg-amber-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Contact Information */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-6">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-amber-700 mb-5">Contact Information</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 pb-4 border-b border-gray-100">
                    <div className="w-9 h-9 bg-amber-50 border border-amber-100 rounded-lg flex items-center justify-center shrink-0">
                      <Mail className="h-4 w-4 text-amber-700" />
                    </div>
                    <div>
                      <h4 className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Email</h4>
                      <p className="text-gray-900 text-sm font-bold">hello@thebiblelover.com</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 pb-4 border-b border-gray-100">
                    <div className="w-9 h-9 bg-amber-50 border border-amber-100 rounded-lg flex items-center justify-center shrink-0">
                      <Phone className="h-4 w-4 text-amber-700" />
                    </div>
                    <div>
                      <h4 className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Phone</h4>
                      <p className="text-gray-900 text-sm font-bold">+1 (555) 123-4567</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-amber-50 border border-amber-100 rounded-lg flex items-center justify-center shrink-0">
                      <MapPin className="h-4 w-4 text-amber-700" />
                    </div>
                    <div>
                      <h4 className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Location</h4>
                      <p className="text-gray-900 text-sm font-bold">New York, NY</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-6">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-amber-700 mb-3">Response Time</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  I typically respond to messages within 24-48 hours. For urgent inquiries,
                  please mention it in your message subject line.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
