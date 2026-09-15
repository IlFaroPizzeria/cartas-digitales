'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { savePlato } from '@/app/dashboard/actions'
import { ETIQUETAS } from '@/lib/etiquetas'

type Props = {
  plato?: {
    id: number
    nombre: string
    descripcion: string | null
    precio: number
    categoria: string
    etiquetas: string[]
  }
}

const ALERGENOS = ETIQUETAS.filter((e) => e.grupo === 'alergeno')
const DIETA = ETIQUETAS.filter((e) => e.grupo === 'dieta')

export default function PlatoForm({ plato }: Props) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [seleccionadas, setSeleccionadas] = useState<Set<string>>(
    new Set(plato?.etiquetas ?? [])
  )

  function toggleEtiqueta(id: string) {
    setSeleccionadas((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function handleSubmit(formData: FormData) {
    setError(null)
    setLoading(true)
    try {
      await savePlato(formData)
      setSaved(true)
      router.push('/dashboard')
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo guardar el plato.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'w-full rounded-lg border border-slate-300 px-3 py-2.5 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'

  return (
    <form action={handleSubmit} className="space-y-4">
      {plato && <input type="hidden" name="id" value={plato.id} />}
      {Array.from(seleccionadas).map((id) => (
        <input key={id} type="hidden" name="etiquetas" value={id} />
      ))}

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
        <input name="nombre" required defaultValue={plato?.nombre} className={inputClass} />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Categoría</label>
        <input
          name="categoria"
          required
          defaultValue={plato?.categoria}
          placeholder="Ej: Entrantes"
          className={inputClass}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Precio (€)</label>
        <input
          name="precio"
          type="number"
          step="0.01"
          min="0"
          inputMode="decimal"
          required
          defaultValue={plato?.precio}
          className={inputClass}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Descripción (opcional)</label>
        <textarea
          name="descripcion"
          rows={3}
          defaultValue={plato?.descripcion ?? ''}
          className={inputClass}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Dieta y picante (opcional)
        </label>
        <div className="flex flex-wrap gap-2">
          {DIETA.map((e) => {
            const activa = seleccionadas.has(e.id)
            return (
              <button
                key={e.id}
                type="button"
                onClick={() => toggleEtiqueta(e.id)}
                className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                  activa
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-300'
                    : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                }`}
              >
                <span>{e.emoji}</span>
                {e.label.es}
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Alérgenos presentes (opcional)
        </label>
        <p className="text-xs text-slate-500 mb-2">
          Marca los que apliquen — obligatorio informar de ellos en hostelería en España.
        </p>
        <div className="flex flex-wrap gap-2">
          {ALERGENOS.map((e) => {
            const activa = seleccionadas.has(e.id)
            return (
              <button
                key={e.id}
                type="button"
                onClick={() => toggleEtiqueta(e.id)}
                className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                  activa
                    ? 'bg-amber-50 text-amber-800 border-amber-300'
                    : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                }`}
              >
                <span>{e.emoji}</span>
                {e.label.es}
              </button>
            )
          })}
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
      {saved && <p className="text-sm text-emerald-700">Plato guardado correctamente.</p>}

      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white py-3 text-base font-medium shadow-sm transition-colors disabled:opacity-50"
        >
          {loading ? 'Guardando...' : 'Guardar'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/dashboard')}
          className="rounded-lg border border-slate-300 px-4 py-3 text-base font-medium text-slate-700 hover:bg-slate-50"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
