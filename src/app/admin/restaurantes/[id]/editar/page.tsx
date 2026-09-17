import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import RestauranteForm from '../../RestauranteForm'

export default async function EditarRestaurantePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: restaurante } = await supabase
    .from('negocios')
    .select('id, nombre, slug, activo, suspendido, plan, fecha_pago, owner_id, idiomas_max_extra')
    .eq('id', id)
    .single()

  if (!restaurante) notFound()

  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-semibold text-slate-900">Editar restaurante</h1>
        <Link
          href={`/admin/restaurantes/${restaurante.id}/carta`}
          className="text-xs font-semibold px-2.5 py-1.5 rounded-full border border-slate-300 text-slate-700 hover:bg-slate-50"
        >
          Ver carta
        </Link>
      </div>
      <RestauranteForm restaurante={restaurante} />
    </div>
  )
}
