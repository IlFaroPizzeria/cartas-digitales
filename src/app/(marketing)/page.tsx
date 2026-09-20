import type { Metadata } from 'next'
import fs from 'node:fs'
import path from 'node:path'
import FinalCtaBand from '@/components/landing/FinalCtaBand'

const bodyHtml = fs.readFileSync(path.join(process.cwd(), 'src/app/home-body.html'), 'utf8')

export const metadata: Metadata = {
  title: 'Cartoca | Cartas digitales para restaurantes',
  description:
    'La plataforma de cartas digitales para restaurantes: gestiónala tú mismo y compártela como quieras, con QR, enlace o tarjetas NFC.',
}

export default function HomePage() {
  return (
    <>
      {/* eslint-disable-next-line react/no-danger */}
      <div dangerouslySetInnerHTML={{ __html: bodyHtml }} />
      <FinalCtaBand />
    </>
  )
}
