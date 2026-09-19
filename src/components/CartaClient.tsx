'use client'

import { useCartaData } from './carta/useCartaData'
import { plantillaDe } from './carta/plantillas'
import type { NegocioCarta, PlatoCrudo } from './carta/types'

// Punto de entrada de la carta pública: calcula los datos compartidos
// (idiomas, categorías traducidas y filtrables, analíticas -- ver
// useCartaData) y los pasa a la plantilla visual que el restaurante
// tenga elegida en negocio.plantilla (ver carta/plantillas/index.ts).
// Añadir una plantilla nueva no toca este archivo.
export default function CartaClient({
  negocio,
  platos,
}: {
  negocio: NegocioCarta
  platos: PlatoCrudo[]
}) {
  const data = useCartaData(negocio, platos)
  const Plantilla = plantillaDe(negocio.plantilla)
  // plantillaDe solo busca en un registro estático (ver
  // carta/plantillas/index.ts); no crea ningún componente nuevo, así
  // que el aviso de "componentes creados durante el render" no aplica.
  // eslint-disable-next-line react-hooks/static-components
  return <Plantilla {...data} />
}
