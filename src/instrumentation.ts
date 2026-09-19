// Punto de entrada que usa Next.js para inicializar cosas antes de
// que arranque cada runtime (ver https://nextjs.org/docs/app/api-reference/file-conventions/instrumentation).
// Aquí solo cargamos la configuración de Sentry que corresponda según
// el runtime -- Node para Server Components/Actions, Edge para
// middleware si lo hubiera. La configuración del cliente vive en
// instrumentation-client.ts (Next.js la reconoce automáticamente por
// el nombre del archivo, no hace falta importarla desde aquí).
import * as Sentry from '@sentry/nextjs'

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('../sentry.server.config')
  }
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('../sentry.edge.config')
  }
}

// Captura errores de Server Components / Route Handlers que Next.js
// no pasaría por ningún error.tsx (por ejemplo, errores durante el
// streaming de una respuesta ya empezada).
export const onRequestError = Sentry.captureRequestError
