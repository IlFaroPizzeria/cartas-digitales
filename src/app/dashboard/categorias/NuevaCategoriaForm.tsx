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

  const [modo, setModo] = useState<"lista" | "personalizada">(
    disponibles.length === 0 ? "personalizada" : "lista",
  );

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    try {
      const etiqueta =
        modo === "lista"
          ? (CATEGORIAS_PREDEFINIDAS.find(
              (c) => c.id === String(formData.get("categoriaId") ?? ""),
            )?.es ?? "")
          : String(formData.get("nombre") ?? "").trim();

      await createCategoria(formData);
      router.refresh();
      const form = document.getElementById(
        "nueva-categoria-form",
      ) as HTMLFormElement | null;
      form?.reset();
      toast.success(`Categoría "${etiqueta}" creada.`);
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
      {modo === "lista" ? (
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
      ) : (
        <form
          id="nueva-categoria-form"
          action={handleSubmit}
          className="flex gap-2"
        >
          <input
            type="text"
            name="nombre"
            required
            maxLength={40}
            placeholder="Nombre de la categoría (ej. Sushi)"
            className="flex-1 rounded-lg border border-slate-300 px-3 py-2.5 text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 text-sm font-medium shadow-sm transition-colors disabled:opacity-50"
          >
            {loading ? "Creando..." : "Crear"}
          </button>
        </form>
      )}

      <div className="mt-2">
        {modo === "lista" ? (
          disponibles.length === 0 ? (
            <p className="text-sm text-slate-500">
              Ya has añadido todas las categorías predefinidas.
            </p>
          ) : (
            <button
              type="button"
              onClick={() => setModo("personalizada")}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
            >
              ¿No la encuentras? Crea una categoría con otro nombre
            </button>
          )
        ) : (
          disponibles.length > 0 && (
            <button
              type="button"
              onClick={() => setModo("lista")}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
            >
              Elegir de la lista de categorías habituales
            </button>
          )
        )}
      </div>
    </div>
  );
}
