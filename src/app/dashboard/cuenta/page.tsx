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

      <CuentaForm email={user.email ?? ''} />
    </div>
  )
}
