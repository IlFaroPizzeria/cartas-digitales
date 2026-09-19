import type { ComponentType } from 'react'
import type { CartaData } from '../types'
import { PLANTILLA_POR_DEFECTO } from './catalogo'
import Clasica from './Clasica'
import Moderna from './Moderna'
import Elegante from './Elegante'
import Rustica from './Rustica'
import Compacta from './Compacta'

// Registro de plantillas de carta pública: la clave es el valor que se
// guarda en negocios.plantilla. Añadir una plantilla nueva es: crear
// el componente en este directorio, añadirlo aquí, y añadir su
// id/nombre/descripción en ./catalogo.ts (para el selector del panel
// y la validación en el servidor). El resto del sistema (datos,
// idiomas, filtro de categorías, analíticas) ya lo resuelve
// src/components/carta/useCartaData.ts para todas por igual.
export const PLANTILLAS: Record<string, ComponentType<CartaData>> = {
  clasica: Clasica,
  moderna: Moderna,
  elegante: Elegante,
  rustica: Rustica,
  compacta: Compacta,
}

export function plantillaDe(id: string | null): ComponentType<CartaData> {
  return (id && PLANTILLAS[id]) || PLANTILLAS[PLANTILLA_POR_DEFECTO]
}
