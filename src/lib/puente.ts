// Puente con tu chat de Claude. La página no se conecta sola (una clave secreta en una página pública la podría usar cualquiera),
// así que el puente son dos toques: copiar un pedido bien armado y pegar el resultado en el formato ```luzmila.
import { BLOQUES_CULTA, DIMENSIONES, PILARES_ZORRO, RUBRICA, TIPOS_EVIDENCIA } from '../data/estructura'
import { bloqueCulta, hoyISO, larga, semanaCulta, sumar } from './fechas'
import { temaSugerido } from './recursos'
import { anclaSemanas, ciclo, cumplimiento7, diasEnCero, proximasFechas, racha, siguientePilar, useDatos, xpCulta, xpLuzmila, xpZorro } from '../store'

type S = ReturnType<typeof useDatos.getState>

export const INSTRUCCION_UNICA = `Desde ahora, cuando termines una sesión de Culta, Zorro o Voz (o cuando me ayudes a registrar algo del proyecto), agrega AL FINAL de tu respuesta un bloque de código con la etiqueta luzmila, con JSON válido, para que mi plataforma lo registre con un solo pegado. Reglas: no inventes datos; si no tienes la nota real, no pongas el bloque; fechas en formato AAAA-MM-DD; la nota honesta, sin inflar; el feedback con "qué falló y por qué", y la versión mejorada.

Formatos (puedes poner varios objetos dentro de un arreglo []):
- Culta: {"tipo":"culta","fecha":"AAAA-MM-DD","bloque":"B1|B2|B3","tema":"...","items":[10 puntajes de 0 a 2, con medios],"nota":0-20,"feedback":"...","mejorada":"...","referencia":"referencia APA 7"}
- Zorro: {"tipo":"zorro","fecha":"AAAA-MM-DD","enfoque":"Cierre + Apertura|Observacion|Ingenio verbal|Anecdota|Cosmovision|Reto social|Otro","hice":"...","xp":1,"nota":"..."}
- Voz (palabra): {"tipo":"voz","palabra":"...","significado":"...","frases":["...","...","..."]}
- Voz (argumento): {"tipo":"voz","argumento":{"tema":"...","afirmacion":"...","evidencia":"...","garantia":"...","contraria":"..."}}
- Expediente: {"tipo":"expediente","fecha":"AAAA-MM-DD","entrada":"...","dimension":"${DIMENSIONES.slice(0, 6).join('|')}","evidencia":"${TIPOS_EVIDENCIA.join('|')}","contradice":"...","impacto":1-5}
- Distorsión: {"tipo":"distorsion","fecha":"AAAA-MM-DD","distorsion":"...","situacion":"...","reencuadre":"..."}
- Fecha límite: {"tipo":"fecha","titulo":"...","fecha":"AAAA-MM-DD","nota":"..."}

Tono: honesto, sin suavizar y sin culpa; en "tú"; con la versión mejorada siempre.`

export type Item = { tipo: string; [k: string]: any }
const num = (v: any, d = 0) => (Number.isFinite(Number(v)) ? Number(v) : d)
const iso = (v: any) => (/^\d{4}-\d{2}-\d{2}$/.test(String(v || '')) ? String(v) : hoyISO())
const ENFOQUES = [...PILARES_ZORRO.map((p) => p.id), 'Reto social', 'Otro']

/** Lee lo que pegues: bloques ```luzmila, JSON suelto, objeto o arreglo. */
export function leerBloques(texto: string): { items: Item[]; errores: string[] } {
  const errores: string[] = []
  const trozos: string[] = []
  const re = /```(?:luzmila|json)?\s*([\s\S]*?)```/gi
  let m: RegExpExecArray | null
  while ((m = re.exec(texto))) trozos.push(m[1])
  if (!trozos.length) { const t = texto.trim(); if (t.startsWith('{') || t.startsWith('[')) trozos.push(t) }
  const items: Item[] = []
  for (const t of trozos) {
    try { const j = JSON.parse(t.trim()); (Array.isArray(j) ? j : [j]).forEach((x) => (x && typeof x === 'object' ? items.push(x) : errores.push('Un elemento no era un objeto.'))) }
    catch { errores.push('Un bloque no es JSON válido (revisa comillas y comas).') }
  }
  if (!trozos.length) errores.push('No encontré ningún bloque ```luzmila. ¿Pegaste la respuesta completa de Claude?')
  return { items: items.filter((x) => x.tipo), errores }
}

export const describir = (i: Item) => {
  switch (i.tipo) {
    case 'culta': return `🎓 Culta · ${i.tema || '(sin tema)'} · ${i.nota ?? '?'}/20`
    case 'zorro': return `🦊 Zorro · ${i.enfoque || 'Otro'} · +${num(i.xp, 1)} XP · ${String(i.hice || '').slice(0, 50)}`
    case 'voz': return i.argumento ? `⚖️ Voz · argumento: ${String(i.argumento.afirmacion || '').slice(0, 60)}` : `📚 Voz · palabra: ${i.palabra || '?'}`
    case 'expediente': return `🕵️ Expediente · ${String(i.entrada || '').slice(0, 70)}`
    case 'distorsion': return `🧑‍⚖️ Distorsión · ${String(i.situacion || '').slice(0, 60)}`
    case 'fecha': return `📌 Fecha límite · ${i.titulo || '?'} · ${i.fecha || '?'}`
    default: return `❓ Tipo desconocido: ${i.tipo}`
  }
}

