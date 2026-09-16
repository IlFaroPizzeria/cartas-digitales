'use server'

// El destino real del formulario vive solo aquí, en el servidor. El HTML y
// el JS que llegan al navegador nunca contienen esta dirección: el cliente
// solo recibe un mensaje de éxito o error, nunca el email de destino.
const RESEND_API_URL = 'https://api.resend.com/emails'
const TO_EMAIL = 'nils.podadera@gmail.com'
const FROM_EMAIL = 'Cartoca <onboarding@resend.dev>'

export type QuoteFormState = { ok: boolean; message: string } | null

// Mismos precios que la calculadora de /precios y el formulario (ver
// src/components/landing/LandingScript.tsx y QuotePresupuestoForm.tsx) --
// se recalculan aquí, en el servidor, en vez de fiarse de un total que
// mande el navegador.
const BASE_PRICE = 50
const MENU_TIER_THRESHOLD = 30
const MENU_BASE = 20
const MENU_DISCOUNT = 18
const REVIEW_TIER_THRESHOLD = 5
const REVIEW_BASE = 30
const REVIEW_DISCOUNT = 25

function tierPrice(qty: number, base: number, discounted: number, threshold: number) {
  if (qty <= 0) return 0
  return qty * (qty >= threshold ? discounted : base)
}

export async function enviarSolicitudPresupuesto(
  _prevState: QuoteFormState,
  formData: FormData
): Promise<QuoteFormState> {
  const restaurante = String(formData.get('restaurante') ?? '').trim()
  const ciudad = String(formData.get('ciudad') ?? '').trim()
  const pais = String(formData.get('pais') ?? '').trim()
  const tarjetasMenu = Number(formData.get('tarjetasMenu') ?? '0') || 0
  const tarjetasResenas = Number(formData.get('tarjetasResenas') ?? '0') || 0
  const accesoPlataforma = formData.get('accesoPlataforma') === 'on' ? 'Sí' : 'No'
  const mensaje = String(formData.get('mensaje') ?? '').trim()

  const menuCost = tierPrice(tarjetasMenu, MENU_BASE, MENU_DISCOUNT, MENU_TIER_THRESHOLD)
  const reviewCost = tierPrice(tarjetasResenas, REVIEW_BASE, REVIEW_DISCOUNT, REVIEW_TIER_THRESHOLD)
  const totalEstimado = BASE_PRICE + menuCost + reviewCost

  if (!restaurante || !ciudad || !pais) {
    return { ok: false, message: 'Rellena al menos el nombre del restaurante, la ciudad y el país.' }
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.error('RESEND_API_KEY no configurada: no se pudo enviar la solicitud de presupuesto.')
    return {
      ok: false,
      message: 'No hemos podido enviar el formulario ahora mismo. Escríbenos por WhatsApp mientras tanto.',
    }
  }

  const body = {
    from: FROM_EMAIL,
    to: [TO_EMAIL],
    subject: `Nueva solicitud de presupuesto — ${restaurante}`,
    text: [
      `Restaurante: ${restaurante}`,
      `Ciudad: ${ciudad}`,
      `País: ${pais}`,
      `Digitalización de la carta: ${BASE_PRICE}€ (incluido siempre)`,
      `Tarjetas NFC de menú: ${tarjetasMenu}`,
      `Tarjetas NFC de reseñas: ${tarjetasResenas}`,
      `Acceso a la plataforma: ${accesoPlataforma}`,
      `Pago único estimado: ${totalEstimado}€`,
      '',
      'Mensaje:',
      mensaje || '(sin mensaje)',
    ].join('\n'),
  }

  try {
    const res = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const errText = await res.text()
      console.error('Error enviando email de presupuesto:', res.status, errText)
      return {
        ok: false,
        message: 'No hemos podido enviar el formulario ahora mismo. Escríbenos por WhatsApp mientras tanto.',
      }
    }

    return { ok: true, message: 'Solicitud enviada. Te contestamos en menos de 24h.' }
  } catch (err) {
    console.error('Error de red enviando email de presupuesto:', err)
    return {
      ok: false,
      message: 'No hemos podido enviar el formulario ahora mismo. Escríbenos por WhatsApp mientras tanto.',
    }
  }
}
