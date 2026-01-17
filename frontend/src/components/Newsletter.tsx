import React, { useState } from 'react';

const Newsletter = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Newsletter subscription:', email);
    setEmail('');
  };

  return (
    <section className="bg-black py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-serif text-white mb-12">
          Subscribe here to get my latest posts
        </h2>
        
        <form onSubmit={handleSubmit} className="max-w-lg mx-auto">
          <div className="mb-6">
            <label htmlFor="email" className="block text-left text-white text-sm mb-3">
              Enter Your Email Here *
            </label>
            <div className="flex">
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                className="flex-1 px-4 py-3 bg-transparent border border-white text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-white focus:border-white"
                placeholder=""
              />
              <button
                type="submit"
                className="px-8 py-3 bg-white text-black font-medium hover:bg-gray-100 transition-colors"
              >
                Join
              </button>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
};

export default Newsletter;