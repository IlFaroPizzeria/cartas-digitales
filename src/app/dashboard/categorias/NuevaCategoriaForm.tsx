"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCategoria } from "../actions";
import { useToast } from "@/components/ui/ToastProvider";

export default function NuevaCategoriaForm() {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    try {
      const nombre = String(formData.get("nombre") ?? "").trim();
      await createCategoria(formData);
      router.refresh();
      const form = document.getElementById(
        "nueva-categoria-form",
      ) as HTMLFormElement | null;
      form?.reset();
      toast.success(`Categoría "${nombre}" creada.`);
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "No se pudo crear la categoría.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <form
        id="nueva-categoria-form"
        action={handleSubmit}
        className="flex gap-2"
      >
        <input
          name="nombre"
          required
          placeholder="Ej: Postres"
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2.5 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 text-sm font-medium shadow-sm transition-colors disabled:opacity-50"
        >
          {loading ? "Creando..." : "Crear"}
        </button>
      </form>
    </div>
  );
}
