import { useMemo, useState } from 'react'
import { Campo, decir, DeDonde, Hoja, Sube, Tilt, Titulo3D, Vacio } from '../components/ui'
import { DIMENSIONES, DISTORSIONES, TIPOS_EVIDENCIA } from '../data/estructura'
import { bonita, dif, esISO, hoyISO } from '../lib/fechas'
import { useDatos } from '../store'

const AREAS = ['Académica', 'Social', 'Física', 'Emocional', 'Espiritual']

function Radar({ medidas }: { medidas: any[] }) {
  const R = 92, cx = 130, cy = 120
  const p = (i: number, v: number) => { const a = (i / 5) * Math.PI * 2 - Math.PI / 2; return [cx + Math.cos(a) * R * (v / 10), cy + Math.sin(a) * R * (v / 10)] }
  const pol = (vals: number[]) => vals.map((v, i) => p(i, v).join(',')).join(' ')
  return (
    <svg viewBox="0 0 260 240" width="100%" className="radar" role="img" aria-label="Radar de autoconcepto">
      {[2.5, 5, 7.5, 10].map((v) => <polygon key={v} points={pol(Array(5).fill(v))} fill="none" stroke="var(--tinta)" strokeOpacity=".14" />)}
      {AREAS.map((a, i) => { const [x, y] = p(i, 11.6); return <text key={a} x={x} y={y} textAnchor="middle" dominantBaseline="middle">{a}</text> })}
      {medidas.slice(0, 2).reverse().map((m, k, arr) => <polygon key={m.id} points={pol(m.valores)} fill={k === arr.length - 1 ? 'var(--rosa)' : 'none'} fillOpacity=".55" stroke="var(--tinta)" strokeWidth={k === arr.length - 1 ? 2.5 : 1.2} strokeDasharray={k === arr.length - 1 ? '' : '4 5'} strokeLinejoin="round" />)}
    </svg>
  )
}

