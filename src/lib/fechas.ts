import { ANCLA_ALTERNANCIA, INICIO } from '../data/estructura'

export const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
export const hoyISO = () => iso(new Date())
export const aFecha = (s: string) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d) }
export const sumar = (s: string, n: number) => { const d = aFecha(s); d.setDate(d.getDate() + n); return iso(d) }
export const dif = (a: string, b: string) => Math.round((aFecha(a).getTime() - aFecha(b).getTime()) / 86400000)
export const esISO = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s || '')

const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
export const diaSemana = (s: string) => DIAS[aFecha(s).getDay()]
export const bonita = (s: string) => esISO(s) ? `${aFecha(s).getDate()} ${MESES[aFecha(s).getMonth()].slice(0, 3)} ${aFecha(s).getFullYear()}` : s
export const larga = (s: string) => `${diaSemana(s)} ${aFecha(s).getDate()} de ${MESES[aFecha(s).getMonth()]}`
export const mesNombre = (m: number) => MESES[m]

export const diaProyecto = (s = hoyISO()) => dif(s, INICIO) + 1
export const mesProyecto = (s = hoyISO()) => Math.max(1, Math.floor(dif(s, INICIO) / 30.44) + 1)

/** Alternancia día por medio desde el 29/08: par = Culta, impar = Zorro. */
export const queToca = (s = hoyISO()): 'culta' | 'zorro' | null => {
  const n = dif(s, ANCLA_ALTERNANCIA)
  if (n < 0) return null
  return n % 2 === 0 ? 'culta' : 'zorro'
}
/** Bloque de Culta por semana (sábado a viernes): impar = B1, par = B2. B3 va siempre. */
export const semanaCulta = (s = hoyISO()) => Math.floor(dif(s, ANCLA_ALTERNANCIA) / 7) + 1
export const bloqueCulta = (s = hoyISO()): 'B1' | 'B2' => (semanaCulta(s) % 2 === 1 ? 'B1' : 'B2')
