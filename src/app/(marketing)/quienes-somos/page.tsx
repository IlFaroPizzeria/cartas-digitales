import type { Metadata } from 'next'
import fs from 'node:fs'
import path from 'node:path'
import FinalCtaBand from '@/components/landing/FinalCtaBand'

const bodyHtml = fs.readFileSync(
  path.join(process.cwd(), 'src/app/quienes-somos-body.html'),
  'utf8'
)

export const metadata: Metadata = {
  title: 'Quiénes somos | Cartoca',
  description:
    'Cartoca la lleva una sola persona, de principio a fin. Conoce a Nils Lehmann, fundador y CEO.',
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
