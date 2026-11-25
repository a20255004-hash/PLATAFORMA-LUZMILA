import { useMemo, useState } from 'react'
import { BLOQUES_CULTA } from '../data/estructura'
import { sesionDeTema, todosLosTemas } from '../lib/recursos'
import { useCultaTab } from '../lib/coachEstado'
import { useDatos } from '../store'
import { sinMovimiento } from './ui'
import FichaTema from './FichaTema'

type B = 'B1' | 'B2' | 'B3'
const EMO: [string, string][] = [['fundamentos', '📚'], ['planeaci', '🧭'], ['organizaci', '🏗️'], ['direcci', '🧑‍🤝‍🧑'], ['control', '📏'], ['finanzas', '💰'], ['marketing', '📣'], ['operaciones', '⚙️'], ['emprendimiento', '🚀'], ['gestión pública', '🏛️'], ['tecnolog', '💻'], ['economía', '📈'], ['derecho', '⚖️'], ['historia', '🏺'], ['política', '🗳️'], ['sociedad', '👥'], ['ciencia', '🔬'], ['filosof', '🤔'], ['psicolog', '🧠'], ['arte', '🎨'], ['geograf', '🗺️'], ['empresas', '🏢'], ['ambiente', '🌱'], ['salud', '💚'], ['cosmovis', '🪐'], ['actualidad', '📰'], ['vocabulario', '📖'], ['estructura', '🧩'], ['argument', '🗣️'], ['explicar', '💡'], ['pensar', '⚡'], ['debates', '🎤'], ['entrevistas', '💼'], ['exposiciones', '🎙️'], ['reuniones', '🤝'], ['medios', '🔎']]
const emojiDe = (cat: string) => EMO.find(([k]) => cat.toLowerCase().includes(k))?.[1] || '📘'
const COLORES = ['var(--lila)', 'var(--menta)', 'var(--mostaza)', 'var(--celeste)', 'var(--rosa)', 'var(--mandarina)', 'var(--lima)', 'var(--durazno)']
const sacar = <T,>(a: T[], n: number) => [...a].sort(() => Math.random() - 0.5).slice(0, n)

/** Ruleta de temas: 8 candidatos, gira y entrega la ficha completa (resumen, enlaces, quiz). */
export default function RuletaTemas({ onRegistrar }: { onRegistrar: (tema: string, bloque: B) => void }) {
  const s = useDatos()
  const [filtro, setFiltro] = useState<'todos' | B>('todos')
  const [soloNuevos, setSoloNuevos] = useState(true)
  const [k, setK] = useState(0)
  const [giro, setGiro] = useState(0)
  const [girando, setGirando] = useState(false)
  const [gana, setGana] = useState<number | null>(null)
  const poner = useCultaTab((x) => x.poner)

  const pool = useMemo(() => {
    let t = todosLosTemas().filter((x) => filtro === 'todos' || x.bloque === filtro)
    // «Actualidad» y las prácticas de Bloque 3 siempre están, el resto puede filtrarse por «no vistos»
    if (soloNuevos) { const nuevos = t.filter((x) => !sesionDeTema(s.culta.sesiones, x.tema)); if (nuevos.length >= 8) t = nuevos }
    return t
  }, [filtro, soloNuevos, s.culta.sesiones])
  const cand = useMemo(() => sacar(pool, 8), [pool, k])
  const n = cand.length

  const girar = () => {
    if (girando || !n) return
    const i = Math.floor(Math.random() * n)
    const sector = 360 / n
    const destino = Math.ceil(giro / 360) * 360 + 360 * 4 + (360 - (i + 0.5) * sector)
    setGirando(true); setGana(null); setGiro(destino)
    setTimeout(() => { setGirando(false); setGana(i) }, sinMovimiento() ? 50 : 3300)
  }
  const mezclar = () => { setGana(null); setK(k + 1) }
  const elegido = gana !== null ? cand[gana] : null

  return (
    <div className="bento">
      <div className="c5 card color pila" style={{ textAlign: 'center', ['--mundo' as any]: 'var(--lila)' }}>
        <span className="eyebrow">¿No sabes de qué nutrirte? Gira</span>
        <div className="fila" style={{ justifyContent: 'center' }}>
          {(['todos', 'B1', 'B2', 'B3'] as const).map((b) => <button key={b} className="pill" aria-pressed={filtro === b} onClick={() => { setFiltro(b); setGana(null) }}>{b === 'todos' ? 'Todo' : `${BLOQUES_CULTA[b].emoji} ${BLOQUES_CULTA[b].nombre}`}</button>)}
        </div>
        <div className="ruleta">
          <div className="flecha" aria-hidden="true">▼</div>
          <div className="plato" style={{ transform: `rotate(${giro}deg)`, transition: girando ? 'transform 3.2s cubic-bezier(0.16, 1, 0.3, 1)' : 'none', background: `conic-gradient(${cand.map((_, i) => `${COLORES[i % 8]} ${(i / n) * 100}% ${((i + 1) / n) * 100}%`).join(',')})` }}>
            {cand.map((c, i) => <span key={c.tema} className="sector" style={{ transform: `rotate(${i * (360 / n) + 180 / n}deg) translateY(calc(var(--R) * -1))` }} aria-hidden="true">{emojiDe(c.categoria)}</span>)}
          </div>
          <button className="centro-r" onClick={girar} disabled={girando} aria-label="Girar la ruleta de temas">{girando ? '…' : 'GIRA'}</button>
        </div>
        <div className="fila" style={{ justifyContent: 'center' }}>
          <button className="pill borde" aria-pressed={soloNuevos} onClick={() => { setSoloNuevos(!soloNuevos); setGana(null) }}>{soloNuevos ? '✨ solo temas que no he visto' : 'incluye los ya vistos'}</button>
          <button className="pill borde" onClick={mezclar}>🔀 Otros 8 temas</button>
        </div>
        <div className="pila-s" style={{ textAlign: 'left' }}>
          <span className="eyebrow">En la ruleta ahora</span>
          {cand.map((c, i) => <div key={c.tema} className="chico" style={{ fontWeight: gana === i ? 800 : 500 }}>{emojiDe(c.categoria)} {c.tema.replace(/\(.*?\)/g, '').trim().slice(0, 56)}</div>)}
        </div>
      </div>

      <div className="c7 card pila">
        {elegido ? (
          <>
            <div className="entre"><span className="eyebrow">{emojiDe(elegido.categoria)} {elegido.categoria}</span><span className="pill mundo" style={{ ['--mundo' as any]: BLOQUES_CULTA[elegido.bloque as B].color }}>{BLOQUES_CULTA[elegido.bloque as B].nombre}</span></div>
            <FichaTema tema={elegido.tema} bloque={elegido.bloque as B} onRegistrar={() => onRegistrar(elegido.tema, elegido.bloque as B)} />
          </>
        ) : (
          <div className="pila" style={{ minHeight: 220, placeContent: 'center', textAlign: 'center' }}>
            <p className="display" style={{ fontSize: 'clamp(28px, 4vw, 44px)' }}>La ruleta elige el tema.</p>
            <p className="chico suave">Cuando salga, te muestro un resumen, los enlaces donde leerlo y un quiz para comprobar que lo entendiste.</p>
            <div><button className="btn" onClick={girar} disabled={girando}>🎡 Girar</button> <button className="btn linea s" onClick={() => poner('temario')}>Prefiero elegir yo</button></div>
          </div>
        )}
      </div>
    </div>
  )
}
