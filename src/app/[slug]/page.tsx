import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import { Fraunces, Public_Sans } from 'next/font/google'

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

type Plato = {
  id: number
  categoria: string | null
  nombre: string
  descripcion: string | null
  precio: number
}

// Marca del faro: icono vectorial propio, no una foto de stock
function LogoFaro() {
  return (
    <svg width="46" height="46" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M27 6 H37 L40 16 H24 L27 6 Z"
        stroke="#B8863B"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M24 16 L21 52 H43 L40 16 Z"
        stroke="#B8863B"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <line x1="22.4" y1="27" x2="41.6" y2="27" stroke="#B8863B" strokeWidth="1.4" />
      <line x1="21.7" y1="38" x2="42.3" y2="38" stroke="#B8863B" strokeWidth="1.4" />
      <rect x="18" y="52" width="28" height="5" stroke="#B8863B" strokeWidth="1.6" />
      <path
        d="M9 22 C13 20 13 24 9 22"
        stroke="#B8863B"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path d="M6 18 L14 12" stroke="#B8863B" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M6 26 L14 32" stroke="#B8863B" strokeWidth="1.4" strokeLinecap="round" />
      <path
        d="M8 60 C 16 55, 24 65, 32 60 C 40 55, 48 65, 56 60"
        stroke="#B8863B"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  )
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
      <div className="min-h-screen flex items-center justify-center bg-[#FAF5EC] px-6 text-center">
        <div>
          <p className="text-2xl text-[#22303F] mb-2" style={{ fontFamily: 'Georgia, serif' }}>
            Carta no disponible
          </p>
          <p className="text-[#6B7280] text-sm">Este menú está temporalmente desactivado.</p>
        </div>
      </div>
    )
  }

  const { data: platos } = await supabase
    .from('platos')
    .select('id, nombre, precio, orden, disponible, categoria:categoría, descripcion:descripción')
    .eq('negocio_id', negocio.id)
    .eq('disponible', true)
    .order('orden', { ascending: true })

  // Agrupar platos por categoría, preservando el orden de aparición
  const categorias: { nombre: string; platos: Plato[] }[] = []
  ;((platos ?? []) as unknown as Plato[]).forEach((plato) => {
    const cat = plato.categoria || 'Otros'
    let grupo = categorias.find((c) => c.nombre === cat)
    if (!grupo) {
      grupo = { nombre: cat, platos: [] }
      categorias.push(grupo)
    }
    grupo.platos.push(plato)
  })

  return (
    <div
      className={`${fraunces.variable} ${publicSans.variable} min-h-screen bg-[#FAF5EC]`}
      style={{ fontFamily: 'var(--font-body)' }}
    >
      {/* Cabecera */}
      <header className="relative overflow-hidden bg-[#101B2D] px-6 pt-14 pb-16">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(60% 55% at 50% 0%, rgba(184,134,59,0.35), transparent 70%)',
          }}
        />
        <div className="relative flex flex-col items-center text-center">
          <LogoFaro />
          <p className="mt-4 text-[11px] tracking-[0.35em] text-[#B8863B] uppercase">
            Cocina de costa
          </p>
          <h1
            className="mt-2 text-4xl text-[#FAF5EC] leading-tight"
            style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
          >
            {negocio.nombre}
          </h1>
          <div className="mt-4 h-px w-10 bg-[#B8863B]/50" />
        </div>

        {/* Ola decorativa de transición */}
        <svg
          className="absolute bottom-[-1px] left-0 w-full"
          height="28"
          viewBox="0 0 1440 60"
          preserveAspectRatio="none"
        >
          <path
            d="M0,30 C240,60 480,0 720,22 C960,44 1200,8 1440,28 L1440,60 L0,60 Z"
            fill="#FAF5EC"
          />
        </svg>
      </header>

      {/* Menú */}
      <main className="mx-auto max-w-md px-6 pt-6 pb-10">
        {categorias.length === 0 && (
          <p className="text-center text-sm text-[#6B7280]">
            Todavía no hay platos disponibles.
          </p>
        )}

        {categorias.map((cat, i) => (
          <section key={cat.nombre} className={i > 0 ? 'mt-10' : ''}>
            <h2
              className="text-xs tracking-[0.25em] uppercase text-[#4A6B65] mb-5 pb-2 border-b border-[#4A6B65]/20"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {cat.nombre}
            </h2>
            <ul className="space-y-6">
              {cat.platos.map((plato) => (
                <li key={plato.id}>
                  <div className="flex items-baseline gap-2">
                    <span
                      className="text-[17px] text-[#22303F]"
                      style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
                    >
                      {plato.nombre}
                    </span>
                    <span className="flex-1 border-b border-dotted border-[#22303F]/25 translate-y-[-3px]" />
                    <span className="text-[15px] text-[#B8863B] font-semibold tabular-nums">
                      {Number(plato.precio).toFixed(2)}€
                    </span>
                  </div>
                  {plato.descripcion && (
                    <p className="mt-1 text-[13px] leading-relaxed text-[#6B7280]">
                      {plato.descripcion}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </main>

      <footer className="relative overflow-hidden bg-[#101B2D] px-6 pt-8 pb-8 text-center">
        <svg
          className="absolute top-[-1px] left-0 w-full rotate-180"
          height="20"
          viewBox="0 0 1440 60"
          preserveAspectRatio="none"
        >
          <path
            d="M0,30 C240,60 480,0 720,22 C960,44 1200,8 1440,28 L1440,60 L0,60 Z"
            fill="#FAF5EC"
          />
        </svg>
        <p className="relative text-[11px] tracking-[0.3em] uppercase text-[#B8863B]/70">
          Carta digital
        </p>
      </footer>
    </div>
  )
}
