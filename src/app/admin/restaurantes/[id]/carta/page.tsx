import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import CategoriaRow from '@/app/dashboard/categorias/CategoriaRow'
import NuevaCategoriaForm from '@/app/dashboard/categorias/NuevaCategoriaForm'
import PlatoRow from '@/app/dashboard/PlatoRow'
import {
  adminCreateCategoria,
  adminDeleteCategoria,
  adminMoveCategoria,
  adminToggleDisponible,
  adminDeletePlato,
  adminMovePlato,
} from '@/app/admin/carta-actions'

type PlatoConCategoria = {
  id: number
  nombre: string
  precio: number
  disponible: boolean
  orden: number
  categoria_id: number | null
  etiquetas: string[] | null
  categorias: { nombre: string; orden: number } | null
}

export default async function AdminCartaPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const negocioId = Number(id)
  if (!Number.isFinite(negocioId)) notFound()

  const supabase = await createClient()

  const { data: negocio } = await supabase
    .from('negocios')
    .select('id, nombre, slug')
    .eq('id', negocioId)
    .single()

  if (!negocio) notFound()

  const { data: categorias } = await supabase
    .from('categorias')
    .select('id, nombre, orden')
    .eq('negocio_id', negocioId)
    .order('orden', { ascending: true })

  const { data: platos } = await supabase
    .from('platos')
    .select('id, nombre, precio, disponible, orden, categoria_id, etiquetas, categorias ( nombre, orden )')
    .eq('negocio_id', negocioId)
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

  const adminCreateCategoriaBound = adminCreateCategoria.bind(null, negocioId)

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/admin/restaurantes/${negocioId}/editar`}
          className="text-xs font-medium text-slate-500 hover:text-slate-900"
        >
          ← {negocio.nombre}
        </Link>
        <div className="flex items-center justify-between mt-1">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Carta de {negocio.nombre}</h1>
            <p className="text-sm text-slate-500">
              Edición de admin — úsala solo en casos puntuales, lo normal es que lo gestione el
              propio restaurante desde su panel.
            </p>
          </div>
          <Link
            href={`/admin/restaurantes/${negocioId}/carta/platos/nuevo`}
            className="rounded-lg bg-brand hover:bg-brand-dark text-white text-sm font-medium px-4 py-2.5 shadow-sm transition-colors shrink-0"
          >
            + Añadir plato
          </Link>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-slate-900 mb-3">Categorías</h2>
        {(!categorias || categorias.length === 0) && (
          <p className="text-sm text-slate-500 mb-2">Todavía no tiene categorías.</p>
        )}
        <ul className="divide-y divide-black/[0.06]">
          {(categorias ?? []).map((categoria, i) => (
            <CategoriaRow
              key={categoria.id}
              categoria={categoria}
              esPrimera={i === 0}
              esUltima={i === (categorias?.length ?? 1) - 1}
              deleteAction={adminDeleteCategoria}
              moveAction={adminMoveCategoria}
            />
          ))}
        </ul>
        <div className="mt-4 pt-4 border-t border-black/[0.06]">
          <NuevaCategoriaForm
            categoriasExistentes={(categorias ?? []).map((c) => c.nombre)}
            createAction={adminCreateCategoriaBound}
          />
        </div>
      </div>

      {grupos.length === 0 && (
        <div className="glass-card rounded-2xl p-10 text-center">
          <p className="text-sm text-slate-500">Todavía no tiene platos.</p>
        </div>
      )}

      {grupos.map((grupo) => (
        <div key={grupo.nombre} className="glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-xs font-bold uppercase tracking-wide text-brand-dark">
              {grupo.nombre}
            </h2>
            <span className="text-xs text-slate-400">
              {grupo.platos.length} {grupo.platos.length === 1 ? 'plato' : 'platos'}
            </span>
          </div>
          <ul className="divide-y divide-black/[0.06]">
            {grupo.platos.map((plato, i) => (
              <PlatoRow
                key={plato.id}
                plato={plato}
                esPrimera={i === 0}
                esUltima={i === grupo.platos.length - 1}
                toggleAction={adminToggleDisponible}
                deleteAction={adminDeletePlato}
                moveAction={adminMovePlato}
                editHref={`/admin/restaurantes/${negocioId}/carta/platos/${plato.id}/editar`}
              />
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
