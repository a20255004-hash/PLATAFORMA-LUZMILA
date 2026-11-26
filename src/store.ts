import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { NIVELES, NIVELES_CULTA, PILARES_ZORRO } from './data/estructura'
import { dif, esISO, hoyISO, sumar } from './lib/fechas'

const CLAVE = 'luzmila-v1'
const CLAVE_FOTOS = 'luzmila-fotos'

export const vacio = () => ({
  version: 1,
  cargado: false,
  perfil: { nombre: 'Luzmila', inicio: '2026-08-19', rincon: [] as string[] },
  checkins: {} as Record<string, any>,
  distorsiones: [] as any[],
  chips: [] as any[],
  expediente: [] as any[],
  metas: [] as any[],
  culta: { sesiones: [] as any[], fuentes: [] as any[] },
  zorro: { bitacora: [] as any[], anecdotas: [] as any[], cosmovision: [] as any[], porConfirmar: [] as string[], niveles: {} as Record<string, string> },
  voz: { semanasCompletas: 0, palabras: [] as any[], argumentos: [] as any[], rondas: [] as any[], frases: [] as any[], observaciones: [] as string[] },
  bitacora: [] as any[],
  misiones: [] as any[],
  autoconcepto: [] as any[],
  retomas: [] as string[],
  alterEgo: [] as any[],
  disfrute: [] as any[],
  juegos: [] as any[],
  evaluaciones: [] as any[],
  quizzes: [] as any[],
  fechas: [] as any[],
  agenda: { manana: '07:30', comida: '13:30', noche: '21:30', hoyToca: '18:00', domingo: '19:00', voz: '17:00', activos: { manana: true, comida: true, noche: true, hoyToca: true, domingo: true, voz: false } as Record<string, boolean> },
  hitos: [] as string[],
  hitosListos: false,
  ancla: { nombre: '', inicio: '' },
  fasesReg: [] as any[],
  fasesChecks: {} as Record<string, boolean>,
  patrones: { fortalezas: [] as any[], debiles: [] as any[] },
  fasesAbiertas: [] as number[],
  fasesEstado: {} as Record<string, string>,
  modulos: { culta: true, zorro: true, voz: true, extra: [] as any[] },
  ajustes: { reingreso: true, movimiento: 'auto' as 'auto' | 'suave', letraNombre: 'montserrat', letraTitulos: 'condensada', mascotaNombre: 'Atoq', mascotaVisible: true, minimo: false, ultimoRespaldo: '' },
})
export type Datos = ReturnType<typeof vacio>

const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4)
const leer = (o: any, ruta: string) => ruta.split('.').reduce((a, k) => a?.[k], o)
const escribir = (o: any, ruta: string, v: any): any => {
  const [k, ...r] = ruta.split('.')
  return { ...o, [k]: r.length ? escribir(o[k] ?? {}, r.join('.'), v) : v }
}

type Acciones = {
  agregar: (ruta: string, item: any) => string
  editar: (ruta: string, id: string, cambio: any) => void
  quitar: (ruta: string, id: string) => void
  poner: (ruta: string, valor: any) => void
  checkin: (fecha: string, cambio: any) => { retomo: boolean }
  importar: (json: any) => void
  borrarTodo: () => void
}

export const useDatos = create<Datos & Acciones>()(
  persist(
    (set, get) => ({
      ...vacio(),
      agregar: (ruta, item) => { const id = uid(); set((s) => escribir(s, ruta, [{ id, ...item }, ...(leer(s, ruta) || [])])); return id },
      editar: (ruta, id, cambio) => set((s) => escribir(s, ruta, leer(s, ruta).map((x: any) => (x.id === id ? { ...x, ...cambio } : x)))),
      quitar: (ruta, id) => set((s) => escribir(s, ruta, leer(s, ruta).filter((x: any) => x.id !== id))),
      poner: (ruta, valor) => set((s) => escribir(s, ruta, valor)),
      checkin: (fecha, cambio) => {
        const s = get()
        const antes = s.checkins[fecha] || {}
        const nuevo = { ...antes, ...cambio }
        const checkins = { ...s.checkins, [fecha]: nuevo }
        // Retomar después de fallar (+3): hoy sumas y los 2 días anteriores quedaron en cero.
        let retomo = false
        const hubo = Object.keys(s.checkins).some((f) => f < fecha && puntosDia(s.checkins[f]) > 0)
        const vacios = [1, 2].every((n) => !vivo(s.checkins[sumar(fecha, -n)]))
        if (puntosDia(nuevo) > 0 && puntosDia(antes) === 0 && hubo && vacios && !s.retomas.includes(fecha)) retomo = true
        set({ checkins, retomas: retomo ? [...s.retomas, fecha] : s.retomas })
        return { retomo }
      },
      importar: (json) => {
        const { fotos, ...resto } = json || {}
        if (Array.isArray(fotos)) { try { localStorage.setItem(CLAVE_FOTOS, JSON.stringify(fotos)) } catch { /* sin espacio: seguimos sin fotos */ } }
        const base = vacio()
        const mezcla: any = { ...base, ...resto, cargado: true }
        for (const k of ['perfil', 'culta', 'zorro', 'voz', 'patrones', 'modulos', 'ajustes', 'agenda', 'ancla']) mezcla[k] = { ...(base as any)[k], ...(resto as any)[k] }
        set(mezcla)
      },
      borrarTodo: () => { try { localStorage.removeItem(CLAVE_FOTOS) } catch { /* nada */ } set(vacio()) },
    }),
    { name: CLAVE, version: 1 },
  ),
)

