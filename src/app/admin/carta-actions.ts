'use server'

// Acciones de admin para editar la carta (categorías y platos) de
// CUALQUIER restaurante, no solo el propio. Pensadas para casos
// puntuales (el dueño te pide ayuda, hay que corregir algo urgente...),
// no para el uso normal del día a día -- eso lo sigue haciendo cada
// restaurante desde su panel (src/app/dashboard/actions.ts), que es
// donde vive la lógica "canónica" de guardado; aquí se repite la parte
// mínima necesaria porque ese archivo está pensado para un dueño
// operando sobre su propio negocio_id, no para un admin operando sobre
// el negocio_id de otro.
//
// La seguridad real la sigue imponiendo RLS: estas acciones solo
// funcionan si en Supabase existen políticas que dejen a los usuarios
// de la tabla `admins` leer/escribir en `categorias` y `platos` de
// cualquier negocio (ver instrucciones dadas al usuario).

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { etiquetasValidas } from '@/lib/etiquetas'
import { IDIOMAS_TRADUCIBLES, traduccionDisponible, traducirAIdiomas } from '@/lib/translate'
import { buscarCategoriaPredefinida, traduccionesPorNombreEs } from '@/lib/categoriasPredefinidas'

type SupabaseClient = Awaited<ReturnType<typeof createClient>>

async function requireAdmin(): Promise<SupabaseClient> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const { data: admin } = await supabase
    .from('admins')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!admin) throw new Error('No autorizado')
  return supabase
}

async function findOrCreateCategoriaAdmin(
  supabase: SupabaseClient,
  negocioId: number,
  nombre: string,
) {
  const nombreLimpio = nombre.trim()

  const { data: existente } = await supabase
    .from('categorias')
    .select('id')
    .eq('negocio_id', negocioId)
    .eq('nombre', nombreLimpio)
    .maybeSingle()

  if (existente) return existente.id

  const traducciones = traduccionesPorNombreEs(nombreLimpio)

  const insercion: Record<string, unknown> = {
    negocio_id: negocioId,
    nombre: nombreLimpio,
    orden: 999,
  }
  if (traducciones) {
    insercion.nombre_en = traducciones.en
    insercion.nombre_de = traducciones.de
    insercion.nombre_it = traducciones.it
    insercion.nombre_sv = traducciones.sv
    insercion.nombre_fr = traducciones.fr
  }

  const { data: nueva, error } = await supabase
    .from('categorias')
    .insert(insercion)
    .select('id')
    .single()

  if (error || !nueva) throw new Error('No se pudo crear la categoría')
  return nueva.id
}

export async function adminToggleDisponible(platoId: number, disponible: boolean) {
  const supabase = await requireAdmin()

  const { error } = await supabase.from('platos').update({ disponible }).eq('id', platoId)
  if (error) throw new Error('No se pudo actualizar la disponibilidad')

  revalidatePath('/admin', 'layout')
}

export async function adminDeletePlato(platoId: number) {
  const supabase = await requireAdmin()

  const { error } = await supabase.from('platos').delete().eq('id', platoId)
  if (error) throw new Error('No se pudo eliminar el plato')

  revalidatePath('/admin', 'layout')
}

export async function adminMovePlato(platoId: number, direccion: 'arriba' | 'abajo') {
  const supabase = await requireAdmin()

  const { data: plato } = await supabase
    .from('platos')
    .select('id, negocio_id, categoria_id')
    .eq('id', platoId)
    .single()

  if (!plato) return

  const { data: platos } = await supabase
    .from('platos')
    .select('id, orden')
    .eq('negocio_id', plato.negocio_id)
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

  revalidatePath('/admin', 'layout')
}

