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
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-6 text-center">
        <p className="text-sm text-amber-700">
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
    .order('id', { ascending: true })

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

  const totalPlatos = grupos.reduce((acc, g) => acc + g.platos.length, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Mi carta</h1>
          <p className="text-sm text-slate-500">
            {totalPlatos} {totalPlatos === 1 ? 'plato' : 'platos'} en {grupos.length}{' '}
            {grupos.length === 1 ? 'categoría' : 'categorías'}
          </p>
        </div>
        <Link
          href="/dashboard/platos/nuevo"
          className="rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2.5 shadow-sm transition-colors shrink-0"
        >
          + Añadir plato
        </Link>
      </div>

      {grupos.length === 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-10 text-center">
          <p className="text-sm text-slate-500 mb-4">No tienes platos todavía.</p>
          <Link
            href="/dashboard/platos/nuevo"
            className="inline-block rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2.5 shadow-sm transition-colors"
          >
            + Añadir primer plato
          </Link>
        </div>
      )}

      {grupos.map((grupo) => (
        <div key={grupo.nombre} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-xs font-bold uppercase tracking-wide text-indigo-700">
              {grupo.nombre}
            </h2>
            <span className="text-xs text-slate-400">
              {grupo.platos.length} {grupo.platos.length === 1 ? 'plato' : 'platos'}
            </span>
          </div>
          <ul className="divide-y divide-slate-100">
            {grupo.platos.map((plato, i) => (
              <PlatoRow
                key={plato.id}
                plato={plato}
                esPrimera={i === 0}
                esUltima={i === grupo.platos.length - 1}
              />
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
