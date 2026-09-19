import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Endpoint para un monitor externo (UptimeRobot, Better Uptime...) que
// avise si cartoca.es cae. No basta con comprobar que Next.js responde
// -- el outage de septiembre de 2026 fue precisamente eso: la app
// respondía perfectamente, era Supabase quien devolvía un error en
// cada consulta. Por eso este endpoint hace una consulta real (barata,
// solo el id de un negocio) y solo devuelve "ok" si Supabase responde
// de verdad.
//
// No requiere autenticación a propósito: un monitor de uptime externo
// no tiene sesión, y esto no expone nada que la carta pública no
// exponga ya (ninguna fila concreta, solo si la consulta funciona).
export async function GET() {
  const { error } = await supabase.from('negocios').select('id').limit(1)

  if (error) {
    return NextResponse.json(
      { status: 'error', detail: error.message },
      { status: 503 },
    )
  }

  return NextResponse.json({ status: 'ok' })
}
