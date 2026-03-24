import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard/', '/admin/', '/api/', '/embed/'],
      },
    ],
    sitemap: 'https://betterroofing.co/sitemap.xml',
  }
}
