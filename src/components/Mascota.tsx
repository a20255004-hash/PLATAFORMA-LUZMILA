import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { create } from 'zustand'
import { irA } from '../App'
import { pendientes } from '../lib/hitos'
import { diasEnCero, nivelDe, proximasFechas, puntosDia, useDatos, vivo, xpLuzmila } from '../store'
import { hoyISO, larga } from '../lib/fechas'
import { sinMovimiento } from './ui'

export type Humor = 'feliz' | 'fiesta' | 'calma' | 'duerme' | 'curiosa'
export const useMascota = create<{ msg: string; humor: Humor; k: number; abierto: boolean; decir: (msg: string, humor?: Humor) => void; toggle: (v?: boolean) => void }>((set) => ({
  msg: '', humor: 'feliz', k: 0, abierto: false,
  decir: (msg, humor = 'feliz') => set((s) => ({ msg, humor, k: s.k + 1, abierto: true })),
  toggle: (v) => set((s) => ({ abierto: v ?? !s.abierto })),
}))
export const mascotaDice = (msg: string, humor: Humor = 'feliz') => useMascota.getState().decir(msg, humor)

/** El zorro andino (atoq) de Luzmila: ropa y accesorios según su nivel. */
export function Atoq({ humor = 'feliz', nivel = 0, tam = 96 }: { humor?: Humor; nivel?: number; tam?: number }) {
  const dormida = humor === 'duerme'
  const boca = humor === 'fiesta' ? 'M44 66q8 12 16 0z' : humor === 'calma' || dormida ? 'M45 66q7 5 14 0' : 'M44 65q8 9 16 0'
  return (
    <svg className={`atoq ${humor}`} width={tam} height={tam} viewBox="0 0 104 104" role="img" aria-label="Atoq, tu zorro compañero">
      <g className="cola"><path d="M78 80c22-4 30-30 14-44-4 14-12 20-22 22z" fill="#ff9d57" /><path d="M90 40c4 8 2 16-4 22-2-8-1-16 4-22z" fill="#fffaf0" /></g>
      <ellipse cx="52" cy="82" rx="22" ry="17" fill="#ff9d57" />
      <ellipse cx="52" cy="86" rx="12" ry="11" fill="#fff3df" />
      <g className="cabeza">
        <path d="M24 34 30 8l16 16z" fill="#ff9d57" /><path d="M80 34 74 8 58 24z" fill="#ff9d57" />
        <path d="M30 28 32 16l8 8z" fill="#ffb3d1" /><path d="M74 28 72 16l-8 8z" fill="#ffb3d1" />
        <ellipse cx="52" cy="48" rx="29" ry="24" fill="#ff9d57" />
        <path d="M23 52c8 18 22 26 29 26s21-8 29-26c-8 8-20 10-29 10s-21-2-29-10z" fill="#fffaf0" />
        <g className="ojos">
          {dormida ? <><path d="M36 46q5 4 10 0" stroke="#12302a" strokeWidth="3" fill="none" strokeLinecap="round" /><path d="M58 46q5 4 10 0" stroke="#12302a" strokeWidth="3" fill="none" strokeLinecap="round" /></>
            : <><ellipse cx="41" cy="46" rx="4.2" ry="5.2" fill="#12302a" /><ellipse cx="63" cy="46" rx="4.2" ry="5.2" fill="#12302a" /><circle cx="42.6" cy="44" r="1.5" fill="#fff" /><circle cx="64.6" cy="44" r="1.5" fill="#fff" /></>}
        </g>
        <ellipse cx="52" cy="58" rx="4.6" ry="3.4" fill="#12302a" />
        <path d={boca} stroke="#12302a" strokeWidth="2.2" fill={humor === 'fiesta' ? '#ff7a7a' : 'none'} strokeLinecap="round" transform="translate(0 -1)" />
        <circle cx="32" cy="58" r="4.5" fill="#ffb3d1" opacity="0.6" /><circle cx="72" cy="58" r="4.5" fill="#ffb3d1" opacity="0.6" />
        {nivel >= 1 && <path d="M30 68q22 12 44 0l-2 9q-20 9-40 0z" fill="#86d6ff" stroke="#12302a" strokeWidth="1.6" />}
        {nivel >= 2 && <g><circle cx="41" cy="46" r="9" fill="none" stroke="#12302a" strokeWidth="2" /><circle cx="63" cy="46" r="9" fill="none" stroke="#12302a" strokeWidth="2" /><path d="M50 46h4" stroke="#12302a" strokeWidth="2" /></g>}
        {nivel >= 3 && <path d="M26 42c8-14 44-14 52 0-6 4-12 6-18 4-4-2-12-2-16 0-6 2-12 0-18-4z" fill="#7a3ff2" opacity="0.88" />}
        {nivel >= 4 && <path d="M32 18l6-12 7 9 7-13 7 13 7-9 6 12z" fill="#ffd25e" stroke="#12302a" strokeWidth="1.8" strokeLinejoin="round" />}
      </g>
      {dormida && <text x="78" y="22" fontSize="14" fill="#46665b" className="zzz">z z</text>}
      {humor === 'fiesta' && <g className="chispas">{[[12, 20], [92, 16], [8, 60], [98, 56]].map(([x, y], i) => <path key={i} d={`M${x} ${y - 6}l2 4 4 2-4 2-2 4-2-4-4-2 4-2z`} fill="#ffd25e" />)}</g>}
    </svg>
  )
}

