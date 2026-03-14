import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Base URL of your site
const BASE_URL = 'https://thebiblelover.com';

// Static routes
const staticRoutes = [
  '',
  '/about',
  '/donate',
  '/contact',
  '/events',
  '/forum',
  '/posts',
  '/login',
  '/signup',
];

// In a real scenario, you would fetch dynamic IDs (blog posts, forum topics) from your API
// For this generation script, we'll placeholder them or rely on the user to run it with data
const dynamicRoutes = [
  // Example: '/posts/1', '/forum/topic/abc'
];

const allRoutes = [...staticRoutes, ...dynamicRoutes];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${allRoutes
    .map((route) => {
      return `
  <url>
    <loc>${BASE_URL}${route}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${route === '' ? '1.0' : '0.8'}</priority>
  </url>`;
    })
    .join('')}
</urlset>`;

const outputPath = path.resolve(__dirname, '../public/sitemap.xml');

try {
  fs.writeFileSync(outputPath, sitemap);
  console.log(`✅ Sitemap successfully generated at: ${outputPath}`);
} catch (error) {
  console.error('❌ Error generating sitemap:', error);
}
