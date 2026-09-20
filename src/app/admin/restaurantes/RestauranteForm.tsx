"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createRestaurante, updateRestaurante } from "../actions";
import { useToast } from "@/components/ui/ToastProvider";
import { IDIOMAS } from "@/lib/idiomas";

const IDIOMAS_EXTRA = IDIOMAS.filter((i) => i.id !== "es");

type Props = {
  restaurante?: {
    id: number;
    nombre: string;
    slug: string;
    activo: boolean;
    suspendido: boolean;
    plan: string | null;
    fecha_pago: string | null;
    owner_id: string | null;
    idiomas_permitidos: string[];
  };
};

export default function RestauranteForm({ restaurante }: Props) {
  const router = useRouter();
  const toast = useToast();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [idiomasPermitidos, setIdiomasPermitidos] = useState<Set<string>>(
    new Set(restaurante?.idiomas_permitidos ?? []),
  );

  function toggleIdiomaPermitido(id: string) {
    setIdiomasPermitidos((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

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
    "w-full rounded-lg border border-slate-300 px-3 py-2.5 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand";

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
              className="h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand"
            />
            Restaurante activo (visible en su carta pública)
          </label>

          <div className="rounded-xl border border-red-200 bg-red-50/80 p-3">
            <label className="flex items-center gap-2 text-sm font-medium text-red-800">
              <input
                type="checkbox"
                name="suspendido"
                defaultChecked={restaurante.suspendido}
                className="h-4 w-4 rounded border-red-300 text-red-600 focus:ring-red-500"
              />
              Suspendido por impago
            </label>
            <p className="mt-1 text-xs text-red-700">
              Marca esto cuando el restaurante deje de pagar: su carta pública
              deja de verse y el dueño no podrá guardar ningún cambio desde su
              panel (platos, categorías, configuración), haga lo que haga.
              Desmárcalo para devolverle el acceso.
            </p>
          </div>

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
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Idiomas permitidos (además del español)
            </label>
            <p className="text-xs text-slate-500 mb-2">
              El dueño solo puede activar, desde su panel, los idiomas que
              marques aquí. Si necesita otro más adelante, márcalo y se le
              queda disponible.
            </p>
            <div className="flex flex-wrap gap-2">
              {IDIOMAS_EXTRA.map((idioma) => {
                const activo = idiomasPermitidos.has(idioma.id);
                return (
                  <button
                    key={idioma.id}
                    type="button"
                    onClick={() => toggleIdiomaPermitido(idioma.id)}
                    className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                      activo
                        ? "bg-brand/10 text-brand-dark border-brand/40"
                        : "bg-white/70 text-slate-600 border-slate-300 hover:bg-white"
                    }`}
                  >
                    {idioma.label}
                  </button>
                );
              })}
            </div>
            {Array.from(idiomasPermitidos).map((id) => (
              <input key={id} type="hidden" name="idiomas_permitidos" value={id} />
            ))}
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
          className="flex-1 rounded-lg bg-brand hover:bg-brand-dark text-white py-3 text-base font-medium shadow-sm transition-colors disabled:opacity-50"
        >
          {loading ? "Guardando..." : "Guardar"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin")}
          className="rounded-lg border border-slate-300 px-4 py-3 text-base font-medium text-slate-700 hover:bg-white/80 transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
