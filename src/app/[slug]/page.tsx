import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import { Fraunces, Public_Sans } from 'next/font/google'
import CartaClient from '@/components/CartaClient'

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-display',
})

const publicSans = Public_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-body',
})

export default async function CartaDigital({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const { data: negocio } = await supabase
    .from('negocios')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!negocio) {
    notFound()
  }

  if (!negocio.activo) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-6 text-center"
        style={{ backgroundColor: negocio.color_fondo || '#faf5ec' }}
      >
        <div>
          <p
            className="text-2xl mb-2"
            style={{ fontFamily: 'Georgia, serif', color: negocio.color_header || '#101b2d' }}
          >
            Carta no disponible
          </p>
          <p className="text-[#6B7280] text-sm">Este menú está temporalmente desactivado.</p>
        </div>
      </div>
    )
  }

  const { data: platos } = await supabase
    .from('platos')
    .select(
      'id, nombre, precio, orden, disponible, ' +
      'categoria:categoría, categoria_en, categoria_de, ' +
      'descripcion:descripción, descripcion_en, descripcion_de'
    )
    .eq('negocio_id', negocio.id)
    .eq('disponible', true)
    .order('orden', { ascending: true })

  return (
    <div className={`${fraunces.variable} ${publicSans.variable}`} style={{ fontFamily: 'var(--font-body)' }}>
      <CartaClient
        negocio={{
          nombre: negocio.nombre,
          tagline: negocio.tagline,
          telefono: negocio.telefono,
          email: negocio.email,
          direccion: negocio.direccion,
          color_fondo: negocio.color_fondo || '#faf5ec',
          color_header: negocio.color_header || '#101b2d',
          color_acento: negocio.color_acento || '#b8863b',
          logo_url: negocio.logo_url,
        }}
        platos={(platos ?? []) as never}
      />
    </div>
  )
}