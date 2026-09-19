import type { CartaData } from '../types'

// Respaldo para negocios sin logo_url propio: un cuadrado con borde y
// la inicial del restaurante -- mismo espíritu que el círculo de
// Clásica, pero con el lenguaje visual (cuadrado, borde fino) de esta
// plantilla en vez de reutilizar el componente de la otra.
function LogoInicial({
  nombre,
  colorAcento,
  colorHeader,
}: {
  nombre: string
  colorAcento: string
  colorHeader: string
}) {
  const inicial = (nombre.trim().charAt(0) || 'C').toUpperCase()
  return (
    <div
      aria-hidden="true"
      className="flex h-16 w-16 items-center justify-center rounded-xl border-2 text-2xl font-bold"
      style={{ borderColor: colorAcento, color: colorHeader }}
    >
      {inicial}
    </div>
  )
}

// Plantilla "Moderna": cabecera clara y sobria (sin ondas ni degradado),
// tipografía de palo en vez de serif itálica, lista de platos con
// divisores finos y precio alineado a la derecha en vez de línea de
// puntos, y navegación por pestañas subrayadas en vez de píldoras. Usa
// los mismos tres colores que el restaurante ya elige
// (color_fondo/header/acento), solo que aplicados de otra forma.
export default function Moderna({
  negocio,
  colorFondo,
  colorHeader,
  colorAcento,
  tagline,
  lang,
  setLang,
  idiomasActivos,
  t,
  categorias,
  categoriaActiva,
  categoriasVisibles,
  seleccionarCategoria,
}: CartaData) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: colorFondo }}>
      {/* Cabecera */}
      <header
        className="mx-auto max-w-md border-b px-6 pt-10 pb-6 text-center"
        style={{ borderColor: `${colorHeader}1A` }}
      >
        {negocio.logo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={negocio.logo_url}
            alt={negocio.nombre}
            className="mx-auto h-16 w-16 rounded-xl object-contain"
          />
        ) : (
          <div className="flex justify-center">
            <LogoInicial nombre={negocio.nombre} colorAcento={colorAcento} colorHeader={colorHeader} />
          </div>
        )}

        <h1
          className="mt-4 text-2xl font-bold tracking-tight"
          style={{ color: colorHeader }}
        >
          {negocio.nombre}
        </h1>
        <p
          className="mt-1 text-[11px] font-semibold uppercase tracking-[0.2em]"
          style={{ color: colorAcento }}
        >
          {tagline}
        </p>

        {/* Selector de idioma: solo si hay más de 1 activo */}
        {idiomasActivos.length > 1 && (
          <div className="mt-5 flex justify-center gap-1.5">
            {idiomasActivos.map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className="h-7 w-9 rounded-md border text-[11px] font-bold transition-colors"
                style={
                  lang === l
                    ? { backgroundColor: colorHeader, color: colorFondo, borderColor: colorHeader }
                    : { color: colorHeader, borderColor: `${colorHeader}33` }
                }
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Barra de categorías: pestañas subrayadas en vez de píldoras.
          Misma lógica de filtro que la plantilla Clásica (categoriaActiva
          / seleccionarCategoria vienen ya resueltas de useCartaData). */}
      {categorias.length > 1 && (
        <div
          className="sticky top-0 z-20 border-b"
          style={{ backgroundColor: colorFondo, borderColor: `${colorHeader}1A` }}
        >
          <nav className="mx-auto flex max-w-md gap-5 overflow-x-auto px-6">
            <button
              onClick={() => seleccionarCategoria(null)}
              className="shrink-0 border-b-2 py-3 text-[12px] font-semibold uppercase tracking-wide transition-colors"
              style={
                categoriaActiva === null
                  ? { borderColor: colorAcento, color: colorHeader }
                  : { borderColor: 'transparent', color: `${colorHeader}80` }
              }
            >
              {t.todos}
            </button>
            {categorias.map((cat) => (
              <button
                key={cat.base}
                onClick={() => seleccionarCategoria(cat.base)}
                className="shrink-0 border-b-2 py-3 text-[12px] font-semibold uppercase tracking-wide transition-colors"
                style={
                  categoriaActiva === cat.base
                    ? { borderColor: colorAcento, color: colorHeader }
                    : { borderColor: 'transparent', color: `${colorHeader}80` }
                }
              >
                {cat.nombre}
              </button>
            ))}
          </nav>
        </div>
      )}

      {/* Menú */}
      <main className="mx-auto max-w-md px-6 pt-6 pb-10">
        {categorias.length === 0 && (
          <p className="text-center text-sm" style={{ color: `${colorHeader}80` }}>
            {t.noPlatos}
          </p>
        )}

        {categoriasVisibles.map((cat, i) => (
          <section key={cat.base} className={i > 0 ? 'mt-8' : ''}>
            <h2
              className="text-sm font-bold uppercase tracking-wide mb-1"
              style={{ color: colorAcento }}
            >
              {cat.nombre}
            </h2>
            <ul className="divide-y" style={{ borderColor: `${colorHeader}14` }}>
              {cat.platos.map((plato) => (
                <li key={plato.id} className="py-4">
                  <div className="flex items-start justify-between gap-4">
                    <p
                      className="font-semibold leading-snug"
                      style={{ color: colorHeader }}
                    >
                      {plato.nombre}
                    </p>
                    <p
                      className="shrink-0 font-bold tabular-nums"
                      style={{ color: colorAcento }}
                    >
                      {Number(plato.precio).toFixed(2)}€
                    </p>
                  </div>
                  {plato.descripcion && (
                    <p
                      className="mt-1 text-[13px] leading-relaxed"
                      style={{ color: `${colorHeader}99` }}
                    >
                      {plato.descripcion}
                    </p>
                  )}
                  {plato.etiquetas.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-2 text-[11px]" style={{ color: `${colorHeader}80` }}>
                      {plato.etiquetas.map((etiqueta) => (
                        <span key={etiqueta.id} className="inline-flex items-center gap-1">
                          <span>{etiqueta.emoji}</span>
                          {etiqueta.label}
                        </span>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </main>

      {/* Footer con contacto */}
      <footer
        className="border-t px-6 py-8 text-center text-[12px]"
        style={{ borderColor: `${colorHeader}1A`, color: `${colorHeader}99` }}
      >
        <p
          className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em]"
          style={{ color: colorAcento }}
        >
          {t.footLabel}
        </p>
        <div className="space-y-1">
          {negocio.direccion && <p>{negocio.direccion}</p>}
          {negocio.telefono && <p>{negocio.telefono}</p>}
          {negocio.email && <p>{negocio.email}</p>}
        </div>
      </footer>
    </div>
  )
}
