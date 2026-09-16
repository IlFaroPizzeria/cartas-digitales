'use client'

import { useState, useSyncExternalStore } from 'react'
import Link from 'next/link'

const STORAGE_KEY = 'cartoca-cookie-consent'

type Consentimiento = 'all' | 'necessary' | 'rejected'

function suscribirseACambiosDeStorage(callback: () => void) {
  window.addEventListener('storage', callback)
  return () => window.removeEventListener('storage', callback)
}

function leerConsentimientoGuardado() {
  try {
    return window.localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

function leerConsentimientoEnServidor() {
  // En el servidor no existe localStorage: se asume que todavía no hay
  // consentimiento guardado, igual que verá el navegador antes de hidratar.
  return null
}

// Usamos useSyncExternalStore (en vez de leer localStorage en un efecto)
// para que React gestione correctamente el primer render en el servidor
// -- donde no existe localStorage -- y lo sincronice con el valor real en
// cuanto se hidrata en el navegador, sin provocar renders en cascada.
export default function CookieBanner() {
  const consentimientoGuardado = useSyncExternalStore(
    suscribirseACambiosDeStorage,
    leerConsentimientoGuardado,
    leerConsentimientoEnServidor
  )
  const [descartado, setDescartado] = useState(false)

  function elegir(valor: Consentimiento) {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ valor, fecha: new Date().toISOString() })
      )
    } catch {
      // Ignorado a propósito: si no se puede guardar, el aviso volverá a
      // aparecer en la siguiente visita, que es un fallo seguro razonable.
    }
    setDescartado(true)
  }

  if (consentimientoGuardado !== null || descartado) return null

  return (
    <div className="cookie-banner" role="dialog" aria-label="Aviso de cookies">
      <p>
        Usamos cookies necesarias para que Cartoca funcione (como mantener tu sesión iniciada). No
        usamos cookies de analítica ni de publicidad. Más información en nuestra{' '}
        <Link href="/privacidad">política de privacidad</Link>.
      </p>
      <div className="cookie-actions">
        <button type="button" className="cookie-btn-reject" onClick={() => elegir('rejected')}>
          No aceptar
        </button>
        <button type="button" className="cookie-btn-necessary" onClick={() => elegir('necessary')}>
          Aceptar solo necesarias
        </button>
        <button type="button" className="cookie-btn-accept" onClick={() => elegir('all')}>
          Aceptar
        </button>
      </div>
    </div>
  )
}
