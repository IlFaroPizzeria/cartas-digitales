import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import CuentaForm from './CuentaForm'
import CartaLinkCard from './CartaLinkCard'

export default async function CuentaPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: negocio } = await supabase
    .from('negocios')
    .select('slug')
    .eq('owner_id', user.id)
    .maybeSingle()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Mi cuenta</h1>
        <p className="text-sm text-slate-500">
          Gestiona el acceso a tu cuenta y el enlace de tu carta
        </p>
      </div>

      {negocio?.slug && <CartaLinkCard slug={negocio.slug} />}

      <Link
        href="/dashboard/estadisticas"
        className="flex items-center justify-between bg-white rounded-2xl shadow-sm border border-slate-200 p-5 hover:border-slate-300 transition-colors"
      >
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Estadísticas</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Cuántas veces se abre tu carta y en qué idiomas
          </p>
        </div>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-slate-400 shrink-0">
          <path d="M9 6l6 6-6 6" />
        </svg>
      </Link>

      <CuentaForm email={user.email ?? ''} />
    </div>
  )
}
