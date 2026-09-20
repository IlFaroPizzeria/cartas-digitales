'use client'

import { useState } from 'react'
import QrDescargable from './QrDescargable'

export default function CartaLinkCard({ slug }: { slug: string }) {
  const [copiado, setCopiado] = useState(false)
  const url = `https://cartoca.es/${slug}`

  async function copiar() {
    try {
      await navigator.clipboard.writeText(url)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch {
      // Si el navegador bloquea el portapapeles, el enlace sigue visible
      // y se puede copiar a mano.
    }
  }

  return (
    <div className="glass-card rounded-2xl p-5">
      <h2 className="text-sm font-semibold text-slate-900 mb-1">Enlace de tu carta</h2>
      <p className="text-sm text-slate-500 mb-3">
        Compártelo con tus clientes, imprime el QR para tus mesas, o úsalo en tus tarjetas NFC.
      </p>
      <div className="flex items-center gap-2 mb-4">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 min-w-0 truncate rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-brand-dark hover:underline"
        >
          {url}
        </a>
        <button
          onClick={copiar}
          className="shrink-0 rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          {copiado ? 'Copiado ✓' : 'Copiar'}
        </button>
      </div>
      <div className="pt-4 border-t border-black/[0.06]">
        <QrDescargable url={url} />
      </div>
    </div>
  )
}
