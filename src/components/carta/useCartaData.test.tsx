import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useCartaData } from './useCartaData'
import type { NegocioCarta, PlatoCrudo } from './types'

// registrarVisita hace un insert real a Supabase (ver src/lib/visitas.ts).
// Se mockea para que los tests de la lógica de la carta no dependan de
// red ni de credenciales, y para poder comprobar cuándo se llama.
vi.mock('@/lib/visitas', () => ({
  registrarVisita: vi.fn(),
}))

function negocio(overrides: Partial<NegocioCarta> = {}): NegocioCarta {
  return {
    id: 1,
    nombre: 'Il Faro',
    tagline: null,
    telefono: null,
    email: null,
    direccion: null,
    color_fondo: '#faf5ec',
    color_header: '#101b2d',
    color_acento: '#b8863b',
    logo_url: null,
    idiomas_activos: ['es'],
    plantilla: 'clasica',
    mostrar_barra_categorias: true,
    ...overrides,
  }
}

function plato(overrides: Partial<PlatoCrudo> = {}): PlatoCrudo {
  return {
    id: 1,
    categoria: 'Entrantes',
    categoria_en: null,
    categoria_de: null,
    categoria_it: null,
    categoria_sv: null,
    categoria_fr: null,
    nombre: 'Patatas bravas',
    nombre_en: null,
    nombre_de: null,
    nombre_it: null,
    nombre_sv: null,
    nombre_fr: null,
    descripcion: null,
    descripcion_en: null,
    descripcion_de: null,
    descripcion_it: null,
    descripcion_sv: null,
    descripcion_fr: null,
    etiquetas: [],
    precio: 5.5,
    ...overrides,
  }
}

describe('useCartaData - barra de categorías', () => {
  it('mostrarBarraCategorias es true por defecto (negocio antiguo sin el campo)', () => {
    const { result } = renderHook(() =>
      useCartaData(negocio({ mostrar_barra_categorias: null }), []),
    )
    expect(result.current.mostrarBarraCategorias).toBe(true)
  })

  it('mostrarBarraCategorias es false solo cuando el restaurante lo desactiva explícitamente', () => {
    const { result } = renderHook(() =>
      useCartaData(negocio({ mostrar_barra_categorias: false }), []),
    )
    expect(result.current.mostrarBarraCategorias).toBe(false)
  })

  it('con la barra desactivada, categoriasVisibles siempre iguala a categorias (carta apilada)', () => {
    const platos = [
      plato({ id: 1, categoria: 'Entrantes' }),
      plato({ id: 2, categoria: 'Postres' }),
    ]
    const { result } = renderHook(() =>
      useCartaData(negocio({ mostrar_barra_categorias: false }), platos),
    )
    act(() => result.current.seleccionarCategoria('Entrantes'))
    // Aunque se intente filtrar, en modo apilado no debe haber filtro.
    expect(result.current.categoriaActiva).toBeNull()
    expect(result.current.categoriasVisibles).toEqual(result.current.categorias)
    expect(result.current.categoriasVisibles).toHaveLength(2)
  })

  it('con la barra activada, seleccionarCategoria filtra y alternar la misma categoría la quita', () => {
    const platos = [
      plato({ id: 1, categoria: 'Entrantes' }),
      plato({ id: 2, categoria: 'Postres' }),
    ]
    const { result } = renderHook(() => useCartaData(negocio(), platos))

    act(() => result.current.seleccionarCategoria('Postres'))
    expect(result.current.categoriaActiva).toBe('Postres')
    expect(result.current.categoriasVisibles.map((c) => c.base)).toEqual(['Postres'])

    act(() => result.current.seleccionarCategoria('Postres'))
    expect(result.current.categoriaActiva).toBeNull()
    expect(result.current.categoriasVisibles).toHaveLength(2)
  })

  it('si la categoría filtrada deja de existir, se trata como "Todos" en vez de vaciar la carta', () => {
    const { result, rerender } = renderHook(
      ({ platos }: { platos: PlatoCrudo[] }) => useCartaData(negocio(), platos),
      { initialProps: { platos: [plato({ categoria: 'Entrantes' })] } },
    )
    act(() => result.current.seleccionarCategoria('Entrantes'))
    expect(result.current.categoriaActiva).toBe('Entrantes')

    // El dueño vacía esa categoría de platos.
    rerender({ platos: [plato({ categoria: 'Postres' })] })
    expect(result.current.categoriaActiva).toBeNull()
    expect(result.current.categoriasVisibles).toHaveLength(1)
  })
})

describe('useCartaData - idiomas', () => {
  it('cae en español si el negocio no tiene idiomas activos', () => {
    const { result } = renderHook(() =>
      useCartaData(negocio({ idiomas_activos: [] }), []),
    )
    expect(result.current.idiomasActivos).toEqual(['es'])
    expect(result.current.lang).toBe('es')
  })

  it('cae en español si el campo viene null', () => {
    const { result } = renderHook(() =>
      useCartaData(negocio({ idiomas_activos: null }), []),
    )
    expect(result.current.idiomasActivos).toEqual(['es'])
  })

  it('descarta idiomas desconocidos y conserva solo los soportados', () => {
    const { result } = renderHook(() =>
      useCartaData(negocio({ idiomas_activos: ['es', 'xx', 'fr'] }), []),
    )
    expect(result.current.idiomasActivos).toEqual(['es', 'fr'])
  })
})

describe('useCartaData - colores y textos con valores por defecto', () => {
  it('usa los colores/tagline por defecto cuando el negocio no los tiene configurados', () => {
    const { result } = renderHook(() =>
      useCartaData(
        negocio({ color_fondo: '', color_header: '', color_acento: '', tagline: null }),
        [],
      ),
    )
    expect(result.current.colorFondo).toBe('#faf5ec')
    expect(result.current.colorHeader).toBe('#101b2d')
    expect(result.current.colorAcento).toBe('#b8863b')
    expect(result.current.tagline).toBe('Carta digital')
  })
})
