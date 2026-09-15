// Etiquetas de alérgenos (los 14 oficiales de la UE, Reglamento 1169/2011,
// obligatorios en la hostelería española) más 3 etiquetas de dieta/picante.
// Vive en un solo sitio para que el formulario del dashboard y la carta
// pública (en sus 6 idiomas) usen siempre la misma lista e id.

export type Lang = 'es' | 'en' | 'de' | 'it' | 'sv' | 'fr'

export type Etiqueta = {
  id: string
  emoji: string
  grupo: 'alergeno' | 'dieta'
  label: Record<Lang, string>
}

export const ETIQUETAS: Etiqueta[] = [
  // --- Alérgenos oficiales UE (14) ---
  {
    id: 'gluten',
    emoji: '🌾',
    grupo: 'alergeno',
    label: { es: 'Gluten', en: 'Gluten', de: 'Gluten', it: 'Glutine', sv: 'Gluten', fr: 'Gluten' },
  },
  {
    id: 'crustaceos',
    emoji: '🦐',
    grupo: 'alergeno',
    label: {
      es: 'Crustáceos',
      en: 'Crustaceans',
      de: 'Krebstiere',
      it: 'Crostacei',
      sv: 'Skaldjur',
      fr: 'Crustacés',
    },
  },
  {
    id: 'huevos',
    emoji: '🥚',
    grupo: 'alergeno',
    label: { es: 'Huevo', en: 'Egg', de: 'Ei', it: 'Uovo', sv: 'Ägg', fr: 'Œuf' },
  },
  {
    id: 'pescado',
    emoji: '🐟',
    grupo: 'alergeno',
    label: { es: 'Pescado', en: 'Fish', de: 'Fisch', it: 'Pesce', sv: 'Fisk', fr: 'Poisson' },
  },
  {
    id: 'cacahuetes',
    emoji: '🥜',
    grupo: 'alergeno',
    label: {
      es: 'Cacahuete',
      en: 'Peanuts',
      de: 'Erdnüsse',
      it: 'Arachidi',
      sv: 'Jordnötter',
      fr: 'Arachides',
    },
  },
  {
    id: 'soja',
    emoji: '🫘',
    grupo: 'alergeno',
    label: { es: 'Soja', en: 'Soy', de: 'Soja', it: 'Soia', sv: 'Soja', fr: 'Soja' },
  },
  {
    id: 'lacteos',
    emoji: '🥛',
    grupo: 'alergeno',
    label: { es: 'Lácteos', en: 'Milk', de: 'Milch', it: 'Latte', sv: 'Mjölk', fr: 'Lait' },
  },
  {
    id: 'frutos_cascara',
    emoji: '🌰',
    grupo: 'alergeno',
    label: {
      es: 'Frutos de cáscara',
      en: 'Tree nuts',
      de: 'Schalenfrüchte',
      it: 'Frutta a guscio',
      sv: 'Nötter',
      fr: 'Fruits à coque',
    },
  },
  {
    id: 'apio',
    emoji: '🥬',
    grupo: 'alergeno',
    label: { es: 'Apio', en: 'Celery', de: 'Sellerie', it: 'Sedano', sv: 'Selleri', fr: 'Céleri' },
  },
  {
    id: 'mostaza',
    emoji: '✳️',
    grupo: 'alergeno',
    label: { es: 'Mostaza', en: 'Mustard', de: 'Senf', it: 'Senape', sv: 'Senap', fr: 'Moutarde' },
  },
  {
    id: 'sesamo',
    emoji: '⚪',
    grupo: 'alergeno',
    label: { es: 'Sésamo', en: 'Sesame', de: 'Sesam', it: 'Sesamo', sv: 'Sesam', fr: 'Sésame' },
  },
  {
    id: 'sulfitos',
    emoji: '🍷',
    grupo: 'alergeno',
    label: {
      es: 'Sulfitos',
      en: 'Sulphites',
      de: 'Sulfite',
      it: 'Solfiti',
      sv: 'Sulfiter',
      fr: 'Sulfites',
    },
  },
  {
    id: 'altramuces',
    emoji: '🫛',
    grupo: 'alergeno',
    label: {
      es: 'Altramuces',
      en: 'Lupin',
      de: 'Lupinen',
      it: 'Lupini',
      sv: 'Lupiner',
      fr: 'Lupin',
    },
  },
  {
    id: 'moluscos',
    emoji: '🐚',
    grupo: 'alergeno',
    label: {
      es: 'Moluscos',
      en: 'Molluscs',
      de: 'Weichtiere',
      it: 'Molluschi',
      sv: 'Blötdjur',
      fr: 'Mollusques',
    },
  },
  // --- Dieta / picante ---
  {
    id: 'vegano',
    emoji: '🌱',
    grupo: 'dieta',
    label: { es: 'Vegano', en: 'Vegan', de: 'Vegan', it: 'Vegano', sv: 'Vegansk', fr: 'Végan' },
  },
  {
    id: 'vegetariano',
    emoji: '🥦',
    grupo: 'dieta',
    label: {
      es: 'Vegetariano',
      en: 'Vegetarian',
      de: 'Vegetarisch',
      it: 'Vegetariano',
      sv: 'Vegetarisk',
      fr: 'Végétarien',
    },
  },
  {
    id: 'picante',
    emoji: '🌶️',
    grupo: 'dieta',
    label: { es: 'Picante', en: 'Spicy', de: 'Scharf', it: 'Piccante', sv: 'Stark', fr: 'Épicé' },
  },
]

const ETIQUETAS_POR_ID = new Map(ETIQUETAS.map((e) => [e.id, e]))

export function etiquetaPorId(id: string): Etiqueta | undefined {
  return ETIQUETAS_POR_ID.get(id)
}

// Filtra cualquier lista de strings (p. ej. lo que llega de un formulario)
// para quedarnos solo con ids de etiqueta reales, evitando guardar en la
// base de datos valores inventados o arbitrarios.
export function etiquetasValidas(ids: string[]): string[] {
  return ids.filter((id) => ETIQUETAS_POR_ID.has(id))
}
