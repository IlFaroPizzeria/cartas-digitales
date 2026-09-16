"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const LINKS = [
  { href: "/producto", label: "Producto" },
  { href: "/precios", label: "Precios" },
  { href: "/preguntas", label: "Preguntas" },
  { href: "/contacto", label: "Contacto" },
];

// Enlace al panel de restaurantes (/login, mismo dominio). Se separa de
// LINKS porque no es contenido de la landing, sino una acción -- lleva su
// propio estilo en el nav para que se note que es "entrar", no "navegar".
const PORTAL_LINK = { href: "/login", label: "Portal de clientes" };

export default function LandingNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <nav className="nav">
      <div className="wrap nav-row">
        <Link href="/" className="brand" onClick={() => setOpen(false)}>
          <span className="brand-mark">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
            >
              <path d="M4 11a8 8 0 0 1 16 0" />
              <path d="M8 11a4 4 0 0 1 8 0" />
              <circle cx="12" cy="11" r="1" fill="currentColor" stroke="none" />
              <path d="M12 15v5" />
            </svg>
          </span>
          Cartoca
        </Link>
        <div className="nav-links">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={pathname === l.href ? "active" : ""}
            >
              {l.label}
            </Link>
          ))}
        </div>
        <div className="nav-actions">
          <Link className="nav-portal-link" href={PORTAL_LINK.href}>
            {PORTAL_LINK.label}
          </Link>
          <Link className="btn btn-ghost btn-sm" href="/precios">
            Ver precios
          </Link>
          <Link className="btn btn-primary btn-sm" href="/contacto">
            Habla con nosotros
          </Link>
          <button
            type="button"
            className="nav-toggle"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
            >
              {open ? (
                <path d="M6 6l12 12M18 6L6 18" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>
        </div>
      </div>
      {open && (
        <div className="nav-mobile">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className={pathname === l.href ? "active" : ""}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href={PORTAL_LINK.href}
            onClick={() => setOpen(false)}
            className={pathname === PORTAL_LINK.href ? "active" : ""}
          >
            {PORTAL_LINK.label}
          </Link>
        </div>
      )}
    </nav>
  );
}
