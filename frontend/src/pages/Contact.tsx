import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import PageHeader from '../components/PageHeader';
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
      <PageHeader title="CONTACT" subtitle="GET IN TOUCH" />

      {/* Contact Content */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-3xl font-serif text-gray-900 mb-6">
              Let's Connect
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed max-w-2xl mx-auto">
              Have a question about a book, want to collaborate, or just want to share your thoughts? I'd love to hear from you.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <h3 className="text-xl font-serif text-gray-900 mb-6">Send a Message</h3>

              {isSubmitted && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-md">
                  Thank you for your message! I'll get back to you soon.
                </div>
              )}

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-1 focus:ring-amber-500 focus:border-transparent"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-1 focus:ring-amber-500 focus:border-transparent"
                    placeholder="your.email@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Subject (Optional)
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-1 focus:ring-amber-500 focus:border-transparent"
                    placeholder="What's this about?"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-1 focus:ring-amber-500 focus:border-transparent resize-none"
                    placeholder="Tell me what's on your mind..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-amber-700 text-white py-3 px-6 rounded-md hover:bg-amber-800 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
            <div>
              <h3 className="text-xl font-serif text-gray-900 mb-6">Contact Information</h3>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <Mail className="h-6 w-6 text-amber-700" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Email</h4>
                    <p className="text-gray-600">hello@thebiblelover.com</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <Phone className="h-6 w-6 text-amber-700" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Phone</h4>
                    <p className="text-gray-600">+1 (555) 123-4567</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <MapPin className="h-6 w-6 text-amber-700" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Location</h4>
                    <p className="text-gray-600">New York, NY</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-6 bg-gray-50 rounded-md">
                <h4 className="font-medium text-gray-900 mb-3">Response Time</h4>
                <p className="text-gray-600 text-sm">
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
