import type { Metadata } from 'next'
import fs from 'node:fs'
import path from 'node:path'
import FinalCtaBand from '@/components/landing/FinalCtaBand'

const bodyHtml = fs.readFileSync(
  path.join(process.cwd(), 'src/app/quienes-somos-body.html'),
  'utf8'
)

export const metadata: Metadata = {
  title: 'Sobre nosotros | Cartoca',
  description:
    'Cartoca la construye Nils Lehmann, con la ayuda de un pequeño equipo de amigos en ventas. Conoce la esencia del proyecto.',
}

export default function QuienesSomosPage() {
  return (
    <>
      {/* eslint-disable-next-line react/no-danger */}
      <div dangerouslySetInnerHTML={{ __html: bodyHtml }} />
      <FinalCtaBand />
    </>
  )
}
