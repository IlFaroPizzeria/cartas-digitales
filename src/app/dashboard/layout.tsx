import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Nav from "./Nav";
import ToastProvider from "@/components/ui/ToastProvider";
import { registrarNegocio } from "@/app/registro/actions";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  let { data: negocio } = await supabase
    .from("negocios")
    .select("nombre, activo")
    .eq("owner_id", user.id)
    .maybeSingle();

  // Si viene de /registro pero Supabase exigió confirmar el email antes de
  // dar sesión, el negocio no se pudo crear en su momento: lo creamos
  // ahora, la primera vez que entra ya logueado.
  if (!negocio) {
    const nombrePendiente = user.user_metadata?.negocio_nombre as
      string | undefined;
    if (nombrePendiente) {
      await registrarNegocio(nombrePendiente);
      const { data: negocioCreado } = await supabase
        .from("negocios")
        .select("nombre, activo")
        .eq("owner_id", user.id)
        .maybeSingle();
      negocio = negocioCreado;
    }
  }

  const { data: admin } = await supabase
    .from("admins")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  return (
    <ToastProvider>
      <div className="min-h-screen bg-slate-100">
        <Nav nombreNegocio={negocio?.nombre ?? "Panel"} isAdmin={!!admin} />
        {negocio && !negocio.activo && (
          <div className="bg-amber-50 border-b border-amber-200">
            <div className="max-w-3xl mx-auto px-4 py-2.5 text-sm text-amber-800">
              Tu carta está pendiente de aprobación. Puedes configurarla
              mientras tanto — te avisaremos en cuanto esté activa y visible al
              público.
            </div>
          </div>
        )}
        <main className="max-w-3xl mx-auto px-4 py-6">{children}</main>
      </div>
    </ToastProvider>
  );
}
