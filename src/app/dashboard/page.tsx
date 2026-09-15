import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import PlatoRow from './PlatoRow'

type PlatoConCategoria = {
  id: number
  nombre: string
  precio: number
  disponible: boolean
  orden: number
  categoria_id: number | null
  categorias: { nombre: string; orden: number } | null
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null // el layout ya redirige si no hay sesión

  const { data: negocio } = await supabase
    .from('negocios')
    .select('id, nombre, slug')
    .eq('owner_id', user.id)
    .single()

  if (!negocio) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-sm border border-zinc-200 p-6 text-center">
        <p className="text-sm text-amber-600">
          Tu usuario todavía no está enlazado a ningún restaurante. Contacta con el administrador.
        </p>
      </div>
    )
  }

  const { data: platos } = await supabase
    .from('platos')
    .select('id, nombre, precio, disponible, orden, categoria_id, categorias ( nombre, orden )')
    .eq('negocio_id', negocio.id)
    .order('orden', { ascending: true })

  const grupos: { nombre: string; orden: number; platos: PlatoConCategoria[] }[] = []
  for (const p of (platos ?? []) as unknown as PlatoConCategoria[]) {
    const nombre = p.categorias?.nombre ?? 'Sin categoría'
    const orden = p.categorias?.orden ?? 999999
    let grupo = grupos.find((g) => g.nombre === nombre)
    if (!grupo) {
      grupo = { nombre, orden, platos: [] }
      grupos.push(grupo)
    }
    grupo.platos.push(p)
  }
  grupos.sort((a, b) => a.orden - b.orden)

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-zinc-900">{negocio.nombre}</h1>
        <Link
          href="/dashboard/platos/nuevo"
          className="rounded-full bg-zinc-900 text-white text-sm font-medium px-4 py-2"
        >
          + Añadir plato
        </Link>
      </div>

      {grupos.length === 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-8 text-center">
          <p className="text-sm text-zinc-500 mb-4">No tienes platos todavía.</p>
          <Link
            href="/dashboard/platos/nuevo"
            className="inline-block rounded-full bg-zinc-900 text-white text-sm font-medium px-4 py-2"
          >
            + Añadir primer plato
          </Link>
        </div>
      )}

      {grupos.map((grupo) => (
        <div key={grupo.nombre} className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-4">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-2">
            {grupo.nombre}
          </h2>
          <ul className="divide-y divide-zinc-100">
            {grupo.platos.map((plato) => (
              <PlatoRow key={plato.id} plato={plato} />
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
