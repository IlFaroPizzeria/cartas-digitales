import { cache } from 'react'
import { supabase } from '@/lib/supabase'

// Solo las columnas que de verdad necesita la carta pública. El resto
// (plan, fecha_pago, owner_id, idiomas_max_extra) son datos de gestión
// de cuenta que no deben poder leerse desde la API pública (esto usa la
// clave anon, visible en el bundle del navegador). Además de esto, en
// Supabase hay que quitarle a `anon` el permiso de SELECT sobre el
// resto de columnas, por si alguien consulta la API directamente en
// vez de pasar por esta página.
//
// Compartida entre src/app/[slug]/page.tsx, generateMetadata (título
// por restaurante) y src/app/[slug]/icon.tsx (favicon por restaurante):
// envuelta en cache() de React para que las tres solo disparen una
// consulta a Supabase por request, en vez de triplicarla.
export const getNegocioCarta = cache(async (slug: string) => {
  const { data, error } = await supabase
    .from('negocios')
    .select('id, nombre, slug, activo, suspendido, tagline, telefono, email, direccion, color_fondo, color_header, color_acento, logo_url, idiomas_activos, plantilla, mostrar_barra_categorias')
    .eq('slug', slug)
    .single()
  // Si Supabase devuelve un error (por ejemplo, falta una columna o un
  // permiso tras una migración a medias), se deja constancia en los logs
  // en vez de fallar en silencio como antes -- así la próxima vez que una
  // carta pública dé 404 sin motivo aparente, el porqué está en los
  // Runtime Logs de Vercel y no hay que ir a ciegas.
  if (error) {
    console.error('[getNegocioCarta] error de Supabase para slug', slug, JSON.stringify(error))
  }
  return data
})
