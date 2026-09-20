'use client'

import { useActionState, useMemo, useState } from 'react'
import { enviarSolicitudPresupuesto, type QuoteFormState } from './actions'

const initialState: QuoteFormState = null

// Mismos planes y precios que la calculadora de /precios (ver
// src/components/landing/LandingScript.tsx) -- si cambian ahí, cambian
// también aquí para que ambas páginas digan siempre lo mismo.
type PlanId = 'admin' | 'qr' | 'nfc'

const PLANS: Record<PlanId, { label: string; price: number; incluyeNfc: boolean; incluyeDigitalizacion: boolean }> = {
  admin: { label: 'Solo plataforma', price: 25, incluyeNfc: false, incluyeDigitalizacion: false },
  qr: { label: 'Digitalización + QR', price: 30, incluyeNfc: false, incluyeDigitalizacion: true },
  nfc: { label: 'Digitalización + NFC', price: 30, incluyeNfc: true, incluyeDigitalizacion: true },
}

const ENTRADA_FEE = 50
const MENU_TIER_THRESHOLD = 30
const MENU_BASE = 20
const MENU_DISCOUNT = 18
const REVIEW_TIER_THRESHOLD = 5
const REVIEW_BASE = 30
const REVIEW_DISCOUNT = 25

function tierPrice(qty: number, base: number, discounted: number, threshold: number) {
  if (qty <= 0) return 0
  return qty * (qty >= threshold ? discounted : base)
}

export default function QuotePresupuestoForm() {
  const [state, formAction, pending] = useActionState(enviarSolicitudPresupuesto, initialState)
  const [plan, setPlan] = useState<PlanId>('qr')
  const [tarjetasMenu, setTarjetasMenu] = useState(6)
  const [tarjetasResenas, setTarjetasResenas] = useState(1)

  const planInfo = PLANS[plan]
  const entrada = planInfo.incluyeDigitalizacion ? ENTRADA_FEE : 0

  const nfcTotal = useMemo(() => {
    if (!planInfo.incluyeNfc) return 0
    const menuCost = tierPrice(tarjetasMenu, MENU_BASE, MENU_DISCOUNT, MENU_TIER_THRESHOLD)
    const reviewCost = tierPrice(tarjetasResenas, REVIEW_BASE, REVIEW_DISCOUNT, REVIEW_TIER_THRESHOLD)
    return menuCost + reviewCost
  }, [planInfo.incluyeNfc, tarjetasMenu, tarjetasResenas])

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

      <div className="quote-field">
        <label id="quote-plan-label">Plan</label>
        <div className="quote-plan-group" role="radiogroup" aria-labelledby="quote-plan-label">
          {(Object.keys(PLANS) as PlanId[]).map((id) => (
            <button
              key={id}
              type="button"
              className={`quote-plan-btn ${plan === id ? 'active' : ''}`}
              role="radio"
              aria-checked={plan === id}
              onClick={() => setPlan(id)}
            >
              <span>
                <span className="qp-name">{PLANS[id].label}</span>
                {PLANS[id].incluyeDigitalizacion && <span className="qp-sub">+ {ENTRADA_FEE}€ de entrada, pago único</span>}
              </span>
              <span className="qp-price mono">{PLANS[id].price}€/mes</span>
            </button>
          ))}
        </div>
      </div>

      {planInfo.incluyeNfc && (
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
              <div className="qs-label">Tarjetas NFC de reseñas de Google</div>
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
        </div>
      )}

      <div className="calc-total">
        <span className="t-label">{planInfo.label}</span>
        <span className="t-amount mono">{planInfo.price}€/mes</span>
      </div>
      {entrada > 0 && (
        <div className="calc-sub">
          <span>+ Entrada (digitalización)</span>
          <span className="mono">{entrada}€ pago único</span>
        </div>
      )}
      {planInfo.incluyeNfc && nfcTotal > 0 && (
        <div className="calc-sub">
          <span>+ Tarjetas NFC</span>
          <span className="mono">{nfcTotal}€ pago único</span>
        </div>
      )}

      <input type="hidden" name="plan" value={plan} />
      <input type="hidden" name="tarjetasMenu" value={planInfo.incluyeNfc ? tarjetasMenu : 0} />
      <input type="hidden" name="tarjetasResenas" value={planInfo.incluyeNfc ? tarjetasResenas : 0} />

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
