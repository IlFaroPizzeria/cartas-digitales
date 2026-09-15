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
    .select('id, nombre, slug, activo, plan, fecha_pago, owner_id')
    .eq('id', id)
    .single()

  if (!restaurante) notFound()

  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <h1 className="text-lg font-semibold text-slate-900 mb-6">Editar restaurante</h1>
      <RestauranteForm restaurante={restaurante} />
    </div>
  )
}
