// Enlaces de estudio por tema. Son búsquedas dirigidas (no apuntan a un artículo fijo), así que siempre funcionan;
// tú eliges la fuente y verificas. Para citar en APA, pídele a Claude que te ayude a armar la referencia.
import temario from '../data/culta.json'

export type Enlace = { etiqueta: string; emoji: string; url: string; para: string }

/** Quita paréntesis y deja el núcleo del tema; los paréntesis se usan como palabras extra. */
export const nucleo = (tema: string) => tema.replace(/\(.*?\)/g, '').replace(/\s+/g, ' ').trim()
const extras = (tema: string) => (tema.match(/\((.*?)\)/)?.[1] || '').split(/[,;—-]/).map((x) => x.trim()).filter((x) => x.length > 2).slice(0, 3)

export function enlacesTema(tema: string, bloque: 'B1' | 'B2' | 'B3' = 'B1'): Enlace[] {
  const base = nucleo(tema)
  const q = encodeURIComponent(base)
  const qx = encodeURIComponent([base, ...extras(tema).slice(0, 1)].join(' '))
  const wiki: Enlace = { etiqueta: 'Panorama (Wikipedia)', emoji: '📖', url: `https://es.wikipedia.org/wiki/Special:Search?search=${q}&go=Ir`, para: 'Para entender el mapa general en 5 minutos' }
  const video: Enlace = { etiqueta: 'Explicación en video', emoji: '🎬', url: `https://www.youtube.com/results?search_query=${encodeURIComponent(base + ' explicación clara')}`, para: 'Para verlo explicado con ejemplos' }
  const academico: Enlace = { etiqueta: 'Fuente académica', emoji: '🎓', url: `https://scholar.google.com/scholar?hl=es&q=${qx}`, para: 'Para profundizar y tener algo citable en APA' }
  const libros: Enlace = { etiqueta: 'Libros sobre el tema', emoji: '📚', url: `https://www.google.com/search?tbm=bks&hl=es&q=${qx}`, para: 'Para ver qué autores lo trabajan' }
  if (bloque === 'B3') return [
    { etiqueta: 'Diccionario (RAE)', emoji: '📕', url: `https://dle.rae.es/${encodeURIComponent(base.split(' ')[0].toLowerCase())}`, para: 'Para precisar significados' },
    { etiqueta: 'Dudas de español (Fundéu)', emoji: '✍️', url: `https://www.fundeu.es/?s=${q}`, para: 'Para escribir con precisión' },
    wiki, video,
  ]
  if (bloque === 'B2') return [wiki, { etiqueta: 'Britannica', emoji: '🌍', url: `https://www.britannica.com/search?query=${q}`, para: 'Enciclopedia con revisión editorial' }, video, academico]
  return [wiki, video, academico, libros]
}

/** Plan corto para estudiar un tema sin saturarse. */
export const PASOS_ESTUDIO = [
  { n: 1, t: 'Panorama', d: '5 min: lee lo general y anota 3 ideas con tus palabras.' },
  { n: 2, t: 'Video o lectura', d: '10 min: una sola fuente más, buscando un ejemplo concreto.' },
  { n: 3, t: 'Explícalo', d: 'Sin mirar: escribe cómo se lo explicarías a alguien. Ahí te evalúo.' },
]

type Bloque = { id: 'B1' | 'B2' | 'B3'; categorias: { nombre: string; temas: string[] }[] }
export const BLOQUES_DATA = temario as unknown as Bloque[]
export const todosLosTemas = () => BLOQUES_DATA.flatMap((b) => b.categorias.flatMap((c) => c.temas.map((t) => ({ bloque: b.id, categoria: c.nombre, tema: t }))))

/** ¿Ya hay una sesión sobre este tema? (coincidencia por el inicio del título) */
export const sesionDeTema = (sesiones: any[], tema: string) => sesiones.find((x) => {
  const a = String(x.tema || '').toLowerCase(), b = tema.toLowerCase()
  return a.includes(b.slice(0, 18)) || b.includes(a.split(' (')[0])
})

/** Qué estudiar hoy: primero refuerza lo que quedó "En progreso" o con nota baja; si no, el siguiente tema sin ver. */
export function temaSugerido(sesiones: any[], bloque: 'B1' | 'B2' | 'B3', semilla = 0) {
  const delBloque = todosLosTemas().filter((t) => t.bloque === bloque)
  const refuerzo = [...sesiones].filter((x) => x.bloque === bloque && (x.estado === 'En progreso' || Number(x.nota) < 15)).sort((a, b) => Number(a.nota) - Number(b.nota))[0]
  if (refuerzo) {
    const t = delBloque.find((d) => sesionDeTema(sesiones, d.tema) === refuerzo) || { bloque, categoria: '', tema: refuerzo.tema }
    return { ...t, tema: t.tema || refuerzo.tema, motivo: `Reforzar: quedó en “${refuerzo.estado || 'En progreso'}” con ${refuerzo.nota}/20.`, tipo: 'refuerzo' as const }
  }
  const sinVer = delBloque.filter((d) => !sesionDeTema(sesiones, d.tema))
  if (!sinVer.length) { const t = delBloque[semilla % delBloque.length]; return { ...t, motivo: 'Ya viste todo este bloque: repásalo con otro ángulo.', tipo: 'repaso' as const } }
  // la categoría con menos temas vistos va primero
  const porCat = new Map<string, number>()
  delBloque.forEach((d) => porCat.set(d.categoria, (porCat.get(d.categoria) || 0) + (sesionDeTema(sesiones, d.tema) ? 1 : 0)))
  const elegido = [...sinVer].sort((a, b) => (porCat.get(a.categoria) || 0) - (porCat.get(b.categoria) || 0))[0]
  return { ...elegido, motivo: `Nuevo tema en “${elegido.categoria}”, donde llevas menos recorrido.`, tipo: 'nuevo' as const }
}
