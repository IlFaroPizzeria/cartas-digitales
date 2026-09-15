'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { toggleDisponible, deletePlato, movePlato } from './actions'

type Plato = {
  id: number
  nombre: string
  precio: number
  disponible: boolean
}

export default function PlatoRow({
  plato,
  esPrimera,
  esUltima,
}: {
  plato: Plato
  esPrimera: boolean
  esUltima: boolean
}) {
  const [disponible, setDisponible] = useState(plato.disponible)
  const [deleting, setDeleting] = useState(false)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleToggle() {
    const next = !disponible
    setDisponible(next)
    setError(null)
    startTransition(async () => {
      try {
        await toggleDisponible(plato.id, next)
      } catch {
        setDisponible(!next)
        setError('No se pudo actualizar.')
      }
    })
  }

  function handleDelete() {
    if (!confirm(`¿Eliminar "${plato.nombre}"? Esta acción no se puede deshacer.`)) return
    setDeleting(true)
    setError(null)
    startTransition(async () => {
      try {
        await deletePlato(plato.id)
      } catch {
        setDeleting(false)
        setError('No se pudo eliminar.')
      }
    })
  }

  function handleMove(direccion: 'arriba' | 'abajo') {
    startTransition(async () => {
      await movePlato(plato.id, direccion)
    })
  }

  return (
    <li className={`py-3.5 ${deleting ? 'opacity-40 pointer-events-none' : ''}`}>
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="min-w-0 mr-auto">
          <p className="text-[15px] font-medium text-slate-900 truncate">{plato.nombre}</p>
          <p className="text-sm text-slate-600 tabular-nums">{Number(plato.precio).toFixed(2)} €</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="flex rounded-md border border-slate-200 overflow-hidden">
            <button
              onClick={() => handleMove('arriba')}
              disabled={esPrimera || pending}
              className="px-1.5 py-1 text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-transparent border-r border-slate-200"
              aria-label="Subir"
            >
              ↑
            </button>
            <button
              onClick={() => handleMove('abajo')}
              disabled={esUltima || pending}
              className="px-1.5 py-1 text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-transparent"
              aria-label="Bajar"
            >
              ↓
            </button>
          </div>
          <button
            onClick={handleToggle}
            disabled={pending}
            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-full border whitespace-nowrap ${
              disponible
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-slate-100 text-slate-600 border-slate-300'
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${disponible ? 'bg-emerald-500' : 'bg-slate-400'}`}
            />
            {disponible ? 'Disponible' : 'No disponible'}
          </button>
          <Link
            href={`/dashboard/platos/${plato.id}/editar`}
            className="text-xs font-semibold px-2.5 py-1.5 rounded-full border border-slate-300 text-slate-700 hover:bg-slate-50"
          >
            Editar
          </Link>
          <button
            onClick={handleDelete}
            disabled={pending}
            className="text-xs font-semibold px-2.5 py-1.5 rounded-full border border-red-200 text-red-700 hover:bg-red-50"
          >
            Eliminar
          </button>
        </div>
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </li>
  )
}
