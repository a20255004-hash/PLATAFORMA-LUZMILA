// "Cerebro" de la plataforma: reglas que corren en tu propio dispositivo (sin internet, sin cuentas, sin enviar nada).
// Mide cosas observables del texto (conectores, ejemplos, términos del tema, repeticiones, estructura del argumento…).
// No entiende el contenido como una persona: por eso cada resultado lleva su "por qué" y un botón para pasárselo a Claude.

export type Estado = 'ok' | 'med' | 'no'
export type Criterio = { id: string; titulo: string; estado: Estado; pts: number; max: number; texto: string }
export type Marca = { ini: number; fin: number; tipo: 'con' | 'rep' | 'mule' }
export type Evaluacion = {
  modo: 'explicar' | 'argumentar' | 'libre' | 'anecdota'
  puntaje: number // 0-100
  nota20: number
  criterios: Criterio[]
  fortalezas: string[]
  mejoras: string[]
  preguntas: string[]
  marcas: Marca[]
  palabras: number
  extra?: Record<string, any>
}

export const sinAcentos = (t: string) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
const STOP = new Set(('el la los las un una unos unas de del al a ante bajo con contra desde en entre hacia hasta para por segun sin sobre tras y e o u ni que como cuando donde quien cual cuyo es son fue era eran ser estar esta este esto estos estas ese esa eso esos esas aquel se si no mas muy ya lo le les me te nos os mi tu su sus mis tus nuestro nuestra pero sino tambien asi entonces porque pues hay han ha he has hemos hubo tiene tienen tener hacer hace hacen puede pueden poder todo toda todos todas cada otro otra otros otras mismo misma algo alguien nada nadie aqui alli ahi tan tanto tanta unos fue sea sean seria').split(' '))
const CONTENIDO = (p: string) => p.length >= 4 && !STOP.has(sinAcentos(p))

export const palabrasDe = (t: string) => t.toLowerCase().match(/[a-záéíóúüñ]+/g) || []
const oraciones = (t: string) => t.split(/(?<=[.!?…])\s+|\n+/).map((x) => x.trim()).filter((x) => palabrasDe(x).length >= 2)
const raiz = (p: string) => sinAcentos(p).slice(0, 5)

const FAMILIAS: Record<string, { nombre: string; frases: string[] }> = {
  causal: { nombre: 'causa (porque…)', frases: ['porque', 'ya que', 'dado que', 'puesto que', 'debido a', 'por eso', 'gracias a', 'a causa de'] },
  contraste: { nombre: 'contraste (en cambio…)', frases: ['sin embargo', 'en cambio', 'a diferencia de', 'mientras que', 'no obstante', 'por el contrario', 'pero'] },
  concesion: { nombre: 'concesión (aunque…)', frases: ['aunque', 'a pesar de', 'si bien', 'pese a', 'es cierto que'] },
  consecuencia: { nombre: 'consecuencia (por lo tanto…)', frases: ['por lo tanto', 'por consiguiente', 'de modo que', 'asi que', 'en consecuencia', 'lo que significa', 'de ahi que'] },
  ejemplo: { nombre: 'ejemplo (por ejemplo…)', frases: ['por ejemplo', 'como cuando', 'es decir', 'imagina', 'un caso', 'como en', 'pienso en', 'digamos'] },
  orden: { nombre: 'orden (primero, luego…)', frases: ['primero', 'luego', 'despues', 'finalmente', 'en resumen', 'en conclusion', 'por ultimo', 'ademas'] },
}
const MULETILLAS = ['o sea', 'como que', 'basicamente', 'la verdad', 'en plan', 'literal', 'osea', 'tipo que', 'nada que ver', 'eh', 'este']
const DEBILES: Record<string, string[]> = {
  bonito: ['atractivo', 'armonioso', 'elegante', 'cautivador'], lindo: ['agradable', 'encantador', 'delicado'],
  bueno: ['sólido', 'eficaz', 'valioso', 'adecuado'], malo: ['deficiente', 'perjudicial', 'inadecuado'],
  cosa: ['aspecto', 'factor', 'elemento', 'hecho'], cosas: ['aspectos', 'factores', 'elementos'],
  muy: ['(un adjetivo más preciso: enorme, notable, escaso…)'], hacer: ['realizar', 'elaborar', 'ejecutar'],
  importante: ['clave', 'determinante', 'relevante'], interesante: ['revelador', 'llamativo', 'sugerente'], algo: ['un aspecto concreto'],
}
const ABSOLUTOS = ['siempre', 'nunca', 'jamas', 'todos', 'todas', 'nadie', 'todo el mundo', 'obviamente', 'claramente', 'es evidente', 'sin duda', 'cualquiera sabe']

