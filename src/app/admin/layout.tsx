import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/app/dashboard/LogoutButton";
import ToastProvider from "@/components/ui/ToastProvider";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: admin } = await supabase
    .from("admins")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!admin) redirect("/dashboard");

  return (
    <ToastProvider>
      {/* Mismo lenguaje visual que el panel del restaurante (/dashboard):
          fondo de manchas difuminadas con cristal esmerilado encima. Antes
          esta zona era la única con cabecera azul oscura y tarjetas blancas
          planas, y al entrar parecía otra aplicación distinta. */}
      <div className="min-h-screen relative">
        <div className="panel-mesh" />
        <div className="relative z-[1]">
          <header className="sticky top-0 z-30 glass-chrome rounded-none border-x-0 border-t-0">
            <div className="max-w-4xl mx-auto px-4">
              <div className="flex items-center justify-between h-14 gap-2">
                <Link
                  href="/admin"
                  className="flex items-center gap-2.5 min-w-0"
                >
                  <span
                    className="flex items-center justify-center h-9 w-9 rounded-xl text-white shrink-0"
                    style={{
                      background:
                        "linear-gradient(150deg, #4fa8ff, var(--brand))",
                      boxShadow: "0 6px 16px rgba(10,132,255,0.35)",
                    }}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5"
                    >
                      <path d="M12 3 4 6.5v5c0 4.7 3.2 8.4 8 9.5 4.8-1.1 8-4.8 8-9.5v-5L12 3Z" />
                    </svg>
                  </span>
                  <span className="text-sm font-semibold text-slate-900 truncate">
                    <span className="hidden sm:inline">
                      Panel de administrador
                    </span>
                    <span className="sm:hidden">Admin</span>
                  </span>
                </Link>
                <div className="flex items-center gap-0.5 shrink-0">
                  <Link
                    href="/admin/auditoria"
                    className="rounded-lg px-2.5 py-2 text-sm font-medium text-slate-600 hover:bg-black/[0.05] hover:text-slate-900 transition-colors"
                  >
                    Auditoría
                  </Link>
                  <Link
                    href="/dashboard"
                    className="rounded-lg px-2.5 py-2 text-sm font-medium text-slate-600 hover:bg-black/[0.05] hover:text-slate-900 transition-colors"
                  >
                    <span className="hidden sm:inline">Mi restaurante</span>
                    <span className="sm:hidden">Mi carta</span>
                  </Link>
                  <LogoutButton icon />
                </div>
              </div>
            </div>
          </header>
          <main className="max-w-4xl mx-auto px-4 py-6">{children}</main>
        </div>
      </div>
    </ToastProvider>
  );
}
