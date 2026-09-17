import type { MetadataRoute } from 'next'

const BASE_URL = 'https://cartoca.es'

// Solo las páginas de marketing, pensadas para que las indexe Google.
// Las cartas públicas de cada restaurante (/[slug]) se quedan fuera por
// ahora -- son muchas, cambian constantemente y no está claro que cada
// restaurante quiera que Google la indexe por defecto; se puede añadir
// más adelante si hace falta.
const RUTAS: { path: string; prioridad: number }[] = [
  { path: '', prioridad: 1 },
  { path: '/producto', prioridad: 0.8 },
  { path: '/precios', prioridad: 0.8 },
  { path: '/quienes-somos', prioridad: 0.6 },
  { path: '/preguntas', prioridad: 0.6 },
  { path: '/contacto', prioridad: 0.6 },
  { path: '/privacidad', prioridad: 0.3 },
]

export default function sitemap(): MetadataRoute.Sitemap {
  return RUTAS.map(({ path, prioridad }) => ({
    url: `${BASE_URL}${path}`,
    changeFrequency: 'monthly',
    priority: prioridad,
  }))
}
