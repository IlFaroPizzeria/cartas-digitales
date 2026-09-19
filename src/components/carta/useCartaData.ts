'use client'

import { useEffect, useRef, useState } from 'react'
import { etiquetaPorId } from '@/lib/etiquetas'
import { registrarVisita } from '@/lib/visitas'
import type {
  CartaData,
  CategoriaResuelta,
  Lang,
  NegocioCarta,
  PlatoCrudo,
  PlatoResuelto,
  TextosUI,
} from './types'

const UI_TEXT: Record<Lang, TextosUI> = {
  es: {
    footLabel: 'Carta digital',
    noPlatos: 'Todavía no hay platos disponibles.',
    todos: 'Todos',
  },
  en: {
    footLabel: 'Digital Menu',
    noPlatos: 'No dishes available yet.',
    todos: 'All',
  },
  de: {
    footLabel: 'Digitale Speisekarte',
    noPlatos: 'Noch keine Gerichte verfügbar.',
    todos: 'Alle',
  },
  it: {
    footLabel: 'Menù digitale',
    noPlatos: 'Ancora nessun piatto disponibile.',
    todos: 'Tutti',
  },
  sv: {
    footLabel: 'Digital meny',
    noPlatos: 'Inga rätter tillgängliga ännu.',
    todos: 'Alla',
  },
  fr: {
    footLabel: 'Menu digital',
    noPlatos: 'Aucun plat disponible pour le moment.',
    todos: 'Tous',
  },
}

// Idiomas soportados por la plataforma, en el orden en que se muestran
// si el negocio los tiene activos (negocio.idiomas_activos).
const ALL_LANGS: Lang[] = ['es', 'en', 'de', 'it', 'sv', 'fr']

const CATEGORIA_POR_IDIOMA: Record<Lang, keyof PlatoCrudo | null> = {
  es: null, // usa 'categoria' directamente
  en: 'categoria_en',
  de: 'categoria_de',
  it: 'categoria_it',
  sv: 'categoria_sv',
  fr: 'categoria_fr',
}
const DESCRIPCION_POR_IDIOMA: Record<Lang, keyof PlatoCrudo | null> = {
  es: null,
  en: 'descripcion_en',
  de: 'descripcion_de',
  it: 'descripcion_it',
  sv: 'descripcion_sv',
  fr: 'descripcion_fr',
}
const NOMBRE_POR_IDIOMA: Record<Lang, keyof PlatoCrudo | null> = {
  es: null,
  en: 'nombre_en',
  de: 'nombre_de',
  it: 'nombre_it',
  sv: 'nombre_sv',
  fr: 'nombre_fr',
}

// Todo lo que necesita cualquier plantilla de carta pública, calculado
// una sola vez a partir de los datos crudos: idiomas, agrupado y
// traducción de categorías/platos, filtro de categoría activa y
// registro de analíticas (apertura de la carta y cambios de idioma).
// Ver src/components/carta/types.ts para la forma exacta de lo que
// devuelve.
export function useCartaData(
  negocio: NegocioCarta,
  platos: PlatoCrudo[],
): CartaData {
  // Idiomas realmente activos para este negocio (lo que ha contratado).
  // Si el campo viene vacío por lo que sea, cae en español solo.
  const idiomasActivos: Lang[] =
    negocio.idiomas_activos && negocio.idiomas_activos.length > 0
      ? (negocio.idiomas_activos.filter((l) =>
          ALL_LANGS.includes(l as Lang),
        ) as Lang[])
      : ['es']

  const [lang, setLang] = useState<Lang>(idiomasActivos[0] || 'es')
  // Categoría seleccionada en la barra de categorías (null = "Todos").
  // Se guarda la categoría en español (estable) y no el texto ya
  // traducido, para que la selección no se pierda al cambiar de idioma.
  const [filtroCategoria, setFiltroCategoria] = useState<string | null>(null)

  // Registra la apertura de la carta (primera vez que se monta) y,
  // después, cada cambio de idioma -- así el restaurante puede ver
  // cuánto se usa su carta y en qué idiomas, desde
  // src/app/dashboard/estadisticas. Si esto falla nunca rompe nada,
  // ver src/lib/visitas.ts.
  const esPrimeraCarga = useRef(true)
  useEffect(() => {
    if (esPrimeraCarga.current) {
      esPrimeraCarga.current = false
      registrarVisita(negocio.id, lang, 'apertura')
    } else {
      registrarVisita(negocio.id, lang, 'idioma')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang])

  function categoriaTexto(p: PlatoCrudo) {
    const key = CATEGORIA_POR_IDIOMA[lang]
    if (!key) return p.categoria
    return (p[key] as string | null) || p.categoria
  }
  function descripcionTexto(p: PlatoCrudo) {
    const key = DESCRIPCION_POR_IDIOMA[lang]
    if (!key) return p.descripcion
    return (p[key] as string | null) || p.descripcion
  }
  function nombreTexto(p: PlatoCrudo) {
    const key = NOMBRE_POR_IDIOMA[lang]
    if (!key) return p.nombre
    return (p[key] as string | null) || p.nombre
  }

  // Agrupar por categoría, preservando el orden de aparición, y
  // resolver cada plato al idioma activo (nombre, descripción,
  // etiquetas) para que las plantillas no tengan que saber nada de
  // idiomas.
  const categorias: CategoriaResuelta[] = []
  platos.forEach((plato) => {
    const base = plato.categoria || 'Otros'
    let grupo = categorias.find((c) => c.base === base)
    if (!grupo) {
      grupo = { base, nombre: categoriaTexto(plato) || 'Otros', platos: [] }
      categorias.push(grupo)
    }
    const platoResuelto: PlatoResuelto = {
      id: plato.id,
      nombre: nombreTexto(plato),
      descripcion: descripcionTexto(plato),
      precio: plato.precio,
      etiquetas: plato.etiquetas
        .map((id) => {
          const etiqueta = etiquetaPorId(id)
          return etiqueta ? { id, emoji: etiqueta.emoji, label: etiqueta.label[lang] } : null
        })
        .filter((e): e is { id: string; emoji: string; label: string } => e !== null),
    }
    grupo.platos.push(platoResuelto)
  })

  // Si la categoría seleccionada ya no existe (por ejemplo, el dueño la
  // vació de platos), se trata como "Todos" en vez de dejar la carta
  // vacía sin explicación.
  const categoriaActiva =
    filtroCategoria && categorias.some((c) => c.base === filtroCategoria)
      ? filtroCategoria
      : null
  const categoriasVisibles = categoriaActiva
    ? categorias.filter((c) => c.base === categoriaActiva)
    : categorias

  function seleccionarCategoria(base: string | null) {
    setFiltroCategoria((actual) => {
      if (base === null) return null
      return actual === base ? null : base
    })
  }

  return {
    negocio,
    colorFondo: negocio.color_fondo || '#faf5ec',
    colorHeader: negocio.color_header || '#101b2d',
    colorAcento: negocio.color_acento || '#b8863b',
    tagline: negocio.tagline || 'Carta digital',
    lang,
    setLang,
    idiomasActivos,
    t: UI_TEXT[lang],
    categorias,
    categoriaActiva,
    categoriasVisibles,
    seleccionarCategoria,
  }
}
