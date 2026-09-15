'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

type SupabaseClient = Awaited<ReturnType<typeof createClient>>

// Devuelve el negocio del usuario logueado. Todas las mutaciones pasan
// por aquí para saber a qué negocio_id deben asociar los cambios; la
// seguridad real de todos modos la impone RLS en la base de datos.
async function getOwnedNegocioId(supabase: SupabaseClient) {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const { data: negocio } = await supabase
    .from('negocios')
    .select('id')
    .eq('owner_id', user.id)
    .single()

  if (!negocio) throw new Error('Este usuario no tiene un restaurante asociado')
  return negocio.id
}

async function findOrCreateCategoria(supabase: SupabaseClient, negocioId: number, nombre: string) {
  const nombreLimpio = nombre.trim()

  const { data: existente } = await supabase
    .from('categorias')
    .select('id')
    .eq('negocio_id', negocioId)
    .eq('nombre', nombreLimpio)
    .maybeSingle()

  if (existente) return existente.id

  const { data: nueva, error } = await supabase
    .from('categorias')
    .insert({ negocio_id: negocioId, nombre: nombreLimpio, orden: 999 })
    .select('id')
    .single()

  if (error || !nueva) throw new Error('No se pudo crear la categoría')
  return nueva.id
}

export async function toggleDisponible(platoId: number, disponible: boolean) {
  const supabase = await createClient()
  await getOwnedNegocioId(supabase)

  const { error } = await supabase.from('platos').update({ disponible }).eq('id', platoId)
  if (error) throw new Error('No se pudo actualizar la disponibilidad')

  revalidatePath('/dashboard')
}

export async function deletePlato(platoId: number) {
  const supabase = await createClient()
  await getOwnedNegocioId(supabase)

  const { error } = await supabase.from('platos').delete().eq('id', platoId)
  if (error) throw new Error('No se pudo eliminar el plato')

  revalidatePath('/dashboard')
}

export async function savePlato(formData: FormData) {
  const supabase = await createClient()
  const negocioId = await getOwnedNegocioId(supabase)

  const id = formData.get('id') ? Number(formData.get('id')) : null
  const nombre = String(formData.get('nombre') ?? '').trim()
  const descripcion = String(formData.get('descripcion') ?? '').trim() || null
  const precio = Number(formData.get('precio'))
  const categoriaNombre = String(formData.get('categoria') ?? '').trim()

  if (!nombre) throw new Error('El nombre es obligatorio')
  if (!Number.isFinite(precio) || precio < 0) throw new Error('El precio no es válido')
  if (!categoriaNombre) throw new Error('La categoría es obligatoria')

  const categoriaId = await findOrCreateCategoria(supabase, negocioId, categoriaNombre)

  if (id) {
    const { error } = await supabase
      .from('platos')
      .update({
        nombre,
        descripción: descripcion,
        precio,
        categoria_id: categoriaId,
        categoría: categoriaNombre,
      })
      .eq('id', id)
    if (error) throw new Error('No se pudo guardar el plato')
  } else {
    const { error } = await supabase.from('platos').insert({
      negocio_id: negocioId,
      nombre,
      descripción: descripcion,
      precio,
      categoria_id: categoriaId,
      categoría: categoriaNombre,
      disponible: true,
      orden: 999,
    })
    if (error) throw new Error('No se pudo crear el plato')
  }

  revalidatePath('/dashboard')
}
