import type { CartaData } from '../types'

// Respaldo para negocios sin logo_url propio: un circulo muy fino, sin
// relleno, con la inicial en el centro -- el mismo espiritu discreto que
// el resto de esta plantilla (nada de bloques de color).
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
      className="flex h-14 w-14 items-center justify-center rounded-full border text-lg"
      style={{
        borderColor: colorAcento,
        color: colorHeader,
        fontFamily: 'var(--font-display)',
      }}
    >
      {inicial}
    </div>
  )
}

// Plantilla "Elegante": inspirada en las cartas de alta cocina -- sin
// bloques de color ni ondas, muchisimo espacio en blanco, tipografia
// serif fina en mayusculas espaciadas, y precios sin linea de puntos.
// La navegacion de categorias y el selector de idioma son enlaces de
// texto en vez de pildoras, para no romper la quietud visual.
export default function Elegante({
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
      {/* Cabecera */}
      <header className="mx-auto max-w-sm px-6 pt-14 pb-10 text-center">
        {negocio.logo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={negocio.logo_url}
            alt={negocio.nombre}
            className="mx-auto h-14 w-auto object-contain"
          />
        ) : (
          <div className="flex justify-center">
            <LogoInicial nombre={negocio.nombre} colorAcento={colorAcento} colorHeader={colorHeader} />
          </div>
        )}

        <p
          className="mt-6 text-[10px] tracking-[0.4em] uppercase"
          style={{ color: colorAcento }}
        >
          {tagline}
        </p>
        <h1
          className="mt-3 text-3xl uppercase tracking-[0.08em]"
          style={{ fontFamily: 'var(--font-display)', fontWeight: 400, color: colorHeader }}
        >
          {negocio.nombre}
        </h1>
        <div className="mx-auto mt-5 h-px w-16" style={{ backgroundColor: `${colorAcento}80` }} />

        {/* Selector de idioma: enlaces de texto separados por barras, sin
            fondo ni borde -- solo si hay mas de 1 idioma activo. */}
        {idiomasActivos.length > 1 && (
          <div className="mt-5 flex justify-center items-center gap-2 text-[11px] tracking-widest uppercase">
            {idiomasActivos.map((l, i) => (
              <span key={l} className="flex items-center gap-2">
                {i > 0 && <span style={{ color: `${colorHeader}40` }}>/</span>}
                <button
                  onClick={() => setLang(l)}
                  style={lang === l ? { color: colorAcento } : { color: `${colorHeader}80` }}
                >
                  {l.toUpperCase()}
                </button>
              </span>
            ))}
          </div>
        )}
      </header>

      {/* Navegacion de categorias: enlaces de texto centrados separados
          por un punto medio, sin pildoras. */}
      {mostrarBarraCategorias && categorias.length > 1 && (
        <nav
          className="sticky top-0 z-20 mx-auto flex max-w-sm flex-wrap items-center justify-center gap-x-3 gap-y-1 px-6 py-4 text-[11px] uppercase tracking-widest"
          style={{ backgroundColor: colorFondo }}
        >
          <button
            onClick={() => seleccionarCategoria(null)}
            className="pb-0.5"
            style={
              categoriaActiva === null
                ? { color: colorHeader, borderBottom: `1px solid ${colorAcento}` }
                : { color: `${colorHeader}66` }
            }
          >
            {t.todos}
          </button>
          {categorias.map((cat) => (
            <span key={cat.base} className="flex items-center gap-3">
              <span style={{ color: `${colorHeader}40` }}>·</span>
              <button
                onClick={() => seleccionarCategoria(cat.base)}
                className="pb-0.5"
                style={
                  categoriaActiva === cat.base
                    ? { color: colorHeader, borderBottom: `1px solid ${colorAcento}` }
                    : { color: `${colorHeader}66` }
                }
              >
                {cat.nombre}
              </button>
            </span>
          ))}
        </nav>
      )}

      {/* Menu */}
      <main className="mx-auto max-w-sm px-6 pt-4 pb-16">
        {categorias.length === 0 && (
          <p className="text-center text-sm" style={{ color: `${colorHeader}80` }}>
            {t.noPlatos}
          </p>
        )}

        {categoriasVisibles.map((cat, i) => (
          <section key={cat.base} className={i > 0 ? 'mt-12' : ''}>
            <h2
              className="text-center text-[11px] tracking-[0.3em] uppercase mb-7"
              style={{ color: colorAcento }}
            >
              {cat.nombre}
            </h2>
            <ul className="space-y-7">
              {cat.platos.map((plato) => (
                <li key={plato.id} className="text-center">
                  <div className="flex items-baseline justify-center gap-3">
                    <span
                      className="text-[15px] uppercase tracking-wide"
                      style={{ fontFamily: 'var(--font-display)', color: colorHeader }}
                    >
                      {plato.nombre}
                    </span>
                    <span className="text-[13px]" style={{ color: colorAcento }}>
                      {Number(plato.precio).toFixed(2)}€
                    </span>
                  </div>
                  {plato.descripcion && (
                    <p
                      className="mt-1.5 text-[12.5px] italic leading-relaxed"
                      style={{ color: `${colorHeader}80` }}
                    >
                      {plato.descripcion}
                    </p>
                  )}
                  {plato.etiquetas.length > 0 && (
                    <p className="mt-1.5 text-[11px]" style={{ color: `${colorHeader}66` }}>
                      {plato.etiquetas.map((etiqueta) => `${etiqueta.emoji} ${etiqueta.label}`).join('   ')}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </main>

      {/* Footer con contacto */}
      <footer className="mx-auto max-w-sm px-6 pb-10 pt-8 text-center" style={{ borderTop: `1px solid ${colorHeader}1A` }}>
        <p className="text-[10px] tracking-[0.35em] uppercase mb-3" style={{ color: colorAcento }}>
          {t.footLabel}
        </p>
        <div className="space-y-1 text-[12px]" style={{ color: `${colorHeader}99` }}>
          {negocio.direccion && <p>{negocio.direccion}</p>}
          {negocio.telefono && <p>{negocio.telefono}</p>}
          {negocio.email && <p>{negocio.email}</p>}
        </div>
        <a
          href="https://cartoca.es"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-block text-[10px] tracking-[0.2em] uppercase"
          style={{ color: `${colorHeader}59` }}
        >
          Hecho con Cartoca
        </a>
      </footer>
    </div>
  )
}
