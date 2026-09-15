'use client'

import { useState, useTransition } from 'react'
import { renameCategoria, deleteCategoria, moveCategoria } from '../actions'

type Categoria = { id: number; nombre: string; orden: number }

export default function CategoriaRow({
  categoria,
  esPrimera,
  esUltima,
}: {
  categoria: Categoria
  esPrimera: boolean
  esUltima: boolean
}) {
  const [nombre, setNombre] = useState(categoria.nombre)
  const [editando, setEditando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function guardarNombre() {
    setError(null)
    startTransition(async () => {
      try {
        await renameCategoria(categoria.id, nombre)
        setEditando(false)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'No se pudo renombrar.')
      }
    })
  }

  function eliminar() {
    if (!confirm(`¿Eliminar la categoría "${categoria.nombre}"?`)) return
    setError(null)
    startTransition(async () => {
      try {
        await deleteCategoria(categoria.id)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'No se pudo eliminar.')
      }
    })
  }

  function mover(direccion: 'arriba' | 'abajo') {
    startTransition(async () => {
      await moveCategoria(categoria.id, direccion)
    })
  }

  return (
    <li className="py-3">
      <div className="flex items-center justify-between gap-2">
        {editando ? (
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="flex-1 min-w-0 rounded-lg border border-zinc-300 px-2 py-1.5 text-sm"
            autoFocus
          />
        ) : (
          <span className="text-sm font-medium text-zinc-900 truncate">{categoria.nombre}</span>
        )}

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => mover('arriba')}
            disabled={esPrimera || pending}
            className="text-xs px-2 py-1 rounded border border-zinc-200 text-zinc-600 disabled:opacity-30"
            aria-label="Subir"
          >
            ↑
          </button>
          <button
            onClick={() => mover('abajo')}
            disabled={esUltima || pending}
            className="text-xs px-2 py-1 rounded border border-zinc-200 text-zinc-600 disabled:opacity-30"
            aria-label="Bajar"
          >
            ↓
          </button>

          {editando ? (
            <button
              onClick={guardarNombre}
              disabled={pending}
              className="text-xs font-medium px-2.5 py-1.5 rounded-full border border-zinc-900 bg-zinc-900 text-white"
            >
              Guardar
            </button>
          ) : (
            <button
              onClick={() => setEditando(true)}
              className="text-xs font-medium px-2.5 py-1.5 rounded-full border border-zinc-200 text-zinc-700"
            >
              Editar
            </button>
          )}

          <button
            onClick={eliminar}
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