const estado = (pts: number, max: number): Estado => (pts >= max * 0.75 ? 'ok' : pts >= max * 0.4 ? 'med' : 'no')
const crit = (id: string, titulo: string, pts: number, max: number, texto: string): Criterio => ({ id, titulo, pts: Math.round(pts * 10) / 10, max, estado: estado(pts, max), texto })

/** Encuentra frases de una lista dentro del texto y devuelve sus posiciones (sobre el texto original). */
function buscar(texto: string, frases: string[], tipo: Marca['tipo']): Marca[] {
  const plano = sinAcentos(texto)
  if (plano.length !== texto.length) return []
  const out: Marca[] = []
  for (const f of frases) {
    const re = new RegExp(`(?<![a-z])${f}(?![a-z])`, 'g')
    let m: RegExpExecArray | null
    while ((m = re.exec(plano))) out.push({ ini: m.index, fin: m.index + f.length, tipo })
  }
  return out
}
const contar = (texto: string, frases: string[]) => buscar(texto, frases, 'con').length

/** Medidas comunes a cualquier texto. */
function medir(texto: string) {
  const pal = palabrasDe(texto)
  const cont = pal.filter(CONTENIDO)
  const unicas = new Set(cont.map(raiz))
  const ors = oraciones(texto)
  const medLong = ors.length ? pal.length / ors.length : pal.length
  const largas = ors.filter((o) => palabrasDe(o).length > 35)
  const freq = new Map<string, { n: number; ej: string }>()
  cont.forEach((p) => { const k = raiz(p); const v = freq.get(k) || { n: 0, ej: p }; v.n++; freq.set(k, v) })
  const repetidas = [...freq.values()].filter((v) => v.n >= 3).sort((a, b) => b.n - a.n).slice(0, 4)
  const familias = Object.entries(FAMILIAS).map(([id, f]) => ({ id, nombre: f.nombre, n: contar(texto, f.frases) })).filter((f) => f.n > 0)
  const mule = MULETILLAS.map((m) => ({ m, n: contar(texto, [m]) })).filter((x) => x.n > 0)
  const debiles = pal.filter((p) => DEBILES[sinAcentos(p)])
  const debilesU = [...new Set(debiles.map(sinAcentos))]
  const ttr = cont.length ? unicas.size / cont.length : 0
  return { pal, cont, ors, medLong, largas, repetidas, familias, mule, debiles, debilesU, ttr }
}

function marcasDe(texto: string, m: ReturnType<typeof medir>): Marca[] {
  const out: Marca[] = []
  Object.values(FAMILIAS).forEach((f) => out.push(...buscar(texto, f.frases, 'con')))
  out.push(...buscar(texto, MULETILLAS, 'mule'))
  m.repetidas.forEach((r) => out.push(...buscar(texto, [sinAcentos(r.ej)], 'rep')))
  return out.sort((a, b) => a.ini - b.ini).filter((x, i, arr) => i === 0 || x.ini >= arr[i - 1].fin)
}

const nota = (p: number) => Math.round((p / 100) * 20 * 2) / 2
function cierre(modo: Evaluacion['modo'], criterios: Criterio[], marcas: Marca[], palabras: number, preguntas: string[], extra?: Record<string, any>): Evaluacion {
  const puntaje = Math.round(criterios.reduce((a, c) => a + c.pts, 0))
  const ok = criterios.filter((c) => c.estado === 'ok').sort((a, b) => b.max - a.max)
  const falta = criterios.filter((c) => c.estado !== 'ok').sort((a, b) => (b.max - b.pts) - (a.max - a.pts))
  return { modo, puntaje, nota20: nota(puntaje), criterios, fortalezas: ok.slice(0, 3).map((c) => `${c.titulo}: ${c.texto}`), mejoras: falta.slice(0, 3).map((c) => `${c.titulo}: ${c.texto}`), preguntas: preguntas.slice(0, 3), marcas, palabras, extra }
}

