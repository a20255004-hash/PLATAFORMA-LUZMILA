import { AnimatePresence, motion, useInView } from 'motion/react'
import { ReactNode, useEffect, useRef, useState } from 'react'
import { create } from 'zustand'

export const sinMovimiento = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Tarjeta que se inclina en 3D con el cursor. */
export function Tilt({ children, className = '', as = 'div', ...p }: any) {
  const ref = useRef<HTMLElement>(null)
  const mover = (e: React.PointerEvent) => {
    if (e.pointerType === 'touch') return
    const r = ref.current!.getBoundingClientRect()
    ref.current!.style.setProperty('--tx', String(((e.clientX - r.left) / r.width - 0.5) * 2))
    ref.current!.style.setProperty('--ty', String(((e.clientY - r.top) / r.height - 0.5) * 2))
  }
  const salir = () => { ref.current?.style.setProperty('--tx', '0'); ref.current?.style.setProperty('--ty', '0') }
  const T: any = as
  return <T ref={ref} className={`card tilt ${className}`} onPointerMove={mover} onPointerLeave={salir} {...p}>{children}</T>
}

/** Aparece al entrar en pantalla. */
export function Sube({ children, d = 0, className = '', style }: { children: ReactNode; d?: number; className?: string; style?: any }) {
  const ref = useRef(null)
  const visto = useInView(ref, { once: true, margin: '-40px' })
  return (
    <motion.div ref={ref} className={className} style={style} initial={{ opacity: 0, y: 34, rotateX: -10 }} animate={visto ? { opacity: 1, y: 0, rotateX: 0 } : {}} transition={{ duration: 0.8, delay: d, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  )
}

/** Título con volumen 3D que sigue al cursor. */
export function Titulo3D({ texto, chico = false, nombre = false }: { texto: string; chico?: boolean; nombre?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    if (sinMovimiento()) return
    const mover = (e: PointerEvent) => {
      ref.current?.style.setProperty('--rx', String((e.clientX / window.innerWidth - 0.5) * 2))
      ref.current?.style.setProperty('--ry', String((e.clientY / window.innerHeight - 0.5) * 2))
    }
    const giro = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return
      ref.current?.style.setProperty('--rx', String(Math.max(-1, Math.min(1, e.gamma / 30))))
      ref.current?.style.setProperty('--ry', String(Math.max(-1, Math.min(1, (e.beta - 45) / 30))))
    }
    window.addEventListener('pointermove', mover)
    window.addEventListener('deviceorientation', giro)
    return () => { window.removeEventListener('pointermove', mover); window.removeEventListener('deviceorientation', giro) }
  }, [])
  return (
    <h1 className={`t3d ${chico ? 'sm' : ''} ${nombre ? 'nombre' : ''}`} aria-label={texto}>
      <span className="t3d-in" ref={ref} aria-hidden="true">
        {texto.split('').map((l, i) => <span key={i} className="t3d-l" style={{ ['--i' as any]: i }}>{l === ' ' ? ' ' : l}</span>)}
      </span>
    </h1>
  )
}

export function Anillo({ valor, tam = 150, grosor = 14, color = 'var(--tinta)', children }: { valor: number; tam?: number; grosor?: number; color?: string; children?: ReactNode }) {
  const r = (tam - grosor) / 2
  const c = 2 * Math.PI * r
  const [v, setV] = useState(0)
  useEffect(() => { const t = setTimeout(() => setV(Math.max(0, Math.min(1, valor))), 150); return () => clearTimeout(t) }, [valor])
  return (
    <div className="anillo" style={{ width: tam, height: tam }} role="img" aria-label={`${Math.round(valor * 100)} por ciento`}>
      <svg width={tam} height={tam}>
        <circle className="fondo" cx={tam / 2} cy={tam / 2} r={r} strokeWidth={grosor} />
        <circle className="valor" cx={tam / 2} cy={tam / 2} r={r} strokeWidth={grosor} style={{ stroke: color }} strokeDasharray={c} strokeDashoffset={c * (1 - v)} />
      </svg>
      <div className="centro">{children}</div>
    </div>
  )
}

/** Número que sube contando. */
export function Cuenta({ n, dec = 0 }: { n: number; dec?: number }) {
  const [v, setV] = useState(sinMovimiento() ? n : 0)
  const desde = useRef(0)
  useEffect(() => {
    if (sinMovimiento()) { setV(n); return }
    const a = desde.current, t0 = performance.now()
    let id = 0
    const paso = (t: number) => { const k = Math.min(1, (t - t0) / 900); const e = 1 - Math.pow(1 - k, 4); setV(a + (n - a) * e); if (k < 1) id = requestAnimationFrame(paso); else desde.current = n }
    id = requestAnimationFrame(paso)
    return () => cancelAnimationFrame(id)
  }, [n])
  return <span className="mono">{v.toFixed(dec)}</span>
}

