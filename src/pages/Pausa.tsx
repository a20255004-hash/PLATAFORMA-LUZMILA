import { useEffect, useMemo, useRef, useState } from 'react'
import { decir, DeDonde, Sube, Tilt, Titulo3D } from '../components/ui'
import { mascotaDice } from '../components/Mascota'
import { hoyISO, sumar } from '../lib/fechas'
import { puntosDia, useDatos } from '../store'

const HUMORES = [['😣', 'Muy pesado'], ['😕', 'Algo pesado'], ['😐', 'Normal'], ['🙂', 'Bien'], ['😄', 'Muy bien']]
const ENERGIAS = [['🪫', 'Baja'], ['🔋', 'Media'], ['⚡', 'Alta']]
const PIX = ['#cdb8ff', '#b3c7ff', '#a6e3ff', '#a6efc9', '#55d79a']

export default function Pausa() {
  const s = useDatos()
  const hoy = hoyISO()
  const a = s.animo?.[hoy]
  const [resp, setResp] = useState(false)
  const [dur, setDur] = useState(90)
  const [seg, setSeg] = useState(0)
  const [fase, setFase] = useState<'in' | 'out'>('in')
  const tim = useRef<any>(null)
  const ciclo = 10 // 4 s inhalar + 6 s exhalar

  useEffect(() => () => clearInterval(tim.current), [])
  const empezar = () => {
    setResp(true); setSeg(0); setFase('in'); const t0 = Date.now()
    tim.current = setInterval(() => { const x = (Date.now() - t0) / 1000; setSeg(Math.floor(x)); setFase(x % ciclo < 4 ? 'in' : 'out'); if (x >= dur) terminar(true) }, 200)
  }
  const terminar = (ok: boolean) => {
    clearInterval(tim.current); setResp(false)
    if (ok) { s.agregar('pausas', { fecha: hoy, seg: dur }); decir('Pausa completa 🫁', true); mascotaDice('Respiraste conmigo. Tu cuerpo lo nota 🤍', 'calma') }
  }
  const poner = (campo: 'humor' | 'energia', v: number) => {
    const nuevo = { humor: a?.humor ?? 3, energia: a?.energia ?? 2, [campo]: v } as any
    s.poner('animo', { ...s.animo, [hoy]: nuevo })
    if (campo === 'energia' && v === 1) mascotaDice('Energía baja hoy: perfecto, hoy toca la versión mínima. Con el check-in basta 🌱', 'calma')
    else mascotaDice(campo === 'humor' && v <= 2 ? 'Gracias por contarme. Un día pesado también cuenta, y no tienes que resolverlo hoy 🤍' : 'Anotado, gracias por decírmelo 🦊', 'feliz')
  }

  const dias = useMemo(() => Array.from({ length: 84 }).map((_, i) => { const f = sumar(hoy, -(83 - i)); return { f, v: s.animo?.[f]?.humor } }), [s.animo, hoy])
  const cuentan = Object.keys(s.animo || {})
  const conPuntos = (cond: (p: number) => boolean) => { const v = cuentan.filter((f) => cond(puntosDia(s.checkins[f]))).map((f) => s.animo[f].humor); return v.length >= 3 ? v.reduce((x, y) => x + y, 0) / v.length : null }
  const alto = conPuntos((p) => p >= 2), bajo = conPuntos((p) => p <= 1)
  const pausasHoy = (s.pausas || []).filter((p: any) => p.fecha === hoy).length

  return (
    <div className="pagina">
      <header className="cabeza">
        <span className="eyebrow">Para cuando necesitas bajar el ruido</span>
        <Titulo3D texto="PAUSA" />
        <p className="serif" style={{ fontSize: 'clamp(22px, 3vw, 32px)', maxWidth: 720 }}>Respira un minuto y cuéntame cómo estás. Son dos toques, y sirve para que el plan se ajuste a tu energía.</p>
      </header>

      <div className="bento">
        <Sube className="c7"><Tilt className="color pila" style={{ height: '100%', ['--mundo' as any]: 'var(--celeste)', textAlign: 'center' }}>
          <span className="eyebrow">🫁 Respiración con exhalación larga</span>
          <div className="respira" data-fase={resp ? fase : 'quieta'} aria-live="polite">
            <div className="aro" /><div className="centro"><b>{resp ? (fase === 'in' ? 'Inhala' : 'Exhala') : 'Lista'}</b><span className="chico">{resp ? `${Math.max(0, dur - seg)} s` : `${dur} s`}</span></div>
          </div>
          <p className="chico">Inhala 4 segundos por la nariz, exhala 6 despacio. Si te mareas, respira normal.</p>
          <div className="fila" style={{ justifyContent: 'center' }}>{[60, 90, 180].map((n) => <button key={n} className="pill" aria-pressed={dur === n} disabled={resp} onClick={() => setDur(n)}>{n / 60 >= 1 && n % 60 === 0 ? `${n / 60} min` : `${n} s`}</button>)}</div>
          <div>{!resp ? <button className="btn" onClick={empezar}>Empezar</button> : <button className="btn linea" onClick={() => terminar(false)}>Parar</button>}</div>
          {pausasHoy > 0 && <p className="chico suave">Hoy ya hiciste {pausasHoy} pausa{pausasHoy > 1 ? 's' : ''} 🤍</p>}
          <DeDonde titulo="¿Por qué esta respiración?">Respirar despacio, con la exhalación más larga que la inhalación, suele ayudar a bajar la activación del cuerpo. Es un recurso de calma, no un tratamiento: si la ansiedad es seguida, conviene hablarlo con un profesional.</DeDonde>
        </Tilt></Sube>

        <Sube className="c5" d={0.06}><div className="card pila" style={{ height: '100%' }}>
          <span className="eyebrow">¿Cómo estás hoy?</span>
          <div className="fila" role="group" aria-label="Ánimo">{HUMORES.map(([e, t], i) => <button key={t} className="animo-btn" aria-pressed={a?.humor === i + 1} aria-label={t} title={t} onClick={() => poner('humor', i + 1)}>{e}</button>)}</div>
          <span className="eyebrow">Energía</span>
          <div className="fila" role="group" aria-label="Energía">{ENERGIAS.map(([e, t], i) => <button key={t} className="pill" aria-pressed={a?.energia === i + 1} onClick={() => poner('energia', i + 1)}>{e} {t}</button>)}</div>
          <p className="porque">Es opcional y no hay respuestas “malas”. Si pones energía baja, tu plan de hoy se reduce a lo mínimo.</p>
        </div></Sube>

        <Sube className="c12"><div className="card pila">
          <span className="eyebrow">🎨 Tus últimas 12 semanas en colores</span>
          <div className="pixeles" role="img" aria-label="Mapa de tu ánimo por día">{dias.map((d) => <i key={d.f} title={`${d.f}${d.v ? ' · ' + HUMORES[d.v - 1][1] : ''}`} style={{ background: d.v ? PIX[d.v - 1] : 'rgba(18,48,42,.07)' }} />)}</div>
          <div className="fila chico">{HUMORES.map(([e], i) => <span key={i} className="pill" style={{ background: PIX[i] }}>{e}</span>)}<span className="suave">los días vacíos no son “malos”: solo no los anotaste</span></div>
          {alto !== null && bajo !== null && <p className="chico">Un dato curioso: tu ánimo promedio fue <b>{alto.toFixed(1)}</b> en los días con 2–3 rituales y <b>{bajo.toFixed(1)}</b> en los de 0–1. {alto > bajo + 0.3 ? 'Parece que cuidarte y sentirte mejor van juntos, aunque no sabemos qué causa qué.' : 'No se ve una diferencia clara, y está bien.'}</p>}
        </div></Sube>
      </div>
    </div>
  )
}
