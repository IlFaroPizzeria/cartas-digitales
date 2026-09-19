// Configuración de Sentry para el navegador. Next.js reconoce este
// archivo por su nombre y lo carga automáticamente antes de que la
// app arranque en el cliente -- no hace falta importarlo desde
// ningún sitio. Ver sentry.server.config.ts para el resto de
// criterios (DSN público, sample rate, etc.).
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.VERCEL_ENV || process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  // Sin session replay: nadie que abra una carta o el panel de un
  // restaurante debe tener su pantalla grabada.
})

// Requerido por Sentry para instrumentar la navegación entre páginas
// (App Router) y poder relacionar errores de cliente con la ruta en
// la que ocurrieron.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
