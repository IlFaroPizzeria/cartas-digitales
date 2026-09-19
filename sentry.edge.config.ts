// Configuración de Sentry para el runtime "edge" de Next.js
// (middleware, si alguna vez se añade uno). Mismo criterio que
// sentry.server.config.ts: ver ese archivo para más contexto.
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.VERCEL_ENV || process.env.NODE_ENV,
  tracesSampleRate: 0.1,
})
