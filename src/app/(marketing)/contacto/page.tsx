import type { Metadata } from 'next'
import fs from 'node:fs'
import path from 'node:path'
import QuotePresupuestoForm from '@/components/landing/QuotePresupuestoForm'

const bodyHtml = fs.readFileSync(path.join(process.cwd(), 'src/app/contacto-body.html'), 'utf8')

const WHATSAPP = '34644090462'
const WA_MSG = 'Hola, me gustaría pedir presupuesto para la carta digital de mi restaurante.'
const waHref = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(WA_MSG)}`

export const metadata: Metadata = {
  title: 'Solicita tu presupuesto | Cartoca',
  description: 'Pide tu presupuesto por WhatsApp o rellena el formulario y te contestamos en menos de 24h.',
}

export default function ContactoPage() {
  return (
    <>
      {/* eslint-disable-next-line react/no-danger */}
      <div dangerouslySetInnerHTML={{ __html: bodyHtml.split('<!-- FUNDADOR-SPLIT -->')[0] }} />

      <section className="section reveal" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="contact-grid">
            <div className="contact-option">
              <h3>Por WhatsApp</h3>
              <p>Lo más rápido. Nos cuentas tu restaurante y te contestamos nosotros mismos, normalmente en minutos.</p>
              <a className="btn btn-primary" href={waHref} target="_blank" rel="noopener noreferrer">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.29-1.39a9.9 9.9 0 0 0 4.75 1.21h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2Zm5.8 14.09c-.25.7-1.44 1.34-1.98 1.4-.51.06-1.05.29-3.52-.74-2.98-1.24-4.89-4.25-5.04-4.45-.15-.2-1.2-1.6-1.2-3.05 0-1.45.76-2.16 1.03-2.46.27-.3.6-.37.8-.37.2 0 .4 0 .58.01.19.01.44-.07.68.52.25.6.85 2.07.92 2.22.07.15.12.33.02.53-.1.2-.15.32-.3.5-.15.17-.31.39-.44.52-.15.15-.3.31-.13.6.17.3.76 1.26 1.64 2.04 1.13 1 2.08 1.32 2.38 1.47.3.15.48.13.66-.08.18-.2.76-.88.96-1.19.2-.3.4-.25.68-.15.27.1 1.75.83 2.05.98.3.15.5.22.57.35.08.13.08.75-.17 1.45Z" />
                </svg>
                Escribir por WhatsApp
              </a>
            </div>

            <div className="contact-option">
              <h3>Con formulario</h3>
              <p>Si prefieres dejarlo todo por escrito y a tu ritmo. Te contestamos en menos de 24h.</p>
              <QuotePresupuestoForm />
            </div>
          </div>
        </div>
      </section>

      {/* eslint-disable-next-line react/no-danger */}
      <div dangerouslySetInnerHTML={{ __html: bodyHtml.split('<!-- FUNDADOR-SPLIT -->')[1] ?? '' }} />
    </>
  )
}