/* ───────── 1) Explicar un tema con tus palabras (Culta) ───────── */
export const clavesDeTema = (tema: string) => {
  const t = tema.replace(/[()—:,;/·]/g, ' ')
  const crudas = (t.match(/[A-Za-zÁÉÍÓÚáéíóúñÑ0-9]{5,}/g) || [])
  const ya = new Set<string>()
  return crudas.filter((p) => !STOP.has(sinAcentos(p))).filter((p) => { const k = raiz(p); if (ya.has(k)) return false; ya.add(k); return true }).slice(0, 12)
}

export function evaluarExplicacion(tema: string, texto: string, otrosTemas: string[] = []): Evaluacion {
  const m = medir(texto)
  const n = m.pal.length
  const claves = clavesDeTema(tema)
  const usadas = new Set(m.pal.map(raiz))
  const halladas = claves.filter((c) => usadas.has(raiz(c)))
  const faltan = claves.filter((c) => !usadas.has(raiz(c)))
  const cobertura = claves.length ? halladas.length / claves.length : 0.5

  const ejemplo = contar(texto, FAMILIAS.ejemplo.frases) + (/\b\d{2,}\b/.test(texto) ? 1 : 0)
  const causa = contar(texto, FAMILIAS.causal.frases) + contar(texto, FAMILIAS.consecuencia.frases)
  const contraste = contar(texto, FAMILIAS.contraste.frases) + contar(texto, FAMILIAS.concesion.frases)
  const vecinos = otrosTemas.flatMap(clavesDeTema).map(raiz).filter((r) => !claves.map(raiz).includes(r))
  const enlaces = [...new Set(m.pal.map(raiz).filter((r) => vecinos.includes(r)))]
  const puente = contar(texto, ['se relaciona', 'me recuerda', 'igual que', 'conecta con', 'tambien pasa en', 'como en'])
  const conexion = Math.min(1, enlaces.length / 2) * 0.7 + (puente ? 0.5 : 0)

  const largoOk = n >= 60 && n <= 230 ? 1 : n >= 35 ? 0.6 : n >= 15 ? 0.3 : 0
  const claridad = (m.medLong >= 8 && m.medLong <= 26 ? 1 : 0.6) - (m.largas.length ? 0.25 : 0) - Math.min(0.4, m.mule.reduce((a, x) => a + x.n, 0) * 0.15)

  const c = [
    crit('terminos', 'Términos clave del tema', 25 * Math.min(1, cobertura * 1.15), 25, claves.length ? (halladas.length ? `usaste ${halladas.length} de ${claves.length} (${halladas.slice(0, 4).join(', ')}${halladas.length > 4 ? '…' : ''})${faltan.length ? `; faltan: ${faltan.slice(0, 4).join(', ')}` : ''}.` : `no aparece ninguno de los términos del título (${claves.slice(0, 4).join(', ')}).`) : 'el tema no trae términos que revisar.'),
    crit('ejemplo', 'Ejemplo propio', ejemplo ? 15 : 0, 15, ejemplo ? 'incluiste un ejemplo o un dato concreto.' : 'no encuentro un ejemplo ("por ejemplo…", "imagina…"). Sin ejemplo, suele ser definición copiada.'),
    crit('causa', 'Por qué / cómo', Math.min(1, causa / 2) * 15, 15, causa ? `explicas relaciones de causa o consecuencia (${causa}).` : 'cuenta el porqué: usa "porque", "ya que", "por lo tanto".'),
    crit('contraste', 'Contraste o límite', contraste ? 10 : 0, 10, contraste ? 'marcas diferencias o excepciones.' : 'dices qué NO es, o en qué se diferencia de otra cosa ("a diferencia de…", "aunque…").'),
    crit('conexion', 'Conexión con lo aprendido', 15 * Math.min(1, conexion), 15, enlaces.length || puente ? `la relacionas con otros temas${enlaces.length ? ` (${enlaces.slice(0, 3).join(', ')})` : ''}.` : otrosTemas.length ? 'no la relacionas con nada de lo que ya viste. Une este tema con uno anterior.' : 'aún no tengo temas anteriores tuyos para comparar; relaciónalo con algo que ya sepas.'),
    crit('largo', 'Extensión', 10 * largoOk, 10, `${n} palabras. ${n < 35 ? 'Muy corta para demostrar que lo entiendes (apunta a 60–200).' : n > 230 ? 'Larga: ¿qué sacarías?' : 'Buen tamaño.'}`),
    crit('claridad', 'Claridad', 10 * Math.max(0, claridad), 10, `${m.largas.length ? 'hay oraciones muy largas (parte en dos). ' : ''}${m.mule.length ? `muletillas: ${m.mule.map((x) => x.m).join(', ')}. ` : ''}${!m.largas.length && !m.mule.length ? 'oraciones de buen largo, sin muletillas.' : ''}`.trim()),
  ]
  const preguntas: string[] = []
  if (!ejemplo) preguntas.push('¿Qué ejemplo real (de tu trabajo, tu vida o el Perú) muestra este tema funcionando?')
  if (!contraste) preguntas.push(`¿En qué se diferencia ${nucleoCorto(tema)} de algo parecido que se confunde con él?`)
  if (faltan.length) preguntas.push(`¿Cómo encaja “${faltan[0]}” en tu explicación?`)
  if (!enlaces.length && otrosTemas.length) preguntas.push('¿Con cuál de tus temas anteriores se conecta este, y por qué?')
  preguntas.push('Si tuvieras que explicárselo a alguien de 12 años en 3 oraciones, ¿cuáles serían?')
  const ev = cierre('explicar', c, marcasDe(texto, m), n, preguntas, { tema, cobertura: Math.round(cobertura * 100), estadoSugerido: nota(c.reduce((a, x) => a + x.pts, 0)) >= 15 && cobertura >= 0.45 ? 'Consolidado' : 'En progreso', faltan })
  return ev
}
const nucleoCorto = (t: string) => t.replace(/\(.*?\)/g, '').trim().split(/[:—-]/)[0].slice(0, 50)

