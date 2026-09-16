'use client'

import Link from 'next/link'

export default function AuthTabs({ activo }: { activo: 'login' | 'registro' }) {
  return (
    <div className="flex rounded-xl bg-slate-100 p-1 mb-6">
      <Link
        href="/login"
        className={`flex-1 text-center text-sm font-medium py-2 rounded-lg transition-colors ${
          activo === 'login'
            ? 'bg-white text-slate-900 shadow-sm'
            : 'text-slate-500 hover:text-slate-700'
        }`}
      >
        Iniciar sesión
      </Link>
      <Link
        href="/registro"
        className={`flex-1 text-center text-sm font-medium py-2 rounded-lg transition-colors ${
          activo === 'registro'
            ? 'bg-white text-slate-900 shadow-sm'
            : 'text-slate-500 hover:text-slate-700'
        }`}
      >
        Registrarse
      </Link>
    </div>
  )
}
