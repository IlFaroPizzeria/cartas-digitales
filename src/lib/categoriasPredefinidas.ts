// Lista fija de categorías que un restaurante puede usar en su carta. Ya
// no se puede escribir el nombre de una categoría a mano -- se elige de
// esta lista, que ya trae las traducciones a los idiomas soportados, sin
// depender de la traducción automática (ver src/lib/translate.ts, que
// solo se usa para platos).
export type CategoriaPredefinida = {
  id: string
  es: string
  en: string
  de: string
  it: string
  sv: string
  fr: string
}

export const CATEGORIAS_PREDEFINIDAS: CategoriaPredefinida[] = [
  {
    id: 'entrantes',
    es: 'Entrantes',
    en: 'Starters',
    de: 'Vorspeisen',
    it: 'Antipasti',
    sv: 'Förrätter',
    fr: 'Entrées',
  },
  {
    id: 'ensaladas',
    es: 'Ensaladas',
    en: 'Salads',
    de: 'Salate',
    it: 'Insalate',
    sv: 'Sallader',
    fr: 'Salades',
  },
  {
    id: 'principales',
    es: 'Platos principales',
    en: 'Main courses',
    de: 'Hauptgerichte',
    it: 'Piatti principali',
    sv: 'Huvudrätter',
    fr: 'Plats principaux',
  },
  {
    id: 'pasta-arroces',
    es: 'Pasta y arroces',
    en: 'Pasta & rice',
    de: 'Pasta und Reis',
    it: 'Pasta e riso',
    sv: 'Pasta och ris',
    fr: 'Pâtes et riz',
  },
  {
    id: 'pizzas',
    es: 'Pizzas',
    en: 'Pizzas',
    de: 'Pizzen',
    it: 'Pizze',
    sv: 'Pizzor',
    fr: 'Pizzas',
  },
  {
    id: 'postres',
    es: 'Postres',
    en: 'Desserts',
    de: 'Desserts',
    it: 'Dolci',
    sv: 'Efterrätter',
    fr: 'Desserts',
  },
  {
    id: 'bebidas',
    es: 'Bebidas',
    en: 'Drinks',
    de: 'Getränke',
    it: 'Bevande',
    sv: 'Drycker',
    fr: 'Boissons',
  },
  {
    id: 'compartir',
    es: 'Para compartir',
    en: 'To share',
    de: 'Zum Teilen',
    it: 'Da condividere',
    sv: 'Att dela',
    fr: 'À partager',
  },
  {
    id: 'infantil',
    es: 'Menú infantil',
    en: 'Kids menu',
    de: 'Kindermenü',
    it: 'Menù bambini',
    sv: 'Barnmeny',
    fr: 'Menu enfant',
  },
]

export function buscarCategoriaPredefinida(id: string): CategoriaPredefinida | null {
  return CATEGORIAS_PREDEFINIDAS.find((c) => c.id === id) ?? null
}

export function traduccionesPorNombreEs(
  nombreEs: string
): Pick<CategoriaPredefinida, 'en' | 'de' | 'it' | 'sv' | 'fr'> | null {
  const c = CATEGORIAS_PREDEFINIDAS.find((c) => c.es === nombreEs)
  if (!c) return null
  return { en: c.en, de: c.de, it: c.it, sv: c.sv, fr: c.fr }
}
