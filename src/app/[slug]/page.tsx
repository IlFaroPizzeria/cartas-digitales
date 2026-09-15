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

// Forma "cruda" que devuelve Supabase: el plato con su categoría
// embebida (vía categoria_id -> categorias). El tipado de PostgREST no
// soporta bien los alias con tilde ("descripción"), igual que ya pasaba
// antes con las columnas de texto: se castea explícitamente.
type PlatoConCategoriaRaw = {
  id: number
  nombre: string
  precio: number
  orden: number
  disponible: boolean
  descripcion: string | null
  descripcion_en: string | null
  descripcion_de: string | null
  descripcion_it: string | null
  descripcion_sv: string | null
  descripcion_fr: string | null
  etiquetas: string[] | null
  categorias: {
    nombre: string
    nombre_en: string | null
    nombre_de: string | null
    nombre_it: string | null
    nombre_sv: string | null
    nombre_fr: string | null
    orden: number
  } | null
}

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

  // Los platos ahora se agrupan/ordenan a través de la tabla categorias
  // (orden de categoría primero, orden de plato después), en vez de las
  // columnas de texto antiguas. CartaClient no cambia: seguimos
  // entregándole exactamente la misma forma de datos que antes
  // (categoria, categoria_en, ..., descripcion, descripcion_en, ...).
  const { data: platosRaw } = await supabase
    .from('platos')
    .select(
      'id, nombre, precio, orden, disponible, ' +
      'descripcion:descripción, descripcion_en, descripcion_de, descripcion_it, descripcion_sv, descripcion_fr, etiquetas, ' +
      'categorias ( nombre, nombre_en, nombre_de, nombre_it, nombre_sv, nombre_fr, orden )'
    )
    .eq('negocio_id', negocio.id)
    .eq('disponible', true)
    .order('orden', { ascending: true, foreignTable: 'categorias' })
    .order('orden', { ascending: true })

  const platos = ((platosRaw ?? []) as unknown as PlatoConCategoriaRaw[]).map((p) => ({
    id: p.id,
    nombre: p.nombre,
    precio: p.precio,
    categoria: p.categorias?.nombre ?? 'Otros',
    categoria_en: p.categorias?.nombre_en ?? null,
    categoria_de: p.categorias?.nombre_de ?? null,
    categoria_it: p.categorias?.nombre_it ?? null,
    categoria_sv: p.categorias?.nombre_sv ?? null,
    categoria_fr: p.categorias?.nombre_fr ?? null,
    descripcion: p.descripcion,
    descripcion_en: p.descripcion_en,
    descripcion_de: p.descripcion_de,
    descripcion_it: p.descripcion_it,
    descripcion_sv: p.descripcion_sv,
    descripcion_fr: p.descripcion_fr,
    etiquetas: p.etiquetas ?? [],
  }))

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
          idiomas_activos: negocio.idiomas_activos,
        }}
        platos={platos as never}
      />
    </div>
  )
}