/* ───────── 2) Argumentar (Toulmin) ───────── */
export type Arg = { afirmacion: string; evidencia: string; garantia: string; contraria?: string }
export function evaluarArgumento(a: Arg): Evaluacion {
  const todo = [a.afirmacion, a.evidencia, a.garantia, a.contraria || ''].join(' ')
  const pAf = palabrasDe(a.afirmacion), pEv = palabrasDe(a.evidencia), pGa = palabrasDe(a.garantia), pCo = palabrasDe(a.contraria || '')
  const raicesAf = new Set(pAf.filter(CONTENIDO).map(raiz)), raicesEv = new Set(pEv.filter(CONTENIDO).map(raiz))
  const solapaAf = pGa.filter(CONTENIDO).map(raiz).filter((r) => raicesAf.has(r)).length
  const solapaEv = pGa.filter(CONTENIDO).map(raiz).filter((r) => raicesEv.has(r)).length
  const puente = contar(a.garantia, [...FAMILIAS.causal.frases, ...FAMILIAS.consecuencia.frases, 'siempre que', 'cuando', 'si ']) > 0
  const concreto = /\d/.test(a.evidencia) || /\b(seg[uú]n|estudio|encuesta|informe|investigaci[oó]n|ejemplo|caso)\b/i.test(a.evidencia) || /(?<=[a-záéíóú,] )[A-ZÁÉÍÓÚÑ][a-záéíóúñ]{3,}/.test(a.evidencia)
  const abs = ABSOLUTOS.filter((x) => contar(todo, [x]) > 0)
  const concede = contar(a.contraria || '', [...FAMILIAS.concesion.frases, 'otro punto de vista', 'quien piensa', 'quienes piensan', 'desde la vision', 'podria argumentarse'])

  const c = [
    crit('afirmacion', 'Afirmación clara', !pAf.length ? 0 : pAf.length >= 6 && pAf.length <= 40 && !a.afirmacion.includes('?') ? 15 : 8, 15, !pAf.length ? 'falta decir qué sostienes.' : pAf.length < 6 ? 'muy corta: di qué afirmas exactamente.' : pAf.length > 40 ? 'muy larga: una sola idea por afirmación.' : 'una idea, bien delimitada.'),
    crit('evidencia', 'Evidencia concreta', !pEv.length ? 0 : concreto ? 25 : pEv.length >= 8 ? 12 : 6, 25, !pEv.length ? 'falta el dato o caso que respalda.' : concreto ? 'trae un dato, fuente, nombre o caso.' : 'suena a opinión: agrega una cifra, una fuente o un caso real.'),
    crit('garantia', 'Garantía (el puente)', !pGa.length ? 0 : Math.min(30, 8 + (puente ? 8 : 0) + Math.min(solapaAf, 2) * 4 + Math.min(solapaEv, 2) * 3), 30, !pGa.length ? 'es la pieza clave: ¿por qué esa evidencia prueba esa afirmación?' : `${puente ? 'tiene un conector lógico' : 'sin conector lógico ("porque", "ya que", "si… entonces")'}; ${solapaAf && solapaEv ? 'toca ideas de la afirmación y de la evidencia (buen puente)' : 'no retoma ideas de la afirmación y de la evidencia: ¿de verdad las une?'}.`),
    crit('precision', 'Precisión', abs.length ? Math.max(0, 10 - abs.length * 4) : 10, 10, abs.length ? `palabras absolutas: ${abs.join(', ')}. Suelen volver el argumento atacable ("a veces", "en la mayoría de casos").` : 'sin absolutos que lo debiliten.'),
    crit('contraria', 'Mejor versión del otro lado', !pCo.length ? 0 : pCo.length >= 8 ? (concede ? 20 : 14) : 7, 20, !pCo.length ? 'no incluyes la postura contraria (steelman).' : pCo.length < 8 ? 'está muy breve: plantea al otro lado en su mejor versión.' : concede ? 'reconoces algo válido del otro lado.' : 'hay postura contraria; añade qué parte es razonable ("es cierto que…").'),
  ]
  const preguntas: string[] = []
  if (!a.garantia?.trim() || !puente) preguntas.push('Completa: “Esta evidencia prueba mi afirmación porque…”')
  if (!concreto) preguntas.push('¿Qué dato verificable o caso real pondrías aquí?')
  if (!pCo.length) preguntas.push('¿Qué diría alguien inteligente que piensa lo contrario?')
  if (abs.length) preguntas.push(`¿Cambiarías “${abs[0]}” por algo que puedas defender con tu evidencia?`)
  preguntas.push('¿Qué tendría que pasar para que cambies de opinión?')
  const ev = cierre('argumentar', c, [], pAf.length + pEv.length + pGa.length + pCo.length, preguntas, { absolutos: abs })
  if (abs.length) ev.mejoras.push('Posible generalización apresurada: revisa los absolutos antes de defenderlo.')
  return ev
}

