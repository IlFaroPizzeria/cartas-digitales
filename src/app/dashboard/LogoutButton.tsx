'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LogoutButton({ compact = false }: { compact?: boolean }) {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  if (compact) {
    return (
      <button
        onClick={handleLogout}
        className="text-sm font-medium text-slate-500 hover:text-red-600 transition-colors"
      >
        Cerrar sesión
      </button>
    )
  }

  return (
    <button
      onClick={handleLogout}
      className="w-full rounded-lg border border-slate-300 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
    >
      Cerrar sesión
    </button>
  )
}
