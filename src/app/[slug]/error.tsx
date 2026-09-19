'use client'

// Si algo falla al pintar la carta de un restaurante concreto (por
// ejemplo un dato inesperado de Supabase), esta pantalla sustituye al
// error genérico de Next.js -- con los colores por defecto de Cartoca,
// ya que en este punto no tenemos garantizado poder leer los del
// negocio -- y reporta el fallo a Sentry para enterarnos sin depender
// de que el restaurante nos escriba.
import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'

export default function ErrorCarta({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        padding: '2rem',
        textAlign: 'center',
        backgroundColor: '#faf5ec',
        color: '#22303f',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <p style={{ fontSize: '1.125rem', fontWeight: 600 }}>
        No hemos podido cargar esta carta.
      </p>
      <p style={{ color: '#6b7280', maxWidth: '26rem' }}>
        Ya lo hemos registrado. Prueba a recargar en unos segundos.
      </p>
      <button
        onClick={reset}
        style={{
          marginTop: '0.5rem',
          padding: '0.5rem 1.25rem',
          borderRadius: '9999px',
          backgroundColor: '#101b2d',
          color: '#faf5ec',
          fontSize: '0.875rem',
          fontWeight: 600,
        }}
      >
        Reintentar
      </button>
    </div>
  )
}
