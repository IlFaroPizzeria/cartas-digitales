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
      <div className="min-h-screen bg-slate-100">
        <header className="sticky top-0 z-10 bg-slate-900 border-b border-slate-800">
          <div className="max-w-4xl mx-auto px-4">
            <div className="flex items-center justify-between h-14">
              <div className="flex items-center gap-2 min-w-0">
                <span className="flex items-center justify-center h-8 w-8 rounded-lg bg-indigo-500 text-white text-sm font-semibold shrink-0">
                  A
                </span>
                <span className="text-sm font-semibold text-white truncate">
                  Panel de administrador
                </span>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <Link
                  href="/admin/auditoria"
                  className="text-sm font-medium text-slate-400 hover:text-white"
                >
                  Auditoría
                </Link>
                <Link
                  href="/dashboard"
                  className="text-sm font-medium text-slate-400 hover:text-white"
                >
                  Mi restaurante
                </Link>
                <LogoutButton compact />
              </div>
            </div>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 py-6">{children}</main>
      </div>
    </ToastProvider>
  );
}
