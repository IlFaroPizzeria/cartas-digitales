import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PlatoForm from '@/app/dashboard/platos/PlatoForm'
import { adminSavePlato } from '@/app/admin/carta-actions'

export default async function AdminNuevoPlatoPage({
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
    .select('id, nombre')
    .eq('id', negocioId)
    .single()

  if (!negocio) notFound()

  const { data: categorias } = await supabase
    .from('categorias')
    .select('id, nombre')
    .eq('negocio_id', negocioId)
    .order('orden', { ascending: true })

  return (
    <div className="max-w-md mx-auto glass-card rounded-2xl p-6">
      <h1 className="text-lg font-semibold text-slate-900 mb-6">
        Añadir plato — {negocio.nombre}
      </h1>
      <PlatoForm
        categorias={categorias ?? []}
        saveAction={adminSavePlato.bind(null, negocioId)}
        backHref={`/admin/restaurantes/${negocioId}/carta`}
        categoriasHref={`/admin/restaurantes/${negocioId}/carta`}
      />
    </div>
  )
}
