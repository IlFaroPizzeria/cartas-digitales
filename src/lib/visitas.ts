'use server'

// Registra cada apertura de una carta pública y cada cambio de idioma,
// para poder mostrarle al restaurante estadísticas básicas de uso
// (ver src/app/dashboard/estadisticas). Lo llama CartaClient, que es
// donde vive el estado del idioma seleccionado.
//
// Usa el cliente público (clave anon) a propósito: quien abre la carta
// nunca tiene sesión. Nunca debe romper la carta pública si falla (sin
// red, la tabla no existe todavía, RLS no configurada...), así que
// nunca lanza -- solo lo intenta y, si no puede, no pasa nada.
import { supabase } from '@/lib/supabase'

export async function registrarVisita(
  negocioId: number,
  idioma: string,
  evento: 'apertura' | 'idioma',
) {
  try {
    await supabase.from('visitas').insert({ negocio_id: negocioId, idioma, evento })
  } catch {
    // Sin estadísticas esta vez, pero la carta sigue funcionando igual.
  }
}
