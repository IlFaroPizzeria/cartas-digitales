import type { MetadataRoute } from 'next'

const BASE_URL = 'https://cartoca.es'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Zonas privadas de la plataforma: sin valor SEO y no deben indexarse.
      disallow: ['/dashboard', '/admin', '/login', '/registro', '/auth'],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
