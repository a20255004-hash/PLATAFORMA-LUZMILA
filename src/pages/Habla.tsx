import { useEffect, useRef, useState } from 'react'
import { Anillo, decir, DeDonde, Sube, Tilt, Titulo3D } from '../components/ui'
import { mascotaDice } from '../components/Mascota'
import { evaluarTexto, type Evaluacion } from '../lib/cerebro'
import { hoyISO } from '../lib/fechas'
import { useDatos } from '../store'

const RETOS = [
  { e: '👋', t: 'Cuéntame de ti', d: 'Presente, pasado y futuro, enfocada en un puesto.' },
  { e: '🎓', t: 'Explica sin jerga', d: 'Un tema de Administración como a alguien de 12 años.' },
  { e: '💬', t: 'Tu opinión en una reunión', d: 'Postura, razón y qué implica, en 30 segundos.' },
  { e: '🎲', t: 'Pregunta inesperada', d: '“¿Qué harías si mañana te cambian de área?”' },
  { e: '🦊', t: 'Anécdota con remate', d: 'Calma, tensión y un remate corto y seco.' },
  { e: '🔁', t: 'Cuenta lo último que estudiaste', d: 'Con tus palabras, sin mirar nada.' },
]
const SR: any = typeof window !== 'undefined' ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition : null