/* ───────── 3) Texto libre: estilo, vocabulario, conectores (Voz) ───────── */
export function evaluarTexto(texto: string): Evaluacion {
  const m = medir(texto)
  const n = m.pal.length
  const sugeridas = m.debilesU.slice(0, 4).map((d) => `${d} → ${DEBILES[d].slice(0, 3).join(' / ')}`)
  const c = [
    crit('largo', 'Desarrollo', n >= 40 ? 15 : n >= 20 ? 9 : n >= 8 ? 4 : 0, 15, `${n} palabras${n < 40 ? ': escribe un poco más para poder evaluar de verdad.' : '.'}`),
    crit('conectores', 'Conectores variados', Math.min(20, m.familias.length * 7), 20, m.familias.length ? `usas ${m.familias.length} tipo(s): ${m.familias.map((f) => f.nombre).join(', ')}.` : 'no uso conectores. Une ideas con "porque", "aunque", "sin embargo".'),
    crit('riqueza', 'Riqueza de vocabulario', n < 25 ? 8 : 20 * Math.min(1, m.ttr / 0.8), 20, n < 25 ? 'texto muy corto para medirla.' : `${Math.round(m.ttr * 100)}% de tus palabras con contenido son distintas${m.ttr < 0.65 ? ': repites bastante' : ''}.`),
    crit('repeticion', 'Repeticiones', m.repetidas.length ? Math.max(0, 15 - m.repetidas.reduce((a, r) => a + (r.n - 2), 0) * 3) : 15, 15, m.repetidas.length ? `se repite: ${m.repetidas.map((r) => `“${r.ej}” ×${r.n}`).join(', ')}.` : 'sin repeticiones llamativas.'),
    crit('oraciones', 'Largo de oraciones', (m.medLong >= 10 && m.medLong <= 25 ? 15 : m.medLong < 10 ? 10 : 8) - (m.largas.length ? 3 : 0), 15, `promedio ${m.medLong.toFixed(0)} palabras${m.largas.length ? `; ${m.largas.length} oración(es) de más de 35 (pártelas)` : ''}.`),
    crit('precision', 'Palabras precisas', Math.max(0, 15 - m.debiles.length * 2.5 - m.mule.reduce((a, x) => a + x.n, 0) * 3), 15, m.debilesU.length || m.mule.length ? `${m.debilesU.length ? 'palabras comodín: ' + sugeridas.join('; ') + '. ' : ''}${m.mule.length ? 'muletillas: ' + m.mule.map((x) => x.m).join(', ') + '.' : ''}` : 'vocabulario directo, sin comodines.'),
  ]
  const pre: string[] = []
  if (m.debilesU.length) pre.push(`¿Qué palabra exacta usarías en vez de “${m.debilesU[0]}”?`)
  if (!m.familias.some((f) => f.id === 'concesion')) pre.push('Intenta una frase con “aunque…” o “a pesar de…” para admitir un matiz.')
  if (m.repetidas.length) pre.push(`Reescribe una frase sin repetir “${m.repetidas[0].ej}”.`)
  pre.push('¿Qué frase de tu texto cortarías sin que se pierda la idea?')
  return cierre('libre', c, marcasDe(texto, m), n, pre, { sugeridas })
}

