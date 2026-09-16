// Traducción automática de platos y categorías, usando la API de Google
// Cloud Translation (v2, autenticación por API key). Sigue el mismo patrón
// que el envío de emails con Resend (src/components/landing/actions.ts):
// si no hay API key configurada, no se rompe nada -- simplemente no se
// traduce nada y se deja un aviso en los logs del servidor.
import { IDIOMAS } from "./idiomas";

const TRANSLATE_API_URL =
  "https://translation.googleapis.com/language/translate/v2";

// 'es' es siempre el idioma base en el que el usuario escribe; el resto
// son a los que se traduce automáticamente.
export const IDIOMAS_TRADUCIBLES = IDIOMAS.map((i) => i.id).filter(
  (id) => id !== "es",
);

export function traduccionDisponible(): boolean {
  return Boolean(process.env.GOOGLE_TRANSLATE_API_KEY);
}

async function traducirTexto(
  texto: string,
  destino: string,
): Promise<string | null> {
  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
  if (!apiKey || !texto.trim()) return null;

  try {
    const res = await fetch(`${TRANSLATE_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        q: texto,
        source: "es",
        target: destino,
        format: "text",
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(
        "Error traduciendo texto con Google Translate:",
        res.status,
        errText,
      );
      return null;
    }

    const data = await res.json();
    const traducido = data?.data?.translations?.[0]?.translatedText;
    return typeof traducido === "string" ? traducido : null;
  } catch (err) {
    console.error("Error de red traduciendo texto con Google Translate:", err);
    return null;
  }
}

// Traduce un texto del español a varios idiomas en paralelo. Si la API no
// está configurada, o el texto está vacío, o alguna traducción individual
// falla, simplemente se omite de la respuesta -- nunca lanza un error que
// pueda romper el guardado del plato/categoría que la llama.
export async function traducirAIdiomas(
  texto: string,
  idiomas: string[],
): Promise<Record<string, string>> {
  if (!traduccionDisponible() || !texto.trim() || idiomas.length === 0)
    return {};

  const resultados = await Promise.all(
    idiomas.map(
      async (idioma) => [idioma, await traducirTexto(texto, idioma)] as const,
    ),
  );

  const salida: Record<string, string> = {};
  for (const [idioma, traducido] of resultados) {
    if (traducido) salida[idioma] = traducido;
  }
  return salida;
}
