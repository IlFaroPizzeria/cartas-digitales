import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PlatoForm from '@/app/dashboard/platos/PlatoForm'
import { adminSavePlato } from '@/app/admin/carta-actions'

type PlatoRow = {
  id: number
  nombre: string
  nombre_en: string | null
  nombre_de: string | null
  nombre_it: string | null
  nombre_sv: string | null
  nombre_fr: string | null
  precio: number
  negocio_id: number
  descripcion: string | null
  descripcion_en: string | null
  descripcion_de: string | null
  descripcion_it: string | null
  descripcion_sv: string | null
  descripcion_fr: string | null
  categoria: string | null
  etiquetas: string[] | null
}

export default async function AdminEditarPlatoPage({
  params,
}: {
  params: Promise<{ id: string; platoId: string }>
}) {
  const { id, platoId } = await params
  const negocioId = Number(id)
  if (!Number.isFinite(negocioId)) notFound()

  const supabase = await createClient()

  const { data: negocio } = await supabase
    .from('negocios')
    .select('id, nombre')
    .eq('id', negocioId)
    .single()

  if (!negocio) notFound()

  const { data: categorias } = await supabase
    .from('categorias')
    .select('id, nombre')
    .eq('negocio_id', negocioId)
    .order('orden', { ascending: true })

  // Igual que en la versión de dueño (src/app/dashboard/platos/[id]/editar):
  // el alias con tilde no lo tipa el generador de Supabase, se castea a mano.
  const { data: platoRaw } = await supabase
    .from('platos')
    .select(
      'id, nombre, nombre_en, nombre_de, nombre_it, nombre_sv, nombre_fr, precio, negocio_id, descripcion:descripción, descripcion_en, descripcion_de, descripcion_it, descripcion_sv, descripcion_fr, categoria:categoría, etiquetas',
    )
    .eq('id', platoId)
    .single()

  const plato = platoRaw as unknown as PlatoRow | null

  if (!plato || plato.negocio_id !== negocioId) notFound()

  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <h1 className="text-lg font-semibold text-slate-900 mb-6">
        Editar plato — {negocio.nombre}
      </h1>
      <PlatoForm
        plato={{
          id: plato.id,
          nombre: plato.nombre,
          nombre_en: plato.nombre_en,
          nombre_de: plato.nombre_de,
          nombre_it: plato.nombre_it,
          nombre_sv: plato.nombre_sv,
          nombre_fr: plato.nombre_fr,
          descripcion: plato.descripcion,
          descripcion_en: plato.descripcion_en,
          descripcion_de: plato.descripcion_de,
          descripcion_it: plato.descripcion_it,
          descripcion_sv: plato.descripcion_sv,
          descripcion_fr: plato.descripcion_fr,
          precio: plato.precio,
          categoria: plato.categoria ?? '',
          etiquetas: plato.etiquetas ?? [],
        }}
        categorias={categorias ?? []}
        saveAction={adminSavePlato.bind(null, negocioId)}
        backHref={`/admin/restaurantes/${negocioId}/carta`}
        categoriasHref={`/admin/restaurantes/${negocioId}/carta`}
      />
    </div>
  )
}
