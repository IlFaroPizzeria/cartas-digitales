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
  {
    id: 'elegante',
    nombre: 'Elegante',
    descripcion:
      'Sin bloques de color, mucho espacio en blanco y tipografía serif fina en mayúsculas. Inspirada en las cartas de alta cocina.',
  },
  {
    id: 'rustica',
    nombre: 'Rústica',
    descripcion:
      'Cabecera y pie redondeados, logo a modo de sello y cada plato en su propia tarjeta con el precio en una insignia. Ambiente cálido y artesanal.',
  },
  {
    id: 'compacta',
    nombre: 'Compacta',
    descripcion:
      'Platos en cuadrícula de 2 columnas con lo justo de texto. Pensada para cartas muy largas, para que quepa todo sin apenas hacer scroll.',
  },
] as const

export type PlantillaId = (typeof PLANTILLAS_INFO)[number]['id']

export const PLANTILLA_IDS: PlantillaId[] = PLANTILLAS_INFO.map((p) => p.id)

export const PLANTILLA_POR_DEFECTO: PlantillaId = 'clasica'

export function esPlantillaValida(id: string): id is PlantillaId {
  return (PLANTILLA_IDS as string[]).includes(id)
}
