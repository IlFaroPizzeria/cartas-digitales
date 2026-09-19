import type { CartaData } from '../types'

// Respaldo para negocios sin logo_url propio: un cuadrado grande y muy
// redondeado con borde grueso del color de fondo, como un sello sobre
// la cabecera -- a juego con las formas redondeadas del resto de esta
// plantilla.
function LogoInicial({
  nombre,
  colorFondo,
  colorAcento,
  colorHeader,
}: {
  nombre: string
  colorFondo: string
  colorAcento: string
  colorHeader: string
}) {
  const inicial = (nombre.trim().charAt(0) || 'C').toUpperCase()
  return (
    <div
      aria-hidden="true"
      className="flex h-20 w-20 items-center justify-center rounded-3xl border-4 text-3xl font-bold"
      style={{ backgroundColor: colorAcento, borderColor: colorFondo, color: colorHeader }}
    >
      {inicial}
    </div>
  )
}

// Plantilla "Rustica": calida y con formas muy redondeadas -- cabecera
// curva a modo de tarjeta, logo a modo de sello, platos como tarjetas
// individuales con el precio en una insignia, en vez de la lista
// continua de Clasica/Moderna. Pensada para dar sensacion
// artesanal/de barrio.
export default function Rustica({
  negocio,
  colorFondo,
  colorHeader,
  colorAcento,
  tagline,
  lang,
  setLang,
  idiomasActivos,
  t,
  mostrarBarraCategorias,
  categorias,
  categoriaActiva,
  categoriasVisibles,
  seleccionarCategoria,
}: CartaData) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: colorFondo }}>
      {/* Cabecera: bloque redondeado por abajo, con el logo a modo de
          sello. */}
      <header
        className="px-6 pt-10 pb-14 text-center rounded-b-[2.5rem]"
        style={{ backgroundColor: colorHeader }}
      >
        {idiomasActivos.length > 1 && (
          <div className="flex justify-center gap-1.5 mb-6">
            {idiomasActivos.map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className="h-7 px-2.5 rounded-full border text-[11px] font-bold transition-colors"
                style={
                  lang === l
                    ? { backgroundColor: colorAcento, color: colorHeader, borderColor: colorAcento }
                    : { color: colorFondo, borderColor: `${colorFondo}40` }
                }
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        )}

        {negocio.logo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={negocio.logo_url}
            alt={negocio.nombre}
            className="mx-auto h-20 w-20 rounded-3xl border-4 object-cover"
            style={{ borderColor: colorFondo }}
          />
        ) : (
          <div className="flex justify-center">
            <LogoInicial nombre={negocio.nombre} colorFondo={colorFondo} colorAcento={colorAcento} colorHeader={colorHeader} />
          </div>
        )}

        <h1
          className="mt-4 text-2xl font-bold"
          style={{ fontFamily: 'var(--font-display)', color: colorFondo }}
        >
          {negocio.nombre}
        </h1>
        <p
          className="mt-2 inline-block rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide"
          style={{ backgroundColor: colorAcento, color: colorHeader }}
        >
          {tagline}
        </p>
      </header>

      {/* Navegacion de categorias: pildoras grandes con borde grueso. */}
      {mostrarBarraCategorias && categorias.length > 1 && (
        <nav className="mx-auto flex max-w-md gap-2.5 overflow-x-auto px-6 py-5">
          <button
            onClick={() => seleccionarCategoria(null)}
            className="shrink-0 rounded-full border-2 px-4 py-2 text-[12px] font-bold uppercase tracking-wide transition-colors"
            style={
              categoriaActiva === null
                ? { backgroundColor: colorAcento, borderColor: colorAcento, color: colorHeader }
                : { borderColor: `${colorHeader}30`, color: colorHeader }
            }
          >
            {t.todos}
          </button>
          {categorias.map((cat) => (
            <button
              key={cat.base}
              onClick={() => seleccionarCategoria(cat.base)}
              className="shrink-0 rounded-full border-2 px-4 py-2 text-[12px] font-bold uppercase tracking-wide transition-colors"
              style={
                categoriaActiva === cat.base
                  ? { backgroundColor: colorAcento, borderColor: colorAcento, color: colorHeader }
                  : { borderColor: `${colorHeader}30`, color: colorHeader }
              }
            >
              {cat.nombre}
            </button>
          ))}
        </nav>
      )}

      {/* Menu: cada plato es una tarjeta con borde, no una lista continua. */}
      <main className="mx-auto max-w-md px-6 pb-14 pt-2">
        {categorias.length === 0 && (
          <p className="text-center text-sm" style={{ color: `${colorHeader}80` }}>
            {t.noPlatos}
          </p>
        )}

        {categoriasVisibles.map((cat, i) => (
          <section key={cat.base} className={i > 0 ? 'mt-8' : ''}>
            <h2
              className="text-base font-bold mb-3"
              style={{ fontFamily: 'var(--font-display)', color: colorHeader }}
            >
              {cat.nombre}
            </h2>
            <div className="space-y-3">
              {cat.platos.map((plato) => (
                <div
                  key={plato.id}
                  className="rounded-2xl border-2 p-4"
                  style={{ borderColor: `${colorHeader}20` }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-bold leading-snug" style={{ color: colorHeader }}>
                      {plato.nombre}
                    </p>
                    <span
                      className="shrink-0 inline-flex h-8 items-center justify-center rounded-full px-2.5 text-[11px] font-bold tabular-nums"
                      style={{ backgroundColor: colorAcento, color: colorHeader }}
                    >
                      {Number(plato.precio).toFixed(2)}€
                    </span>
                  </div>
                  {plato.descripcion && (
                    <p className="mt-1.5 text-[13px] leading-relaxed" style={{ color: `${colorHeader}99` }}>
                      {plato.descripcion}
                    </p>
                  )}
                  {plato.etiquetas.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {plato.etiquetas.map((etiqueta) => (
                        <span
                          key={etiqueta.id}
                          className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10.5px]"
                          style={{ borderColor: `${colorHeader}30`, color: `${colorHeader}B3` }}
                        >
                          <span>{etiqueta.emoji}</span>
                          {etiqueta.label}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        ))}
      </main>

      {/* Footer con contacto: bloque redondeado por arriba, a juego con
          la cabecera. */}
      <footer
        className="rounded-t-[2.5rem] px-6 pt-8 pb-10 text-center"
        style={{ backgroundColor: colorHeader }}
      >
        <p
          className="mb-3 inline-block rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide"
          style={{ backgroundColor: colorAcento, color: colorHeader }}
        >
          {t.footLabel}
        </p>
        <div className="space-y-1 text-[12px]" style={{ color: `${colorFondo}CC` }}>
          {negocio.direccion && <p>{negocio.direccion}</p>}
          {negocio.telefono && <p>{negocio.telefono}</p>}
          {negocio.email && <p>{negocio.email}</p>}
        </div>
        <a
          href="https://cartoca.es"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-block rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-wide"
          style={{ borderColor: `${colorFondo}40`, color: `${colorFondo}99` }}
        >
          Hecho con Cartoca
        </a>
      </footer>
    </div>
  )
}