/* ───────── 4) Anécdota / humor (Zorro): calma, tensión, remate ───────── */
export function evaluarAnecdota(texto: string): Evaluacion {
  const ors = oraciones(texto)
  const n = palabrasDe(texto).length
  const largos = ors.map((o) => palabrasDe(o).length)
  const resto = largos.slice(0, -1)
  const prom = resto.length ? resto.reduce((a, b) => a + b, 0) / resto.length : n
  const ultima = largos[largos.length - 1] || 0
  const apertura = ors.length ? contar(ors[0], ['ayer', 'una vez', 'el otro dia', 'estaba', 'iba', 'hoy', 'anoche', 'esta manana', 'cuando']) > 0 : false
  const tension = contar(ors.slice(1, -1).join(' '), ['pero', 'de pronto', 'de repente', 'y justo', 'entonces', 'hasta que', 'cuando']) > 0
  const explica = contar(texto, ['es decir', 'o sea', 'lo gracioso', 'la gracia', 'jaja', 'jeje', 'lo chistoso', 'lo curioso es que'])
  const tres = /[^,.]+,[^,.]+,? y [^,.]+/i.test(texto)
  const c = [
    crit('largo', 'Tamaño', n >= 40 && n <= 170 ? 15 : n >= 25 ? 9 : 4, 15, `${n} palabras. ${n < 40 ? 'Una anécdota necesita un poco más de calma antes del remate.' : n > 170 ? 'Larga: recorta lo que no empuja hacia el remate.' : 'Buen tamaño.'}`),
    crit('calma', 'Calma (apertura)', apertura ? 20 : 8, 20, apertura ? 'sitúas el momento o el lugar al empezar.' : 'empieza ubicándonos: cuándo, dónde, quién.'),
    crit('tension', 'Tensión', tension ? 25 : ors.length >= 4 ? 12 : 4, 25, tension ? 'hay un giro o complicación a mitad de camino.' : 'falta un “pero…”, “de pronto…” que tuerza la historia antes del final.'),
    crit('remate', 'Remate corto', ors.length >= 3 && ultima > 0 && ultima <= Math.max(8, prom * 0.7) ? 25 : ultima <= 14 ? 14 : 5, 25, ors.length < 3 ? 'faltan oraciones para armar estructura.' : ultima <= Math.max(8, prom * 0.7) ? `cierras con ${ultima} palabras: seco.` : `tu última oración tiene ${ultima} palabras (el resto promedia ${Math.round(prom)}). El remate pega más si es la oración más corta.`),
    crit('sinexplicar', 'Sin explicar el chiste', explica ? Math.max(0, 15 - explica * 8) : 15, 15, explica ? 'detecto frases que explican la gracia (“o sea”, “lo gracioso”…). Confía en el remate.' : 'no explicas la gracia, bien.'),
  ]
  const pre: string[] = []
  if (!tension) pre.push('¿Cuál fue el momento en que algo se torció? Ponlo justo antes del final.')
  if (ultima > Math.max(8, prom * 0.7)) pre.push('Intenta que la última oración tenga 8 palabras o menos.')
  if (!tres) pre.push('Prueba una lista de tres cosas donde la tercera rompa el patrón.')
  pre.push('¿Qué detalle podrías quitar sin perder el chiste?')
  return cierre('anecdota', c, [], n, pre, { ultima })
}

