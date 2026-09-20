import type { Metadata } from 'next'
import fs from 'node:fs'
import path from 'node:path'
import FinalCtaBand from '@/components/landing/FinalCtaBand'

const bodyHtml = fs.readFileSync(path.join(process.cwd(), 'src/app/precios-body.html'), 'utf8')

export const metadata: Metadata = {
  title: 'Precios | Cartoca',
  description: 'Planes desde 25€/mes, sin permanencia. Elige cómo compartir tu carta y calcula el precio exacto.',
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
