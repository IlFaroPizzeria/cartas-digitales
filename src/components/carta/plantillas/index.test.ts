import { describe, expect, it } from 'vitest'
import { plantillaDe, PLANTILLAS } from './index'
import { PLANTILLA_POR_DEFECTO } from './catalogo'

// plantillaDe es lo que decide, para cada request de una carta
// pública, qué componente se renderiza a partir de negocios.plantilla.
// Un negocio puede tener ese campo a null (nunca lo configuró) o con
// un valor que ya no existe (una plantilla que se quitó del catálogo,
// o un valor corrupto): en ningún caso debe romper la carta, tiene que
// caer siempre en la plantilla por defecto.
describe('plantillaDe', () => {
  it('devuelve el componente correcto para un id válido', () => {
    expect(plantillaDe('moderna')).toBe(PLANTILLAS.moderna)
    expect(plantillaDe('rustica')).toBe(PLANTILLAS.rustica)
  })

  it('cae en la plantilla por defecto si el id es null', () => {
    expect(plantillaDe(null)).toBe(PLANTILLAS[PLANTILLA_POR_DEFECTO])
  })

  it('cae en la plantilla por defecto si el id no existe', () => {
    expect(plantillaDe('no-existe')).toBe(PLANTILLAS[PLANTILLA_POR_DEFECTO])
  })

  it('cae en la plantilla por defecto con una cadena vacía', () => {
    expect(plantillaDe('')).toBe(PLANTILLAS[PLANTILLA_POR_DEFECTO])
  })
})