export default function Expediente() {
  const s = useDatos()
  const [tab, setTab] = useState<'evid' | 'sos' | 'caza' | 'auto'>('evid')
  const [hoja, setHoja] = useState<null | 'evid' | 'caza' | 'chip'>(null)
  const [f, setF] = useState<any>({})
  const [dim, setDim] = useState('Todas')
  const [abiertas, setAbiertas] = useState<string[]>([])
  const [sos, setSos] = useState('')
  const [auto, setAuto] = useState<number[]>([5, 5, 5, 5, 5])

  const nuevas = s.expediente.filter((e) => !e.historial)
  const orden = useMemo(() => [...s.expediente].sort((a, b) => { const A = esISO(a.fecha) ? a.fecha : a.fecha.match(/\d{4}/)?.[0] + '-00'; const B = esISO(b.fecha) ? b.fecha : b.fecha.match(/\d{4}/)?.[0] + '-00'; return A < B ? 1 : -1 }).filter((e) => dim === 'Todas' || e.dimension === dim), [s.expediente, dim])

  // SOS: busca evidencias y chips relacionados con lo que escribes.
  const pal = sos.toLowerCase().split(/[^a-záéíóúñ]+/).filter((w) => w.length > 3)
  const puntua = (t: string) => pal.reduce((a, w) => a + (t.toLowerCase().includes(w.slice(0, 5)) ? 1 : 0), 0)
  const evSos = pal.length ? [...s.expediente].filter((e) => !e.sensible).map((e) => ({ e, p: puntua(e.contradice + ' ' + e.entrada) * 2 + e.impacto / 5 })).sort((a, b) => b.p - a.p).slice(0, 3).map((x) => x.e) : []
  const chipSos = pal.length ? [...s.chips].map((c) => ({ c, p: puntua(c.situacion + ' ' + c.chip) })).sort((a, b) => b.p - a.p).slice(0, 2).map((x) => x.c) : []

  const ultima = s.autoconcepto[0]
  const tocaMedir = !ultima || dif(hoyISO(), ultima.fecha) >= 60
  const cuentaDist = DISTORSIONES.map((d) => ({ ...d, n: s.distorsiones.filter((x) => x.tipo === d.id).length }))

  const guardarEvid = () => {
    if (!f.entrada?.trim()) return decir('¿Qué pasó? Una línea basta.')
    s.agregar('expediente', { fecha: f.fecha || hoyISO(), entrada: f.entrada.trim(), dimension: f.dimension || DIMENSIONES[0], tipo: f.tipo || TIPOS_EVIDENCIA[0], contradice: f.contradice || '', impacto: Number(f.impacto || 3), link: f.link || '', fuente: 'Plataforma' })
    setHoja(null); decir(<>Esto también cuenta. <b>+1</b> al Expediente 🕵️</>, true)
  }
  const guardarCaza = () => {
    if (!f.situacion?.trim()) return decir('Cuéntame la situación en breve.')
    s.agregar('distorsiones', { fecha: f.fecha || hoyISO(), tipo: f.tipo || DISTORSIONES[0].id, situacion: f.situacion.trim(), reencuadre: f.reencuadre || '' })
    setHoja(null); decir(<>Distorsión cazada <b>+1</b> 🧑‍⚖️</>, true)
  }
  const guardarChip = () => { if (!f.chip?.trim()) return; s.agregar('chips', { situacion: f.situacion || '', chip: f.chip.trim(), porque: f.porque || 'Chip propio', fase: 'Mío' }); setHoja(null); decir('Chip agregado a tu bolsillo 🧠') }

  return (
    <div className="pagina">
      <header className="cabeza">
        <span className="eyebrow">Fases 2 y 3 · {s.expediente.length} evidencias reales</span>
        <Titulo3D texto="EXPEDIENTE" chico />
        <p className="serif" style={{ fontSize: 'clamp(22px, 3vw, 32px)', maxWidth: 720 }}>Las pruebas de quién eres, a la vista, para que no tengas que salir a buscarlas.</p>
        <div className="fila"><button className="btn" onClick={() => { setF({ fecha: hoyISO(), impacto: 3 }); setHoja('evid') }}>+ Esto también cuenta</button><button className="btn claro" onClick={() => setTab('sos')}>🛟 SOS: ¿qué me digo ahora?</button></div>
      </header>

      <div className="tabs">{([['evid', '🕵️ Evidencias'], ['sos', '🛟 SOS y chips'], ['caza', '🧑‍⚖️ Cazadora'], ['auto', '🪞 Autoconcepto']] as const).map(([k, t]) => <button key={k} className="pill" aria-pressed={tab === k} onClick={() => setTab(k)}>{t}</button>)}</div>

      {tab === 'evid' && <div className="pila">
        <div className="bento">
          <div className="c4"><Tilt className="color pila-s" style={{ height: '100%' }}><span className="eyebrow">En total</span><div className="num" style={{ fontSize: 84 }}>{s.expediente.length}</div><p className="chico"><b>{nuevas.length}</b> registradas en el proyecto (+1 XP cada una) y <b>{s.expediente.length - nuevas.length}</b> de tu historia anterior.</p>
            <DeDonde titulo="¿Por qué el historial no da puntos?">Son hechos reales de 2023 a 2026 que ya estaban en tus diarios y chats. Se muestran como evidencia, pero el XP premia lo que haces ahora, para no inflar el nivel.</DeDonde></Tilt></div>
          <div className="c8"><div className="card pila-s" style={{ height: '100%' }}><span className="eyebrow">Por dimensión de vida</span>
            {DIMENSIONES.map((d) => { const n = s.expediente.filter((e) => e.dimension === d).length; return <button key={d} className="fila chico" style={{ flexWrap: 'nowrap', textAlign: 'left' }} onClick={() => setDim(dim === d ? 'Todas' : d)} aria-pressed={dim === d}><span style={{ width: 150, fontWeight: dim === d ? 700 : 500 }}>{d}</span><div className="barra mundo crece"><i style={{ width: `${(n / Math.max(1, s.expediente.length)) * 100}%` }} /></div><b className="mono" style={{ width: 24, textAlign: 'right' }}>{n}</b></button> })}
            <span className="chico suave">Toca una dimensión para filtrar{dim !== 'Todas' ? ` · viendo: ${dim}` : ''}.</span></div></div>
        </div>
        <div className="bento">
          {orden.map((e, i) => { const tapada = e.sensible && !abiertas.includes(e.id); return (
            <Sube key={e.id} className="c6" d={(i % 2) * 0.04}><div className="card pila-s" style={{ height: '100%' }}>
              <div className="entre"><span className="chico suave">{bonita(e.fecha)}{e.historial ? ' · historial' : ''}</span><span className="mono chico" title={`Impacto ${e.impacto} de 5`} aria-label={`Impacto ${e.impacto} de 5`}>{'●'.repeat(e.impacto)}<span style={{ opacity: 0.2 }}>{'●'.repeat(5 - e.impacto)}</span></span></div>
              <p className={`h3 ${e.sensible ? 'sensible' : ''} ${tapada ? '' : 'abierta'}`} aria-hidden={tapada}>{e.entrada}</p>
              {tapada ? <button className="pill borde" onClick={() => setAbiertas([...abiertas, e.id])}>🔒 Tema sensible · toca para verla</button> : <>
                {e.contradice && <p className="chico">Contradice: <b>“{e.contradice}”</b></p>}
                <div className="fila"><span className="pill mundo">{e.tipo}</span><span className="pill">{e.dimension}</span>
                  <select aria-label="Cambiar impacto" className="pill borde" value={e.impacto} onChange={(ev) => s.editar('expediente', e.id, { impacto: Number(ev.target.value) })}>{[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>impacto {n}</option>)}</select>
                  <button className="pill borde" aria-label="Quitar evidencia" onClick={() => confirm('¿Quitar esta evidencia?') && s.quitar('expediente', e.id)}>✕</button></div></>}
            </div></Sube>) })}
        </div>
        {!orden.length && <Vacio>Aún no hay evidencias aquí.</Vacio>}
      </div>}

      {tab === 'sos' && <div className="bento">
        <div className="c7 pila">
          <div className="card color pila"><span className="eyebrow">SOS autoimagen</span><h2 className="h2">¿Qué te estás diciendo ahora mismo?</h2>
            <Campo label="Escríbelo tal cual"><textarea value={sos} onChange={(e) => setSos(e.target.value)} placeholder="Ej. siento que no sostengo nada…" /></Campo>
            <p className="chico">Lo que escribes aquí no se guarda. Solo sirve para buscar en tu propio Expediente.</p></div>
          {pal.length > 0 && <>
            <div className="card pila"><span className="eyebrow">Tus propios hechos dicen otra cosa</span>{evSos.map((e) => <div key={e.id} className="item"><b>{e.entrada}</b><span className="chico suave">{bonita(e.fecha)} · contradice “{e.contradice}”</span></div>)}{!evSos.length && <Vacio>No encontré coincidencias. Prueba con otras palabras.</Vacio>}</div>
            <div className="card tinta pila">{chipSos.map((c) => <div key={c.id} className="pila-s"><p className="display" style={{ fontSize: 30 }}>“{c.chip}”</p><p className="chico suave">{c.porque}</p></div>)}
              <p className="chico suave">Si esto pesa seguido, hablarlo con una psicóloga o psicólogo ayuda de verdad. Pedir apoyo también va al Expediente.</p></div></>}
        </div>
        <div className="c5 pila"><div className="entre"><span className="eyebrow">Chips mentales · {s.chips.length}</span><button className="btn s claro" onClick={() => { setF({}); setHoja('chip') }}>+ Chip propio</button></div>
          {s.chips.map((c) => <div key={c.id} className="card pila-s" style={{ padding: 16 }}><span className="chico suave">Cuando: {c.situacion}</span><b style={{ fontSize: 17 }}>“{c.chip}”</b><span className="porque">{c.porque} · {c.fase}</span></div>)}
          {!s.chips.length && <Vacio>Tus frases de bolsillo aparecerán aquí.</Vacio>}</div>
      </div>}

      {tab === 'caza' && <div className="bento">
        <div className="c5 pila"><div className="card color pila"><span className="eyebrow">Cazadora de distorsiones</span><div className="num" style={{ fontSize: 72 }}>{s.distorsiones.length}</div>
          {cuentaDist.map((d) => <div key={d.id} className="entre chico"><span>{d.emoji} {d.id}</span><b className="mono">{d.n}</b></div>)}
          <button className="btn" onClick={() => { setF({ fecha: hoyISO(), tipo: DISTORSIONES[0].id }); setHoja('caza') }}>+ Cazar una</button>
          <p className="porque" style={{ borderColor: 'var(--tinta)', color: 'var(--tinta)' }}>El mejor reencuadre junta compasión y responsabilidad: ni “soy un desastre” ni “no pasó nada”. Nombra el error con precisión, sin carga moral.</p></div></div>
        <div className="c7 lista">{s.distorsiones.length ? [...s.distorsiones].sort((a, b) => (a.fecha < b.fecha ? 1 : -1)).map((d) => <div key={d.id} className="card pila-s" style={{ padding: 18 }}><div className="entre"><span className="pill mundo">{DISTORSIONES.find((x) => x.id === d.tipo)?.emoji} {d.tipo}</span><span className="chico suave">{bonita(d.fecha)}</span></div><p className="chico suave">{d.situacion}</p>{d.reencuadre && <p><b>Reencuadre:</b> {d.reencuadre}</p>}</div>) : <Vacio>Cuando caces un pensamiento tramposo, anótalo aquí.</Vacio>}</div>
      </div>}

      {tab === 'auto' && <div className="bento">
        <div className="c6"><div className="card pila"><span className="eyebrow">Foto de autoconcepto · cada 2 meses</span>
          {s.autoconcepto.length ? <Radar medidas={s.autoconcepto} /> : <Vacio>Todavía no has hecho ninguna medición. No hay datos previos: esta sería la primera.</Vacio>}
          {s.autoconcepto.map((m) => <div key={m.id} className="item entre chico"><span>{bonita(m.fecha)}</span><span className="mono">{m.valores.join(' · ')}</span></div>)}
          <p className="porque">Es una foto rápida, no un examen. Sirve para ver si tu nota sobre ti misma se mueve junto con la evidencia que acumulas.</p></div></div>
        <div className="c6"><div className="card color pila"><h2 className="h2">{tocaMedir ? 'Toca una foto nueva' : 'Próxima foto en ' + (60 - dif(hoyISO(), ultima.fecha)) + ' días'}</h2><p className="chico">Del 1 al 10, ¿cómo te ves hoy en cada área? Sin pensarlo mucho.</p>
          {AREAS.map((a, i) => <label key={a} className="campo"><span className="entre"><span>{a}</span><b className="mono">{auto[i]}</b></span><input type="range" min="1" max="10" value={auto[i]} onChange={(e) => { const n = [...auto]; n[i] = Number(e.target.value); setAuto(n) }} style={{ padding: 0, accentColor: 'var(--tinta)' }} /></label>)}
          <button className="btn" onClick={() => { s.agregar('autoconcepto', { fecha: hoyISO(), valores: auto }); decir('Foto guardada 🪞') }}>Guardar foto de hoy</button></div></div>
      </div>}

      <Hoja abierta={hoja === 'evid'} cerrar={() => setHoja(null)} titulo="Esto también cuenta">
        <Campo label="¿Qué hiciste o qué pasó?"><textarea value={f.entrada || ''} onChange={(e) => setF({ ...f, entrada: e.target.value })} placeholder="Ej. Saludé primero aunque me daba roche" /></Campo>
        <div className="dos"><Campo label="Fecha"><input type="date" value={f.fecha || ''} onChange={(e) => setF({ ...f, fecha: e.target.value })} /></Campo><Campo label="Impacto (1–5)"><select value={f.impacto || 3} onChange={(e) => setF({ ...f, impacto: e.target.value })}>{[1, 2, 3, 4, 5].map((n) => <option key={n}>{n}</option>)}</select></Campo>
          <Campo label="Dimensión"><select value={f.dimension || DIMENSIONES[0]} onChange={(e) => setF({ ...f, dimension: e.target.value })}>{DIMENSIONES.map((d) => <option key={d}>{d}</option>)}</select></Campo><Campo label="Tipo"><select value={f.tipo || TIPOS_EVIDENCIA[0]} onChange={(e) => setF({ ...f, tipo: e.target.value })}>{TIPOS_EVIDENCIA.map((d) => <option key={d}>{d}</option>)}</select></Campo></div>
        <Campo label="Contradice la creencia de…"><input value={f.contradice || ''} onChange={(e) => setF({ ...f, contradice: e.target.value })} placeholder="“no sostengo nada”" /></Campo>
        <Campo label="Link o prueba (opcional)"><input value={f.link || ''} onChange={(e) => setF({ ...f, link: e.target.value })} /></Campo>
        <button className="btn" onClick={guardarEvid}>Guardar · +1</button>
      </Hoja>
      <Hoja abierta={hoja === 'caza'} cerrar={() => setHoja(null)} titulo="Cazar una distorsión">
        <div className="fila">{DISTORSIONES.map((d) => <button key={d.id} className="pill" aria-pressed={f.tipo === d.id} onClick={() => setF({ ...f, tipo: d.id })}>{d.emoji} {d.id}</button>)}</div>
        <Campo label="Fecha"><input type="date" value={f.fecha || ''} onChange={(e) => setF({ ...f, fecha: e.target.value })} /></Campo>
        <Campo label="Situación breve"><textarea value={f.situacion || ''} onChange={(e) => setF({ ...f, situacion: e.target.value })} /></Campo>
        <Campo label="Reencuadre" ayuda="Lo que le dirías a alguien que quieres, con honestidad."><textarea value={f.reencuadre || ''} onChange={(e) => setF({ ...f, reencuadre: e.target.value })} /></Campo>
        <button className="btn" onClick={guardarCaza}>Guardar · +1</button>
      </Hoja>
      <Hoja abierta={hoja === 'chip'} cerrar={() => setHoja(null)} titulo="Chip propio">
        <Campo label="¿Para qué situación?"><input value={f.situacion || ''} onChange={(e) => setF({ ...f, situacion: e.target.value })} /></Campo>
        <Campo label="La frase"><input value={f.chip || ''} onChange={(e) => setF({ ...f, chip: e.target.value })} /></Campo>
        <Campo label="Por qué te funciona (opcional)"><input value={f.porque || ''} onChange={(e) => setF({ ...f, porque: e.target.value })} /></Campo>
        <button className="btn" onClick={guardarChip}>Guardar</button>
      </Hoja>
    </div>
  )
}
