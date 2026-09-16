import type { Metadata } from 'next'
import fs from 'node:fs'
import path from 'node:path'
import './landing.css'

// La landing se mantiene como HTML/CSS/JS ya verificado (nace de un artifact
// probado visualmente) y se inyecta tal cual desde ficheros hermanos en vez
// de reescribirse a mano en JSX, para evitar errores de transcripción en una
// página de más de mil líneas. El marcado y el script no dependen de estado
// de React ni de props: son autocontenidos, como un micrositio embebido.
// Si en el futuro se quiere refactorizar a componentes React "idiomáticos"
// (por ejemplo para que la calculadora use useState), se puede hacer sin
// prisa: hoy funciona y está verificado.
const bodyHtml = fs.readFileSync(path.join(process.cwd(), 'src/app/landing-body.html'), 'utf8')
const scriptJs = fs.readFileSync(path.join(process.cwd(), 'src/app/landing-script.js'), 'utf8')

export const metadata: Metadata = {
  title: 'Cartoca | Cartas digitales para restaurantes',
  description:
    'La carta aparece en cuanto tocas. Cartas digitales y reseñas de Google con tecnología NFC para bares y restaurantes. Sin apps que instalar, sin cámaras de QR.',
}

export default function LandingPage() {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,500&family=Public+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap"
        rel="stylesheet"
      />
      {/* eslint-disable-next-line react/no-danger */}
      <div dangerouslySetInnerHTML={{ __html: bodyHtml }} />
      {/* eslint-disable-next-line react/no-danger */}
      <script dangerouslySetInnerHTML={{ __html: scriptJs }} />
    </>
  )
}
