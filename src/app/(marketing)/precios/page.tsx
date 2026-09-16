import type { Metadata } from 'next'
import fs from 'node:fs'
import path from 'node:path'
import FinalCtaBand from '@/components/landing/FinalCtaBand'

const bodyHtml = fs.readFileSync(path.join(process.cwd(), 'src/app/precios-body.html'), 'utf8')

export const metadata: Metadata = {
  title: 'Precios | Cartoca',
  description: 'Un pago único desde 50€, sin permanencia. Calcula el presupuesto exacto para tu restaurante.',
}

export default function PreciosPage() {
  return (
    <>
      {/* eslint-disable-next-line react/no-danger */}
      <div dangerouslySetInnerHTML={{ __html: bodyHtml }} />
      <FinalCtaBand />
    </>
  )
}
