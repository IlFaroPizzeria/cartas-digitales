'use server'

import { revalidatePath } from 'next/cache'
import { createClient as createServerSupabaseClient } from '@/lib/supabase/server'
import { createClient as createSupabaseJsClient } from '@supabase/supabase-js'
import { etiquetasValidas } from '@/lib/etiquetas'

// Alias para no romper el resto del archivo, que ya usa `createClient()`
// como nombre para el cliente de servidor.
const createClient = createServerSupabaseClient

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

  const etiquetas = etiquetasValidas(formData.getAll('etiquetas').map(String))

  const traducciones: Record<string, string | null> = {}
  for (const l of ['en', 'de', 'it', 'sv', 'fr']) {
    traducciones[`nombre_${l}`] = String(formData.get(`nombre_${l}`) ?? '').trim() || null
    traducciones[`descripcion_${l}`] =
      String(formData.get(`descripcion_${l}`) ?? '').trim() || null
  }

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
        etiquetas,
        ...traducciones,
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
      etiquetas,
      disponible: true,
      orden: 999,
      ...traducciones,
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

// Campos que el propio dueño puede editar sobre su negocio (branding y
// contacto). slug/activo/plan/fecha_pago/owner_id quedan fuera a propósito
// -- son cosas de gestión de cuenta que solo debe tocar el admin, y desde
// Fase 15 además hay un trigger en la base de datos que lo impide aunque
// alguien intente saltarse esta función y llamar a la API directamente.
export async function updateNegocioConfig(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')
  const negocioId = await getOwnedNegocioId(supabase)

  const nombre = String(formData.get('nombre') ?? '').trim()
  const tagline = String(formData.get('tagline') ?? '').trim() || null
  const telefono = String(formData.get('telefono') ?? '').trim() || null
  const email = String(formData.get('email') ?? '').trim() || null
  const direccion = String(formData.get('direccion') ?? '').trim() || null
  const color_fondo = String(formData.get('color_fondo') ?? '').trim() || null
  const color_header = String(formData.get('color_header') ?? '').trim() || null
  const color_acento = String(formData.get('color_acento') ?? '').trim() || null
  const idiomas_activos = formData.getAll('idiomas_activos').map(String)

  if (!nombre) throw new Error('El nombre es obligatorio')
  if (idiomas_activos.length === 0) throw new Error('Activa al menos un idioma')

  const update: Record<string, unknown> = {
    nombre,
    tagline,
    telefono,
    email,
    direccion,
    color_fondo,
    color_header,
    color_acento,
    idiomas_activos,
  }

  const logo = formData.get('logo')
  if (logo instanceof File && logo.size > 0) {
    const extension = logo.name.split('.').pop() || 'png'
    const path = `${user.id}/logo-${Date.now()}.${extension}`

    // El cliente de servidor (@supabase/ssr) no siempre adjunta bien el
    // token de sesión en las peticiones a Storage -- las llamadas a las
    // tablas (negocios, platos...) funcionan porque van por PostgREST,
    // pero Storage es una API distinta. Se construye aquí un cliente
    // aparte con el access token de la sesión puesto a mano, para que la
    // política de RLS del bucket ("solo tu propia carpeta") vea el
    // auth.uid() correcto.
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) throw new Error('No autenticado')

    const storageClient = createSupabaseJsClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: `Bearer ${session.access_token}` } } }
    )

    const { error: uploadError } = await storageClient.storage
      .from('logos')
      .upload(path, logo, { upsert: true, contentType: logo.type || undefined })
    if (uploadError) throw new Error('No se pudo subir el logo')

    const { data: publicUrlData } = storageClient.storage.from('logos').getPublicUrl(path)
    update.logo_url = publicUrlData.publicUrl
  }

  const { error } = await supabase.from('negocios').update(update).eq('id', negocioId)
  if (error) throw new Error('No se pudo guardar la configuración')

  revalidatePath('/dashboard/configuracion')
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