/** Guarda los elementos en la plataforma. Devuelve cuántos se guardaron y los que se saltó. */
export function aplicar(items: Item[]) {
  const s = useDatos.getState()
  let ok = 0; const salto: string[] = []
  for (const i of items) {
    try {
      if (i.tipo === 'culta') {
        if (!i.tema) { salto.push('Culta sin tema'); continue }
        const items10 = Array.isArray(i.items) && i.items.length === 10 ? i.items.map((v: any) => num(v)) : undefined
        const nota = items10 && i.nota === undefined ? items10.reduce((a: number, b: number) => a + b, 0) : num(i.nota)
        const ceros = items10 ? items10.filter((v: number) => v === 0).length : 0
        s.agregar('culta.sesiones', { fecha: iso(i.fecha), bloque: ['B1', 'B2', 'B3'].includes(i.bloque) ? i.bloque : bloqueCulta(), tema: String(i.tema), nota, items: items10, feedback: String(i.feedback || ''), mejorada: String(i.mejorada || ''), estado: nota >= 15 && ceros < 2 ? 'Consolidado' : 'En progreso', repasos: { d2: false, d7: false, d21: false }, origen: 'claude' })
        if (i.referencia) s.agregar('culta.fuentes', { bloque: (BLOQUES_CULTA as any)[i.bloque]?.nombre || 'Culta', tema: String(i.tema), autor: '', ref: String(i.referencia) })
      } else if (i.tipo === 'zorro') {
        s.agregar('zorro.bitacora', { fecha: iso(i.fecha), enfoque: ENFOQUES.includes(i.enfoque) ? i.enfoque : 'Otro', hice: String(i.hice || ''), xp: num(i.xp, 1), nota: String(i.nota || ''), origen: 'claude' })
      } else if (i.tipo === 'voz' && i.argumento) {
        const a = i.argumento
        s.agregar('voz.argumentos', { fecha: iso(i.fecha), tema: String(a.tema || ''), afirmacion: String(a.afirmacion || ''), evidencia: String(a.evidencia || ''), garantia: String(a.garantia || ''), contraria: String(a.contraria || '') })
      } else if (i.tipo === 'voz' && i.palabra) {
        s.agregar('voz.palabras', { fecha: iso(i.fecha), palabra: String(i.palabra), significado: String(i.significado || ''), frases: Array.isArray(i.frases) ? i.frases.slice(0, 3).map(String) : ['', '', ''], d2: false, d7: false, d21: false })
      } else if (i.tipo === 'expediente') {
        s.agregar('expediente', { fecha: iso(i.fecha), entrada: String(i.entrada || ''), dimension: i.dimension || DIMENSIONES[0], tipo: i.evidencia || TIPOS_EVIDENCIA[0], contradice: String(i.contradice || ''), impacto: Math.min(5, Math.max(1, num(i.impacto, 3))), link: '', fuente: 'Claude' })
      } else if (i.tipo === 'distorsion') {
        s.agregar('distorsiones', { fecha: iso(i.fecha), tipo: String(i.distorsion || 'Otra'), situacion: String(i.situacion || ''), reencuadre: String(i.reencuadre || '') })
      } else if (i.tipo === 'fecha') {
        if (!i.titulo || !/^\d{4}-\d{2}-\d{2}$/.test(String(i.fecha))) { salto.push('Fecha incompleta'); continue }
        s.agregar('fechas', { titulo: String(i.titulo), fecha: String(i.fecha), hora: '', tipo: 'personal', nota: String(i.nota || ''), hecha: false })
      } else { salto.push(`Tipo ${i.tipo}`); continue }
      ok++
    } catch { salto.push(describir(i)) }
  }
  return { ok, salto }
}

const ritual = (s: S, k: 'manana' | 'comida' | 'noche', dias = 7) => { let n = 0; for (let d = 0; d < dias; d++) if ((s.checkins[sumar(hoyISO(), -d)] as any)?.[k]) n++; return n }

