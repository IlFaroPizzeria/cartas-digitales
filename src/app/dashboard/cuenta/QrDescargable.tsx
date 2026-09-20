'use client'

import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'

// QR del enlace de la carta, listo para imprimir en las mesas -- la
// forma gratuita e inmediata de desplegar la carta sin depender de
// tarjetas NFC (que siguen siendo una opción, no un requisito). Se
// genera en el propio navegador (no hace falta ningún servicio
// externo ni guardar nada en Supabase), tanto la vista previa como el
// PNG en alta resolución que se descarga.
export default function QrDescargable({ url }: { url: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [error, setError] = useState(false)
  const [descargando, setDescargando] = useState(false)

  useEffect(() => {
    if (!canvasRef.current) return
    QRCode.toCanvas(canvasRef.current, url, {
      width: 160,
      margin: 1,
      color: { dark: '#101b2d', light: '#ffffff' },
    }).catch(() => setError(true))
  }, [url])

  async function descargar() {
    setDescargando(true)
    try {
      // Tamaño grande a propósito: pensado para imprimirse en una mesa
      // o un escaparate, no solo para verse bien en pantalla.
      const dataUrl = await QRCode.toDataURL(url, {
        width: 1200,
        margin: 2,
        color: { dark: '#101b2d', light: '#ffffff' },
      })
      const enlace = document.createElement('a')
      enlace.href = dataUrl
      enlace.download = 'qr-carta-cartoca.png'
      enlace.click()
    } catch {
      setError(true)
    } finally {
      setDescargando(false)
    }
  }

  if (error) {
    return (
      <p className="text-xs text-slate-500">
        No se ha podido generar el código QR. Recarga la página e inténtalo de nuevo.
      </p>
    )
  }

  return (
    <div className="flex items-center gap-4">
      <canvas
        ref={canvasRef}
        className="h-20 w-20 shrink-0 rounded-lg border border-slate-200 bg-white"
        aria-label="Código QR de tu carta"
      />
      <div className="min-w-0">
        <p className="text-xs text-slate-500 mb-2 leading-snug">
          Imprímelo y pégalo en tus mesas, tu escaparate o donde quieras
          -- funciona igual que un tag NFC, solo que se escanea con la
          cámara en vez de acercar el móvil.
        </p>
        <button
          type="button"
          onClick={descargar}
          disabled={descargando}
          className="rounded-lg border border-black/[0.12] px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-black/[0.04] disabled:opacity-50"
        >
          {descargando ? 'Generando...' : 'Descargar QR (PNG)'}
        </button>
      </div>
    </div>
  )
}
