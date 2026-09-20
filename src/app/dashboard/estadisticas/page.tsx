import { createClient } from '@/lib/supabase/server'
import { isoHaceDias } from '@/lib/fechas'

const IDIOMA_LABEL: Record<string, string> = {
  es: 'Español',
  en: 'Inglés',
  de: 'Alemán',
  it: 'Italiano',
  sv: 'Sueco',
  fr: 'Francés',
}

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="glass-card rounded-2xl p-4 text-center">
      <p className="text-2xl font-semibold text-slate-900 tabular-nums">{value}</p>
      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
    </div>
  )
}

export default async function EstadisticasPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: negocio } = await supabase
    .from('negocios')
    .select('id')
    .eq('owner_id', user.id)
    .maybeSingle()

  if (!negocio) {
    return (
      <div className="max-w-md mx-auto glass-card rounded-2xl p-6 text-center">
        <p className="text-sm text-amber-700">
          Tu usuario todavía no está enlazado a ningún restaurante.
        </p>
      </div>
    )
  }

  const hace7 = isoHaceDias(7)
  const hace30 = isoHaceDias(30)

  const [{ count: aperturas7 }, { count: aperturas30 }, { count: aperturasTotal }, { data: eventosIdioma }] =
    await Promise.all([
      supabase
        .from('visitas')
        .select('id', { count: 'exact', head: true })
        .eq('negocio_id', negocio.id)
        .eq('evento', 'apertura')
        .gte('creado_en', hace7),
      supabase
        .from('visitas')
        .select('id', { count: 'exact', head: true })
        .eq('negocio_id', negocio.id)
        .eq('evento', 'apertura')
        .gte('creado_en', hace30),
      supabase
        .from('visitas')
        .select('id', { count: 'exact', head: true })
        .eq('negocio_id', negocio.id)
        .eq('evento', 'apertura'),
      supabase
        .from('visitas')
        .select('idioma')
        .eq('negocio_id', negocio.id)
        .gte('creado_en', hace30),
    ])

  const conteoIdiomas: Record<string, number> = {}
  for (const e of eventosIdioma ?? []) {
    conteoIdiomas[e.idioma] = (conteoIdiomas[e.idioma] ?? 0) + 1
  }
  const totalEventosIdioma = Object.values(conteoIdiomas).reduce((a, b) => a + b, 0)
  const idiomasOrdenados = Object.entries(conteoIdiomas).sort((a, b) => b[1] - a[1])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Estadísticas</h1>
        <p className="text-sm text-slate-500">
          Cuántas veces se ha abierto tu carta y en qué idiomas la ven tus clientes
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <StatTile label="Últimos 7 días" value={aperturas7 ?? 0} />
        <StatTile label="Últimos 30 días" value={aperturas30 ?? 0} />
        <StatTile label="Desde siempre" value={aperturasTotal ?? 0} />
      </div>

      <div className="glass-card rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-slate-900 mb-1">Idiomas más usados</h2>
        <p className="text-xs text-slate-500 mb-4">Últimos 30 días</p>
        {idiomasOrdenados.length === 0 ? (
          <p className="text-sm text-slate-500">
            Todavía no hay datos suficientes. Vuelve por aquí en unos días.
          </p>
        ) : (
          <ul className="space-y-3">
            {idiomasOrdenados.map(([idioma, count]) => {
              const pct = totalEventosIdioma > 0 ? Math.round((count / totalEventosIdioma) * 100) : 0
              return (
                <li key={idioma}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-medium text-slate-700">
                      {IDIOMA_LABEL[idioma] ?? idioma.toUpperCase()}
                    </span>
                    <span className="text-slate-500 tabular-nums">
                      {count} · {pct}%
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full rounded-full bg-brand" style={{ width: `${pct}%` }} />
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