export default function Habla() {
  const s = useDatos()
  const [reto, setReto] = useState(0)
  const [seg, setSeg] = useState(60)
  const [estado, setEstado] = useState<'listo' | 'grabando' | 'revisar'>('listo')
  const [texto, setTexto] = useState('')
  const [t, setT] = useState(0)
  const [ev, setEv] = useState<Evaluacion | null>(null)
  const [dur, setDur] = useState(0)
  const [acepta, setAcepta] = useState(false)
  const rec = useRef<any>(null)
  const tim = useRef<any>(null)
  const base = useRef('')

  useEffect(() => () => { try { rec.current?.stop() } catch { /* nada */ } clearInterval(tim.current) }, [])

  const parar = () => { try { rec.current?.stop() } catch { /* nada */ } clearInterval(tim.current); setEstado('revisar') }
  const empezar = () => {
    base.current = ''; setTexto(''); setEv(null); setT(0); setEstado('grabando')
    if (SR && acepta) {
      const r = new SR(); r.lang = 'es-PE'; r.continuous = true; r.interimResults = true
      r.onresult = (e: any) => { let fin = base.current, par = ''; for (let i = e.resultIndex; i < e.results.length; i++) { const x = e.results[i]; if (x.isFinal) { fin += (fin ? ' ' : '') + x[0].transcript.trim(); base.current = fin } else par += x[0].transcript } setTexto((fin + ' ' + par).trim()) }
      r.onerror = () => { /* seguimos: puede escribir */ }
      rec.current = r; try { r.start() } catch { /* ya activo */ }
    }
    const t0 = Date.now()
    tim.current = setInterval(() => { const x = Math.floor((Date.now() - t0) / 1000); setT(x); if (x >= seg) { setDur(seg); parar() } }, 250)
  }
  const detener = () => { setDur(Math.max(1, t)); parar() }
  const evaluar = () => {
    if (texto.trim().split(/\s+/).length < 8) return decir('Necesito al menos unas 8 palabras para evaluar 🙂')
    setEv(evaluarTexto(texto)); if (!dur) setDur(Math.max(1, t))
  }
  const palabras = texto.trim() ? texto.trim().split(/\s+/).length : 0
  const wpm = dur ? Math.round((palabras / dur) * 60) : 0
  const guardar = () => {
    if (!ev) return
    s.agregar('evaluaciones', { fecha: hoyISO(), modo: 'libre', tema: `🎙️ ${RETOS[reto].t}`, puntaje: ev.puntaje, nota20: ev.nota20, palabras, wpm, criterios: ev.criterios.map((c) => ({ id: c.id, titulo: c.titulo, estado: c.estado, pts: c.pts, max: c.max })), texto: texto.slice(0, 1500) })
    decir(<>Guardado: <b>{ev.puntaje}/100</b> · {wpm} palabras por minuto</>, ev.puntaje >= 70)
    mascotaDice('¡Hablaste en voz alta y lo guardaste! Practicar hablando es lo que más te acerca a tu meta 🎙️', 'fiesta')
    setEstado('listo'); setEv(null); setTexto('')
  }

  return (
    <div className="pagina">
      <header className="cabeza">
        <span className="eyebrow">Practica hablando · como en Orai o Yoodli, pero tuyo</span>
        <Titulo3D texto="HABLA" />
        <p className="serif" style={{ fontSize: 'clamp(22px, 3vw, 32px)', maxWidth: 720 }}>Tu reto está en la voz, no solo en la escritura. Habla 60 segundos, mira lo que dijiste y qué muletillas aparecieron.</p>
      </header>

      <div className="bento">
        <Sube className="c7"><div className="card pila" style={{ height: '100%' }}>
          <span className="eyebrow">1 · Elige un reto</span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 8 }}>
            {RETOS.map((r, i) => <button key={r.t} className="item chico" aria-pressed={reto === i} style={{ textAlign: 'left', background: reto === i ? 'var(--rosa)' : undefined }} onClick={() => setReto(i)} disabled={estado === 'grabando'}><b>{r.e} {r.t}</b><span className="suave">{r.d}</span></button>)}
          </div>
          <div className="fila"><span className="chico suave">Duración:</span>{[30, 60, 90].map((n) => <button key={n} className="pill" aria-pressed={seg === n} disabled={estado === 'grabando'} onClick={() => setSeg(n)}>{n} s</button>)}</div>
          {SR ? <label className="item chico fila" style={{ cursor: 'pointer', gridTemplateColumns: 'none' }}><input type="checkbox" checked={acepta} onChange={(e) => setAcepta(e.target.checked)} /> Usar el micrófono para transcribir mi voz. <span className="suave">(El navegador envía el audio a su servicio de reconocimiento de voz; en Chrome es el de Google. Si prefieres no hacerlo, déjalo apagado y escribe lo que dijiste.)</span></label>
            : <p className="chico suave">Este navegador no ofrece dictado. Habla en voz alta y luego escribe lo que recuerdes de lo que dijiste: igual sirve.</p>}
          <div className="fila">
            {estado !== 'grabando' ? <button className="btn" onClick={empezar}>🎙️ Empezar a hablar</button> : <button className="btn" onClick={detener}>⏹ Terminar</button>}
            {estado === 'grabando' && <span className="num" style={{ fontSize: 34 }}>{Math.max(0, seg - t)} s</span>}
          </div>
          {estado === 'grabando' && <div className="barra"><i style={{ width: `${(t / seg) * 100}%`, transition: 'width .3s linear' }} /></div>}
        </div></Sube>

        <Sube className="c5" d={0.05}><Tilt className="color pila" style={{ height: '100%', ['--mundo' as any]: 'var(--rosa)' }}>
          <span className="eyebrow">Cómo se usa</span>
          <p className="chico">1. Elige un reto y toca empezar.</p>
          <p className="chico">2. Habla sin parar: si te trabas, sigue o describe la palabra (forma, función).</p>
          <p className="chico">3. Revisa el texto (corrige lo que el navegador entendió mal) y evalúalo.</p>
          <p className="porque">Mides tu ritmo, tus muletillas, tus conectores y tu vocabulario. Trabarse no baja nada: lo que importa es la fluidez a la larga.</p>
          <DeDonde titulo="¿Qué mide y qué no?">Palabras por minuto = palabras del texto ÷ segundos hablados × 60. Un ritmo cómodo ronda 110–160. Las muletillas y conectores se cuentan en el texto. No mide pronunciación ni silencios.</DeDonde>
        </Tilt></Sube>

        {(estado === 'revisar' || texto) && estado !== 'grabando' && <Sube className="c12"><div className="card pila">
          <span className="eyebrow">2 · Tu texto (puedes corregirlo)</span>
          <textarea className="entrada" style={{ fontSize: 16, fontWeight: 500, minHeight: 150 }} value={texto} onChange={(e) => setTexto(e.target.value)} aria-label="Lo que dijiste" />
          <div className="fila"><button className="btn" onClick={evaluar}>🧠 Evaluar lo que dije</button><span className="chico suave">{palabras} palabras{dur ? ` · ${wpm} por minuto` : ''}</span></div>
        </div></Sube>}

        {ev && <Sube className="c12"><div className="card pila">
          <div className="fila" style={{ gap: 22 }}>
            <Anillo valor={ev.puntaje / 100} tam={130} color="var(--titulo)"><div><div className="num" style={{ fontSize: 40 }}>{ev.puntaje}</div><div className="eyebrow">de 100</div></div></Anillo>
            <div className="pila-s crece"><h2 className="h2">{wpm ? `${wpm} palabras por minuto` : 'Tu evaluación'}</h2><p className="chico">{wpm ? (wpm < 90 ? 'Ritmo pausado: está bien si estás pensando. Con práctica sube solo.' : wpm > 180 ? 'Ritmo rápido: respira entre ideas.' : 'Ritmo cómodo.') : ''}</p></div>
          </div>
          {ev.criterios.map((c) => <div key={c.id} className="mini"><span className={`pto ${c.estado}`} /><span><b>{c.titulo}</b> <span className="suave">· {c.texto}</span></span><b className="mono">{c.pts}/{c.max}</b></div>)}
          {ev.preguntas[0] && <p className="porque">Para tu próxima vez: {ev.preguntas[0]}</p>}
          <div className="fila"><button className="btn" onClick={guardar}>💾 Guardar</button><button className="btn linea" onClick={() => { setEstado('listo'); setEv(null) }}>Otra vez</button></div>
        </div></Sube>}
      </div>
    </div>
  )
}