/* ───────── 5) Palabras de la ronda de 90 segundos ───────── */
const LEX: Record<string, string> = {
  'Cosas de una biblioteca': 'libro libros estante estanteria catalogo bibliotecario bibliotecaria mesa silla lampara silencio carnet prestamo devolucion enciclopedia diccionario revista periodico archivo ficha novela tesis lectura lector sala computadora escritorio sello clasificacion',
  'Verbos de movimiento': 'caminar correr saltar avanzar retroceder trotar deslizar gatear trepar bajar subir girar rodar volar nadar cruzar escalar marchar desplazar acercar alejar huir perseguir arrastrar lanzar',
  Emociones: 'alegria tristeza miedo ira asco sorpresa verguenza culpa orgullo envidia celos esperanza nostalgia angustia ansiedad calma gratitud soledad ternura frustracion euforia amor odio rabia desconfianza',
  'Palabras para "lograr"': 'alcanzar conseguir obtener cumplir completar concretar materializar consumar culminar ejecutar realizar superar dominar ganar acabar',
  'Objetos de oficina': 'escritorio silla grapadora engrapadora lapicero lapiz cuaderno agenda computadora impresora teclado mouse monitor archivador folder carpeta clip tijera resaltador corrector calculadora telefono pizarra escritorio lampara',
  'Sinónimos de "bonito"': 'hermoso bello lindo precioso atractivo encantador elegante armonioso espectacular vistoso agraciado radiante cautivador deslumbrante exquisito',
  'Cosas de una cocina': 'cocina olla sarten cuchillo cuchara tenedor plato vaso taza horno refrigerador licuadora tabla cocinar fregadero mantel batidor colador rallador hervidor microondas',
  'Palabras para "valiente"': 'valiente audaz osado intrepido arrojado decidido bravo atrevido coraje temerario gallardo firme resuelto',
  Profesiones: 'abogado medico ingeniero arquitecto contador administrador profesor docente enfermero psicologo economista periodista piloto chef electricista carpintero programador disenador dentista veterinario notario policia bombero',
  'Términos de administración': 'planeacion organizacion direccion control estrategia liderazgo presupuesto eficiencia eficacia productividad mision vision objetivo indicador proceso gestion organigrama delegacion motivacion foda recursos',
}
export function evaluarPalabras(lista: string[], categoria: string) {
  const lex = (LEX[categoria] || '').split(/\s+/).filter((x) => /^[a-z]+$/.test(x))
  const reconoce = (w: string) => { const k = sinAcentos(w); return lex.some((l) => l === k || (k.length >= 5 && l.slice(0, 5) === k.slice(0, 5))) }
  const reconocidas = lista.filter(reconoce)
  const otras = lista.filter((w) => !reconoce(w))
  const largas = lista.filter((w) => w.length >= 9)
  const iniciales = new Set(lista.map((w) => sinAcentos(w)[0])).size
  const faltaron = lex.filter((l) => !lista.some((w) => { const k = sinAcentos(w); return l === k || l.slice(0, 5) === k.slice(0, 5) })).slice(0, 5)
  return { conLista: lex.length > 0, reconocidas, otras, largas, iniciales, faltaron }
}

/* ───────── 6) Seguimiento: tendencias de tus evaluaciones guardadas ───────── */
export function tendencia(evs: any[]) {
  const por = [...evs].sort((a, b) => (a.fecha < b.fecha ? -1 : 1))
  if (por.length < 2) return { texto: por.length ? 'Con 2 o más evaluaciones empiezo a ver tu tendencia.' : 'Aún no hay evaluaciones guardadas.', delta: 0, puntos: por.map((e) => e.puntaje) }
  const ult = por.slice(-3), prev = por.slice(-6, -3)
  const prom = (x: any[]) => x.reduce((a, e) => a + e.puntaje, 0) / x.length
  const delta = prev.length ? Math.round(prom(ult) - prom(prev)) : Math.round(por[por.length - 1].puntaje - por[0].puntaje)
  const flojos = new Map<string, number>()
  por.slice(-8).forEach((e) => (e.criterios || []).forEach((c: any) => { if (c.estado === 'no') flojos.set(c.titulo, (flojos.get(c.titulo) || 0) + 1) }))
  const top = [...flojos.entries()].sort((a, b) => b[1] - a[1])[0]
  return { texto: `${delta > 3 ? 'Vas subiendo' : delta < -3 ? 'Bajó un poco' : 'Te mantienes estable'} (${delta >= 0 ? '+' : ''}${delta} puntos).${top && top[1] >= 2 ? ` Lo que más se repite como flojo: “${top[0]}”.` : ''}`, delta, puntos: por.map((e) => e.puntaje) }
}

