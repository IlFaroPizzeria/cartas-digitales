'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import LogoutButton from './LogoutButton'

const LINKS = [
  { href: '/dashboard', label: 'Mi carta' },
  { href: '/dashboard/categorias', label: 'Categorías' },
  { href: '/dashboard/configuracion', label: 'Configuración' },
]

export default function Nav({
  nombreNegocio,
  isAdmin,
}: {
  nombreNegocio: string
  isAdmin: boolean
}) {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-slate-200">
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-2 min-w-0">
            <span className="flex items-center justify-center h-8 w-8 rounded-lg bg-indigo-600 text-white text-sm font-semibold shrink-0">
              {nombreNegocio.charAt(0).toUpperCase() || 'R'}
            </span>
            <span className="text-sm font-semibold text-slate-900 truncate">{nombreNegocio}</span>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            {isAdmin && (
              <Link
                href="/admin"
                className="text-sm font-medium text-slate-500 hover:text-slate-900"
              >
                Panel admin
              </Link>
            )}
            <LogoutButton compact />
          </div>
        </div>
        <nav className="flex gap-5 -mb-px overflow-x-auto">
          {LINKS.map((link) => {
            const active = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`whitespace-nowrap text-sm font-medium py-2.5 border-b-2 transition-colors ${
                  active
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
