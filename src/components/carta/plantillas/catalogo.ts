// Catálogo de plantillas de carta pública: solo datos (id, nombre,
// descripción), sin importar ningún componente de React. Lo usan tanto
// el registro de componentes (plantillas/index.ts, lado cliente) como
// el selector del panel del dueño y la validación en el servidor
// (dashboard/actions.ts) -- así todos comparten la misma lista de ids
// válidos sin arrastrar componentes de presentación a código servidor.
export const PLANTILLAS_INFO = [
  {
    id: 'clasica',
    nombre: 'Clásica',
    descripcion:
      'Cabecera oscura con degradado y ondas, tipografía serif itálica y precios con línea de puntos. La carta original de Cartoca.',
  },
  {
    id: 'moderna',
    nombre: 'Moderna',
    descripcion:
      'Cabecera clara y minimalista, tipografía de palo, platos en lista con divisores finos y precio alineado a la derecha.',
  },
] as const

export type PlantillaId = (typeof PLANTILLAS_INFO)[number]['id']

export const PLANTILLA_IDS: PlantillaId[] = PLANTILLAS_INFO.map((p) => p.id)

export const PLANTILLA_POR_DEFECTO: PlantillaId = 'clasica'

export function esPlantillaValida(id: string): id is PlantillaId {
  return (PLANTILLA_IDS as string[]).includes(id)
}
