"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteRestaurante } from "./actions";
import { useToast } from "@/components/ui/ToastProvider";

// Borrar un restaurante es irreversible y se lleva por delante todos sus
// platos y categorías, así que además del típico Cancelar/Eliminar se pide
// escribir el slug exacto -- así un admin no puede borrar el restaurante
// equivocado por un clic de más.
export default function EliminarRestauranteButton({
  id,
  nombre,
  slug,
}: {
  id: number;
  nombre: string;
  slug: string;
}) {
  const [open, setOpen] = useState(false);
  const [texto, setTexto] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const toast = useToast();

  const confirmado = texto.trim() === slug;

  function cerrar() {
    if (pending) return;
    setOpen(false);
    setTexto("");
  }

  function handleDelete() {
    if (!confirmado) return;
    startTransition(async () => {
      try {
        await deleteRestaurante(id);
        toast.success(`"${nombre}" eliminado.`);
        setOpen(false);
        setTexto("");
        router.refresh();
      } catch (e) {
        toast.error(
          e instanceof Error
            ? e.message
            : "No se pudo eliminar el restaurante.",
        );
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs font-semibold px-2.5 py-1.5 rounded-full border border-red-200 text-red-700 hover:bg-red-50"
      >
        Eliminar
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
          onClick={cerrar}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="eliminar-restaurante-title"
            className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              id="eliminar-restaurante-title"
              className="text-base font-semibold text-slate-900"
            >
              ¿Eliminar &quot;{nombre}&quot;?
            </h3>
            <p className="mt-1.5 text-sm text-slate-600">
              Esto borra el restaurante, todos sus platos y categorías, y su
              carta pública deja de existir. No se puede deshacer.
            </p>
            <label className="mt-4 block text-sm text-slate-700">
              Escribe <span className="font-mono font-semibold">{slug}</span>{" "}
              para confirmar
            </label>
            <input
              autoFocus
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder={slug}
              disabled={pending}
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={cerrar}
                disabled={pending}
                className="rounded-lg border border-slate-300 px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={!confirmado || pending}
                className="rounded-lg bg-red-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 disabled:opacity-50"
              >
                {pending ? "Eliminando…" : "Eliminar definitivamente"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
