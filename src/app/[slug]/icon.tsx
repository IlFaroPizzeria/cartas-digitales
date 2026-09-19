import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { getNegocioCarta } from '@/lib/negocio-carta'

// Icono por ruta (recomendado por Next.js para esto, ver
// src/app/[slug]/page.tsx): cada carta pública muestra en la pestaña
// del navegador el logo propio del restaurante en vez del icono
// genérico de Cartoca -- y ese, a su vez, en vez de heredar cualquier
// icono por defecto de la plataforma de hosting.
export const size = { width: 32, height: 32 }

// Icono de Cartoca por defecto: el mismo que ya vive en
// src/app/icon.svg, servido tal cual para los restaurantes que
// todavía no han subido su logo.
async function iconoPorDefecto() {
  const buffer = await readFile(path.join(process.cwd(), 'src/app/icon.svg'))
  return new Response(new Uint8Array(buffer), {
    headers: { 'Content-Type': 'image/svg+xml' },
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
        const buffer = await res.arrayBuffer()
        return new Response(buffer, {
          headers: { 'Content-Type': res.headers.get('content-type') || 'image/png' },
        })
      }
    } catch {
      // Si falla la descarga del logo (URL caída, etc.), seguimos al
      // icono por defecto en vez de romper la pestaña del navegador.
    }
  }

  return iconoPorDefecto()
}