export async function adminSavePlato(negocioId: number, formData: FormData) {
  const supabase = await requireAdmin()

  const id = formData.get('id') ? Number(formData.get('id')) : null
  const nombre = String(formData.get('nombre') ?? '').trim()
  const descripcion = String(formData.get('descripcion') ?? '').trim() || null
  const precio = Number(formData.get('precio'))
  const categoriaNombre = String(formData.get('categoria') ?? '').trim()

  const etiquetas = etiquetasValidas(formData.getAll('etiquetas').map(String))

  const traducciones: Record<string, string | null> = {}
  const idiomasFaltantesNombre: string[] = []
  const idiomasFaltantesDescripcion: string[] = []
  for (const l of IDIOMAS_TRADUCIBLES) {
    const nombreTraducido = String(formData.get(`nombre_${l}`) ?? '').trim() || null
    const descripcionTraducida = String(formData.get(`descripcion_${l}`) ?? '').trim() || null
    traducciones[`nombre_${l}`] = nombreTraducido
    traducciones[`descripcion_${l}`] = descripcionTraducida
    if (!nombreTraducido) idiomasFaltantesNombre.push(l)
    if (!descripcionTraducida) idiomasFaltantesDescripcion.push(l)
  }

  if (!nombre) throw new Error('El nombre es obligatorio')
  if (!Number.isFinite(precio) || precio < 0) throw new Error('El precio no es válido')
  if (!categoriaNombre) throw new Error('La categoría es obligatoria')

  if (traduccionDisponible()) {
    const [nombresTraducidos, descripcionesTraducidas] = await Promise.all([
      traducirAIdiomas(nombre, idiomasFaltantesNombre),
      descripcion
        ? traducirAIdiomas(descripcion, idiomasFaltantesDescripcion)
        : Promise.resolve({} as Record<string, string>),
    ])
    for (const [l, texto] of Object.entries(nombresTraducidos)) {
      traducciones[`nombre_${l}`] = texto
    }
    for (const [l, texto] of Object.entries(descripcionesTraducidas)) {
      traducciones[`descripcion_${l}`] = texto
    }
  }

  const categoriaId = await findOrCreateCategoriaAdmin(supabase, negocioId, categoriaNombre)

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
      .eq('negocio_id', negocioId)
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

  revalidatePath('/admin', 'layout')
}

export async function adminCreateCategoria(negocioId: number, formData: FormData) {
  const supabase = await requireAdmin()

  const categoriaId = String(formData.get('categoriaId') ?? '').trim()
  const nombrePersonalizado = String(formData.get('nombre') ?? '').trim()

  let nombre: string
  const traducciones: Record<string, string | null> = {}

  if (categoriaId) {
    const predefinida = buscarCategoriaPredefinida(categoriaId)
    if (!predefinida) throw new Error('Elige una categoría de la lista')
    nombre = predefinida.es
    traducciones.nombre_en = predefinida.en
    traducciones.nombre_de = predefinida.de
    traducciones.nombre_it = predefinida.it
    traducciones.nombre_sv = predefinida.sv
    traducciones.nombre_fr = predefinida.fr
  } else {
    if (!nombrePersonalizado) throw new Error('Escribe un nombre para la categoría')
    if (nombrePersonalizado.length > 40) {
      throw new Error('El nombre es demasiado largo (máximo 40 caracteres)')
    }
    nombre = nombrePersonalizado

    const traducidas = await traducirAIdiomas(nombre, IDIOMAS_TRADUCIBLES)
    for (const l of IDIOMAS_TRADUCIBLES) {
      traducciones[`nombre_${l}`] = traducidas[l] ?? null
    }
  }

  const { data: existentes } = await supabase
    .from('categorias')
    .select('id, nombre, orden')
    .eq('negocio_id', negocioId)

  const yaExiste = (existentes ?? []).some(
    (c) => c.nombre.trim().toLowerCase() === nombre.trim().toLowerCase(),
  )
  if (yaExiste) throw new Error('Ya tiene esa categoría')

  const siguienteOrden =
    (existentes ?? []).reduce((max, c) => Math.max(max, c.orden ?? 0), 0) + 1

  const { error } = await supabase.from('categorias').insert({
    negocio_id: negocioId,
    nombre,
    ...traducciones,
    orden: siguienteOrden,
  })
  if (error) throw new Error('No se pudo crear la categoría')

  revalidatePath('/admin', 'layout')
}

export async function adminDeleteCategoria(categoriaId: number) {
  const supabase = await requireAdmin()

  const { count } = await supabase
    .from('platos')
    .select('id', { count: 'exact', head: true })
    .eq('categoria_id', categoriaId)

  if (count && count > 0) {
    throw new Error('Esta categoría tiene platos. Muévelos o bórralos antes de eliminarla.')
  }

  const { error } = await supabase.from('categorias').delete().eq('id', categoriaId)
  if (error) throw new Error('No se pudo eliminar la categoría')

  revalidatePath('/admin', 'layout')
}

export async function adminMoveCategoria(categoriaId: number, direccion: 'arriba' | 'abajo') {
  const supabase = await requireAdmin()

  const { data: categoria } = await supabase
    .from('categorias')
    .select('id, negocio_id')
    .eq('id', categoriaId)
    .single()

  if (!categoria) return

  const { data: categorias } = await supabase
    .from('categorias')
    .select('id, orden')
    .eq('negocio_id', categoria.negocio_id)
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

  revalidatePath('/admin', 'layout')
}
