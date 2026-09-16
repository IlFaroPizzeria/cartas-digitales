import Link from 'next/link'

export default function FinalCtaBand() {
  return (
    <section className="section" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <div className="final-cta">
          <div className="blob" />
          <div>
            <h2>¿Hablamos de la carta de tu restaurante?</h2>
            <p>Cuéntanos cómo es tu carta ahora y te decimos exactamente cómo quedaría en Cartoca.</p>
          </div>
          <Link className="btn btn-primary" href="/contacto">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
            Solicitar presupuesto
          </Link>
        </div>
      </div>
    </section>
  )
}
