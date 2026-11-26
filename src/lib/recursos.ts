// Enlaces de estudio por tema. Son búsquedas dirigidas (no apuntan a un artículo fijo), así que siempre funcionan;
// tú eliges la fuente y verificas. Para citar en APA, pídele a Claude que te ayude a armar la referencia.
import temario from '../data/culta.json'
import { FICHAS, type Q } from '../data/temas'

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
  const sitio = (sitios: string[], etiqueta: string, emoji: string, para: string): Enlace => ({ etiqueta, emoji, url: `https://www.google.com/search?q=${encodeURIComponent(sitios.map((x) => 'site:' + x).join(' OR ') + ' ' + base)}`, para })
  const redalyc = sitio(['redalyc.org', 'scielo.org', 'dialnet.unirioja.es'], 'Artículos en español (Redalyc, SciELO, Dialnet)', '🔬', 'Revistas académicas en español, de acceso abierto')
  const libros: Enlace = { etiqueta: 'Libros sobre el tema', emoji: '📚', url: `https://www.google.com/search?tbm=bks&hl=es&q=${qx}`, para: 'Para ver qué autores lo trabajan' }
  if (bloque === 'B3') return [
    { etiqueta: 'Diccionario (RAE)', emoji: '📕', url: `https://dle.rae.es/${encodeURIComponent(base.split(' ')[0].toLowerCase())}`, para: 'Para precisar significados' },
    { etiqueta: 'Dudas de español (Fundéu)', emoji: '✍️', url: `https://www.fundeu.es/?s=${q}`, para: 'Para escribir con precisión' },
    wiki, video,
  ]
  if (bloque === 'B2') return [sitio(['es.khanacademy.org'], 'Khan Academy', '🧑‍🏫', 'Lecciones gratuitas en español'), wiki, { etiqueta: 'Britannica', emoji: '🌍', url: `https://www.britannica.com/search?query=${q}`, para: 'Enciclopedia con revisión editorial' }, video, academico, redalyc]
  return [sitio(['economipedia.com'], 'Economipedia', '💡', 'Definiciones claras de economía, finanzas y gestión'), sitio(['gestiopolis.com'], 'Gestiopolis', '🏢', 'Artículos de gestión y administración'), wiki, video, academico, redalyc, libros]
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


/* ───────── Fichas de estudio: resumen, enlaces y quiz por tema ───────── */
const MEDIOS: Enlace[] = [
  { etiqueta: 'BBC Mundo', emoji: '📰', url: 'https://www.bbc.com/mundo', para: 'Noticias internacionales en español' },
  { etiqueta: 'DW Español', emoji: '🌍', url: 'https://www.dw.com/es', para: 'Actualidad internacional y análisis' },
  { etiqueta: 'El Comercio (Perú)', emoji: '🇵🇪', url: 'https://elcomercio.pe', para: 'Actualidad nacional' },
  { etiqueta: 'Reuters', emoji: '🗞️', url: 'https://www.reuters.com/world/', para: 'Agencia internacional (en inglés)' },
]
const RAE: Enlace[] = [
  { etiqueta: 'Diccionario de la RAE', emoji: '📕', url: 'https://dle.rae.es/', para: 'Significado y sinónimos precisos' },
  { etiqueta: 'Fundéu', emoji: '✍️', url: 'https://www.fundeu.es/', para: 'Dudas de uso del español' },
]
const norm = (t: string) => t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')

/** Posición del tema dentro del temario (el orden coincide con FICHAS). */
export const indiceTema = (tema: string) => {
  const todos = todosLosTemas().map((t) => norm(t.tema))
  const t = norm(tema)
  let i = todos.indexOf(t)
  if (i < 0) i = todos.findIndex((x) => x.startsWith(t.slice(0, 22)) || t.startsWith(x.slice(0, 22)))
  return i
}
export const fichaDe = (tema: string) => {
  const i = indiceTema(tema)
  const f = i >= 0 ? FICHAS[i] : undefined
  return f ? { i, resumen: f[1], wikis: f[2].split('|'), quiz: f[3], lectura: f[4] } : null
}

