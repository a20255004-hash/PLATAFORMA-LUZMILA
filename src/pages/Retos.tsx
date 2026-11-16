import { useState } from 'react'
import { jugar } from '../components/Juegos'
import { sinMovimiento, Sube, Tilt, Titulo3D, Vacio } from '../components/ui'
import { JUEGOS } from '../data/juegos'
import { bonita, hoyISO } from '../lib/fechas'
import { useDatos } from '../store'

const MUNDO = { voz: '🗣️ Voz', zorro: '🦊 Zorro', culta: '🎓 Culta', mente: '🧭 Mentalidad' } as const

export default function Retos() {
  const s = useDatos()
  const partidas: any[] = (s as any).juegos || []
  const [giro, setGiro] = useState(0)
  const [gana, setGana] = useState<number | null>(null)
  const [girando, setGirando] = useState(false)
  const n = JUEGOS.length
  const hoy = partidas.filter((p) => p.fecha === hoyISO()).length
  const de = (id: string) => partidas.filter((p) => p.juego === id)

  const girar = () => {
    if (girando) return
    const i = Math.floor(Math.random() * n)
    const destino = Math.ceil(giro / 360) * 360 + 360 * 4 + (360 - i * (360 / n))
    setGirando(true); setGana(null); setGiro(destino)
    setTimeout(() => { setGirando(false); setGana(i) }, sinMovimiento() ? 50 : 3300)
  }

  return (
    <div className="pagina">
      <header className="cabeza">
        <span className="eyebrow">Zona de juego · {partidas.length} partidas · {hoy} hoy</span>
        <Titulo3D texto="RETOS" />
        <p className="serif" style={{ fontSize: 'clamp(22px, 3vw, 32px)', maxWidth: 720 }}>Aquí no se anota que jugaste: se juega. Con reloj, escribiendo, y sin que nada se rompa si sale mal.</p>
      </header>

      <div className="bento">
        <Sube className="c5"><div className="card color pila" style={{ height: '100%', ['--mundo' as any]: 'var(--mostaza)', textAlign: 'center' }}>
          <span className="eyebrow">¿No sabes cuál? Gira</span>
          <div className="ruleta">
            <div className="flecha" aria-hidden="true">▼</div>
            <div className="plato" style={{ transform: `rotate(${giro}deg)`, transition: girando ? 'transform 3.2s cubic-bezier(0.16, 1, 0.3, 1)' : 'none', background: `conic-gradient(${JUEGOS.map((j, i) => `${j.color} ${(i / n) * 100}% ${((i + 1) / n) * 100}%`).join(',')})` }}>
              {JUEGOS.map((j, i) => <span key={j.id} className="sector" style={{ transform: `rotate(${i * (360 / n) + 180 / n}deg) translateY(calc(var(--R) * -1))` }} aria-hidden="true">{j.emoji}</span>)}
            </div>
            <button className="centro-r" onClick={girar} disabled={girando} aria-label="Girar la ruleta">{girando ? '…' : 'GIRA'}</button>
          </div>
          {gana !== null ? <div className="pila-s"><p className="h3">{JUEGOS[gana].emoji} {JUEGOS[gana].nombre}</p><p className="chico">{JUEGOS[gana].desc}</p><div><button className="btn" onClick={() => jugar(JUEGOS[gana].id)}>▶ Jugar ahora</button></div></div> : <p className="chico">La ruleta elige, tú decides si lo juegas.</p>}
        </div></Sube>

        <div className="c7 pila">
          {(['voz', 'zorro', 'culta', 'mente'] as const).map((m) => (
            <Sube key={m}><div className="pila-s"><span className="eyebrow">{MUNDO[m]}</span>
              <div className="juegos">{JUEGOS.filter((j) => j.mundo === m).map((j) => { const ps = de(j.id); const mejor = j.id === 'palabras' || j.id === 'cazadora' ? Math.max(0, ...ps.map((p) => p.puntaje)) : 0; return (
                <Tilt as="button" key={j.id} className="color pila-s juego" style={{ ['--mundo' as any]: j.color }} onClick={() => jugar(j.id)}>
                  <span className="entre"><span style={{ fontSize: 34 }} aria-hidden="true">{j.emoji}</span><span className="pill" style={{ background: 'rgba(255,255,255,.65)' }}>{j.seg ? `${j.seg} s` : 'sin reloj'}</span></span>
                  <b style={{ fontSize: 18 }}>{j.nombre}</b><span className="chico">{j.desc}</span>
                  <span className="chico" style={{ opacity: 0.75 }}>Entrena: {j.entrena}</span>
                  <span className="entre chico"><b>{ps.length ? `${ps.length} ${ps.length === 1 ? 'partida' : 'partidas'}` : 'sin estrenar'}</b>{mejor > 0 && <span>mejor: {mejor}</span>}<span className="pill tinta">▶ Jugar</span></span>
                </Tilt>) })}</div></div></Sube>
          ))}
        </div>

        <Sube className="c12"><div className="card pila"><span className="eyebrow">Tus últimas jugadas</span>
          {partidas.length ? <div className="lista">{partidas.slice(0, 12).map((p) => { const j = JUEGOS.find((x) => x.id === p.juego); return <div key={p.id} className="item"><span className="entre chico"><b>{j?.emoji} {j?.nombre}</b><span className="suave">{bonita(p.fecha)}</span></span>{p.detalle && <span className="chico suave">{p.detalle}{p.juego === 'palabras' ? ` · ${p.puntaje} palabras` : p.juego === 'cazadora' ? ` · ${p.puntaje}` : ''}</span>}{p.texto && <span>“{p.texto}”</span>}</div> })}</div> : <Vacio>Todavía no has jugado. El primero puede ser “Lluvia de palabras”: 90 segundos y ya.</Vacio>}
          <p className="porque">Los retos son práctica: no suman al nivel Luzmila. Los del Zorro dan +1 XP en su bitácora, una vez al día, para que jugar no se vuelva una forma de inflar puntos.</p></div></Sube>
      </div>
    </div>
  )
}
