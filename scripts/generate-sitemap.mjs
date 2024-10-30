// scripts/generate-sitemap.mjs
import { writeFileSync } from 'fs';
import { globby } from 'globby';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// ES Module equivalent of __dirname
const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function generateSitemap() {
  try {
    // Get all .tsx files in the app directory
    const pages = await globby([
      'app/**/*.tsx',
      '!app/**/_*.tsx',
      '!app/**/layout.tsx',
      '!app/**/error.tsx',
      '!app/**/loading.tsx',
      '!app/api/**',
    ]);

    const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://theokapistore.com';

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
              xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
        ${pages
          .map((page) => {
            const path = page
              .replace('app/', '')
              .replace('/page.tsx', '')
              .replace('index', '');
            
            const route = path === '' ? '' : `/${path}`;
            const url = `${siteUrl}${route}`;

            const priority = 1 - (route.split('/').length - 1) * 0.2;
            const changefreq = route === '' ? 'daily' 
              : route.startsWith('/products') ? 'weekly'
              : 'monthly';

            return `
              <url>
                <loc>${url}</loc>
                <lastmod>${new Date().toISOString()}</lastmod>
                <changefreq>${changefreq}</changefreq>
                <priority>${Math.max(0.1, priority).toFixed(1)}</priority>
                ${route.startsWith('/products') ? `
                <image:image>
                  <image:loc>${siteUrl}/images/products${route}.jpg</image:loc>
                  <image:title>Product Image</image:title>
                </image:image>` : ''}
              </url>
            `;
          })
          .join('')}
      </urlset>`;

    // Write the sitemap to the public directory
    const publicPath = path.join(process.cwd(), 'public');
    writeFileSync(path.join(publicPath, 'sitemap.xml'), sitemap);
    console.log('✅ Sitemap generated successfully');
  } catch (error) {
    console.error('Error generating sitemap:', error);
    process.exit(1);
  }
}

// Execute the function
generateSitemap().catch(console.error);