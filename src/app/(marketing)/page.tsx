import type { Metadata } from 'next'
import fs from 'node:fs'
import path from 'node:path'
import FinalCtaBand from '@/components/landing/FinalCtaBand'

const bodyHtml = fs.readFileSync(path.join(process.cwd(), 'src/app/home-body.html'), 'utf8')

export const metadata: Metadata = {
  title: 'Cartoca | Cartas digitales para restaurantes',
  description:
    'La carta aparece en cuanto tocas. Cartas digitales y reseñas de Google con tecnología NFC para bares y restaurantes. Sin apps que instalar, sin cámaras de QR.',
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
