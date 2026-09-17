'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import LogoutButton from './LogoutButton'

const LINKS = [
  {
    href: '/dashboard',
    label: 'Mi carta',
    mobileLabel: 'Carta',
    match: (p: string) => p === '/dashboard' || p.startsWith('/dashboard/platos'),
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5V6a2 2 0 0 1 2-2h9.5L20 8.5V19.5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1Z" />
        <path d="M15.5 4v3.5a1 1 0 0 0 1 1H20" />
        <path d="M8 12h8M8 15.5h8M8 8.5h4" />
      </svg>
    ),
  },
  {
    href: '/dashboard/categorias',
    label: 'Categorías',
    mobileLabel: 'Categorías',
    match: (p: string) => p.startsWith('/dashboard/categorias'),
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 7a2 2 0 0 1 2-2h4.17a2 2 0 0 1 1.41.59l1.83 1.82a2 2 0 0 0 1.42.59H19a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />
      </svg>
    ),
  },
  {
    href: '/dashboard/configuracion',
    label: 'Configuración',
    mobileLabel: 'Ajustes',
    match: (p: string) => p.startsWith('/dashboard/configuracion'),
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
      </svg>
    ),
  },
  {
    href: '/dashboard/cuenta',
    label: 'Mi cuenta',
    mobileLabel: 'Cuenta',
    match: (p: string) => p.startsWith('/dashboard/cuenta'),
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="3.5" />
        <path d="M4.5 20c1.4-3.2 4.2-5 7.5-5s6.1 1.8 7.5 5" />
      </svg>
    ),
  },
]

function BrandBlock({ nombreNegocio, slug }: { nombreNegocio: string; slug: string | null }) {
  return (
    <div className="px-5 pt-5 pb-4 border-b border-slate-800">
      <div className="flex items-center gap-2.5 min-w-0">
        <span className="flex items-center justify-center h-9 w-9 rounded-lg bg-indigo-500 text-white text-sm font-semibold shrink-0">
          {nombreNegocio.charAt(0).toUpperCase() || 'R'}
        </span>
        <span className="text-sm font-semibold text-white truncate">{nombreNegocio}</span>
      </div>
      {slug && (
        <a
          href={`https://cartoca.es/${slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 flex items-center gap-1.5 text-xs font-medium text-indigo-400 hover:text-indigo-300"
        >
          Ver mi carta pública
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
            <path d="M7 17 17 7M8 7h9v9" />
          </svg>
        </a>
      )}
    </div>
  )
}

function NavLinks({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname()
  return (
    <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
      {LINKS.map((link) => {
        const active = link.match(pathname)
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              active
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
            }`}
          >
            <span className={`h-5 w-5 shrink-0 ${active ? 'text-indigo-400' : 'text-slate-500'}`}>
              {link.icon}
            </span>
            {link.label}
          </Link>
        )
      })}
      <Link
        href="/dashboard/estadisticas"
        className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors mt-2 border-t border-slate-800 pt-4 ${
          pathname.startsWith("/dashboard/estadisticas")
            ? "bg-slate-800 text-white"
            : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
        }`}
      >
        <span className={`h-5 w-5 shrink-0 ${pathname.startsWith("/dashboard/estadisticas") ? "text-indigo-400" : "text-slate-500"}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19V5M10 19V9M16 19v-6M22 19H2" />
          </svg>
        </span>
        Estadísticas
      </Link>

      {isAdmin && (
        <Link
          href="/admin"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-slate-800/60 hover:text-white mt-2"
        >
          <span className="h-5 w-5 shrink-0 text-slate-500">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3 4 6.5v5c0 4.7 3.2 8.4 8 9.5 4.8-1.1 8-4.8 8-9.5v-5L12 3Z" />
            </svg>
          </span>
          Panel admin
        </Link>
      )}
    </nav>
  )
}

// Barra de pestañas fija abajo, pensada para manejar la carta desde el
// móvil con el pulgar: siempre visible, sin menús ocultos que encontrar.
function BottomNav() {
  const pathname = usePathname()
  return (
    <nav
      className="lg:hidden fixed inset-x-0 bottom-0 z-30 bg-slate-900 border-t border-slate-800"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="grid grid-cols-4">
        {LINKS.map((link) => {
          const active = link.match(pathname)
          return (
            <Link
              key={link.href}
              href={link.href}
              className="flex flex-col items-center justify-center gap-0.5 py-2 min-w-0"
            >
              <span className={`h-5 w-5 shrink-0 ${active ? 'text-indigo-400' : 'text-slate-500'}`}>
                {link.icon}
              </span>
              <span
                className={`text-[10.5px] font-medium leading-tight truncate max-w-full px-0.5 ${
                  active ? 'text-indigo-400' : 'text-slate-500'
                }`}
              >
                {link.mobileLabel}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export default function Sidebar({
  nombreNegocio,
  slug,
  isAdmin,
}: {
  nombreNegocio: string
  slug: string | null
  isAdmin: boolean
}) {
  return (
    <>
      {/* Sidebar fija en escritorio */}
      <aside className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:bg-slate-900 lg:border-r lg:border-slate-800 lg:z-20">
        <BrandBlock nombreNegocio={nombreNegocio} slug={slug} />
        <NavLinks isAdmin={isAdmin} />
        <div className="px-3 py-4 border-t border-slate-800">
          <LogoutButton />
        </div>
      </aside>

      {/* Cabecera compacta en móvil: marca + accesos rápidos. La navegación
          principal vive en la barra de pestañas de abajo (BottomNav), no
          aquí, para que nunca quede escondida en un menú. */}
      <header className="lg:hidden sticky top-0 z-30 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-2 min-w-0">
            <span className="flex items-center justify-center h-8 w-8 rounded-lg bg-indigo-500 text-white text-sm font-semibold shrink-0">
              {nombreNegocio.charAt(0).toUpperCase() || 'R'}
            </span>
            <span className="text-sm font-semibold text-white truncate">{nombreNegocio}</span>
          </div>
          <div className="flex items-center gap-0.5 shrink-0">
            {slug && (
              <a
                href={`https://cartoca.es/${slug}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Ver mi carta pública"
                title="Ver mi carta pública"
                className="flex items-center justify-center h-9 w-9 rounded-lg text-slate-400 hover:bg-white/10 hover:text-white"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                  <path d="M7 17 17 7M8 7h9v9" />
                </svg>
              </a>
            )}
            {isAdmin && (
              <Link
                href="/admin"
                aria-label="Panel admin"
                title="Panel admin"
                className="flex items-center justify-center h-9 w-9 rounded-lg text-slate-400 hover:bg-white/10 hover:text-white"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                  <path d="M12 3 4 6.5v5c0 4.7 3.2 8.4 8 9.5 4.8-1.1 8-4.8 8-9.5v-5L12 3Z" />
                </svg>
              </Link>
            )}
            <LogoutButton icon />
          </div>
        </div>
      </header>

      <BottomNav />
    </>
  )
}
