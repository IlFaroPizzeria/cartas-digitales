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

export async function createCategoria(formData: FormData) {
  const supabase = await createClient()
  const negocioId = await getOwnedNegocioId(supabase)
  const nombre = String(formData.get('nombre') ?? '').trim()
  if (!nombre) throw new Error('El nombre es obligatorio')

  const { data: maxOrden } = await supabase
    .from('categorias')
    .select('orden')
    .eq('negocio_id', negocioId)
    .order('orden', { ascending: false })
    .limit(1)
    .maybeSingle()

  const siguienteOrden = (maxOrden?.orden ?? 0) + 1

  const { error } = await supabase
    .from('categorias')
    .insert({ negocio_id: negocioId, nombre, orden: siguienteOrden })
  if (error) throw new Error('No se pudo crear la categoría')

  revalidatePath('/dashboard/categorias')
}

export async function renameCategoria(categoriaId: number, nombre: string) {
  const supabase = await createClient()
  await getOwnedNegocioId(supabase)
  const nombreLimpio = nombre.trim()
  if (!nombreLimpio) throw new Error('El nombre es obligatorio')

  const { error } = await supabase
    .from('categorias')
    .update({ nombre: nombreLimpio })
    .eq('id', categoriaId)
  if (error) throw new Error('No se pudo renombrar la categoría')

  revalidatePath('/dashboard/categorias')
  revalidatePath('/dashboard')
}

export async function deleteCategoria(categoriaId: number) {
  const supabase = await createClient()
  await getOwnedNegocioId(supabase)

  const { count } = await supabase
    .from('platos')
    .select('id', { count: 'exact', head: true })
    .eq('categoria_id', categoriaId)

  if (count && count > 0) {
    throw new Error('Esta categoría tiene platos. Muévelos o bórralos antes de eliminarla.')
  }

  const { error } = await supabase.from('categorias').delete().eq('id', categoriaId)
  if (error) throw new Error('No se pudo eliminar la categoría')

  revalidatePath('/dashboard/categorias')
}

export async function moveCategoria(categoriaId: number, direccion: 'arriba' | 'abajo') {
  const supabase = await createClient()
  const negocioId = await getOwnedNegocioId(supabase)

  const { data: categorias } = await supabase
    .from('categorias')
    .select('id, orden')
    .eq('negocio_id', negocioId)
    .order('orden', { ascending: true })

  if (!categorias) return
  const index = categorias.findIndex((c) => c.id === categoriaId)
  if (index === -1) return

  const otroIndex = direccion === 'arriba' ? index - 1 : index + 1
  if (otroIndex < 0 || otroIndex >= categorias.length) return

  const actual = categorias[index]
  const otro = categorias[otroIndex]

  await supabase.from('categorias').update({ orden: otro.orden }).eq('id', actual.id)
  await supabase.from('categorias').update({ orden: actual.orden }).eq('id', otro.id)

  revalidatePath('/dashboard/categorias')
  revalidatePath('/dashboard')
}

export async function movePlato(platoId: number, direccion: 'arriba' | 'abajo') {
  const supabase = await createClient()
  const negocioId = await getOwnedNegocioId(supabase)

  const { data: plato } = await supabase
    .from('platos')
    .select('id, categoria_id')
    .eq('id', platoId)
    .single()

  if (!plato) return

  // El orden solo tiene sentido dentro de la misma categoría (es como
  // se agrupan y muestran los platos tanto en el dashboard como en la
  // carta pública).
  const { data: platos } = await supabase
    .from('platos')
    .select('id, orden')
    .eq('negocio_id', negocioId)
    .eq('categoria_id', plato.categoria_id)
    .order('orden', { ascending: true })
    .order('id', { ascending: true })

  if (!platos) return
  const index = platos.findIndex((p) => p.id === platoId)
  if (index === -1) return

  const otroIndex = direccion === 'arriba' ? index - 1 : index + 1
  if (otroIndex < 0 || otroIndex >= platos.length) return

  const actual = platos[index]
  const otro = platos[otroIndex]

  await supabase.from('platos').update({ orden: otro.orden }).eq('id', actual.id)
  await supabase.from('platos').update({ orden: actual.orden }).eq('id', otro.id)

  revalidatePath('/dashboard')
}
