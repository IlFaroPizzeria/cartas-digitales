'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import AuthTabs from '@/components/auth/AuthTabs'
import { verificarCaptchaLogin } from './actions'

// Bypass temporal del captcha (ver src/lib/turnstile.ts) -- widget
// de Cloudflare Turnstile roto en producción para todo el mundo.
const CAPTCHA_ACTIVO = false

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const captchaOk = await verificarCaptchaLogin(captchaToken)
    if (!captchaOk) {
      setLoading(false)
      setCaptchaToken(null)
      setError('No hemos podido verificar que no eres un robot. Inténtalo de nuevo.')
      return
    }

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    setLoading(false)

    if (error) {
      setError('Email o contraseña incorrectos.')
      setCaptchaToken(null)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-6">
          <svg
            viewBox="0 0 32 32"
            className="h-11 w-11 rounded-xl shadow-sm"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="Cartoca"
          >
            <rect width="32" height="32" rx="8" fill="#0a84ff" />
            <g fill="none" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round">
              <path d="M8 16.8a8 8 0 0 1 16 0" />
              <path d="M11.2 16.8a4.8 4.8 0 0 1 9.6 0" />
              <circle cx="16" cy="16.8" r="1.1" fill="#FFFFFF" stroke="none" />
              <path d="M16 20.4v4.4" />
            </g>
          </svg>
          <h1 className="mt-3 text-lg font-semibold text-slate-900">Portal de clientes</h1>
          <p className="text-sm text-slate-500">Gestiona tu carta digital de Cartoca</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <AuthTabs activo="login" />

          <form onSubmit={handleSubmit}>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mb-4 rounded-lg border border-slate-300 px-3 py-2.5 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />

            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mb-4 rounded-lg border border-slate-300 px-3 py-2.5 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />

            {error && (
              <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || (CAPTCHA_ACTIVO && !captchaToken)}
              className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white py-3 text-base font-medium shadow-sm transition-colors disabled:opacity-50"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
