import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import LogoutButton from './LogoutButton'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Buscamos el negocio cuyo owner_id coincide con el usuario logueado.
  // Todavía sin RLS por propietario (eso es la Fase 4), pero esto ya
  // demuestra que la relación usuario -> negocio funciona.
  const { data: negocio } = await supabase
    .from('negocios')
    .select('id, nombre, slug')
    .eq('owner_id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-10">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-sm border border-zinc-200 p-6">
        <h1 className="text-lg font-semibold text-zinc-900 mb-1">Dashboard</h1>
        <p className="text-sm text-zinc-500 mb-1">Sesión iniciada como {user.email}</p>

        {negocio ? (
          <p className="text-sm text-zinc-700 mb-6">
            Restaurante: <span className="font-medium">{negocio.nombre}</span> (
            {negocio.slug})
          </p>
        ) : (
          <p className="text-sm text-amber-600 mb-6">
            Este usuario todavía no está enlazado a ningún restaurante.
          </p>
        )}

        <LogoutButton />
      </div>
    </div>
  )
}
