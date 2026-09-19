'use client'

// Red de seguridad de última instancia: solo se activa si algo revienta
// tan arriba que ni siquiera el layout raíz puede pintarse (por eso
// trae su propio <html>/<body>, sustituye a layout.tsx por completo
// mientras se muestra). Next.js exige que exista este archivo para que
// Sentry pueda instrumentar errores a este nivel
// (https://docs.sentry.io/platforms/javascript/guides/nextjs/).
import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string }
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html lang="es">
      <body
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.75rem',
          fontFamily: 'system-ui, sans-serif',
          textAlign: 'center',
          padding: '2rem',
        }}
      >
        <p style={{ fontSize: '1.125rem', fontWeight: 600 }}>
          Algo ha ido mal.
        </p>
        <p style={{ color: '#6b7280', maxWidth: '28rem' }}>
          Ya lo hemos registrado. Prueba a recargar la página en unos
          minutos.
        </p>
      </body>
    </html>
  )
}
