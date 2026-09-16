"use client";

import { useState, useTransition } from "react";
import { deleteCategoria, moveCategoria } from "../actions";
import { useToast } from "@/components/ui/ToastProvider";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

type Categoria = { id: number; nombre: string; orden: number };

export default function CategoriaRow({
  categoria,
  esPrimera,
  esUltima,
  deleteAction = deleteCategoria,
  moveAction = moveCategoria,
}: {
  categoria: Categoria;
  esPrimera: boolean;
  esUltima: boolean;
  // El panel admin pasa aquí sus propias acciones (admin/carta-actions.ts)
  // para poder editar la carta de cualquier restaurante -- ver PlatoRow.
  deleteAction?: (categoriaId: number) => Promise<void>;
  moveAction?: (categoriaId: number, direccion: "arriba" | "abajo") => Promise<void>;
}) {
  const [confirmando, setConfirmando] = useState(false);
  const [pending, startTransition] = useTransition();
  const toast = useToast();

  function confirmarEliminar() {
    setConfirmando(false);
    startTransition(async () => {
      try {
        await deleteAction(categoria.id);
        toast.success(`Categoría "${categoria.nombre}" eliminada.`);
      } catch (e) {
        toast.error(
          e instanceof Error ? e.message : "No se pudo eliminar la categoría.",
        );
      }
    });
  }

  function mover(direccion: "arriba" | "abajo") {
    startTransition(async () => {
      await moveAction(categoria.id, direccion);
    });
  }

  return (
    <li className="py-3.5">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span className="text-[15px] font-medium text-slate-900 truncate">
          {categoria.nombre}
        </span>

        <div className="flex items-center gap-1.5 shrink-0">
          <div className="flex rounded-md border border-slate-200 overflow-hidden">
            <button
              onClick={() => mover("arriba")}
              disabled={esPrimera || pending}
              className="px-1.5 py-1 text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-transparent border-r border-slate-200"
              aria-label="Subir"
            >
              ↑
            </button>
            <button
              onClick={() => mover("abajo")}
              disabled={esUltima || pending}
              className="px-1.5 py-1 text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-transparent"
              aria-label="Bajar"
            >
              ↓
            </button>
          </div>

          <button
            onClick={() => setConfirmando(true)}
            disabled={pending}
            className="text-xs font-semibold px-2.5 py-1.5 rounded-full border border-red-200 text-red-700 hover:bg-red-50"
          >
            Eliminar
          </button>
        </div>
      </div>
      <ConfirmDialog
        open={confirmando}
        title={`¿Eliminar la categoría "${categoria.nombre}"?`}
        description="Si tiene platos dentro, primero tendrás que moverlos o borrarlos."
        pending={pending}
        onConfirm={confirmarEliminar}
        onCancel={() => setConfirmando(false)}
      />
    </li>
  );
}
