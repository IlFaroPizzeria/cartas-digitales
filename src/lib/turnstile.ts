// Verificación del token de Cloudflare Turnstile (control de bots) para
// el registro y el inicio de sesión. Mismo patrón que el resto de
// integraciones opcionales del proyecto (Resend, Google Translate): si
// no hay clave secreta configurada, no bloquea nada -- se deja pasar,
// avisando en el log del servidor. Así el formulario nunca queda roto
// por no tener aún la clave configurada.
const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

export function turnstileConfigurado(): boolean {
  return Boolean(process.env.TURNSTILE_SECRET_KEY)
}

export async function verificarTurnstile(token: string | null): Promise<boolean> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY
  if (!secretKey) {
    console.error('TURNSTILE_SECRET_KEY no configurada: control de bots desactivado.')
    return true
  }
  if (!token) return false

  try {
    const res = await fetch(VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret: secretKey, response: token }),
    })
    if (!res.ok) return false
    const data = await res.json()
    return Boolean(data?.success)
  } catch (err) {
    console.error('Error verificando Turnstile:', err)
    return false
  }
}
