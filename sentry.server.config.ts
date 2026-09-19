// Configuración de Sentry para el runtime de servidor (Node) de
// Next.js: Server Components, Server Actions, Route Handlers. Se
// activa solo si hay DSN configurado (NEXT_PUBLIC_SENTRY_DSN en
// Vercel), así que en local, sin la variable puesta, no manda nada.
// Usamos el mismo DSN "público" en cliente/servidor/edge a propósito:
// el DSN de Sentry no es un secreto (está pensado para ir en el
// bundle del navegador), así que no hace falta duplicar variables.
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.VERCEL_ENV || process.env.NODE_ENV,
  // 100% de los errores, pero solo una muestra pequeña de trazas de
  // rendimiento -- de sobra para una app de este tamaño y para no
  // gastar la cuota gratuita de Sentry en tracing que no necesitamos.
  tracesSampleRate: 0.1,
  // No hay session replay activado: la carta pública no debe grabar
  // nada de la pantalla de nadie.
})
