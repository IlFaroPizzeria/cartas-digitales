import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ActivarButton from "./ActivarButton";
import EliminarRestauranteButton from "./EliminarRestauranteButton";

export default async function AdminPage() {
  const supabase = await createClient();

  const { data: negocios } = await supabase
    .from("negocios")
    .select("id, nombre, slug, activo, suspendido, plan, owner_id, idiomas_permitidos")
    .order("id", { ascending: true });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Restaurantes</h1>
          <p className="text-sm text-slate-500">
            {negocios?.length ?? 0} en la plataforma
          </p>
        </div>
        <Link
          href="/admin/restaurantes/nuevo"
          className="rounded-lg bg-brand hover:bg-brand-dark text-white text-sm font-medium px-4 py-2.5 shadow-sm transition-colors shrink-0"
        >
          + Crear restaurante
        </Link>
      </div>

      <div className="glass-card rounded-2xl divide-y divide-black/[0.06] overflow-hidden">
        {(negocios ?? []).map((n) => (
          <div
            key={n.id}
            className="flex items-center justify-between gap-3 p-4 flex-wrap transition-colors hover:bg-white/50"
          >
            <div className="min-w-0">
              <p className="text-[15px] font-medium text-slate-900">
                {n.nombre}
              </p>
              <p className="text-sm text-slate-500">/{n.slug}</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {n.suspendido && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full border bg-red-50 text-red-700 border-red-200">
                  Suspendido
                </span>
              )}
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                  n.activo
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : n.owner_id
                      ? "bg-amber-50 text-amber-700 border-amber-200"
                      : "bg-slate-100 text-slate-600 border-slate-300"
                }`}
              >
                {n.activo ? "Activo" : n.owner_id ? "Pendiente" : "Inactivo"}
              </span>
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                  n.owner_id
                    ? "bg-brand/10 text-brand-dark border-brand/30"
                    : "bg-amber-50 text-amber-700 border-amber-200"
                }`}
              >
                {n.owner_id ? "Cuenta enlazada" : "Sin cuenta"}
              </span>
              {n.plan && (
                <span className="text-xs font-medium px-2.5 py-1 rounded-full border border-slate-200 text-slate-600">
                  {n.plan}
                </span>
              )}
              <span className="text-xs font-medium px-2.5 py-1 rounded-full border border-slate-200 text-slate-600">
                +{(n.idiomas_permitidos ?? []).length} idiomas
              </span>
              {!n.activo && n.owner_id && (
                <ActivarButton id={n.id} nombre={n.nombre} />
              )}
              <Link
                href={`/admin/restaurantes/${n.id}/editar`}
                className="text-xs font-semibold px-2.5 py-1.5 rounded-full border border-slate-300 text-slate-700 hover:bg-white/80 transition-colors"
              >
                Editar
              </Link>
              <Link
                href={`/admin/restaurantes/${n.id}/carta`}
                className="text-xs font-semibold px-2.5 py-1.5 rounded-full border border-slate-300 text-slate-700 hover:bg-white/80 transition-colors"
              >
                Carta
              </Link>
              <EliminarRestauranteButton
                id={n.id}
                nombre={n.nombre}
                slug={n.slug}
              />
            </div>
          </div>
        ))}
        {(!negocios || negocios.length === 0) && (
          <p className="p-6 text-sm text-slate-500 text-center">
            Todavía no hay restaurantes.
          </p>
        )}
      </div>
    </div>
  );
}
