// Script de un solo uso para traducir los platos y categorías que ya
// existían en la base de datos antes de tener la traducción automática.
// Rellena solo los campos de idioma que estén vacíos -- nunca toca una
// traducción que el dueño ya haya escrito a mano. Es seguro ejecutarlo
// varias veces: la segunda vez no encuentra nada que traducir.
//
// Uso:
//   1. En Supabase: Settings -> API -> copia la clave "service_role"
//      (NO la "anon"). Añádela a .env.local como:
//        SUPABASE_SERVICE_ROLE_KEY=...
//      Esta clave salta la seguridad (RLS) de la base de datos, así que
//      NUNCA debe usarse en el navegador ni subirse a git -- .env.local
//      ya está en .gitignore, y este script solo se ejecuta a mano,
//      nunca en Vercel.
//   2. Asegúrate de tener también GOOGLE_TRANSLATE_API_KEY en
//      .env.local (la misma que usa la app para traducir al guardar).
//   3. Ejecuta desde la raíz del proyecto:
//        npx tsx scripts/backfill-traducciones.ts

import { readFileSync, existsSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'
import {
  IDIOMAS_TRADUCIBLES,
  traduccionDisponible,
  traducirAIdiomas,
} from '../src/lib/translate'

// Cargamos .env.local a mano (sin depender de la librería `dotenv`,
// que no está entre las dependencias del proyecto). Next.js hace esto
// automáticamente en `next dev`/`next build`, pero este script se
// ejecuta fuera de Next.
function cargarEnvLocal() {
  const ruta = '.env.local'
  if (!existsSync(ruta)) return
  const contenido = readFileSync(ruta, 'utf-8')
  for (const linea of contenido.split('\n')) {
    const limpia = linea.trim()
    if (!limpia || limpia.startsWith('#')) continue
    const igual = limpia.indexOf('=')
    if (igual === -1) continue
    const clave = limpia.slice(0, igual).trim()
    let valor = limpia.slice(igual + 1).trim()
    if (
      (valor.startsWith('"') && valor.endsWith('"')) ||
      (valor.startsWith("'") && valor.endsWith("'"))
    ) {
      valor = valor.slice(1, -1)
    }
    if (!(clave in process.env)) process.env[clave] = valor
  }
}

type FilaConIdiomas = Record<string, unknown>

async function main() {
  cargarEnvLocal()

  if (!traduccionDisponible()) {
    console.error('Falta GOOGLE_TRANSLATE_API_KEY en .env.local. Nada que traducir.')
    process.exit(1)
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) {
    console.error(
      'Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local.'
    )
    process.exit(1)
  }

  const supabase = createClient(url, serviceKey)

  // --- Categorías ---
  const { data: categorias, error: errCategorias } = await supabase
    .from('categorias')
    .select('id, nombre, nombre_en, nombre_de, nombre_it, nombre_sv, nombre_fr')

  if (errCategorias) throw errCategorias

  let categoriasActualizadas = 0
  for (const cat of (categorias ?? []) as FilaConIdiomas[]) {
    const faltantes = IDIOMAS_TRADUCIBLES.filter((l) => !cat[`nombre_${l}`])
    if (faltantes.length === 0) continue

    const traducciones = await traducirAIdiomas(cat.nombre as string, faltantes)
    if (Object.keys(traducciones).length === 0) continue

    const update: Record<string, string> = {}
    for (const [l, texto] of Object.entries(traducciones)) update[`nombre_${l}`] = texto

    const { error } = await supabase.from('categorias').update(update).eq('id', cat.id)
    if (error) {
      console.error(`Error actualizando categoría ${cat.id} (${cat.nombre}):`, error.message)
      continue
    }
    categoriasActualizadas++
    console.log(`Categoría traducida: ${cat.nombre} -> ${Object.keys(traducciones).join(', ')}`)
  }

  // --- Platos ---
  const { data: platos, error: errPlatos } = await supabase
    .from('platos')
    .select(
      'id, nombre, descripción, nombre_en, nombre_de, nombre_it, nombre_sv, nombre_fr, descripcion_en, descripcion_de, descripcion_it, descripcion_sv, descripcion_fr'
    )

  if (errPlatos) throw errPlatos

  let platosActualizados = 0
  for (const p of (platos ?? []) as FilaConIdiomas[]) {
    const faltantesNombre = IDIOMAS_TRADUCIBLES.filter((l) => !p[`nombre_${l}`])
    const descripcion = (p['descripción'] as string | null) ?? null
    const faltantesDescripcion = descripcion
      ? IDIOMAS_TRADUCIBLES.filter((l) => !p[`descripcion_${l}`])
      : []

    if (faltantesNombre.length === 0 && faltantesDescripcion.length === 0) continue

    const [nombresTraducidos, descripcionesTraducidas] = await Promise.all([
      traducirAIdiomas(p.nombre as string, faltantesNombre),
      descripcion
        ? traducirAIdiomas(descripcion, faltantesDescripcion)
        : Promise.resolve({} as Record<string, string>),
    ])

    const update: Record<string, string> = {}
    for (const [l, texto] of Object.entries(nombresTraducidos)) update[`nombre_${l}`] = texto
    for (const [l, texto] of Object.entries(descripcionesTraducidas))
      update[`descripcion_${l}`] = texto

    if (Object.keys(update).length === 0) continue

    const { error } = await supabase.from('platos').update(update).eq('id', p.id as number)
    if (error) {
      console.error(`Error actualizando plato ${p.id} (${p.nombre}):`, error.message)
      continue
    }
    platosActualizados++
    console.log(`Plato traducido: ${p.nombre} -> ${Object.keys(update).join(', ')}`)
  }

  console.log(
    `\nListo. ${categoriasActualizadas} categorías y ${platosActualizados} platos actualizados.`
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
