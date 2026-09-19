import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const securityHeaders = [
  // Evita que el navegador intente adivinar el tipo de un archivo servido
  // (por ejemplo, un logo subido a Storage con la extensión "equivocada").
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Nada en la app necesita ir dentro de un <iframe> de otro sitio.
  { key: 'X-Frame-Options', value: 'DENY' },
  // No filtra la URL completa (con posibles query params) a sitios externos
  // cuando el usuario sigue un enlace saliente.
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Desactiva por defecto APIs sensibles que la app no usa.
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  },
  // El dominio solo se sirve por HTTPS; le decimos al navegador que lo
  // recuerde y no intente nunca HTTP plano.
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
];

const nextConfig: NextConfig = {
  experimental: {
    // Por defecto Next.js limita el cuerpo de una Server Action a 1MB,
    // lo que bloquea (con un error de red genérico, no un mensaje claro)
    // subir un logo normal. Lo subimos a un tamaño razonable para imágenes.
    serverActions: {
      bodySizeLimit: '8mb',
    },
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

// Sube sourcemaps a Sentry en el build de Vercel para que los stack
// traces de producción se vean con el código real (no minificado).
// Sin SENTRY_AUTH_TOKEN configurado (org/proyecto en sentry.io), esto
// simplemente no sube nada -- no rompe el build ni bloquea el deploy.
export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: true,
  disableLogger: true,
  widenClientFileUpload: true,
  // El panel del restaurante y el público no necesitan que el SDK de
  // Sentry pase por el tunneling de /monitoring -- lo dejamos simple.
  tunnelRoute: false,
});
