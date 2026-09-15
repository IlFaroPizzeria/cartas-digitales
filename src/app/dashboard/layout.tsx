import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Nav from './Nav'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: negocio } = await supabase
    .from('negocios')
    .select('nombre')
    .eq('owner_id', user.id)
    .single()

  const { data: admin } = await supabase
    .from('admins')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle()

  return (
    <div className="min-h-screen bg-slate-100">
      <Nav nombreNegocio={negocio?.nombre ?? 'Panel'} isAdmin={!!admin} />
      <main className="max-w-3xl mx-auto px-4 py-6">{children}</main>
    </div>
  )
}