export function enlacesFicha(tema: string, bloque: 'B1' | 'B2' | 'B3' = 'B1'): Enlace[] {
  const f = fichaDe(tema)
  if (!f) return enlacesTema(tema, bloque)
  const fuente: Enlace[] = []
  f.wikis.forEach((w) => {
    if (w === '@medios') fuente.push(...MEDIOS)
    else if (w === '@rae') fuente.push(...RAE)
    else { const t = w.replaceAll('_', ' '); fuente.push({ etiqueta: `Wikipedia: ${t}`, emoji: '📖', url: `https://es.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(t)}&go=Ir`, para: 'Artículo de referencia (si el título exacto no existe, abre la búsqueda)' }) }
  })
  const resto = enlacesTema(tema, bloque).filter((e) => !e.etiqueta.startsWith('Panorama') && !e.etiqueta.startsWith('Diccionario') && !e.etiqueta.startsWith('Dudas') && !e.etiqueta.startsWith('Britannica'))
  const libro: Enlace[] = f.lectura ? [{ etiqueta: f.lectura, emoji: '📚', url: `https://www.google.com/search?tbm=bks&hl=es&q=${encodeURIComponent(f.lectura)}`, para: 'Lectura sugerida' }] : []
  const esWiki = (e: Enlace) => e.etiqueta.startsWith('Wikipedia')
  return [...fuente.filter((e) => !esWiki(e)), ...resto.filter((e) => !e.etiqueta.startsWith('Libros sobre') && !e.etiqueta.startsWith('Artículos')), ...fuente.filter(esWiki), ...resto.filter((e) => e.etiqueta.startsWith('Artículos')), ...libro]
}
export const linkWikipedia = (tema: string) => { const f = fichaDe(tema); const w = f?.wikis.find((x) => !x.startsWith('@')); return w ? w.replaceAll('_', ' ') : null }

/* ───────── Quiz ───────── */
export type Pregunta = { q: string; opciones: string[]; correcta: number; origen: 'ficha' | 'idea' }
const mezclar = <T,>(a: T[]) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]] } return b }
const deQ = (q: Q): Pregunta => { const op = mezclar([q[1], q[2], q[3], q[4]]); return { q: q[0], opciones: op, correcta: op.indexOf(q[1]), origen: 'ficha' } }
const PAL = /[A-Za-zÁÉÍÓÚáéíóúñÑ]{7,}/g

function completar(resumen: string, pool: string[]): Pregunta | null {
  for (const fr of mezclar(resumen.split(/(?<=[.;:])\s+/)).filter((x) => x.split(' ').length >= 7)) {
    const cand = (fr.match(PAL) || []).filter((w) => !/^(Peru|Perú)/.test(w))
    if (!cand.length) continue
    const palabra = mezclar(cand.sort((a, b) => b.length - a.length).slice(0, 3))[0]
    const falsas = mezclar([...new Set(pool.filter((w) => norm(w) !== norm(palabra) && !norm(resumen).includes(norm(w)) && Math.abs(w.length - palabra.length) <= 4))]).slice(0, 3)
    if (falsas.length < 3) continue
    const op = mezclar([palabra, ...falsas])
    return { q: `Completa la idea: «${fr.replace(palabra, '_____')}»`, opciones: op, correcta: op.indexOf(palabra), origen: 'idea' }
  }
  return null
}

/** 2 preguntas escritas a mano + 2 «completa la idea» generadas del resumen (cambian cada vez). */
export function armarQuiz(tema: string): Pregunta[] {
  const f = fichaDe(tema)
  if (!f) return []
  const [a, b] = f.i < 50 ? [0, 50] : f.i < 90 ? [50, 90] : [90, FICHAS.length]
  const pool = [...new Set(FICHAS.filter((_, i) => i !== f.i && i >= a && i < b).flatMap((x) => x[1].match(PAL) || []))]
  const base = f.quiz.map(deQ)
  const extra = [completar(f.resumen, pool), completar(f.resumen, pool)].filter(Boolean) as Pregunta[]
  const ya = new Set<string>()
  return mezclar([...base, ...extra]).filter((p) => (ya.has(p.q) ? false : (ya.add(p.q), true)))
}
export const ultimoQuiz = (quizzes: any[], tema: string) => (quizzes || []).find((q) => q.tema === tema)
