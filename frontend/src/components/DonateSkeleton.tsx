import React from 'react';

// Mirrors Donate.tsx's real layout (header, amount-selector form card,
// "Impact" and "Wall of Support" sidebar cards) so the route-level
// Suspense fallback doesn't just blank the screen while that page's
// lazy chunk loads. Kept in its own file so importing it here doesn't
// drag the whole lazy page into the main bundle.
const DonateSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-transparent min-h-screen animate-pulse">
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 md:py-16">
      <div className="md:hidden mb-4 space-y-2">
        <div className="h-3 w-20 bg-gray-200 dark:bg-white/10 rounded" />
        <div className="h-7 w-48 bg-gray-200 dark:bg-white/10 rounded" />
        <div className="h-4 w-56 bg-gray-200 dark:bg-white/10 rounded" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-10 items-start">
        {/* Left: donation form */}
        <div className="lg:col-span-7">
          <div className="bg-white dark:bg-[#141417] border border-gray-300 dark:border-white/10 rounded-lg shadow-sm p-4 md:p-8 space-y-5 md:space-y-8">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 md:w-11 md:h-11 bg-gray-200 dark:bg-white/10 rounded-lg shrink-0" />
              <div className="space-y-1.5">
                <div className="h-4 w-32 bg-gray-200 dark:bg-white/10 rounded" />
                <div className="h-2.5 w-40 bg-gray-200 dark:bg-white/10 rounded" />
              </div>
            </div>

            <div>
              <div className="h-3 w-28 bg-gray-200 dark:bg-white/10 rounded mb-3" />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 md:gap-3 mb-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-11 md:h-14 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-md" />
                ))}
              </div>
              <div className="h-10 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-md" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 md:gap-4">
              <div className="h-10 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-md" />
              <div className="h-10 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-md" />
            </div>
            <div className="h-16 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-md" />
            <div className="h-12 bg-gray-200 dark:bg-white/10 rounded-md" />
          </div>
        </div>

        {/* Right: impact + wall of support */}
        <div className="lg:col-span-5 space-y-4 md:space-y-6">
          <section className="bg-white dark:bg-[#141417] border border-gray-300 dark:border-white/10 rounded-lg shadow-sm p-4 md:p-6 space-y-4">
            <div className="h-3 w-32 bg-gray-200 dark:bg-white/10 rounded" />
            {[1, 2, 3].map(i => (
              <div key={i} className="flex gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-100 dark:bg-white/10 rounded-lg shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-28 bg-gray-200 dark:bg-white/10 rounded" />
                  <div className="h-3 w-full bg-gray-200 dark:bg-white/10 rounded" />
                </div>
              </div>
            ))}
          </section>

          <section className="bg-white dark:bg-[#141417] border border-gray-300 dark:border-white/10 rounded-lg shadow-sm p-4 md:p-6">
            <div className="h-3 w-28 bg-gray-200 dark:bg-white/10 rounded mb-4" />
            <div className="space-y-2.5 md:space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 md:h-20 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-lg" />
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  </div>
);

export default DonateSkeleton;
