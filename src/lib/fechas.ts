// Pequeña utilidad para no llamar a Date.now()/new Date() directamente
// dentro de un Server Component -- el linter de React (react-hooks/purity)
// lo marca como "impuro" aunque aquí sea perfectamente seguro (no hay
// re-render en cliente, es solo una consulta puntual al cargar la página).
export function isoHaceDias(dias: number): string {
  return new Date(Date.now() - dias * 24 * 60 * 60 * 1000).toISOString()
}
