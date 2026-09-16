"use client";

import { useState } from "react";
import { etiquetaPorId } from "@/lib/etiquetas";

type Plato = {
  id: number;
  categoria: string;
  categoria_en: string | null;
  categoria_de: string | null;
  categoria_it: string | null;
  categoria_sv: string | null;
  categoria_fr: string | null;
  nombre: string;
  nombre_en: string | null;
  nombre_de: string | null;
  nombre_it: string | null;
  nombre_sv: string | null;
  nombre_fr: string | null;
  descripcion: string | null;
  descripcion_en: string | null;
  descripcion_de: string | null;
  descripcion_it: string | null;
  descripcion_sv: string | null;
  descripcion_fr: string | null;
  etiquetas: string[];
  precio: number;
};

type Negocio = {
  nombre: string;
  tagline: string | null;
  telefono: string | null;
  email: string | null;
  direccion: string | null;
  color_fondo: string;
  color_header: string;
  color_acento: string;
  logo_url: string | null;
  idiomas_activos: string[] | null;
};

type Lang = "es" | "en" | "de" | "it" | "sv" | "fr";

const UI_TEXT: Record<Lang, { footLabel: string; noPlatos: string }> = {
  es: {
    footLabel: "Carta digital",
    noPlatos: "Todavía no hay platos disponibles.",
  },
  en: { footLabel: "Digital Menu", noPlatos: "No dishes available yet." },
  de: {
    footLabel: "Digitale Speisekarte",
    noPlatos: "Noch keine Gerichte verfügbar.",
  },
  it: {
    footLabel: "Menù digitale",
    noPlatos: "Ancora nessun piatto disponibile.",
  },
  sv: { footLabel: "Digital meny", noPlatos: "Inga rätter tillgängliga ännu." },
  fr: {
    footLabel: "Menu digital",
    noPlatos: "Aucun plat disponible pour le moment.",
  },
};

// Idiomas soportados por la plataforma, en el orden en que se muestran
// si el negocio los tiene activos (negocio.idiomas_activos)
const ALL_LANGS: Lang[] = ["es", "en", "de", "it", "sv", "fr"];

// Respaldo neutral para negocios sin logo_url propio: un círculo con la
// inicial del restaurante, en los mismos colores que ya elige el propio
// negocio (nada de una marca genérica de Cartoca ni de la antigua "Il Faro").
function LogoInicial({
  nombre,
  colorAcento,
  colorHeader,
}: {
  nombre: string;
  colorAcento: string;
  colorHeader: string;
}) {
  const inicial = (nombre.trim().charAt(0) || "C").toUpperCase();
  return (
    <div
      aria-hidden="true"
      className="flex h-24 w-24 items-center justify-center rounded-full text-4xl"
      style={{
        backgroundColor: colorAcento,
        color: colorHeader,
        fontFamily: "var(--font-display)",
        fontWeight: 500,
      }}
    >
      {inicial}
    </div>
  );
}

export default function CartaClient({
  negocio,
  platos,
}: {
  negocio: Negocio;
  platos: Plato[];
}) {
  // Idiomas realmente activos para este negocio (lo que ha contratado).
  // Si el campo viene vacío por lo que sea, cae en español solo.
  const idiomasActivos: Lang[] =
    negocio.idiomas_activos && negocio.idiomas_activos.length > 0
      ? (negocio.idiomas_activos.filter((l) =>
          ALL_LANGS.includes(l as Lang),
        ) as Lang[])
      : ["es"];

  const [lang, setLang] = useState<Lang>(idiomasActivos[0] || "es");

  const colorFondo = negocio.color_fondo || "#faf5ec";
  const colorHeader = negocio.color_header || "#101b2d";
  const colorAcento = negocio.color_acento || "#b8863b";
  const tagline = negocio.tagline || "Carta digital";

  const CATEGORIA_POR_IDIOMA: Record<Lang, keyof Plato | null> = {
    es: null, // usa 'categoria' directamente
    en: "categoria_en",
    de: "categoria_de",
    it: "categoria_it",
    sv: "categoria_sv",
    fr: "categoria_fr",
  };
  const DESCRIPCION_POR_IDIOMA: Record<Lang, keyof Plato | null> = {
    es: null,
    en: "descripcion_en",
    de: "descripcion_de",
    it: "descripcion_it",
    sv: "descripcion_sv",
    fr: "descripcion_fr",
  };
  const NOMBRE_POR_IDIOMA: Record<Lang, keyof Plato | null> = {
    es: null,
    en: "nombre_en",
    de: "nombre_de",
    it: "nombre_it",
    sv: "nombre_sv",
    fr: "nombre_fr",
  };

  function categoriaTexto(p: Plato) {
    const key = CATEGORIA_POR_IDIOMA[lang];
    if (!key) return p.categoria;
    return (p[key] as string | null) || p.categoria;
  }
  function descripcionTexto(p: Plato) {
    const key = DESCRIPCION_POR_IDIOMA[lang];
    if (!key) return p.descripcion;
    return (p[key] as string | null) || p.descripcion;
  }
  function nombreTexto(p: Plato) {
    const key = NOMBRE_POR_IDIOMA[lang];
    if (!key) return p.nombre;
    return (p[key] as string | null) || p.nombre;
  }

  // Agrupar por categoría (en el idioma activo), preservando el orden de aparición
  const categorias: { nombre: string; platos: Plato[] }[] = [];
  platos.forEach((plato) => {
    const cat = categoriaTexto(plato) || "Otros";
    let grupo = categorias.find((c) => c.nombre === cat);
    if (!grupo) {
      grupo = { nombre: cat, platos: [] };
      categorias.push(grupo);
    }
    grupo.platos.push(plato);
  });

  const t = UI_TEXT[lang];

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
                backgroundColor: "#00000030",
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
              fontFamily: "var(--font-display)",
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

      {/* Menú */}
      <main className="mx-auto max-w-md px-6 pt-6 pb-10">
        {categorias.length === 0 && (
          <p className="text-center text-sm text-[#6B7280]">{t.noPlatos}</p>
        )}

        {categorias.map((cat, i) => (
          <section key={cat.nombre} className={i > 0 ? "mt-10" : ""}>
            <h2
              className="text-xs tracking-[0.25em] uppercase mb-5 pb-2 border-b"
              style={{
                fontFamily: "var(--font-display)",
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
                        fontFamily: "var(--font-display)",
                        fontWeight: 500,
                        color: colorHeader,
                      }}
                    >
                      {nombreTexto(plato)}
                    </span>
                    <span className="flex-1 border-b border-dotted border-[#00000025] translate-y-[-3px]" />
                    <span
                      className="text-[15px] font-semibold tabular-nums"
                      style={{ color: colorAcento }}
                    >
                      {Number(plato.precio).toFixed(2)}€
                    </span>
                  </div>
                  {descripcionTexto(plato) && (
                    <p className="mt-1 text-[13px] leading-relaxed text-[#6B7280]">
                      {descripcionTexto(plato)}
                    </p>
                  )}
                  {plato.etiquetas.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {plato.etiquetas.map((id) => {
                        const etiqueta = etiquetaPorId(id);
                        if (!etiqueta) return null;
                        return (
                          <span
                            key={id}
                            className="inline-flex items-center gap-1 text-[10.5px] px-1.5 py-0.5 rounded-full"
                            style={{
                              backgroundColor: `${colorHeader}0D`,
                              color: `${colorHeader}B3`,
                            }}
                          >
                            <span>{etiqueta.emoji}</span>
                            {etiqueta.label[lang]}
                          </span>
                        );
                      })}
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
      </footer>
    </div>
  );
}
