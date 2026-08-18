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
    .select('*')
    .eq('negocio_id', negocio.id)
    .eq('disponible', true)
    .order('orden', { ascending: true })

  // Agrupar platos por categoría, preservando el orden de aparición
  const categorias: { nombre: string; platos: Plato[] }[] = []
  ;(platos ?? []).forEach((plato: Plato) => {
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
      <header className="relative overflow-hidden bg-[#101B2D] px-6 pt-16 pb-14 text-center">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(60% 50% at 50% 0%, rgba(184,134,59,0.35), transparent 70%)',
          }}
        />
        <p className="relative text-[11px] tracking-[0.3em] text-[#B8863B] uppercase mb-3">
          Carta
        </p>
        <h1
          className="relative text-4xl text-[#FAF5EC] leading-tight"
          style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
        >
          {negocio.nombre}
        </h1>
      </header>

      {/* Menú */}
      <main className="mx-auto max-w-md px-6 py-10">
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

      <footer className="pb-10 pt-4 text-center">
        <p className="text-[11px] tracking-widest uppercase text-[#22303F]/30">
          Carta digital
        </p>
      </footer>
    </div>
  )
}