/** Resumen de datos para la revisión semanal. Solo números y títulos: no incluye tu Expediente, bitácora ni nada sensible. */
export function pedidoSemana(s: S) {
  const hoy = hoyISO(), desde = sumar(hoy, -6)
  const ses = s.culta.sesiones.filter((x: any) => x.fecha >= desde)
  const qz = (s.quizzes || []).filter((x: any) => x.fecha >= desde)
  const ev = (s.evaluaciones || []).filter((x: any) => x.fecha >= desde)
  const zo = s.zorro.bitacora.filter((x: any) => x.fecha >= desde)
  const c = ciclo(s), an = anclaSemanas(s), pf = proximasFechas(s).slice(0, 5)
  return `Hazme mi revisión semanal del Proyecto Luzmila, honesta y sin culpa. Datos de los últimos 7 días (${desde} a ${hoy}), sacados de mi plataforma:

• Check-ins: ${cumplimiento7(s).puntos}/21 puntos (mañana ${ritual(s, 'manana')}/7, comida ancla ${ritual(s, 'comida')}/7, noche ${ritual(s, 'noche')}/7). Racha con regla de 48 h: ${racha(s)} día(s). Días en cero hasta hoy: ${diasEnCero(s) ?? 'sin registros'}.
• Modo: ${s.ajustes.reingreso ? 'REINGRESO (solo lo mínimo)' : 'normal'}. XP total ${xpLuzmila(s).total}. Capacidad real ≈ 2 h libres al día.
• Culta: ${ses.length ? ses.map((x: any) => `${x.tema} (${x.nota}/20)`).join('; ') : 'sin sesiones registradas'}. XP Culta ${xpCulta(s).total}. Quizzes: ${qz.length ? qz.map((x: any) => `${String(x.tema).slice(0, 30)} ${x.aciertos}/${x.total}`).join('; ') : 'ninguno'}.
• Escritura evaluada por la plataforma: ${ev.length ? ev.map((x: any) => `${x.modo} ${x.puntaje}/100`).join('; ') : 'ninguna'}.
• Zorro: ${zo.length ? zo.length + ' registro(s), ' + zo.reduce((a: number, b: any) => a + (Number(b.xp) || 0), 0) + ' XP' : 'sin registros'}. XP Zorro total ${xpZorro(s).total}.
• Práctica ancla: ${an ? `“${s.ancla.nombre}”, ${an.semanas}/8 semanas` : 'aún no elegida'}.
• Ciclo de caída y regreso: ${c.caidas.length ? `${c.caidas.length} caída(s) registradas; últimas ${c.caidas.slice(-3).map((x) => x.vacios + ' días').join(', ')}` : 'sin caídas registradas'}.
• Próximas fechas límite: ${pf.length ? pf.map((x) => `${x.titulo} (${x.fecha})`).join('; ') : 'ninguna'}.

Quiero: 1) una lectura honesta de la semana (qué sí funcionó y qué no, sin suavizar), 2) UNA sola cosa a ajustar, 3) el plan de la próxima semana con máximo 3 cosas y teniendo en cuenta mis 2 h diarias, 4) un comentario sobre si mi ciclo de regreso se está acortando. Al final, si corresponde, un bloque \`\`\`luzmila con lo que haya que registrar.`
}

export function pedidoCulta(s: S) {
  const b = bloqueCulta(), t = temaSugerido(s.culta.sesiones, b)
  return `Hazme la sesión de Culta de hoy (${larga(hoyISO())}, semana ${semanaCulta()}: ${(BLOQUES_CULTA as any)[b].nombre}).
Tema sugerido por mi plataforma: ${t.tema} (${t.motivo}). Si prefieres otro por coherencia con lo que vimos, dímelo.

Formato de siempre: 1) 🍎 con manzanitas, 2) 🔬 a fondo (con autores y fundamentos), 3) 📝 evaluación de 10 ítems (${RUBRICA.map((r, i) => `${i + 1}. ${r}`).join('; ')}), 4) 📊 nota /20 con feedback honesto y la versión mejorada, 5) 📚 referencias APA 7 verificadas, 6) 🎤 micro-ejercicio de Bloque 3. Espera mis respuestas antes de corregir. Al terminar, entrega el bloque \`\`\`luzmila tipo "culta" para que mi plataforma lo registre.`
}

export function pedidoZorro(s: S) {
  const p = siguientePilar(s) as any
  return `Hazme la sesión del Zorro de hoy (${larga(hoyISO())}). Pilar que sigue en la rueda: ${p.emoji} ${p.nombre || p.id} (${p.accion}). 5 a 10 minutos, con humor que nunca sea a mi costa y feedback honesto (remate corto y seco). Al terminar, el bloque \`\`\`luzmila tipo "zorro" con el XP que corresponda.`
}

export function pedidoReingreso(s: S) {
  const gap = diasEnCero(s)
  return `Estoy volviendo al Proyecto Luzmila${gap !== null ? ` después de ${gap} días sin registrar` : ''}. Aplica mi protocolo de Reingreso: sin culpa, sin empezar de cero, retomando solo 1–2 cosas durante una semana, y recordándome que los puntos no se pierden y que retomar vale +3. Tengo ≈ 2 h libres al día. Mi plataforma muestra: XP ${xpLuzmila(s).total}, ${s.culta.sesiones.length} sesiones de Culta, práctica ancla ${s.ancla.nombre ? '“' + s.ancla.nombre + '”' : 'sin elegir'}. Dime qué fase sigue "viva", qué retomamos esta semana (máximo 2 cosas) y qué espera sin culpa.`
}

export const pedidoLibre = (tipo: string, texto: string) => `Revisa a fondo mi texto como un profesor exigente pero amable (tipo: ${tipo}). Quiero: 1) qué está bien, 2) errores conceptuales o imprecisiones, 3) una versión mejorada con su justificación, 4) tres preguntas para profundizar.\n\nMi texto:\n${texto}`
