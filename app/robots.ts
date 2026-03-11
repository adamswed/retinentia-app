import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: [
        '/',
        '/privacy-policy',
        '/terms-and-conditions',
        '/_next/static/',
      ],
      disallow: [
        '/main',
        '/account/',
        '/api/',
        '/_next/',
      ],
    },
    sitemap: 'https://retinentia.com/sitemap.xml',
  };
}
