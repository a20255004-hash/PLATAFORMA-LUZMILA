import { AnimatePresence, motion } from 'motion/react'
import { Component, lazy, ReactNode, Suspense, useEffect, useRef, useState } from 'react'
import { Avisos, sinMovimiento } from './components/ui'
import { MUNDOS, MundoId, ORDEN } from './data/estructura'
import { useDatos } from './store'
import Hoy from './pages/Hoy'

const PAGINAS: Record<MundoId, any> = {
  hoy: Hoy,
  mapa: lazy(() => import('./pages/Mapa')),
  culta: lazy(() => import('./pages/Culta')),
  zorro: lazy(() => import('./pages/Zorro')),
  voz: lazy(() => import('./pages/Voz')),
  calendario: lazy(() => import('./pages/Calendario')),
  bitacora: lazy(() => import('./pages/Bitacora')),
  expediente: lazy(() => import('./pages/Expediente')),
  patrones: lazy(() => import('./pages/Patrones')),
  logros: lazy(() => import('./pages/Logros')),
  ajustes: lazy(() => import('./pages/Ajustes')),
}
const leerRuta = (): MundoId => { const h = location.hash.replace('#/', '').replace('#', '') as MundoId; return ORDEN.includes(h) ? h : 'hoy' }

class Red extends Component<{ children: ReactNode }, { e: any }> {
  state = { e: null as any }
  static getDerivedStateFromError(e: any) { return { e } }
  render() {
    if (this.state.e) return <div className="pagina"><div className="card pila"><h2 className="h2">Ups, algo se cruzó 🌀</h2><p className="suave">Tus datos están a salvo en este dispositivo. Recarga la página; si sigue, exporta tu respaldo desde Datos.</p><button className="btn" onClick={() => location.reload()}>Recargar</button></div></div>
    return this.props.children
  }
}

export let irA: (m: MundoId, e?: { clientX: number; clientY: number }) => void = () => {}

export default function App() {
  const [ruta, setRuta] = useState<MundoId>(leerRuta())
  const [menu, setMenu] = useState(false)
  const [telon, setTelon] = useState<{ m: MundoId; x: number; y: number; k: number } | null>(null)
  const mods = useDatos((s) => s.modulos)
  const origen = useRef({ x: 0, y: 0 })

  useEffect(() => { const h = () => setRuta(leerRuta()); window.addEventListener('hashchange', h); return () => window.removeEventListener('hashchange', h) }, [])
  useEffect(() => { document.documentElement.style.setProperty('--mundo', MUNDOS[ruta].color); window.scrollTo({ top: 0 }) }, [ruta])
  useEffect(() => { const p = (e: PointerEvent) => { origen.current = { x: e.clientX, y: e.clientY } }; window.addEventListener('pointerdown', p, true); return () => window.removeEventListener('pointerdown', p, true) }, [])

  irA = (m) => {
    setMenu(false)
    if (m === ruta) return
    if (sinMovimiento()) { location.hash = '/' + m; return }
    const { x, y } = origen.current
    setTelon({ m, x: x || innerWidth / 2, y: y || innerHeight / 2, k: Date.now() })
    setTimeout(() => { location.hash = '/' + m }, 430)
    setTimeout(() => setTelon(null), 520)
  }

  const visibles = ORDEN.filter((m) => (m === 'culta' || m === 'zorro' || m === 'voz' ? (mods as any)[m] !== false : true))
  const rapidos = (['hoy', 'culta', 'zorro', 'voz', 'expediente'] as MundoId[]).filter((m) => visibles.includes(m))
  const Pag = PAGINAS[ruta]

  return (
    <Red>
      <a href="#contenido" className="sr">Saltar al contenido</a>
      <Avisos />
      <nav className="dock" aria-label="Secciones">
        {rapidos.map((m) => (
          <button key={m} onClick={() => irA(m)} aria-current={ruta === m ? 'page' : undefined} aria-label={MUNDOS[m].nombre} style={{ ['--mundo' as any]: MUNDOS[m].color }}>
            {ruta === m && <motion.span layoutId="burbuja" className="burbuja" transition={{ type: 'spring', damping: 24, stiffness: 300 }} />}
            <span className="e" aria-hidden="true">{MUNDOS[m].emoji}</span><span className="n">{MUNDOS[m].nombre}</span>
          </button>
        ))}
        <button className="mas" onClick={() => setMenu(true)} aria-label="Abrir menú completo" aria-expanded={menu}><span className="e" aria-hidden="true">☰</span></button>
      </nav>

      <main id="contenido">
        <AnimatePresence mode="wait">
          <motion.div key={ruta} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}>
            <Suspense fallback={<div className="pagina"><p className="serif" style={{ fontSize: 28 }}>Un segundito…</p></div>}><Pag /></Suspense>
          </motion.div>
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {telon && (
          <motion.div key={telon.k} className="telon" style={{ background: MUNDOS[telon.m].color }} aria-hidden="true"
            initial={{ clipPath: `circle(0px at ${telon.x}px ${telon.y}px)` }} animate={{ clipPath: `circle(${Math.hypot(innerWidth, innerHeight)}px at ${telon.x}px ${telon.y}px)` }} exit={{ opacity: 0 }} transition={{ duration: 0.5, ease: [0.65, 0, 0.35, 1] }} />
        )}
        {menu && (
          <motion.div className="menu" role="dialog" aria-modal="true" aria-label="Menú" key="menu"
            initial={{ clipPath: `circle(0px at ${origen.current.x}px ${origen.current.y}px)` }} animate={{ clipPath: `circle(${Math.hypot(innerWidth, innerHeight) * 1.1}px at ${origen.current.x}px ${origen.current.y}px)` }} exit={{ opacity: 0 }} transition={{ duration: 0.6, ease: [0.65, 0, 0.35, 1] }}>
            <div className="menu-in">
              <div className="entre"><span className="serif" style={{ fontSize: 26 }}>¿A dónde vamos?</span><button className="btn claro" onClick={() => setMenu(false)} autoFocus>Cerrar ✕</button></div>
              <div className="menu-links">
                {visibles.map((m, i) => (
                  <motion.button key={m} style={{ ['--c' as any]: MUNDOS[m].color }} onClick={() => irA(m)} initial={{ opacity: 0, y: 30, rotateX: -50 }} animate={{ opacity: 1, y: 0, rotateX: 0 }} transition={{ delay: 0.18 + i * 0.04, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
                    <span aria-hidden="true" style={{ fontSize: '0.6em' }}>{MUNDOS[m].emoji}</span>{MUNDOS[m].nombre}<small>{MUNDOS[m].frase}</small>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Red>
  )
}