const saludoHora = (n: string) => { const h = new Date().getHours(); return h < 6 ? `${n} aquí: es tardecito, corazón` : h < 12 ? `¡Buenos días! Soy ${n} 🦊` : h < 19 ? `¡Buenas tardes! ${n} presente` : `Buenas noches, ${n} contigo` }

/** Mensaje de bienvenida según lo que de verdad está pasando (nunca con culpa). */
export function mensajeInicial(s: ReturnType<typeof useDatos.getState>): { msg: string; humor: Humor } {
  const n = s.ajustes.mascotaNombre || 'Atoq'
  const hoy = hoyISO(), c = s.checkins[hoy] || {}
  const prox = proximasFechas(s)[0]
  const gap = diasEnCero(s)
  const hora = new Date().getHours()
  if (prox && prox.faltan >= 0 && prox.faltan <= 3) return { msg: `${saludoHora(n)}. ${prox.faltan === 0 ? 'Hoy es' : prox.faltan === 1 ? 'Mañana es' : `En ${prox.faltan} días es`} “${prox.titulo}”. Un paso pequeño hoy y llegas tranquila.`, humor: 'curiosa' }
  const resp = s.ajustes.ultimoRespaldo
  if (Object.keys(s.checkins).length + s.culta.sesiones.length > 3 && (!resp || (new Date(hoy).getTime() - new Date(resp).getTime()) / 86400000 > 7) && hora >= 9 && hora < 21) return { msg: `${saludoHora(n)}. Tus datos viven solo en este dispositivo. ¿Bajamos un respaldo? Son 2 toques en Datos y los dejas a salvo 🗝️`, humor: 'curiosa' }
  if (gap !== null && gap > 14 && !vivo(c)) return { msg: `¡Volviste! Qué alegría verte 🤍 No hace falta ponerse al día: hoy basta con un check-in de 10 segundos. Y volver ya suma +3.`, humor: 'feliz' }
  if (hora >= 22 || hora < 5) return { msg: `${saludoHora(n)}. Nada exigente a esta hora: celular afuera, último capítulo y a descansar. Mañana seguimos.`, humor: 'duerme' }
  if (puntosDia(c) === 0 && !c.supervivencia) return { msg: `${saludoHora(n)}. ¿Hacemos el check-in de 10 segundos? Si hoy fue pesado, marca “modo supervivencia”: también cuenta.`, humor: 'feliz' }
  if (puntosDia(c) >= 3) return { msg: `Tres de tres hoy. ${n} está orgulloso de ti 🌟`, humor: 'fiesta' }
  return { msg: `${saludoHora(n)}. Llevas ${puntosDia(c)} de 3 hoy. Sin apuro, a tu ritmo.`, humor: 'calma' }
}

