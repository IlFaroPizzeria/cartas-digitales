import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Por defecto Next.js limita el cuerpo de una Server Action a 1MB,
    // lo que bloquea (con un error de red genérico, no un mensaje claro)
    // subir un logo normal. Lo subimos a un tamaño razonable para imágenes.
    serverActions: {
      bodySizeLimit: '8mb',
    },
  },
};

export default nextConfig;
