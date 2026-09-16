'use client'

import { useActionState, useState } from 'react'
import { enviarSolicitudPresupuesto, type QuoteFormState } from './actions'

const initialState: QuoteFormState = null

export default function QuotePresupuestoForm() {
  const [state, formAction, pending] = useActionState(enviarSolicitudPresupuesto, initialState)
  const [tarjetasMenu, setTarjetasMenu] = useState(6)
  const [tarjetasResenas, setTarjetasResenas] = useState(1)
  const [accesoPlataforma, setAccesoPlataforma] = useState(false)

  return (
    <form className="quote-form" action={formAction}>
      <div className="quote-two">
        <div className="quote-field">
          <label htmlFor="restaurante">Nombre del restaurante</label>
          <input id="restaurante" name="restaurante" type="text" required placeholder="p. ej. La Caleta" />
        </div>
        <div className="quote-field">
          <label htmlFor="ciudad">Ciudad</label>
          <input id="ciudad" name="ciudad" type="text" required placeholder="p. ej. Málaga" />
        </div>
      </div>

      <div className="quote-field">
        <label htmlFor="pais">País</label>
        <input id="pais" name="pais" type="text" required placeholder="p. ej. España" />
      </div>

      <div className="quote-steppers">
        <div className="quote-stepper-row">
          <div>
            <div className="qs-label">Tarjetas NFC de menú</div>
            <div className="qs-help">20€/ud · 18€/ud a partir de 30</div>
          </div>
          <div className="stepper">
            <button type="button" aria-label="Quitar tarjeta de menú" onClick={() => setTarjetasMenu((v) => Math.max(0, v - 1))}>
              –
            </button>
            <output>{tarjetasMenu}</output>
            <button type="button" aria-label="Añadir tarjeta de menú" onClick={() => setTarjetasMenu((v) => Math.min(80, v + 1))}>
              +
            </button>
          </div>
        </div>
        <div className="quote-stepper-row">
          <div>
            <div className="qs-label">Tarjetas NFC de reseñas</div>
            <div className="qs-help">30€/ud · 25€/ud a partir de 5</div>
          </div>
          <div className="stepper">
            <button type="button" aria-label="Quitar tarjeta de reseñas" onClick={() => setTarjetasResenas((v) => Math.max(0, v - 1))}>
              –
            </button>
            <output>{tarjetasResenas}</output>
            <button type="button" aria-label="Añadir tarjeta de reseñas" onClick={() => setTarjetasResenas((v) => Math.min(30, v + 1))}>
              +
            </button>
          </div>
        </div>
        <div className="quote-stepper-row">
          <div>
            <div className="qs-label">Acceso a la plataforma</div>
            <div className="qs-help">Desde 25€/mes, según funciones</div>
          </div>
          <button
            type="button"
            className="toggle"
            role="switch"
            aria-pressed={accesoPlataforma}
            aria-label="Activar acceso a la plataforma"
            onClick={() => setAccesoPlataforma((v) => !v)}
          />
        </div>
      </div>

      <input type="hidden" name="tarjetasMenu" value={tarjetasMenu} />
      <input type="hidden" name="tarjetasResenas" value={tarjetasResenas} />
      {accesoPlataforma && <input type="hidden" name="accesoPlataforma" value="on" />}

      <div className="quote-field">
        <label htmlFor="mensaje">Mensaje (opcional)</label>
        <textarea id="mensaje" name="mensaje" placeholder="Cuéntanos lo que necesites: cuántas mesas, idiomas, plazos..." />
      </div>

      {state && (
        <div className={`quote-msg ${state.ok ? 'ok' : 'err'}`} role="status">
          {state.message}
        </div>
      )}

      <button type="submit" className="btn btn-primary btn-block" disabled={pending}>
        {pending ? 'Enviando…' : 'Enviar solicitud'}
      </button>
    </form>
  )
}
