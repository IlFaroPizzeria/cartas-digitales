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
    <li className="py-3.5">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        {editando ? (
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="flex-1 min-w-[8rem] rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            autoFocus
          />
        ) : (
          <span className="text-[15px] font-medium text-slate-900 truncate">{categoria.nombre}</span>
        )}

        <div className="flex items-center gap-1.5 shrink-0">
          <div className="flex rounded-md border border-slate-200 overflow-hidden">
            <button
              onClick={() => mover('arriba')}
              disabled={esPrimera || pending}
              className="px-1.5 py-1 text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-transparent border-r border-slate-200"
              aria-label="Subir"
            >
              ↑
            </button>
            <button
              onClick={() => mover('abajo')}
              disabled={esUltima || pending}
              className="px-1.5 py-1 text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-transparent"
              aria-label="Bajar"
            >
              ↓
            </button>
          </div>

          {editando ? (
            <button
              onClick={guardarNombre}
              disabled={pending}
              className="text-xs font-semibold px-3 py-1.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              Guardar
            </button>
          ) : (
            <button
              onClick={() => setEditando(true)}
              className="text-xs font-semibold px-2.5 py-1.5 rounded-full border border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              Editar
            </button>
          )}

          <button
            onClick={eliminar}
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
