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

// Punto de estado (activa/pendiente/suspendida) que se apoya en la
// esquina del avatar, y su versión con etiqueta de texto para donde hay
// sitio de sobra (sidebar de escritorio). Reutiliza datos que el layout
// ya carga (negocio.activo / negocio.suspendido): no dispara ninguna
// consulta nueva, solo los hace más visibles.
function estadoNegocio(activo: boolean | null, suspendido: boolean) {
  if (suspendido) return { color: 'bg-red-500', text: 'text-red-500', label: 'Suspendida' }
  if (activo === false) return { color: 'bg-amber-500', text: 'text-amber-600', label: 'Pendiente' }
  if (activo === true) return { color: 'bg-emerald-500', text: 'text-emerald-600', label: 'Activa' }
  return null
}

function AvatarConEstado({
  inicial,
  logoUrl,
  activo,
  suspendido,
  size = 9,
}: {
  inicial: string
  // Logo real del restaurante (negocio.logo_url), el mismo que usa su
  // carta pública. Si todavía no ha subido uno, se cae en la inicial
  // sobre un degradado -- nunca se deja el avatar vacío.
  logoUrl?: string | null
  activo: boolean | null
  suspendido: boolean
  size?: 8 | 9
}) {
  const estado = estadoNegocio(activo, suspendido)
  const dimensiones = size === 9 ? 'h-9 w-9' : 'h-8 w-8'
  return (
    <span className={`relative shrink-0 ${dimensiones}`}>
      {logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logoUrl}
          alt=""
          className={`${dimensiones} rounded-xl object-cover bg-white shadow-sm`}
        />
      ) : (
        <span
          className={`flex items-center justify-center ${dimensiones} rounded-xl text-white text-sm font-semibold`}
          style={{ background: 'linear-gradient(150deg, #4fa8ff, var(--brand))', boxShadow: '0 6px 16px rgba(10,132,255,0.35)' }}
        >
          {inicial}
        </span>
      )}
      {estado && (
        <span
          className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white ${estado.color}`}
          aria-hidden="true"
        />
      )}
    </span>
  )
}

function BrandBlock({
  nombreNegocio,
  slug,
  logoUrl,
  activo,
  suspendido,
}: {
  nombreNegocio: string
  slug: string | null
  logoUrl: string | null
  activo: boolean | null
  suspendido: boolean
}) {
  const estado = estadoNegocio(activo, suspendido)
  return (
    <div className="glass-card rounded-2xl px-5 pt-5 pb-4">
      <div className="flex items-center gap-2.5 min-w-0">
        <AvatarConEstado inicial={nombreNegocio.charAt(0).toUpperCase() || 'R'} logoUrl={logoUrl} activo={activo} suspendido={suspendido} />
        <div className="min-w-0">
          <span className="text-sm font-semibold text-slate-900 truncate block">{nombreNegocio}</span>
          {estado && (
            <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium ${estado.text}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${estado.color}`} />
              {estado.label}
            </span>
          )}
        </div>
      </div>
      {slug && (
        <a
          href={`https://cartoca.es/${slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 flex items-center gap-1.5 text-xs font-medium text-brand hover:text-brand-dark"
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
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
              active
                ? 'bg-brand text-white shadow-[0_6px_18px_rgba(10,132,255,0.35)]'
                : 'text-slate-600 hover:bg-black/[0.04] hover:text-slate-900'
            }`}
          >
            <span className={`h-5 w-5 shrink-0 ${active ? 'text-white' : 'text-slate-400'}`}>
              {link.icon}
            </span>
            {link.label}
          </Link>
        )
      })}
      <Link
        href="/dashboard/estadisticas"
        className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors mt-2 border-t border-black/[0.06] pt-4 ${
          pathname.startsWith("/dashboard/estadisticas")
            ? "bg-brand text-white shadow-[0_6px_18px_rgba(10,132,255,0.35)]"
            : "text-slate-600 hover:bg-black/[0.04] hover:text-slate-900"
        }`}
      >
        <span className={`h-5 w-5 shrink-0 ${pathname.startsWith("/dashboard/estadisticas") ? "text-white" : "text-slate-400"}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19V5M10 19V9M16 19v-6M22 19H2" />
          </svg>
        </span>
        Estadísticas
      </Link>

      {isAdmin && (
        <Link
          href="/admin"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-black/[0.04] hover:text-slate-900 mt-2"
        >
          <span className="h-5 w-5 shrink-0 text-slate-400">
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
// Ahora en cristal claro, a juego con el resto del panel, con una
// "pastilla" azul detrás del icono activo.
function BottomNav() {
  const pathname = usePathname()
  return (
    <nav
      className="lg:hidden fixed inset-x-0 bottom-0 z-30 glass-card rounded-t-2xl border-b-0"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="grid grid-cols-4 px-2 pt-2 pb-1.5">
        {LINKS.map((link) => {
          const active = link.match(pathname)
          return (
            <Link
              key={link.href}
              href={link.href}
              className="flex flex-col items-center justify-center gap-1 py-1.5 min-w-0"
            >
              <span
                className={`flex items-center justify-center h-9 w-9 rounded-xl transition-colors ${
                  active ? 'bg-brand/15 text-brand' : 'text-slate-400'
                }`}
              >
                <span className="h-6 w-6 shrink-0">{link.icon}</span>
              </span>
              <span
                className={`text-[11.5px] font-semibold leading-tight truncate max-w-full px-0.5 ${
                  active ? 'text-brand' : 'text-slate-500'
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
  logoUrl = null,
  isAdmin,
  activo = null,
  suspendido = false,
}: {
  nombreNegocio: string
  slug: string | null
  logoUrl?: string | null
  isAdmin: boolean
  activo?: boolean | null
  suspendido?: boolean
}) {
  return (
    <>
      {/* Sidebar fija en escritorio: se mantiene en el mismo hueco de
          siempre (ancho fijo a la izquierda), pero ahora "flota" dentro
          de ese hueco con un margen, en vez de ir a tope de borde, para
          que se lea como un panel de cristal y no como una barra sólida
          pegada al lienzo. */}
      <aside className="hidden lg:flex lg:flex-col lg:gap-3 lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:z-20 lg:p-3">
        <BrandBlock nombreNegocio={nombreNegocio} slug={slug} logoUrl={logoUrl} activo={activo} suspendido={suspendido} />
        <div className="glass-card rounded-2xl flex-1 flex flex-col min-h-0">
          <NavLinks isAdmin={isAdmin} />
          <div className="px-3 py-4 border-t border-black/[0.06]">
            <LogoutButton />
          </div>
        </div>
      </aside>

      {/* Cabecera compacta en móvil: marca + accesos rápidos. La navegación
          principal vive en la barra de pestañas de abajo (BottomNav), no
          aquí, para que nunca quede escondida en un menú. */}
      <header className="lg:hidden sticky top-0 z-30 glass-card rounded-none border-x-0 border-t-0">
        <div className="flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-2 min-w-0">
            <AvatarConEstado
              inicial={nombreNegocio.charAt(0).toUpperCase() || 'R'}
              logoUrl={logoUrl}
              activo={activo}
              suspendido={suspendido}
              size={8}
            />
            <span className="text-sm font-semibold text-slate-900 truncate">{nombreNegocio}</span>
          </div>
          <div className="flex items-center gap-0.5 shrink-0">
            {slug && (
              <a
                href={`https://cartoca.es/${slug}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Ver mi carta pública"
                title="Ver mi carta pública"
                className="flex items-center justify-center h-9 w-9 rounded-lg text-slate-500 hover:bg-black/[0.05] hover:text-slate-900"
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
                className="flex items-center justify-center h-9 w-9 rounded-lg text-slate-500 hover:bg-black/[0.05] hover:text-slate-900"
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
