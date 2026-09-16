'use server'

import { verificarTurnstile } from '@/lib/turnstile'

// Verifica el token de Cloudflare Turnstile (control de bots) antes de
// dejar avanzar el inicio de sesión. Se llama desde el cliente justo
// antes de llamar a Supabase Auth.
export async function verificarCaptchaLogin(token: string | null) {
  return verificarTurnstile(token)
}
