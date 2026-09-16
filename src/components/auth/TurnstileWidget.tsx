'use client'

import { useEffect, useRef, useState } from 'react'
import Script from 'next/script'

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string
          callback: (token: string) => void
          'expired-callback'?: () => void
          'error-callback'?: () => void
        }
      ) => string
      reset: (widgetId?: string) => void
      remove: (widgetId?: string) => void
    }
  }
}

// Widget de Cloudflare Turnstile (control de bots) para registro/login.
// Si no hay NEXT_PUBLIC_TURNSTILE_SITE_KEY configurada, no renderiza
// nada -- el formulario que lo usa debe tratar ese caso como "control de
// bots desactivado" y dejar enviar igualmente (se valida en el servidor
// con el mismo criterio, ver src/lib/turnstile.ts).
export default function TurnstileWidget({
  onVerify,
}: {
  onVerify: (token: string | null) => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [scriptListo, setScriptListo] = useState(false)
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

  useEffect(() => {
    if (!scriptListo || !siteKey || !ref.current || !window.turnstile) return

    const widgetId = window.turnstile.render(ref.current, {
      sitekey: siteKey,
      callback: (token: string) => onVerify(token),
      'expired-callback': () => onVerify(null),
      'error-callback': () => onVerify(null),
    })

    return () => {
      window.turnstile?.remove(widgetId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scriptListo, siteKey])

  if (!siteKey) return null

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="afterInteractive"
        onLoad={() => setScriptListo(true)}
      />
      <div ref={ref} className="flex justify-center" />
    </>
  )
}