export const FOTOS_PUBLICAS = [1, 2, 3, 4, 5].map((n) => `${import.meta.env.BASE_URL}fotos/f${n}.jpg`)
export const fotosGuardadas = (): string[] => {
  try { const propias = JSON.parse(localStorage.getItem(CLAVE_FOTOS) || '[]'); if (Array.isArray(propias) && propias.length) return propias } catch { /* sin fotos propias */ }
  return FOTOS_PUBLICAS
}
export const exportar = (s: Datos) => {
  const limpio: any = {}
  for (const k of Object.keys(vacio())) limpio[k] = (s as any)[k]
  limpio.fotos = fotosGuardadas()
  return limpio
}

// ───────── Cálculos (cada número se puede explicar) ─────────
export const puntosDia = (c: any) => (c ? Number(!!c.manana) + Number(!!c.comida) + Number(!!c.noche) : 0)
/** Un día "vivo" no cuenta como día en cero: sumó puntos o lo marcaste como modo supervivencia. */
export const vivo = (c: any) => puntosDia(c) > 0 || !!c?.supervivencia

export const xpLuzmila = (s: Datos) => {
  const f1 = Object.values(s.checkins).reduce((a: number, c) => a + puntosDia(c), 0)
  const f2 = s.distorsiones.length
  const f3 = s.expediente.filter((e) => !e.historial).length
  const f4 = s.metas.filter((m) => m.estado === 'Cumplida').length * 2
  const retomar = s.retomas.length * 3
  const alter = s.alterEgo.length * 2
  const otras = (s.fasesReg || []).reduce((a: number, r: any) => a + (Number(r.xp) || 0), 0)
  const partes = [
    { nombre: 'Fase 1 · rituales (+1 por cada Sí)', xp: f1 },
    { nombre: 'Fase 2 · distorsiones capturadas (+1)', xp: f2 },
    { nombre: 'Fase 3 · evidencias nuevas (+1)', xp: f3 },
    { nombre: 'Fase 4 · metas cumplidas (+2)', xp: f4 },
    { nombre: 'Retomar después de fallar (+3)', xp: retomar },
    { nombre: 'Alter Ego activado (+2)', xp: alter },
    { nombre: 'Otras fases con puntos (Cuerpo +2 por sesión)', xp: otras },
  ]
  return { total: f1 + f2 + f3 + f4 + retomar + alter + otras, partes }
}

export const nivelDe = (xp: number, tabla: { min: number }[] = NIVELES) => {
  let i = 0
  tabla.forEach((n, k) => { if (xp >= n.min) i = k })
  const sig = tabla[i + 1]
  const base = tabla[i].min
  return { i, actual: tabla[i] as any, siguiente: sig as any, faltan: sig ? sig.min - xp : 0, progreso: sig ? (xp - base) / (sig.min - base) : 1 }
}

/** Racha con regla de 48 h: un día en cero no la corta; dos seguidos sí. */
export const racha = (s: Datos, hasta = hoyISO()) => {
  let f = hasta
  if (!vivo(s.checkins[f])) f = sumar(f, -1) // hoy todavía no cuenta en contra
  let dias = 0, huecos = 0
  for (let i = 0; i < 400; i++) {
    if (vivo(s.checkins[f])) { dias++; huecos = 0 } else { huecos++; if (huecos >= 2) break }
    f = sumar(f, -1)
  }
  return dias
}
export const diasEnCero = (s: Datos, hasta = hoyISO()) => {
  const fechas = Object.keys(s.checkins).filter((f) => vivo(s.checkins[f])).sort()
  if (!fechas.length) return null
  return Math.max(0, dif(hasta, fechas[fechas.length - 1]) - (vivo(s.checkins[hasta]) ? 0 : 0))
}
export const cumplimiento7 = (s: Datos, hasta = hoyISO()) => {
  let p = 0
  for (let i = 0; i < 7; i++) p += puntosDia(s.checkins[sumar(hasta, -i)])
  return { puntos: p, de: 21, pct: Math.round((p / 21) * 100) }
}

