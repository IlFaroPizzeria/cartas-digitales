import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ConfiguracionForm from './ConfiguracionForm'

export default async function ConfiguracionPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: negocio } = await supabase
    .from('negocios')
    .select(
      'nombre, tagline, telefono, email, direccion, color_fondo, color_header, color_acento, logo_url, idiomas_activos'
    )
    .eq('owner_id', user.id)
    .maybeSingle()

  if (!negocio) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-6 text-center">
        <p className="text-sm text-amber-700">
          Tu usuario todavía no está enlazado a ningún restaurante. Contacta con el administrador.
        </p>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900 mb-1">Configuración</h1>
      <p className="text-sm text-slate-500 mb-6">Datos y apariencia de tu restaurante</p>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <ConfiguracionForm negocio={negocio} />
      </div>
    </div>
  )
}
