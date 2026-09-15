import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PlatoForm from '../PlatoForm'

export default async function NuevoPlatoPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <h1 className="text-lg font-semibold text-slate-900 mb-6">Añadir plato</h1>
      <PlatoForm />
    </div>
  )
}
