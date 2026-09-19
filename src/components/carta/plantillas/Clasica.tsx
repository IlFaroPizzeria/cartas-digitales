import type { CartaData } from '../types'

// Respaldo neutral para negocios sin logo_url propio: un círculo con la
// inicial del restaurante, en los mismos colores que ya elige el propio
// negocio (nada de una marca genérica de Cartoca).
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
      className="flex h-24 w-24 items-center justify-center rounded-full text-4xl"
      style={{
        backgroundColor: colorAcento,
        color: colorHeader,
        fontFamily: 'var(--font-display)',
        fontWeight: 500,
      }}
    >
      {inicial}
    </div>
  )
}

// Plantilla "Clásica": la carta original de Cartoca -- cabecera oscura
// con degradado y ondas, logo centrado, tipografía serif itálica, y
// lista de platos con línea de puntos entre el nombre y el precio. Es
// la plantilla por defecto de todo restaurante que no ha elegido otra
// (ver src/components/carta/plantillas/index.ts).
export default function Clasica({
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
      <header
        className="relative overflow-hidden px-6 pt-10 pb-16"
        style={{ backgroundColor: colorHeader }}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(60% 55% at 50% 0%, ${colorAcento}59, transparent 70%)`,
          }}
        />

        {/* Selector de idioma: solo se muestra si el negocio tiene más de 1 activo */}
        {idiomasActivos.length > 1 && (
          <div className="relative flex justify-center mb-6">
            <div
              className="inline-flex gap-0.5 rounded-full p-1 border"
              style={{
                backgroundColor: '#00000030',
                borderColor: `${colorAcento}59`,
              }}
            >
              {idiomasActivos.map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className="px-3.5 py-1.5 rounded-full text-[11px] font-semibold tracking-wide transition-colors"
                  style={
                    lang === l
                      ? { backgroundColor: colorAcento, color: colorHeader }
                      : { color: `${colorAcento}CC` }
                  }
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="relative flex flex-col items-center text-center">
          {negocio.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={negocio.logo_url}
              alt={negocio.nombre}
              className="h-24 w-auto object-contain drop-shadow-lg"
            />
          ) : (
            <LogoInicial
              nombre={negocio.nombre}
              colorAcento={colorAcento}
              colorHeader={colorHeader}
            />
          )}
          <p
            className="mt-4 text-[11px] tracking-[0.35em] uppercase"
            style={{ color: colorAcento }}
          >
            {tagline}
          </p>
          <h1
            className="mt-2 text-4xl leading-tight italic"
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 500,
              color: colorFondo,
            }}
          >
            {negocio.nombre}
          </h1>
          <div
            className="mt-4 h-px w-10"
            style={{ backgroundColor: `${colorAcento}80` }}
          />
        </div>

        <svg
          className="absolute bottom-[-1px] left-0 w-full"
          height="28"
          viewBox="0 0 1440 60"
          preserveAspectRatio="none"
        >
          <path
            d="M0,30 C240,60 480,0 720,22 C960,44 1200,8 1440,28 L1440,60 L0,60 Z"
            fill={colorFondo}
          />
        </svg>
      </header>

      {/* Barra de categorías: pulsar una muestra solo esos platos: pulsar
          "Todos" (o volver a pulsar la misma) los vuelve a mostrar todos.
          Pegada arriba al hacer scroll para no perderla de vista en
          cartas largas. Solo tiene sentido si hay más de una categoría. */}
      {mostrarBarraCategorias && categorias.length > 1 && (
        <div
          className="sticky top-0 z-20"
          style={{
            backgroundColor: colorFondo,
            boxShadow: `0 1px 0 ${colorHeader}1F`,
          }}
        >
          <nav className="mx-auto flex max-w-md gap-2 overflow-x-auto px-6 py-3">
            <button
              onClick={() => seleccionarCategoria(null)}
              className="shrink-0 rounded-full px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-wide transition-colors"
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
                className="shrink-0 rounded-full px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-wide transition-colors"
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
        </div>
      )}

      {/* Menú */}
      <main className="mx-auto max-w-md px-6 pt-6 pb-10">
        {categorias.length === 0 && (
          <p className="text-center text-sm text-[#6B7280]">{t.noPlatos}</p>
        )}

        {categoriasVisibles.map((cat, i) => (
          <section key={cat.base} className={i > 0 ? 'mt-10' : ''}>
            <h2
              className="text-xs tracking-[0.25em] uppercase mb-5 pb-2 border-b"
              style={{
                fontFamily: 'var(--font-display)',
                color: colorHeader,
                borderColor: `${colorHeader}33`,
              }}
            >
              {cat.nombre}
            </h2>
            <ul className="space-y-6">
              {cat.platos.map((plato) => (
                <li key={plato.id}>
                  <div className="flex items-baseline gap-2">
                    <span
                      className="text-[17px]"
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontWeight: 500,
                        color: colorHeader,
                      }}
                    >
                      {plato.nombre}
                    </span>
                    <span className="flex-1 border-b border-dotted border-[#00000025] translate-y-[-3px]" />
                    <span
                      className="text-[15px] font-semibold tabular-nums"
                      style={{ color: colorAcento }}
                    >
                      {Number(plato.precio).toFixed(2)}€
                    </span>
                  </div>
                  {plato.descripcion && (
                    <p className="mt-1 text-[13px] leading-relaxed text-[#6B7280]">
                      {plato.descripcion}
                    </p>
                  )}
                  {plato.etiquetas.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {plato.etiquetas.map((etiqueta) => (
                        <span
                          key={etiqueta.id}
                          className="inline-flex items-center gap-1 text-[10.5px] px-1.5 py-0.5 rounded-full"
                          style={{
                            backgroundColor: `${colorHeader}0D`,
                            color: `${colorHeader}B3`,
                          }}
                        >
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
        className="relative overflow-hidden px-6 pt-8 pb-8 text-center"
        style={{ backgroundColor: colorHeader }}
      >
        <svg
          className="absolute top-[-1px] left-0 w-full rotate-180"
          height="20"
          viewBox="0 0 1440 60"
          preserveAspectRatio="none"
        >
          <path
            d="M0,30 C240,60 480,0 720,22 C960,44 1200,8 1440,28 L1440,60 L0,60 Z"
            fill={colorFondo}
          />
        </svg>

        <p
          className="relative text-[11px] tracking-[0.3em] uppercase mb-3"
          style={{ color: `${colorAcento}B3` }}
        >
          {t.footLabel}
        </p>

        <div
          className="relative space-y-1 text-[12px]"
          style={{ color: `${colorFondo}CC` }}
        >
          {negocio.direccion && <p>{negocio.direccion}</p>}
          {negocio.telefono && <p>{negocio.telefono}</p>}
          {negocio.email && <p>{negocio.email}</p>}
        </div>

        <a
          href="https://cartoca.es"
          target="_blank"
          rel="noopener noreferrer"
          className="relative mt-5 inline-block text-[10px] tracking-[0.2em] uppercase"
          style={{ color: `${colorFondo}66` }}
        >
          Hecho con Cartoca
        </a>
      </footer>
    </div>
  )
}
