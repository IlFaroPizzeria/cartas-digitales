'use client'

import { useState, type FormEvent } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/ToastProvider'

export default function CuentaForm({ email }: { email: string }) {
  const toast = useToast()

  const [nuevoEmail, setNuevoEmail] = useState('')
  const [loadingEmail, setLoadingEmail] = useState(false)

  const [passwordActual, setPasswordActual] = useState('')
  const [passwordNueva, setPasswordNueva] = useState('')
  const [passwordNueva2, setPasswordNueva2] = useState('')
  const [loadingPassword, setLoadingPassword] = useState(false)

  async function cambiarEmail(e: FormEvent) {
    e.preventDefault()
    if (!nuevoEmail.trim()) return
    setLoadingEmail(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({ email: nuevoEmail.trim() })
      if (error) throw error
      toast.success('Te hemos enviado un enlace de confirmación a tu nuevo email.')
      setNuevoEmail('')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudo cambiar el email.')
    } finally {
      setLoadingEmail(false)
    }
  }

  async function cambiarPassword(e: FormEvent) {
    e.preventDefault()
    if (passwordNueva.length < 6) {
      toast.error('La nueva contraseña debe tener al menos 6 caracteres.')
      return
    }
    if (passwordNueva !== passwordNueva2) {
      toast.error('Las contraseñas nuevas no coinciden.')
      return
    }
    setLoadingPassword(true)
    try {
      const supabase = createClient()

      // Verificamos la contraseña actual antes de cambiarla, para que
      // alguien que encuentre la sesión abierta no pueda cambiarla sin
      // saber la contraseña actual.
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email,
        password: passwordActual,
      })
      if (verifyError) throw new Error('La contraseña actual no es correcta.')

      const { error } = await supabase.auth.updateUser({ password: passwordNueva })
      if (error) throw error

      toast.success('Contraseña actualizada.')
      setPasswordActual('')
      setPasswordNueva('')
      setPasswordNueva2('')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudo cambiar la contraseña.')
    } finally {
      setLoadingPassword(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
        <h2 className="text-sm font-semibold text-slate-900 mb-1">Email de acceso</h2>
        <p className="text-sm text-slate-500 mb-4">
          Email actual: <span className="font-medium text-slate-700">{email}</span>
        </p>
        <form onSubmit={cambiarEmail} className="flex gap-2">
          <input
            type="email"
            required
            placeholder="Nuevo email"
            value={nuevoEmail}
            onChange={(e) => setNuevoEmail(e.target.value)}
            className="flex-1 rounded-lg border border-slate-300 px-3 py-2.5 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={loadingEmail}
            className="shrink-0 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 text-sm font-medium shadow-sm transition-colors disabled:opacity-50"
          >
            {loadingEmail ? 'Enviando...' : 'Cambiar email'}
          </button>
        </form>
        <p className="mt-2 text-xs text-slate-400">
          Te enviaremos un enlace de confirmación al nuevo email antes de aplicar el cambio.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
        <h2 className="text-sm font-semibold text-slate-900 mb-4">Cambiar contraseña</h2>
        <form onSubmit={cambiarPassword} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Contraseña actual
            </label>
            <input
              type="password"
              autoComplete="current-password"
              required
              value={passwordActual}
              onChange={(e) => setPasswordActual(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nueva contraseña
            </label>
            <input
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
              value={passwordNueva}
              onChange={(e) => setPasswordNueva(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Repite la nueva contraseña
            </label>
            <input
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
              value={passwordNueva2}
              onChange={(e) => setPasswordNueva2(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <button
            type="submit"
            disabled={loadingPassword}
            className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 text-sm font-medium shadow-sm transition-colors disabled:opacity-50"
          >
            {loadingPassword ? 'Guardando...' : 'Actualizar contraseña'}
          </button>
        </form>
      </div>
    </div>
  )
}
