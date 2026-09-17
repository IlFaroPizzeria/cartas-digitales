"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateNegocioConfig } from "@/app/dashboard/actions";
import { useToast } from "@/components/ui/ToastProvider";

type Negocio = {
  nombre: string;
  tagline: string | null;
  telefono: string | null;
  email: string | null;
  direccion: string | null;
  color_fondo: string | null;
  color_header: string | null;
  color_acento: string | null;
  logo_url: string | null;
  idiomas_activos: string[] | null;
  idiomas_permitidos: string[] | null;
};

const IDIOMAS: { id: string; label: string }[] = [
  { id: "es", label: "Español" },
  { id: "en", label: "Inglés" },
  { id: "de", label: "Alemán" },
  { id: "it", label: "Italiano" },
  { id: "sv", label: "Sueco" },
  { id: "fr", label: "Francés" },
];

export default function ConfiguracionForm({ negocio }: { negocio: Negocio }) {
  const router = useRouter();
  const toast = useToast();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(
    negocio.logo_url,
  );
  const [idiomas, setIdiomas] = useState<Set<string>>(
    new Set(
      negocio.idiomas_activos && negocio.idiomas_activos.length > 0
        ? negocio.idiomas_activos
        : ["es"],
    ),
  );

  const idiomasPermitidos = new Set(negocio.idiomas_permitidos ?? []);

  function toggleIdioma(id: string) {
    setIdiomas((prev) => {
      if (prev.has(id)) {
        const next = new Set(prev);
        next.delete(id);
        return next;
      }

      // Qué idiomas, además del español, puede activar este restaurante lo
      // decide el admin por cuenta (ver /admin/restaurantes/[id]/editar).
      // Si quiere alguno que no tiene permitido, tiene que pedirlo.
      if (id !== "es" && !idiomasPermitidos.has(id)) {
        toast.error(
          "Este idioma no está incluido en tu cuenta. Contacta con nosotros si lo necesitas.",
        );
        return prev;
      }

      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(formData: FormData) {
    setError(null);
    setSaved(false);
    setLoading(true);
    try {
      await updateNegocioConfig(formData);
      setSaved(true);
      toast.success("Configuración guardada.");
      router.refresh();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "No se pudo guardar la configuración.",
      );
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-slate-300 px-3 py-2.5 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500";

  return (
    <form action={handleSubmit} className="space-y-6">
      {Array.from(idiomas).map((id) => (
        <input key={id} type="hidden" name="idiomas_activos" value={id} />
      ))}

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Nombre del restaurante
        </label>
        <input
          name="nombre"
          required
          defaultValue={negocio.nombre}
          className={inputClass}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Eslogan (aparece bajo el logo en la carta)
        </label>
        <input
          name="tagline"
          defaultValue={negocio.tagline ?? ""}
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Teléfono
          </label>
          <input
            name="telefono"
            defaultValue={negocio.telefono ?? ""}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Email de contacto
          </label>
          <input
            name="email"
            type="email"
            defaultValue={negocio.email ?? ""}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Dirección
        </label>
        <input
          name="direccion"
          defaultValue={negocio.direccion ?? ""}
          className={inputClass}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Logo
        </label>
        <div className="flex items-center gap-4">
          {logoPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoPreview}
              alt="Logo actual"
              className="h-16 w-16 object-contain rounded-lg border border-slate-200 bg-slate-50 p-1"
            />
          ) : (
            <div className="h-16 w-16 rounded-lg border border-dashed border-slate-300 bg-slate-50" />
          )}
          <input
            name="logo"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleLogoChange}
            className="text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium hover:file:bg-slate-200"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Colores de la carta
        </label>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <span className="block text-xs text-slate-500 mb-1">Fondo</span>
            <input
              name="color_fondo"
              type="color"
              defaultValue={negocio.color_fondo ?? "#faf5ec"}
              className="h-10 w-full rounded-lg border border-slate-300 cursor-pointer"
            />
          </div>
          <div>
            <span className="block text-xs text-slate-500 mb-1">Cabecera</span>
            <input
              name="color_header"
              type="color"
              defaultValue={negocio.color_header ?? "#101b2d"}
              className="h-10 w-full rounded-lg border border-slate-300 cursor-pointer"
            />
          </div>
          <div>
            <span className="block text-xs text-slate-500 mb-1">Acento</span>
            <input
              name="color_acento"
              type="color"
              defaultValue={negocio.color_acento ?? "#b8863b"}
              className="h-10 w-full rounded-lg border border-slate-300 cursor-pointer"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Idiomas activos
        </label>
        <p className="text-xs text-slate-500 mb-2">
          Español incluido siempre, más los idiomas que tengas contratados.
          ¿Necesitas alguno más? Contacta con nosotros.
        </p>
        <div className="flex flex-wrap gap-2">
          {IDIOMAS.map((idioma) => {
            const activo = idiomas.has(idioma.id);
            const bloqueado =
              !activo && idioma.id !== "es" && !idiomasPermitidos.has(idioma.id);
            return (
              <button
                key={idioma.id}
                type="button"
                onClick={() => toggleIdioma(idioma.id)}
                disabled={bloqueado}
                title={
                  bloqueado
                    ? "Este idioma no está incluido en tu cuenta. Contacta con nosotros para añadirlo."
                    : undefined
                }
                className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                  activo
                    ? "bg-indigo-50 text-indigo-700 border-indigo-300"
                    : bloqueado
                      ? "bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed"
                      : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"
                }`}
              >
                {idioma.label}
              </button>
            );
          })}
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
      {saved && (
        <p className="text-sm text-emerald-700">Guardado correctamente.</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full sm:w-auto rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 text-base font-medium shadow-sm transition-colors disabled:opacity-50"
      >
        {loading ? "Guardando..." : "Guardar cambios"}
      </button>
    </form>
  );
}
