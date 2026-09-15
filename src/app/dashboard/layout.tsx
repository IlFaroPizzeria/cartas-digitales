import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import LogoutButton from './LogoutButton'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="bg-white border-b border-zinc-200">
        <nav className="max-w-md mx-auto flex items-center justify-between px-4 py-3 text-sm font-medium text-zinc-600">
          <div className="flex gap-4">
            <Link href="/dashboard" className="hover:text-zinc-900">
              Mi carta
            </Link>
            <Link href="/dashboard/categorias" className="hover:text-zinc-900">
              Categorías
            </Link>
            <Link href="/dashboard/configuracion" className="hover:text-zinc-900">
              Configuración
            </Link>
          </div>
          <LogoutButton compact />
        </nav>
      </header>
      <main className="px-4 py-6">{children}</main>
    </div>
  )
}
