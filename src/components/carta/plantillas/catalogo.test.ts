import { describe, expect, it } from 'vitest'
import {
  esPlantillaValida,
  PLANTILLA_IDS,
  PLANTILLA_POR_DEFECTO,
  PLANTILLAS_INFO,
} from './catalogo'
import { PLANTILLAS } from './index'

// Este catálogo es la fuente de verdad que usa dashboard/actions.ts en
// el servidor para validar la plantilla que manda el formulario de
// configuración, y el registro de componentes (index.ts) para pintar
// la carta pública. Si un id se añade en un sitio y se olvida en el
// otro, el resultado es una carta rota o un guardado que rechaza un
// valor legítimo -- por eso estos tests comprueban que ambos lados
// están sincronizados, no solo el catálogo en aislado.
describe('catalogo de plantillas', () => {
  it('PLANTILLA_POR_DEFECTO es una de las plantillas listadas', () => {
    expect(PLANTILLA_IDS).toContain(PLANTILLA_POR_DEFECTO)
  })

  it('esPlantillaValida acepta todos los ids del catálogo', () => {
    for (const id of PLANTILLA_IDS) {
      expect(esPlantillaValida(id)).toBe(true)
    }
  })

  it('esPlantillaValida rechaza ids desconocidos, vacíos o manipulados', () => {
    expect(esPlantillaValida('no-existe')).toBe(false)
    expect(esPlantillaValida('')).toBe(false)
    expect(esPlantillaValida('Clasica')).toBe(false) // sensible a mayúsculas
  })

  it('cada plantilla del catálogo tiene un componente registrado en plantillas/index.ts', () => {
    for (const id of PLANTILLA_IDS) {
      expect(PLANTILLAS[id]).toBeDefined()
    }
  })

  it('no hay ids duplicados ni entradas sin nombre/descripción', () => {
    const ids = PLANTILLAS_INFO.map((p) => p.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const p of PLANTILLAS_INFO) {
      expect(p.nombre.trim().length).toBeGreaterThan(0)
      expect(p.descripcion.trim().length).toBeGreaterThan(0)
    }
  })
})
