import sharp from 'sharp'
import { getNegocioCarta } from '@/lib/negocio-carta'

// Icono por ruta (recomendado por Next.js para esto, ver
// src/app/[slug]/page.tsx): cada carta pública muestra en la pestaña
// del navegador el logo propio del restaurante en vez del icono
// genérico de Cartoca -- y ese, a su vez, en vez de heredar cualquier
// icono por defecto de la plataforma de hosting.
export const size = { width: 32, height: 32 }

// Sin esto, el navegador (y cualquier CDN por delante) puede quedarse
// con una respuesta vieja de esta ruta durante mucho tiempo -- a
// diferencia de src/app/icon.png (un archivo estático, con su propio
// hash de contenido en la URL), esta es una función que se ejecuta en
// cada petición, así que forzamos la misma política de "revalida
// siempre".
const CACHE_HEADERS = { 'Cache-Control': 'public, max-age=0, must-revalidate' }

// Icono de Cartoca por defecto, para los restaurantes que todavía no
// han subido su logo. Va escrito aquí en vez de leerse del disco: en
// Vercel cada ruta se empaqueta solo con los archivos que Next.js
// detecta que usa, y un readFile() con una ruta montada a mano no
// entra siempre en ese paquete -- justo el tipo de cosa que funciona
// en local y se cae en producción.
const ICONO_CARTOCA = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="8" fill="#0a84ff"/>
  <g fill="none" stroke="#FFFFFF" stroke-width="2.4" stroke-linecap="round">
    <path d="M8 16.8a8 8 0 0 1 16 0"/>
    <path d="M11.2 16.8a4.8 4.8 0 0 1 9.6 0"/>
    <circle cx="16" cy="16.8" r="1.1" fill="#FFFFFF" stroke="none"/>
    <path d="M16 20.4v4.4"/>
  </g>
</svg>`

function iconoPorDefecto() {
  return new Response(ICONO_CARTOCA, {
    headers: { 'Content-Type': 'image/svg+xml', ...CACHE_HEADERS },
  })
}

export default async function Icon({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const negocio = await getNegocioCarta(slug)

  if (negocio?.logo_url) {
    try {
      const res = await fetch(negocio.logo_url)
      if (res.ok) {
        const buffer = Buffer.from(await res.arrayBuffer())
        // El logo que sube cada restaurante puede ser una foto de varios
        // MB a cualquier proporción -- lo reducimos al tamaño real de un
        // favicon en vez de mandar el archivo tal cual (antes se servían
        // fotos de 32x32 declarados pero ~500KB reales de peso).
        const icono = await sharp(buffer)
          .resize(64, 64, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
          .png()
          .toBuffer()
        return new Response(new Uint8Array(icono), {
          headers: { 'Content-Type': 'image/png', ...CACHE_HEADERS },
        })
      }
    } catch {
      // Si falla la descarga o el redimensionado del logo (URL caída,
      // formato raro, etc.), seguimos al icono por defecto en vez de
      // romper la pestaña del navegador.
    }
  }

  return iconoPorDefecto()
}
