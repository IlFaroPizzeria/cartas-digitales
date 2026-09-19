import type { ComponentType } from 'react'
import type { CartaData } from '../types'
import Clasica from './Clasica'

// Registro de plantillas de carta pública: la clave es el valor que se
// guarda en negocios.plantilla. Añadir una plantilla nueva es añadir
// una entrada aquí (y su componente en este mismo directorio) -- el
// resto del sistema (datos, idiomas, filtro de categorías, analíticas)
// ya lo resuelve src/components/carta/useCartaData.ts para todas por
// igual.
export const PLANTILLAS: Record<string, ComponentType<CartaData>> = {
  clasica: Clasica,
}

export const PLANTILLA_POR_DEFECTO = 'clasica'

export function plantillaDe(id: string | null): ComponentType<CartaData> {
  return (id && PLANTILLAS[id]) || PLANTILLAS[PLANTILLA_POR_DEFECTO]
}
