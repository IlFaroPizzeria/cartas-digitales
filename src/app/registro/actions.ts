'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

// Crea el negocio del usuario logueado si todavía no tiene uno. Es
// idempotente a propósito: se llama tanto justo después del alta pública
// en /registro (si Supabase da sesión inmediata) como, por si hizo falta
// confirmar el email antes de tener sesión, la primera vez que el usuario
// entra al dashboard (ver src/app/dashboard/layout.tsx).
export async function registrarNegocio(nombre: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const { data: existente } = await supabase
    .from('negocios')
    .select('id')
    .eq('owner_id', user.id)
    .maybeSingle()
  if (existente) return

  const nombreLimpio = nombre.trim()
  if (!nombreLimpio) throw new Error('Falta el nombre del restaurante')

  const base = slugify(nombreLimpio) || `restaurante-${user.id.slice(0, 8)}`

  // La política de RLS "negocios: alta propia" solo deja insertar con
  // owner_id = auth.uid() y activo = false, así que aunque alguien se
  // salte esta función y llame a la API directamente, no puede
  // autoactivarse ni crear un restaurante a nombre de otro usuario.
  for (let intento = 0; intento < 5; intento++) {
    const slug = intento === 0 ? base : `${base}-${intento + 1}`
    const { error } = await supabase.from('negocios').insert({
      nombre: nombreLimpio,
      slug,
      owner_id: user.id,
      activo: false,
    })
    if (!error) {
      revalidatePath('/dashboard')
      return
    }
    if (error.code === '23505') {
      if (error.message.includes('owner_id')) return // ya tenía negocio (carrera), no es un fallo real
      continue // colisión de slug: probamos con el siguiente sufijo
    }
    throw new Error('No se pudo crear el restaurante')
  }
  throw new Error('No se pudo generar un identificador único para el restaurante')
}
