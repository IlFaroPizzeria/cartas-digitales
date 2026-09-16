import type { Metadata } from 'next'
import fs from 'node:fs'
import path from 'node:path'
import FinalCtaBand from '@/components/landing/FinalCtaBand'

const bodyHtml = fs.readFileSync(path.join(process.cwd(), 'src/app/producto-body.html'), 'utf8')

export const metadata: Metadata = {
  title: 'Producto | Cartoca',
  description:
    'Cómo funciona Cartoca: el problema que resolvemos, el proceso de puesta en marcha y la carta real de un cliente, tocando la tarjeta.',
}

export default function ProductoPage() {
  return (
    <>
      {/* eslint-disable-next-line react/no-danger */}
      <div dangerouslySetInnerHTML={{ __html: bodyHtml }} />
      <FinalCtaBand />
    </>
  )
}
