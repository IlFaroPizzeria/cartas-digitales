import { createClient } from '@/lib/supabase/server'
import { formatearFechaHora } from '@/lib/fechas'

export default async function AuditoriaPage() {
  const supabase = await createClient()

  const { data: entradas } = await supabase
    .from('admin_auditoria')
    .select('id, admin_email, negocio_nombre, accion, creado_en')
    .order('creado_en', { ascending: false })
    .limit(200)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Auditoría</h1>
        <p className="text-sm text-slate-500">
          Qué se ha creado, editado o borrado desde el panel admin, y quién lo hizo
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 divide-y divide-slate-100">
        {(entradas ?? []).map((e) => (
          <div key={e.id} className="p-4 flex items-start justify-between gap-3 flex-wrap">
            <div className="min-w-0">
              <p className="text-sm text-slate-900">{e.accion}</p>
              <p className="text-xs text-slate-500 mt-0.5">
                {e.negocio_nombre} · {e.admin_email}
              </p>
            </div>
            <span className="text-xs text-slate-400 shrink-0 tabular-nums">
              {formatearFechaHora(e.creado_en)}
            </span>
          </div>
        ))}
        {(!entradas || entradas.length === 0) && (
          <p className="p-6 text-sm text-slate-500 text-center">
            Todavía no hay nada registrado. En cuanto edites algo desde el editor de cartas del
            admin, aparecerá aquí.
          </p>
        )}
      </div>
    </div>
  )
}
