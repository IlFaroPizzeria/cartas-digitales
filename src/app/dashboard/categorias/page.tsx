import { createClient } from '@/lib/supabase/server'
import CategoriaRow from './CategoriaRow'
import NuevaCategoriaForm from './NuevaCategoriaForm'

export default async function CategoriasPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: negocio } = await supabase
    .from('negocios')
    .select('id')
    .eq('owner_id', user.id)
    .single()

  if (!negocio) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-6 text-center">
        <p className="text-sm text-amber-700">
          Tu usuario todavía no está enlazado a ningún restaurante.
        </p>
      </div>
    )
  }

  const { data: categorias } = await supabase
    .from('categorias')
    .select('id, nombre, orden')
    .eq('negocio_id', negocio.id)
    .order('orden', { ascending: true })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Categorías</h1>
        <p className="text-sm text-slate-500">Organiza y ordena las secciones de tu carta</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
        {(!categorias || categorias.length === 0) && (
          <p className="text-sm text-slate-500 mb-2">Todavía no tienes categorías.</p>
        )}
        <ul className="divide-y divide-slate-100">
          {(categorias ?? []).map((categoria, i) => (
            <CategoriaRow
              key={categoria.id}
              categoria={categoria}
              esPrimera={i === 0}
              esUltima={i === (categorias?.length ?? 1) - 1}
            />
          ))}
        </ul>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
        <h2 className="text-sm font-semibold text-slate-900 mb-3">Nueva categoría</h2>
        <NuevaCategoriaForm />
      </div>
    </div>
  )
}
