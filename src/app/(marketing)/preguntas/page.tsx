import type { Metadata } from 'next'
import fs from 'node:fs'
import path from 'node:path'
import FinalCtaBand from '@/components/landing/FinalCtaBand'

const bodyHtml = fs.readFileSync(path.join(process.cwd(), 'src/app/preguntas-body.html'), 'utf8')

export const metadata: Metadata = {
  title: 'Preguntas frecuentes | Cartoca',
  description: 'Idiomas, tarjetas perdidas, plazos de entrega y garantías: todo lo que se suele preguntar antes de empezar.',
}

export default function PreguntasPage() {
  return (
    <>
      {/* eslint-disable-next-line react/no-danger */}
      <div dangerouslySetInnerHTML={{ __html: bodyHtml }} />
      <FinalCtaBand />
    </>
  )
}
