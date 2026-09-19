import type { Lang } from '@/lib/etiquetas'

export type { Lang }

// Forma "cruda" de un plato tal cual llega de Supabase (ver
// src/app/[slug]/page.tsx): todavía sin resolver a un idioma.
export type PlatoCrudo = {
  id: number
  categoria: string
  categoria_en: string | null
  categoria_de: string | null
  categoria_it: string | null
  categoria_sv: string | null
  categoria_fr: string | null
  nombre: string
  nombre_en: string | null
  nombre_de: string | null
  nombre_it: string | null
  nombre_sv: string | null
  nombre_fr: string | null
  descripcion: string | null
  descripcion_en: string | null
  descripcion_de: string | null
  descripcion_it: string | null
  descripcion_sv: string | null
  descripcion_fr: string | null
  etiquetas: string[]
  precio: number
}

// Datos del negocio que necesita cualquier plantilla de carta pública.
// `plantilla` decide qué componente de src/components/carta/plantillas
// se usa para pintarlo (ver src/components/carta/plantillas/index.ts).
export type NegocioCarta = {
  id: number
  nombre: string
  tagline: string | null
  telefono: string | null
  email: string | null
  direccion: string | null
  color_fondo: string
  color_header: string
  color_acento: string
  logo_url: string | null
  idiomas_activos: string[] | null
  plantilla: string | null
}

// Un plato ya resuelto al idioma activo: nombre/descripción/etiquetas
// en el idioma que corresponda, sin los sufijos _en/_de/... Esto es lo
// que consume una plantilla -- no necesita saber nada de idiomas.
export type PlatoResuelto = {
  id: number
  nombre: string
  descripcion: string | null
  precio: number
  etiquetas: { id: string; emoji: string; label: string }[]
}

export type CategoriaResuelta = {
  // Categoría en español: clave estable que no cambia con el idioma,
  // para poder filtrar por categoría sin que se rompa al traducir.
  base: string
  // Categoría ya traducida al idioma activo, lista para mostrar.
  nombre: string
  platos: PlatoResuelto[]
}

export type TextosUI = {
  footLabel: string
  noPlatos: string
  todos: string
}

// Todo lo que useCartaData calcula a partir de (negocio, platos) y que
// cualquier plantilla recibe ya resuelto: colores con su valor por
// defecto aplicado, selector de idioma, categorías traducidas y
// filtrables, y los textos de interfaz del idioma activo. Una
// plantilla nueva solo tiene que maquetar esto -- toda la lógica de
// idiomas, analíticas y agrupado de platos vive en un único sitio.
export type CartaData = {
  negocio: NegocioCarta
  colorFondo: string
  colorHeader: string
  colorAcento: string
  tagline: string
  lang: Lang
  setLang: (lang: Lang) => void
  idiomasActivos: Lang[]
  t: TextosUI
  categorias: CategoriaResuelta[]
  categoriaActiva: string | null
  categoriasVisibles: CategoriaResuelta[]
  // Alterna el filtro de categoría: pasar la misma que ya está activa
  // (o null) lo quita y vuelve a mostrar "Todos".
  seleccionarCategoria: (base: string | null) => void
}
