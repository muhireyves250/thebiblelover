// Simple API endpoint for Vercel
export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Handle different API routes
  const { pathname } = new URL(req.url, `http://${req.headers.host}`);
  
  if (pathname === '/api/health') {
    res.status(200).json({
      status: 'OK',
      message: 'Bible Project API is running',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV
    });
    return;
  }

  if (pathname === '/api/blog') {
    // Mock blog data for now
    res.status(200).json({
      success: true,
      data: {
        posts: [
          {
            id: '1',
            title: 'Welcome to The Bible Lover',
            slug: 'welcome-to-the-bible-lover',
            excerpt: 'A beautiful journey of faith and discovery.',
            content: 'This is a sample blog post content.',
            featuredImage: 'https://images.pexels.com/photos/1370295/pexels-photo-1370295.jpeg?w=800',
            author: { name: 'Admin', email: 'admin@biblelover.com' },
            category: 'FAITH',
            tags: ['faith', 'bible', 'christianity'],
            status: 'PUBLISHED',
            publishedAt: new Date().toISOString(),
            readTime: 5,
            views: 0,
            likes: 0,
            isFeatured: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1
        }
      }
    });
    return;
  }

  if (pathname === '/api/bible-verses/featured') {
    // Mock Bible verse data
    res.status(200).json({
      success: true,
      data: {
        id: '1',
        title: 'Faith and Hope',
        book: 'Hebrews',
        chapter: 11,
        verse: 1,
        text: 'Now faith is confidence in what we hope for and assurance about what we do not see.',
        translation: 'NIV',
        image: 'https://images.pexels.com/photos/1370295/pexels-photo-1370295.jpeg?w=800',
        isActive: true,
        isFeatured: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    });
    return;
  }

  // Default response
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
}
