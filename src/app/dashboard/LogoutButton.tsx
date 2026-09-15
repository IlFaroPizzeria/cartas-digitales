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
      <button onClick={handleLogout} className="text-sm font-medium text-red-600 hover:text-red-700">
        Cerrar sesión
      </button>
    )
  }

  return (
    <button
      onClick={handleLogout}
      className="w-full rounded-lg border border-zinc-300 py-2.5 text-sm font-medium text-zinc-700"
    >
      Cerrar sesión
    </button>
  )
}
