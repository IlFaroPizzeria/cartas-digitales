import type { Metadata } from 'next'
import fs from 'node:fs'
import path from 'node:path'

const bodyHtml = fs.readFileSync(
  path.join(process.cwd(), 'src/app/privacidad-body.html'),
  'utf8'
)

export const metadata: Metadata = {
  title: 'Política de privacidad | Cartoca',
  description: 'Qué datos tratamos en Cartoca, para qué los usamos y qué derechos tienes sobre ellos.',
}

export default function PrivacidadPage() {
  return (
    <>
      {/* eslint-disable-next-line react/no-danger */}
      <div dangerouslySetInnerHTML={{ __html: bodyHtml }} />
    </>
  )
}
