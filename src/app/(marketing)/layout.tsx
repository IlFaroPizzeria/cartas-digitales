import fs from 'node:fs'
import path from 'node:path'
import LandingNav from '@/components/landing/LandingNav'
import LandingFooter from '@/components/landing/LandingFooter'
import '../landing.css'

// Script compartido por todas las páginas de marketing (scroll reveal, tabs
// de producto, calculadora de precios). Se autoprotege comprobando que cada
// elemento existe antes de usarlo, así funciona igual en cualquier página
// aunque no tenga esa pieza concreta.
const scriptJs = fs.readFileSync(path.join(process.cwd(), 'src/app/landing-script.js'), 'utf8')

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,500&family=Public+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap"
        rel="stylesheet"
      />
      <div className="landing">
        <LandingNav />
        {children}
        <LandingFooter />
      </div>
      {/* eslint-disable-next-line react/no-danger */}
      <script dangerouslySetInnerHTML={{ __html: scriptJs }} />
    </>
  )
}
