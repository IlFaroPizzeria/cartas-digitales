import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// A esta URL redirige Supabase después de que alguien confirme su email
// (el link del correo apunta aquí con ?code=...). Sin esto, la
// confirmación dejaba al usuario en una página en blanco sin sesión.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login`)
}