export const xpCulta = (s: Datos) => {
  const prog = s.culta.sesiones.filter((x) => x.estado === 'En progreso').length
  const cons = s.culta.sesiones.filter((x) => x.estado === 'Consolidado').length
  const total = prog + cons * 3
  return { total, prog, cons, ...nivelDe(total, NIVELES_CULTA) }
}
export const promedio = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null)

export const xpZorro = (s: Datos) => {
  const total = s.zorro.bitacora.reduce((a, b) => a + (Number(b.xp) || 0), 0)
  const nivel = Math.floor(total / 15) + 1
  const enNivel = total % 15
  return { total, nivel, enNivel, faltan: 15 - enNivel, progreso: enNivel / 15, nombre: s.zorro.niveles?.[nivel] || (nivel === 1 ? 'Zorra Aprendiz' : null) }
}
export const siguientePilar = (s: Datos) => {
  const ult = [...s.zorro.bitacora].filter((b) => esISO(b.fecha)).sort((a, b) => (a.fecha < b.fecha ? 1 : -1))[0]
  const i = ult ? PILARES_ZORRO.findIndex((p) => p.id === ult.enfoque) : -1
  return PILARES_ZORRO[(i + 1) % PILARES_ZORRO.length]
}

/** Vocabulario: nivel por dominio demostrado (palabras con 3 frases y sus 3 repasos), nunca por racha. */
export const dominioVoz = (s: Datos) => {
  const dominadas = s.voz.palabras.filter((p) => (p.frases || []).filter(Boolean).length >= 3 && p.d2 && p.d7 && p.d21).length
  const completos = s.voz.argumentos.filter((a) => a.afirmacion && a.evidencia && a.garantia).length
  return { dominadas, completos, nivel: Math.floor(dominadas / 10) + 1, progreso: (dominadas % 10) / 10 }
}

export const repasosPendientes = (items: any[], hoy = hoyISO()) => {
  const out: { item: any; clave: 'd2' | 'd7' | 'd21'; dias: number }[] = []
  for (const it of items) {
    if (!esISO(it.fecha)) continue
    const r = it.repasos || it
    const pasados = dif(hoy, it.fecha)
    for (const [clave, dias] of [['d2', 2], ['d7', 7], ['d21', 21]] as const) if (!r[clave] && pasados >= dias) { out.push({ item: it, clave, dias }); break }
  }
  return out
}


/** Práctica ancla: UNA práctica pequeña sostenida hacia 8 semanas, con la regla de 48 h (dos días seguidos sin marcarla la cortan). */
export const anclaSemanas = (s: Datos, hasta = hoyISO()) => {
  if (!s.ancla?.nombre) return null
  const marcado = (f: string) => !!s.checkins[f]?.ancla
  let f = hasta
  if (!marcado(f)) f = sumar(f, -1)
  let huecos = 0, primero = '', ultimo = '', dias = 0
  for (let i = 0; i < 400; i++) {
    if (marcado(f)) { if (!ultimo) ultimo = f; primero = f; dias++; huecos = 0 } else { huecos++; if (huecos >= 2) break }
    f = sumar(f, -1)
  }
  const span = ultimo ? dif(ultimo, primero) + 1 : 0
  return { dias, span, semanas: Math.floor(span / 7), meta: 8, progreso: Math.min(1, span / 56), hoy: marcado(hasta) }
}

/** Ciclo de caída y regreso: cuántos días en cero hubo cada vez que paraste y luego volviste (tu definición de éxito: que se acorte). */
export const ciclo = (s: Datos, hasta = hoyISO()) => {
  const vivos = Object.keys(s.checkins).filter((f) => vivo(s.checkins[f])).sort()
  const caidas: { desde: string; hasta: string; vacios: number }[] = []
  for (let i = 1; i < vivos.length; i++) {
    const vacios = dif(vivos[i], vivos[i - 1]) - 1
    if (vacios >= 2) caidas.push({ desde: sumar(vivos[i - 1], 1), hasta: sumar(vivos[i], -1), vacios })
  }
  const actual = vivos.length ? Math.max(0, dif(hasta, vivos[vivos.length - 1]) - (vivo(s.checkins[hasta]) ? 0 : 0)) : null
  const prom = (x: number[]) => (x.length ? x.reduce((a, b) => a + b, 0) / x.length : null)
  const v = caidas.map((c) => c.vacios)
  const ult = prom(v.slice(-3)), prev = prom(v.slice(-6, -3))
  return { caidas, actual, ult, prev, tendencia: ult !== null && prev !== null ? (ult < prev - 0.5 ? 'baja' : ult > prev + 0.5 ? 'sube' : 'igual') : null }
}

/** Fechas límite ordenadas, con cuenta regresiva amable. */
export const proximasFechas = (s: Datos, hoy = hoyISO()) => (s.fechas || []).filter((x) => !x.hecha && esISO(x.fecha)).map((x) => ({ ...x, faltan: dif(x.fecha, hoy) })).sort((a, b) => (a.fecha < b.fecha ? -1 : 1))
