"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { toggleDisponible, deletePlato, movePlato } from "./actions";
import { etiquetaPorId } from "@/lib/etiquetas";
import { useToast } from "@/components/ui/ToastProvider";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

type Plato = {
  id: number;
  nombre: string;
  precio: number;
  disponible: boolean;
  etiquetas: string[] | null;
};

export default function PlatoRow({
  plato,
  esPrimera,
  esUltima,
  toggleAction = toggleDisponible,
  deleteAction = deletePlato,
  moveAction = movePlato,
  editHref,
}: {
  plato: Plato;
  esPrimera: boolean;
  esUltima: boolean;
  // Por defecto usan las acciones del dueño (dashboard/actions.ts), que
  // solo pueden tocar el negocio del usuario logueado. El panel admin
  // (src/app/admin/restaurantes/[id]/carta) pasa aquí sus propias
  // versiones (admin/carta-actions.ts) para poder editar la carta de
  // cualquier restaurante en casos puntuales.
  toggleAction?: (platoId: number, disponible: boolean) => Promise<void>;
  deleteAction?: (platoId: number) => Promise<void>;
  moveAction?: (platoId: number, direccion: "arriba" | "abajo") => Promise<void>;
  editHref?: string;
}) {
  const [disponible, setDisponible] = useState(plato.disponible);
  const [deleting, setDeleting] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [pending, startTransition] = useTransition();
  const toast = useToast();

  function handleToggle() {
    const next = !disponible;
    setDisponible(next);
    startTransition(async () => {
      try {
        await toggleAction(plato.id, next);
      } catch {
        setDisponible(!next);
        toast.error("No se pudo actualizar la disponibilidad.");
      }
    });
  }

  function confirmarEliminar() {
    setConfirmando(false);
    setDeleting(true);
    startTransition(async () => {
      try {
        await deleteAction(plato.id);
        toast.success(`"${plato.nombre}" eliminado.`);
      } catch {
        setDeleting(false);
        toast.error("No se pudo eliminar el plato.");
      }
    });
  }

  function handleMove(direccion: "arriba" | "abajo") {
    startTransition(async () => {
      await moveAction(plato.id, direccion);
    });
  }

  return (
    <li
      className={`py-3.5 ${deleting ? "opacity-40 pointer-events-none" : ""}`}
    >
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="min-w-0 mr-auto">
          <p className="text-[15px] font-medium text-slate-900 truncate">
            {plato.nombre}
          </p>
          <p className="text-sm text-slate-600 tabular-nums">
            {Number(plato.precio).toFixed(2)} €
          </p>
          {plato.etiquetas && plato.etiquetas.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1">
              {plato.etiquetas.map((id) => {
                const etiqueta = etiquetaPorId(id);
                if (!etiqueta) return null;
                return (
                  <span key={id} title={etiqueta.label.es} className="text-xs">
                    {etiqueta.emoji}
                  </span>
                );
              })}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="flex rounded-md border border-slate-200 overflow-hidden">
            <button
              onClick={() => handleMove("arriba")}
              disabled={esPrimera || pending}
              className="px-1.5 py-1 text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-transparent border-r border-slate-200"
              aria-label="Subir"
            >
              ↑
            </button>
            <button
              onClick={() => handleMove("abajo")}
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
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-slate-100 text-slate-600 border-slate-300"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${disponible ? "bg-emerald-500" : "bg-slate-400"}`}
            />
            {disponible ? "Disponible" : "No disponible"}
          </button>
          <Link
            href={editHref ?? `/dashboard/platos/${plato.id}/editar`}
            className="text-xs font-semibold px-2.5 py-1.5 rounded-full border border-slate-300 text-slate-700 hover:bg-slate-50"
          >
            Editar
          </Link>
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
        title={`¿Eliminar "${plato.nombre}"?`}
        description="Esta acción no se puede deshacer."
        pending={pending && deleting}
        onConfirm={confirmarEliminar}
        onCancel={() => setConfirmando(false)}
      />
    </li>
  );
}
