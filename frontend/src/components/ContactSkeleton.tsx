import React from 'react';

// Mirrors Contact.tsx's real layout (header text, form card + two
// sidebar cards) so the route-level Suspense fallback doesn't just
// blank the screen while that page's lazy chunk loads. Kept in its own
// file (rather than inside Contact.tsx) so importing it here doesn't
// drag the whole lazy-loaded page into the main bundle.
const ContactSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-transparent">
    <section className="py-3 md:py-16 bg-white dark:bg-transparent animate-pulse">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-4 md:mb-10 space-y-2">
          <div className="h-3 w-24 bg-gray-200 dark:bg-white/10 rounded" />
          <div className="h-7 md:h-10 w-56 md:w-72 bg-gray-200 dark:bg-white/10 rounded" />
          <div className="h-4 w-full max-w-2xl bg-gray-200 dark:bg-white/10 rounded" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-10">
          <div className="lg:col-span-2 bg-white dark:bg-[#141417] border border-gray-300 dark:border-white/10 rounded-lg shadow-sm p-4 md:p-8 space-y-4">
            <div className="h-3 w-28 bg-gray-200 dark:bg-white/10 rounded" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 md:gap-4">
              <div className="h-10 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-md" />
              <div className="h-10 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-md" />
            </div>
            <div className="h-10 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-md" />
            <div className="h-28 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-md" />
            <div className="h-11 bg-gray-200 dark:bg-white/10 rounded-md" />
          </div>

          <div className="lg:col-span-1 space-y-4 md:space-y-6">
            <div className="bg-white dark:bg-[#141417] border border-gray-300 dark:border-white/10 rounded-lg shadow-sm p-4 md:p-6 space-y-4">
              <div className="h-3 w-32 bg-gray-200 dark:bg-white/10 rounded" />
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-8 h-8 md:w-9 md:h-9 bg-gray-100 dark:bg-white/10 rounded-lg shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-2.5 w-14 bg-gray-200 dark:bg-white/10 rounded" />
                    <div className="h-3.5 w-32 bg-gray-200 dark:bg-white/10 rounded" />
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-white dark:bg-[#141417] border border-gray-300 dark:border-white/10 rounded-lg shadow-sm p-4 md:p-6 space-y-3">
              <div className="h-3 w-28 bg-gray-200 dark:bg-white/10 rounded" />
              <div className="h-3 w-full bg-gray-200 dark:bg-white/10 rounded" />
              <div className="h-3 w-2/3 bg-gray-200 dark:bg-white/10 rounded" />
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
);

export default ContactSkeleton;
