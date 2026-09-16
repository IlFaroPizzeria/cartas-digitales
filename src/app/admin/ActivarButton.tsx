"use client";

import { useTransition } from "react";
import { activarRestaurante } from "./actions";
import { useToast } from "@/components/ui/ToastProvider";

export default function ActivarButton({
  id,
  nombre,
}: {
  id: number;
  nombre: string;
}) {
  const [pending, startTransition] = useTransition();
  const toast = useToast();

  function handleClick() {
    startTransition(async () => {
      try {
        await activarRestaurante(id);
        toast.success(`"${nombre}" activado. Ya es visible al público.`);
      } catch {
        toast.error("No se pudo activar el restaurante.");
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className="text-xs font-semibold px-2.5 py-1.5 rounded-full border border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
    >
      {pending ? "Activando…" : "Activar"}
    </button>
  );
}
