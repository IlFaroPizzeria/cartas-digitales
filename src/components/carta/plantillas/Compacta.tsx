import type { CartaData } from '../types'

// Respaldo para negocios sin logo_url propio: iniciales pequeñas sin
// adornos -- coherente con el resto de esta plantilla, pensada para
// ocupar el minimo espacio posible.
function LogoInicial({ nombre, colorAcento }: { nombre: string; colorAcento: string }) {
  const inicial = (nombre.trim().charAt(0) || 'C').toUpperCase()
  return (
    <div
      aria-hidden="true"
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-sm font-bold"
      style={{ backgroundColor: `${colorAcento}30`, color: colorAcento }}
    >
      {inicial}
    </div>
  )
}

// Plantilla "Compacta": pensada para cartas muy largas (decenas de
// platos) -- cabecera y navegacion minimas, y los platos en una
// cuadricula de 2 columnas en vez de una lista larga, para que quepa
// mucho mas de un vistazo y haya que hacer scroll mucho menos.
export default function Compacta({
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
      {/* Cabecera: una sola fila compacta */}
      <header
        className="flex items-center gap-3 px-4 py-3"
        style={{ borderBottom: `1px solid ${colorHeader}1A` }}
      >
        {negocio.logo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={negocio.logo_url}
            alt={negocio.nombre}
            className="h-9 w-9 shrink-0 rounded-md object-cover"
          />
        ) : (
          <LogoInicial nombre={negocio.nombre} colorAcento={colorAcento} />
        )}
        <div className="min-w-0 flex-1">
          <h1
            className="truncate text-[15px] font-bold leading-tight"
            style={{ fontFamily: 'var(--font-display)', color: colorHeader }}
          >
            {negocio.nombre}
          </h1>
          <p className="truncate text-[10px] uppercase tracking-wide" style={{ color: colorAcento }}>
            {tagline}
          </p>
        </div>
        {idiomasActivos.length > 1 && (
          <div className="flex shrink-0 gap-1">
            {idiomasActivos.map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className="h-6 w-7 rounded text-[10px] font-bold"
                style={
                  lang === l
                    ? { backgroundColor: colorHeader, color: colorFondo }
                    : { color: colorHeader, border: `1px solid ${colorHeader}33` }
                }
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Navegacion de categorias: chips pequeños */}
      {mostrarBarraCategorias && categorias.length > 1 && (
        <nav
          className="sticky top-0 z-20 flex gap-1.5 overflow-x-auto px-4 py-2"
          style={{ backgroundColor: colorFondo, borderBottom: `1px solid ${colorHeader}14` }}
        >
          <button
            onClick={() => seleccionarCategoria(null)}
            className="shrink-0 rounded px-2 py-1 text-[10px] font-bold uppercase tracking-wide"
            style={
              categoriaActiva === null
                ? { backgroundColor: colorAcento, color: colorHeader }
                : { backgroundColor: `${colorHeader}0D`, color: `${colorHeader}99` }
            }
          >
            {t.todos}
          </button>
          {categorias.map((cat) => (
            <button
              key={cat.base}
              onClick={() => seleccionarCategoria(cat.base)}
              className="shrink-0 rounded px-2 py-1 text-[10px] font-bold uppercase tracking-wide"
              style={
                categoriaActiva === cat.base
                  ? { backgroundColor: colorAcento, color: colorHeader }
                  : { backgroundColor: `${colorHeader}0D`, color: `${colorHeader}99` }
              }
            >
              {cat.nombre}
            </button>
          ))}
        </nav>
      )}

      {/* Menu: cuadricula de 2 columnas por categoria */}
      <main className="px-4 pb-10 pt-3">
        {categorias.length === 0 && (
          <p className="text-center text-sm" style={{ color: `${colorHeader}80` }}>
            {t.noPlatos}
          </p>
        )}

        {categoriasVisibles.map((cat, i) => (
          <section key={cat.base} className={i > 0 ? 'mt-5' : ''}>
            <h2
              className="text-[11px] font-bold uppercase tracking-wide mb-2"
              style={{ color: colorAcento }}
            >
              {cat.nombre}
            </h2>
            <div className="grid grid-cols-2 gap-x-3 gap-y-2.5">
              {cat.platos.map((plato) => (
                <div key={plato.id} className="min-w-0">
                  <p
                    className="text-[12.5px] font-semibold leading-tight"
                    style={{ color: colorHeader }}
                  >
                    {plato.nombre}
                    {plato.etiquetas.length > 0 && (
                      <span className="ml-1">{plato.etiquetas.map((e) => e.emoji).join('')}</span>
                    )}
                  </p>
                  {plato.descripcion && (
                    <p
                      className="mt-0.5 text-[10.5px] leading-snug overflow-hidden text-ellipsis whitespace-nowrap"
                      style={{ color: `${colorHeader}80` }}
                    >
                      {plato.descripcion}
                    </p>
                  )}
                  <p className="mt-0.5 text-[11px] font-bold tabular-nums" style={{ color: colorAcento }}>
                    {Number(plato.precio).toFixed(2)}€
                  </p>
                </div>
              ))}
            </div>
          </section>
        ))}
      </main>

      {/* Footer con contacto: reducido */}
      <footer
        className="px-4 py-6 text-center"
        style={{ borderTop: `1px solid ${colorHeader}1A` }}
      >
        <p className="text-[10px] uppercase tracking-wide mb-2" style={{ color: colorAcento }}>
          {t.footLabel}
        </p>
        <div className="space-y-0.5 text-[11px]" style={{ color: `${colorHeader}99` }}>
          {negocio.direccion && <p>{negocio.direccion}</p>}
          {negocio.telefono && <p>{negocio.telefono}</p>}
          {negocio.email && <p>{negocio.email}</p>}
        </div>
        <a
          href="https://cartoca.es"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-block text-[9.5px] uppercase tracking-wide"
          style={{ color: `${colorHeader}59` }}
        >
          Hecho con Cartoca
        </a>
      </footer>
    </div>
  )
}
