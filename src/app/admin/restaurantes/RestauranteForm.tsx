"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createRestaurante, updateRestaurante } from "../actions";
import { useToast } from "@/components/ui/ToastProvider";

type Props = {
  restaurante?: {
    id: number;
    nombre: string;
    slug: string;
    activo: boolean;
    plan: string | null;
    fecha_pago: string | null;
    owner_id: string | null;
    idiomas_max_extra: number;
  };
};

export default function RestauranteForm({ restaurante }: Props) {
  const router = useRouter();
  const toast = useToast();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setLoading(true);
    try {
      if (restaurante) {
        await updateRestaurante(formData);
        toast.success("Restaurante actualizado.");
      } else {
        await createRestaurante(formData);
        toast.success("Restaurante creado.");
      }
      router.push("/admin");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo guardar.");
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-slate-300 px-3 py-2.5 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500";

  return (
    <form action={handleSubmit} className="space-y-4">
      {restaurante && <input type="hidden" name="id" value={restaurante.id} />}

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Nombre
        </label>
        <input
          name="nombre"
          required
          defaultValue={restaurante?.nombre}
          className={inputClass}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Slug (parte de la URL pública)
        </label>
        <input
          name="slug"
          required
          defaultValue={restaurante?.slug}
          placeholder="Ej: mi-restaurante"
          className={inputClass}
        />
        <p className="mt-1 text-xs text-slate-500">
          La carta pública se verá en tudominio.com/mi-restaurante
        </p>
      </div>

      {restaurante && (
        <>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              name="activo"
              defaultChecked={restaurante.activo}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            Restaurante activo (visible en su carta pública)
          </label>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Plan (opcional)
            </label>
            <input
              name="plan"
              defaultValue={restaurante.plan ?? ""}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Fecha de pago (opcional)
            </label>
            <input
              name="fecha_pago"
              type="date"
              defaultValue={restaurante.fecha_pago ?? ""}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              UID del propietario (cuenta enlazada)
            </label>
            <input
              name="owner_id"
              defaultValue={restaurante.owner_id ?? ""}
              placeholder="Pega aquí el UID de Authentication → Users"
              className={inputClass}
            />
            <p className="mt-1 text-xs text-slate-500">
              Crea primero la cuenta en Supabase → Authentication → Users, y
              pega aquí su UID para enlazarla. Déjalo vacío para quitar el
              acceso.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Idiomas extra permitidos (además del español)
            </label>
            <input
              name="idiomas_max_extra"
              type="number"
              min={0}
              max={5}
              defaultValue={restaurante.idiomas_max_extra}
              className={inputClass}
            />
            <p className="mt-1 text-xs text-slate-500">
              Todos los restaurantes tienen 2 idiomas extra incluidos de
              base. Si un cliente paga por más, súbelo aquí (hasta 5 en
              total: inglés, alemán, italiano, sueco y francés) — se queda
              guardado así hasta que lo vuelvas a cambiar.
            </p>
          </div>
        </>
      )}

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white py-3 text-base font-medium shadow-sm transition-colors disabled:opacity-50"
        >
          {loading ? "Guardando..." : "Guardar"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin")}
          className="rounded-lg border border-slate-300 px-4 py-3 text-base font-medium text-slate-700 hover:bg-slate-50"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