/** Sello circular con texto que gira (foto o emoji al centro). */
export function Sello({ texto, foto, emoji = '✨', tam = 132 }: { texto: string; foto?: string; emoji?: string; tam?: number }) {
  const id = useRef('s' + Math.random().toString(36).slice(2, 7)).current
  return (
    <div className="sello" style={{ width: tam, height: tam }} aria-hidden="true">
      <svg viewBox="0 0 132 132" className="gira"><defs><path id={id} d="M66,66 m-56,0 a56,56 0 1,1 112,0 a56,56 0 1,1 -112,0" /></defs><text><textPath href={`#${id}`}>{texto}</textPath></text></svg>
      {foto ? <img className="foto" src={foto} alt="" /> : <div className="emoji">{emoji}</div>}
    </div>
  )
}

export function Hoja({ abierta, cerrar, titulo, children }: { abierta: boolean; cerrar: () => void; titulo: string; children: ReactNode }) {
  useEffect(() => {
    if (!abierta) return
    const k = (e: KeyboardEvent) => e.key === 'Escape' && cerrar()
    window.addEventListener('keydown', k)
    document.body.style.overflow = 'hidden'; document.body.classList.add('con-hoja')
    return () => { window.removeEventListener('keydown', k); document.body.style.overflow = ''; document.body.classList.remove('con-hoja') }
  }, [abierta])
  return (
    <AnimatePresence>
      {abierta && (
        <motion.div className="velo" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={cerrar}>
          <motion.div className="hoja" role="dialog" aria-modal="true" aria-label={titulo} initial={{ y: 80, opacity: 0, rotateX: -12 }} animate={{ y: 0, opacity: 1, rotateX: 0 }} exit={{ y: 80, opacity: 0 }} transition={{ type: 'spring', damping: 26, stiffness: 260 }} onClick={(e) => e.stopPropagation()}>
            <div className="entre"><h2 className="h2">{titulo}</h2><button className="btn claro s" onClick={cerrar} aria-label="Cerrar">Cerrar ✕</button></div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function Campo({ label, children, ayuda }: { label: string; children: ReactNode; ayuda?: string }) {
  return <label className="campo"><span>{label}</span>{children}{ayuda && <span className="suave" style={{ fontWeight: 400 }}>{ayuda}</span>}</label>
}

export function DeDonde({ children, titulo = '¿De dónde sale este número?' }: { children: ReactNode; titulo?: string }) {
  return <details className="dedonde"><summary>ⓘ {titulo}</summary><div className="suave">{children}</div></details>
}

export function Vacio({ children }: { children: ReactNode }) { return <div className="vacio chico">{children}</div> }

// ───── Avisos y celebración ─────
type Av = { id: number; texto: ReactNode }
export const useAvisos = create<{ lista: Av[]; fiesta: number; decir: (t: ReactNode, fiesta?: boolean) => void }>((set) => ({
  lista: [], fiesta: 0,
  decir: (texto, fiesta) => {
    const id = Date.now() + Math.random()
    set((s) => ({ lista: [...s.lista, { id, texto }], fiesta: fiesta ? s.fiesta + 1 : s.fiesta }))
    setTimeout(() => set((s) => ({ lista: s.lista.filter((a) => a.id !== id) })), 3800)
  },
}))
export const decir = (t: ReactNode, fiesta = false) => useAvisos.getState().decir(t, fiesta)

const COLORES = ['var(--lima)', 'var(--lila)', 'var(--mandarina)', 'var(--celeste)', 'var(--rosa)', 'var(--mostaza)']
export function Avisos() {
  const { lista, fiesta } = useAvisos()
  const [conf, setConf] = useState(0)
  useEffect(() => { if (!fiesta || sinMovimiento()) return; setConf(fiesta); const t = setTimeout(() => setConf(0), 1600); return () => clearTimeout(t) }, [fiesta])
  return (
    <>
      <div className="avisos" role="status" aria-live="polite">
        <AnimatePresence>
          {lista.map((a) => <motion.div key={a.id} className="aviso" initial={{ opacity: 0, y: -20, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.95 }}>{a.texto}</motion.div>)}
        </AnimatePresence>
      </div>
      {conf > 0 && <div className="confeti" key={conf} aria-hidden="true">{Array.from({ length: 34 }).map((_, i) => { const a = (i / 34) * Math.PI * 2, d = 160 + (i % 5) * 60; return <i key={i} style={{ background: COLORES[i % 6], ['--x' as any]: `${Math.cos(a) * d}px`, ['--y' as any]: `${Math.sin(a) * d - 80}px`, animationDelay: `${(i % 6) * 20}ms` }} /> })}</div>}
    </>
  )
}

export const Barra = ({ v, mundo = false }: { v: number; mundo?: boolean }) => <div className={`barra ${mundo ? 'mundo' : ''}`}><i style={{ width: `${Math.round(Math.max(0, Math.min(1, v)) * 100)}%` }} /></div>