/* ───────── 7) Plan de hoy: qué conviene hacer, con su porqué ───────── */
import { BLOQUES_CULTA } from '../data/estructura'
import { bloqueCulta, hoyISO, queToca } from './fechas'
import { enlacesTema, temaSugerido } from './recursos'
import { puntosDia, repasosPendientes, siguientePilar } from '../store'

export type Paso = { id: string; emoji: string; titulo: string; detalle: string; por: string; ir: { tipo: 'ruta'; ruta: string } | { tipo: 'juego'; juego: string } | { tipo: 'coach'; modo: Evaluacion['modo']; tema?: string } }

export function planDeHoy(s: any): { pasos: Paso[]; tema?: ReturnType<typeof temaSugerido> & { enlaces: ReturnType<typeof enlacesTema> } } {
  const hoy = hoyISO(), toca = queToca(hoy), pasos: Paso[] = []
  const reingreso = !!s.ajustes?.reingreso
  let tema: any
  if (puntosDia(s.checkins[hoy] || {}) === 0) pasos.push({ id: 'checkin', emoji: '✅', titulo: 'Check-in de 10 segundos', detalle: 'Marca lo que ya hiciste hoy. Con eso el día queda vivo.', por: 'Es lo que sostiene la racha de 48 h; todo lo demás es bonus.', ir: { tipo: 'ruta', ruta: 'hoy' } })
  if (reingreso) return { pasos: pasos.length ? pasos : [{ id: 'respira', emoji: '🌱', titulo: 'Hoy basta con lo mínimo', detalle: 'Estás en Reingreso: lo extra es opcional.', por: 'Protocolo de tu propio proyecto.', ir: { tipo: 'ruta', ruta: 'calendario' } }] }
  if (toca === 'culta') {
    tema = temaSugerido(s.culta.sesiones, bloqueCulta())
    tema.enlaces = enlacesTema(tema.tema, tema.bloque)
    pasos.push({ id: 'estudiar', emoji: '🎓', titulo: `Estudia: ${tema.tema.replace(/\(.*?\)/g, '').trim().slice(0, 70)}`, detalle: `${BLOQUES_CULTA[bloqueCulta()].emoji} ${BLOQUES_CULTA[bloqueCulta()].nombre}. ${tema.motivo}`, por: 'Panorama → una fuente más → explicarlo con tus palabras.', ir: { tipo: 'coach', modo: 'explicar', tema: tema.tema } })
  } else {
    const p = siguientePilar(s)
    pasos.push({ id: 'zorro', emoji: '🦊', titulo: `Zorro: ${(p as any).nombre || p.id}`, detalle: (p as any).accion, por: 'Rueda completa: cada pilar entrena un músculo distinto del humor.', ir: { tipo: 'juego', juego: ['definicion', 'giro', 'remate'][Number(hoy.replaceAll('-', '')) % 3] } })
  }
  const rep = [...repasosPendientes(s.culta.sesiones), ...repasosPendientes(s.voz.palabras)]
  if (rep.length) pasos.push({ id: 'repaso', emoji: '🔁', titulo: `${rep.length} repaso${rep.length > 1 ? 's' : ''} listo${rep.length > 1 ? 's' : ''}`, detalle: 'Cinco minutos con lo que ya viste: ahí está la retención.', por: 'Repaso espaciado a 2, 7 y 21 días (curva del olvido).', ir: { tipo: 'ruta', ruta: 'culta' } })
  const sinGar = (s.voz.argumentos || []).filter((a: any) => !a.garantia).length
  if (sinGar) pasos.push({ id: 'garantia', emoji: '⚖️', titulo: 'Completa la garantía de un argumento', detalle: `${sinGar} argumento(s) sin el “porque” que une evidencia y afirmación.`, por: 'La garantía es la pieza que más cuesta (Toulmin).', ir: { tipo: 'coach', modo: 'argumentar' } })
  const evs = s.evaluaciones || []
  if (evs.length >= 2 && tendencia(evs).delta < -3) pasos.push({ id: 'tendencia', emoji: '📉', titulo: 'Una evaluación tranquila para retomar', detalle: 'Tus últimas evaluaciones bajaron un poco: escribe 5 líneas sobre algo que ya sepas.', por: tendencia(evs).texto, ir: { tipo: 'coach', modo: 'libre' } })
  return { pasos: pasos.slice(0, 3), tema }
}

