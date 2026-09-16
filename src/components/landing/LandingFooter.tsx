import Link from 'next/link'

export default function LandingFooter() {
  return (
    <footer>
      <div className="wrap foot-grid">
        <div className="foot-brand">
          <Link href="/" className="brand">
            <span className="brand-mark">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                <path d="M4 11a8 8 0 0 1 16 0" />
                <path d="M8 11a4 4 0 0 1 8 0" />
                <circle cx="12" cy="11" r="1" fill="currentColor" stroke="none" />
                <path d="M12 15v5" />
              </svg>
            </span>
            Cartoca
          </Link>
          <p>Cartas digitales con tecnología NFC para restaurantes. Sin apps, en varios idiomas y siempre al día.</p>
        </div>
        <div className="foot-cols">
          <div className="foot-col">
            <span className="h">Producto</span>
            <Link href="/producto">Por qué Cartoca</Link>
            <Link href="/producto">Cómo funciona</Link>
            <Link href="/precios">Precios</Link>
          </div>
          <div className="foot-col">
            <span className="h">Contacto</span>
            <Link href="/contacto">Solicitar presupuesto</Link>
            <a href="mailto:hola@cartoca.es">hola@cartoca.es</a>
            <Link href="/preguntas">Preguntas frecuentes</Link>
          </div>
        </div>
      </div>
      <div className="wrap foot-bottom">
        <span>© {new Date().getFullYear()} Cartoca</span>
        <span>Hecho para restaurantes que no quieren volver a imprimir una carta</span>
      </div>
    </footer>
  )
}
