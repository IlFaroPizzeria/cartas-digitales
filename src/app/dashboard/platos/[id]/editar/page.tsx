import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PlatoForm from '../../PlatoForm'

type PlatoRow = {
  id: number
  nombre: string
  precio: number
  negocio_id: number
  descripcion: string | null
  categoria: string | null
  etiquetas: string[] | null
}

export default async function EditarPlatoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: negocio } = await supabase
    .from('negocios')
    .select('id')
    .eq('owner_id', user.id)
    .single()

  if (!negocio) notFound()

  // El alias con tilde ("descripción"/"categoría") no lo puede tipar el
  // generador de tipos de Supabase, igual que en la carta pública: se
  // castea explícitamente, tal y como ya hace src/app/[slug]/page.tsx.
  const { data: platoRaw } = await supabase
    .from('platos')
    .select('id, nombre, precio, negocio_id, descripcion:descripción, categoria:categoría, etiquetas')
    .eq('id', id)
    .single()

  const plato = platoRaw as unknown as PlatoRow | null

  if (!plato || plato.negocio_id !== negocio.id) notFound()

  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <h1 className="text-lg font-semibold text-slate-900 mb-6">Editar plato</h1>
      <PlatoForm
        plato={{
          id: plato.id,
          nombre: plato.nombre,
          descripcion: plato.descripcion,
          precio: plato.precio,
          categoria: plato.categoria ?? '',
          etiquetas: plato.etiquetas ?? [],
        }}
      />
    </div>
  )
}