export default function Mascota() {
  const s = useDatos()
  const { msg, humor, k, abierto, toggle } = useMascota()
  const [auto, setAuto] = useState(true)
  const inicio = useRef(false)
  const nivel = nivelDe(xpLuzmila(s).total).i
  const nombre = s.ajustes.mascotaNombre || 'Atoq'

  // Saludo al abrir la página (una vez por visita)
  useEffect(() => {
    if (inicio.current || !s.cargado || s.ajustes.mascotaVisible === false) return
    inicio.current = true
    const t = setTimeout(() => { const m = mensajeInicial(useDatos.getState()); useMascota.getState().decir(m.msg, m.humor) }, 1800)
    return () => clearTimeout(t)
  }, [s.cargado])

  // Felicitaciones por hitos: la primera vez solo se anotan en silencio (para no bombardear lo que ya lograste)
  useEffect(() => {
    if (!s.cargado) return
    const falta = pendientes(s)
    if (!s.hitosListos) { useDatos.setState({ hitos: [...new Set([...s.hitos, ...falta.map((h) => h.id)])], hitosListos: true }); return }
    if (falta.length) {
      const h = falta[0]
      useDatos.setState({ hitos: [...s.hitos, h.id] })
      useMascota.getState().decir(`${h.emoji} ${h.texto}`, 'fiesta')
    }
  }, [s.checkins, s.expediente, s.distorsiones, s.quizzes, s.evaluaciones, s.zorro, s.fechas, s.alterEgo, s.fasesReg, s.retomas, s.cargado, s.ancla])

  // El globo se recoge solo a los 9 segundos
  useEffect(() => { if (!abierto) return; setAuto(true); const t = setTimeout(() => { setAuto(false); toggle(false) }, 9000); return () => clearTimeout(t) }, [k])

  if (!s.cargado || s.ajustes.mascotaVisible === false) return null
  const quieto = sinMovimiento()
  const hoy = hoyISO()
  return (
    <div className="mascota" data-humor={humor}>
      <AnimatePresence>
        {abierto && (
          <motion.div className="globo" role="status" aria-live="polite" initial={{ opacity: 0, y: 12, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.95 }} transition={{ type: 'spring', damping: 22, stiffness: 300 }}>
            <p>{msg || mensajeInicial(s).msg}</p>
            <div className="fila" style={{ gap: 6 }}>
              <button className="pill" onClick={() => { irA('hoy'); toggle(false) }}>Check-in</button>
              <button className="pill" onClick={() => { irA('agenda'); toggle(false) }}>Mis fechas</button>
              <button className="pill borde" onClick={() => { const m = mensajeInicial(useDatos.getState()); useMascota.getState().decir(m.msg, m.humor) }}>¿Y ahora?</button>
              <button className="pill borde" aria-label="Cerrar mensaje" onClick={() => toggle(false)}>✕</button>
            </div>
            <span className="chico suave">{nombre} · {larga(hoy)}</span>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.button className="atoq-btn" aria-label={`${nombre}, tu zorro compañero. Toca para hablar`} onClick={() => { if (abierto) toggle(false); else { const m = mensajeInicial(useDatos.getState()); useMascota.getState().decir(m.msg, m.humor) } }} whileHover={quieto ? undefined : { scale: 1.08, rotate: -3 }} whileTap={{ scale: 0.92 }}>
        <Atoq humor={abierto ? humor : 'feliz'} nivel={nivel} tam={84} />
        {!abierto && auto && <span className="punto" aria-hidden="true" />}
      </motion.button>
    </div>
  )
}
