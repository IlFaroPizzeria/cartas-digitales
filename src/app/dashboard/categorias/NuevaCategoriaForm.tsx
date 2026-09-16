"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCategoria } from "../actions";
import { useToast } from "@/components/ui/ToastProvider";
import { CATEGORIAS_PREDEFINIDAS } from "@/lib/categoriasPredefinidas";

export default function NuevaCategoriaForm({
  categoriasExistentes,
}: {
  categoriasExistentes: string[];
}) {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const disponibles = CATEGORIAS_PREDEFINIDAS.filter(
    (c) => !categoriasExistentes.includes(c.es),
  );

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    try {
      const categoriaId = String(formData.get("categoriaId") ?? "");
      const elegida = CATEGORIAS_PREDEFINIDAS.find(
        (c) => c.id === categoriaId,
      );
      await createCategoria(formData);
      router.refresh();
      const form = document.getElementById(
        "nueva-categoria-form",
      ) as HTMLFormElement | null;
      form?.reset();
      toast.success(`Categoría "${elegida?.es ?? ""}" creada.`);
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "No se pudo crear la categoría.",
      );
    } finally {
      setLoading(false);
    }
  }

  if (disponibles.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        Ya has añadido todas las categorías disponibles.
      </p>
    );
  }

  return (
    <form
      id="nueva-categoria-form"
      action={handleSubmit}
      className="flex gap-2"
    >
      <select
        name="categoriaId"
        required
        defaultValue=""
        className="flex-1 rounded-lg border border-slate-300 px-3 py-2.5 text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
      >
        <option value="" disabled>
          Elige una categoría
        </option>
        {disponibles.map((c) => (
          <option key={c.id} value={c.id}>
            {c.es}
          </option>
        ))}
      </select>
      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 text-sm font-medium shadow-sm transition-colors disabled:opacity-50"
      >
        {loading ? "Creando..." : "Crear"}
      </button>
    </form>
  );
}
