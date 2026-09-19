import { ImageResponse } from 'next/og'
import { getNegocioCarta } from '@/lib/negocio-carta'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

// Imagen de preview (Open Graph / Twitter Card) por restaurante: la que
// se ve al compartir el enlace de una carta en WhatsApp, iMessage,
// redes sociales, etc. Sin esto, al no haber ninguna imagen propia
// definida para esta ruta, se heredaba la meta genérica del sitio (o
// nada), por lo que algunas apps mostraban el icono/marca de Cartoca
// en vez de la del restaurante -- igual que pasaba con el favicon
// antes de src/app/[slug]/icon.tsx, y se resuelve del mismo modo:
// componiendo la imagen con los datos propios del negocio.
export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const negocio = await getNegocioCarta(slug)

  const colorFondo = negocio?.color_fondo || '#faf5ec'
  const colorHeader = negocio?.color_header || '#101b2d'
  const colorAcento = negocio?.color_acento || '#b8863b'
  const nombre = negocio?.nombre || 'Cartoca'
  const tagline = negocio?.tagline || 'Carta digital'
  const inicial = (nombre.trim().charAt(0) || 'C').toUpperCase()

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colorFondo,
          fontFamily: 'sans-serif',
        }}
      >
        {negocio?.logo_url ? (
          <img
            src={negocio.logo_url}
            width={200}
            height={200}
            alt=""
            style={{ borderRadius: '9999px', objectFit: 'cover' }}
          />
        ) : (
          <div
            style={{
              width: 200,
              height: 200,
              borderRadius: '9999px',
              backgroundColor: colorAcento,
              color: colorHeader,
              fontSize: 96,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {inicial}
          </div>
        )}
        <div
          style={{
            marginTop: 40,
            fontSize: 64,
            fontWeight: 700,
            color: colorHeader,
            textAlign: 'center',
          }}
        >
          {nombre}
        </div>
        <div
          style={{
            marginTop: 16,
            fontSize: 28,
            letterSpacing: 4,
            textTransform: 'uppercase',
            color: colorAcento,
          }}
        >
          {tagline}
        </div>
      </div>
    ),
    { ...size }
  )
}
