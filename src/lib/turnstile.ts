// Verificación del token de Cloudflare Turnstile (control de bots) para
// el registro y el inicio de sesión. Mismo patrón que el resto de
// integraciones opcionales del proyecto (Resend, Google Translate): si
// no hay clave secreta configurada, no bloquea nada -- se deja pasar,
// avisando en el log del servidor. Así el formulario nunca queda roto
// por no tener aún la clave configurada.
export function turnstileConfigurado(): boolean {
  return Boolean(process.env.TURNSTILE_SECRET_KEY)
}

// --- BYPASS TEMPORAL (2026-09-19) ------------------------------------
// El widget de Cloudflare Turnstile estaba fallando en producción para
// TODO el mundo (probablemente el dominio cartoca.es / www.cartoca.es
// no está bien registrado para el sitekey en el panel de Cloudflare):
// el checkbox daba error ("Troubleshoot") en vez de verificar, así que
// nadie conseguía nunca un token y el registro/login se quedaban
// bloqueados para siempre. Mientras se revisa esa configuración en
// Cloudflare, esta función deja pasar siempre. Para reactivar el
// control de bots: repón el cuerpo de abajo (o pide que lo reactive)
// una vez confirmado que el dominio está bien dado de alta en
// Cloudflare Turnstile.
export async function verificarTurnstile(token: string | null): Promise<boolean> {
  void token // bypass temporal: no se usa mientras el control de bots está desactivado (ver comentario arriba)
  return true
}

// Cuerpo original, para restaurar cuando se arregle el dominio en Cloudflare:
//
// export async function verificarTurnstile(token: string | null): Promise<boolean> {
//   const secretKey = process.env.TURNSTILE_SECRET_KEY
//   if (!secretKey) {
//     console.error('TURNSTILE_SECRET_KEY no configurada: control de bots desactivado.')
//     return true
//   }
//   if (!token) return false
//
//   try {
//     const res = await fetch(VERIFY_URL, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
//       body: new URLSearchParams({ secret: secretKey, response: token }),
//     })
//     if (!res.ok) return false
//     const data = await res.json()
//     return Boolean(data?.success)
//   } catch (err) {
//     console.error('Error verificando Turnstile:', err)
//     return false
//   }
// }
