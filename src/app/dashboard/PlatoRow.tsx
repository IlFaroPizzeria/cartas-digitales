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
    <li className={`py-3 ${deleting ? 'opacity-40 pointer-events-none' : ''}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-zinc-900 truncate">{plato.nombre}</p>
          <p className="text-sm text-zinc-500">{Number(plato.precio).toFixed(2)} €</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
          <button
            onClick={() => handleMove('arriba')}
            disabled={esPrimera || pending}
            className="text-xs px-2 py-1 rounded border border-zinc-200 text-zinc-600 disabled:opacity-30"
            aria-label="Subir"
          >
            ↑
          </button>
          <button
            onClick={() => handleMove('abajo')}
            disabled={esUltima || pending}
            className="text-xs px-2 py-1 rounded border border-zinc-200 text-zinc-600 disabled:opacity-30"
            aria-label="Bajar"
          >
            ↓
          </button>
          <button
            onClick={handleToggle}
            disabled={pending}
            className={`text-xs font-medium px-2.5 py-1.5 rounded-full border whitespace-nowrap ${
              disponible
                ? 'bg-green-50 text-green-700 border-green-200'
                : 'bg-zinc-100 text-zinc-500 border-zinc-200'
            }`}
          >
            {disponible ? 'Disponible' : 'No disponible'}
          </button>
          <Link
            href={`/dashboard/platos/${plato.id}/editar`}
            className="text-xs font-medium px-2.5 py-1.5 rounded-full border border-zinc-200 text-zinc-700"
          >
            Editar
          </Link>
          <button
            onClick={handleDelete}
            disabled={pending}
            className="text-xs font-medium px-2.5 py-1.5 rounded-full border border-red-200 text-red-600"
          >
            Eliminar
          </button>
        </div>
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </li>
  )
}
