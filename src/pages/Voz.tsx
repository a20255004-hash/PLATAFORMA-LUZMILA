import { useEffect, useRef, useState } from 'react'
import { Anillo, Campo, decir, DeDonde, Hoja, Sube, Tilt, Titulo3D, Vacio } from '../components/ui'
import { CATEGORIAS_P1, CONECTORES, PILARES_VOZ, SEMANA_VOZ } from '../data/estructura'
import { bonita, hoyISO } from '../lib/fechas'
import { dominioVoz, repasosPendientes, useDatos } from '../store'

export default function Voz() {
  const s = useDatos()
  const dom = dominioVoz(s)
  const [tab, setTab] = useState<'p1' | 'p3' | 'p4' | 'p5'>('p1')
  const [hoja, setHoja] = useState<null | 'palabra' | 'arg'>(null)
  const [f, setF] = useState<any>({})
  const pend = repasosPendientes(s.voz.palabras)
  const diaSem = new Date().getDay()

  // Cronómetro P1
  const [cat, setCat] = useState(CATEGORIAS_P1[0])
  const [seg, setSeg] = useState(90)
  const [corre, setCorre] = useState(false)
  const [cuenta, setCuenta] = useState(0)
  const t = useRef<any>(null)
  useEffect(() => {
    if (!corre) return
    t.current = setInterval(() => setSeg((x) => { if (x <= 1) { clearInterval(t.current); setCorre(false); return 0 } return x - 1 }), 1000)
    return () => clearInterval(t.current)
  }, [corre])
  const empezar = () => { setSeg(90); setCuenta(0); setCorre(true) }
  const guardarRonda = () => { s.agregar('voz.rondas', { fecha: hoyISO(), categoria: cat, palabras: cuenta }); decir(<>Ronda guardada: <b>{cuenta} palabras</b> en “{cat}”</>, true); setSeg(90); setCuenta(0) }
  const mejor = (c: string) => Math.max(0, ...s.voz.rondas.filter((r) => r.categoria === c).map((r) => r.palabras))

  // P4 conectores
  const [con, setCon] = useState(CONECTORES[0])
  const [frase, setFrase] = useState('')
  const causales = ['porque', 'ya que', 'dado que', 'de modo que']
  const usoCausal = s.voz.frases.filter((x) => causales.includes(x.conector)).length

  const guardarPalabra = () => {
    if (!f.palabra?.trim()) return decir('¿Cuál es la palabra?')
    s.agregar('voz.palabras', { fecha: f.fecha || hoyISO(), palabra: f.palabra.trim(), significado: f.significado || '', frases: [f.f1 || '', f.f2 || '', f.f3 || ''], d2: false, d7: false, d21: false })
    setHoja(null); decir('Palabra guardada 📚 Te la recuerdo a los 2, 7 y 21 días.')
  }
  const guardarArg = () => {
    if (!f.afirmacion?.trim()) return decir('Empieza por la afirmación 🙂')
    s.agregar('voz.argumentos', { fecha: hoyISO(), tema: f.tema || '', afirmacion: f.afirmacion, evidencia: f.evidencia || '', garantia: f.garantia || '', contraria: f.contraria || '' })
    setHoja(null); decir(f.garantia?.trim() ? <>Argumento <b>completo, con garantía</b> ⚖️</> : 'Guardado. Le falta la garantía: puedes completarla luego.', !!f.garantia?.trim())
  }

  return (
    <div className="pagina">
      <header className="cabeza">
        <span className="eyebrow">Vocabulario y argumentación · {SEMANA_VOZ[diaSem]}</span>
        <Titulo3D texto="VOZ" />
        <p className="serif" style={{ fontSize: 'clamp(22px, 3vw, 32px)', maxWidth: 720 }}>Tu cerebro está ocupado, no roto. Aquí se entrena encontrar la palabra, unir ideas y sostener un argumento.</p>
      </header>

      <div className="bento">
        <Sube className="c5"><Tilt className="color pila" style={{ height: '100%' }}>
          <span className="eyebrow">Nivel por dominio demostrado</span>
          <div className="fila" style={{ gap: 16 }}>
            <Anillo valor={dom.progreso} tam={128}><div><div className="num" style={{ fontSize: 40 }}>{dom.dominadas}</div><div className="eyebrow">palabras</div></div></Anillo>
            <div className="pila-s crece"><div className="h3">Nivel {dom.nivel}</div><p className="chico">{dom.completos} argumentos con garantía · {s.voz.rondas.length} rondas · {s.voz.semanasCompletas} semanas completas del plan</p></div>
          </div>
          <DeDonde titulo="¿Por qué sin rachas?">Aquí no hay racha a propósito: los sistemas que castigan rachas rotas generan ansiedad (Deci & Ryan). Una palabra cuenta como dominada cuando tiene 3 frases tuyas y sus repasos D2, D7 y D21. Cada 10 = 1 nivel (propuesta: cámbiala si quieres).</DeDonde>
        </Tilt></Sube>
        <Sube className="c7" d={0.06}><div className="card pila" style={{ height: '100%' }}><span className="eyebrow">Los 6 pilares</span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 10 }}>
            {PILARES_VOZ.map((p) => <div key={p.n} className="item"><b>{p.emoji} P{p.n} · {p.nombre}</b><span className="chico suave">{p.como}</span><span className="chico" style={{ opacity: 0.7 }}>{p.base}</span></div>)}
          </div>
          <p className="porque">Plan de 24 semanas en 3 etapas: Cimentación → Integración → Autonomía. 30 min de lunes a viernes, 60 el fin de semana.</p>
        </div></Sube>
        {pend.length > 0 && <Sube className="c12"><div className="card pila"><span className="eyebrow">🔁 Palabras para repasar hoy</span><div className="lista">{pend.map(({ item, clave, dias }) => <div key={item.id + clave} className="item entre"><span><b>{item.palabra}</b> <span className="chico suave">· día {dias} · úsala en una frase en voz alta</span></span><button className="btn s mundo" onClick={() => s.editar('voz.palabras', item.id, { [clave]: true })}>Hecho</button></div>)}</div></div></Sube>}
        {s.voz.observaciones.length > 0 && <Sube className="c12"><div className="card pila-s"><span className="eyebrow">Lo que se observó en tus semanas 1–5</span>{s.voz.observaciones.map((o) => <p key={o} className="chico">◦ {o}</p>)}</div></Sube>}
      </div>

      <div className="tabs" style={{ marginTop: 26 }}>
        {([['p1', '🧩 Ronda de 90 s'], ['p3', '📚 Palabras'], ['p4', '🧠 Conectores'], ['p5', '⚖️ Toulmin']] as const).map(([k, x]) => <button key={k} className="pill" aria-pressed={tab === k} onClick={() => setTab(k)}>{x}</button>)}
      </div>

      {tab === 'p1' && <div className="bento">
        <div className="c7"><div className="card color pila" style={{ textAlign: 'center' }}>
          <Campo label="Categoría"><select value={cat} disabled={corre} onChange={(e) => setCat(e.target.value)}>{CATEGORIAS_P1.map((c) => <option key={c}>{c}</option>)}</select></Campo>
          <div style={{ display: 'grid', placeItems: 'center' }}><Anillo valor={seg / 90} tam={230} grosor={16}><div><div className="crono" aria-live="off">{seg}</div><div className="eyebrow">segundos</div></div></Anillo></div>
          {corre ? <button className="btn" style={{ minHeight: 84, fontSize: 22 }} onClick={() => setCuenta(cuenta + 1)}>+1 palabra dicha · llevas {cuenta}</button>
            : seg === 0 ? <div className="pila"><p className="h3">Tiempo. Dijiste {cuenta} palabras.</p><div className="fila" style={{ justifyContent: 'center' }}><button className="btn" onClick={guardarRonda}>Guardar ronda</button><button className="btn linea" onClick={empezar}>Otra vez</button></div></div>
              : <button className="btn" onClick={empezar}>▶ Empezar (en voz alta)</button>}
          <p className="porque" style={{ textAlign: 'left', borderColor: 'var(--tinta)', color: 'var(--tinta)' }}>Si te trabas, no pares: describe la forma, la función o el sonido. Después pídele a Claude tu “banco ideal” de esa categoría.</p>
        </div></div>
        <div className="c5"><div className="card pila-s"><span className="eyebrow">Tus rondas</span>
          {s.voz.rondas.length ? s.voz.rondas.slice(0, 12).map((r) => <div key={r.id} className="item entre chico"><span>{r.categoria}<br /><span className="suave">{bonita(r.fecha)}</span></span><span className="fila"><b className="num" style={{ fontSize: 24 }}>{r.palabras}</b>{r.palabras === mejor(r.categoria) && <span className="pill mundo">mejor tuya</span>}</span></div>) : <Vacio>Sin rondas todavía. Te comparas solo con tu propia marca anterior.</Vacio>}
        </div></div>
      </div>}

      {tab === 'p3' && <div className="pila">
        <div><button className="btn s" onClick={() => { setF({ fecha: hoyISO() }); setHoja('palabra') }}>+ Palabra del día</button></div>
        <div className="bento">{s.voz.palabras.map((p) => <Sube key={p.id} className="c4"><div className="card pila-s" style={{ height: '100%' }}><div className="entre"><span className="display" style={{ fontSize: 30 }}>{p.palabra}</span><button className="pill borde" aria-label="Quitar" onClick={() => s.quitar('voz.palabras', p.id)}>✕</button></div>
          {p.significado && <p className="chico suave">{p.significado}</p>}{(p.frases || []).filter(Boolean).map((x: string, i: number) => <p key={i} className="chico">“{x}”</p>)}
          <div className="fila">{(['d2', 'd7', 'd21'] as const).map((k) => <button key={k} className="pill borde" aria-pressed={!!p[k]} onClick={() => s.editar('voz.palabras', p.id, { [k]: !p[k] })}>{k.toUpperCase()}</button>)}</div></div></Sube>)}</div>
        {!s.voz.palabras.length && <Vacio>Una palabra al día, sacada de lo que lees, usada en 3 frases tuyas.</Vacio>}
      </div>}

      {tab === 'p4' && <div className="bento">
        <div className="c7"><div className="card pila"><span className="eyebrow">Une dos ideas con…</span>
          <div className="fila">{CONECTORES.map((c) => <button key={c} className="pill" aria-pressed={con === c} onClick={() => setCon(c)}>{c}{causales.includes(c) ? ' ·causal' : ''}</button>)}</div>
          <Campo label={`Tu frase con “${con}”`}><textarea value={frase} onChange={(e) => setFrase(e.target.value)} placeholder={`…, ${con} …`} /></Campo>
          <button className="btn" disabled={!frase.trim()} onClick={() => { s.agregar('voz.frases', { fecha: hoyISO(), conector: con, frase: frase.trim() }); setFrase(''); decir('Frase guardada 🧠') }}>Guardar frase</button>
          <p className="porque">Ojo con dos trampas: “ya que” introduce la causa, no la consecuencia; y “mientras que” compara en paralelo, no contradice (eso es “sin embargo”).</p>
        </div></div>
        <div className="c5"><div className="card pila-s"><span className="eyebrow">Tus frases</span>
          <p className="chico suave">{s.voz.frases.length} frases · {usoCausal} con conector causal</p>
          {s.voz.frases.slice(0, 10).map((x) => <div key={x.id} className="item chico"><b>{x.conector}</b>{x.frase}</div>)}
          {!s.voz.frases.length && <Vacio>Aquí se va viendo qué conectores usas y cuáles evitas.</Vacio>}
        </div></div>
      </div>}

      {tab === 'p5' && <div className="pila">
        <div><button className="btn s" onClick={() => { setF({}); setHoja('arg') }}>+ Nuevo argumento</button></div>
        <div className="bento">{s.voz.argumentos.map((a) => <Sube key={a.id} className="c6"><div className="card pila-s" style={{ height: '100%' }}><div className="entre"><span className="chico suave">{bonita(a.fecha)} · {a.tema}</span><span className="pill" style={{ background: a.garantia ? 'var(--menta)' : 'var(--mostaza)' }}>{a.garantia ? 'completo' : 'falta garantía'}</span></div>
          <p><span className="eyebrow">Afirmación · </span>{a.afirmacion}</p><p><span className="eyebrow">Evidencia · </span>{a.evidencia || '—'}</p><p><span className="eyebrow">Garantía · </span>{a.garantia || '—'}</p>{a.contraria && <p className="porque"><b>Postura contraria (steelman):</b> {a.contraria}</p>}</div></Sube>)}</div>
        {!s.voz.argumentos.length && <Vacio>Afirmación + evidencia + la regla que las une (garantía). Esa última es la que hay que entrenar.</Vacio>}
      </div>}

      <Hoja abierta={hoja === 'palabra'} cerrar={() => setHoja(null)} titulo="Palabra del día">
        <div className="dos"><Campo label="Palabra"><input value={f.palabra || ''} onChange={(e) => setF({ ...f, palabra: e.target.value })} /></Campo><Campo label="Fecha"><input type="date" value={f.fecha || ''} onChange={(e) => setF({ ...f, fecha: e.target.value })} /></Campo></div>
        <Campo label="Qué significa (con tus palabras)"><input value={f.significado || ''} onChange={(e) => setF({ ...f, significado: e.target.value })} /></Campo>
        {[1, 2, 3].map((n) => <Campo key={n} label={`Frase ${n}`}><input value={f['f' + n] || ''} onChange={(e) => setF({ ...f, ['f' + n]: e.target.value })} /></Campo>)}
        <button className="btn" onClick={guardarPalabra}>Guardar</button>
      </Hoja>
      <Hoja abierta={hoja === 'arg'} cerrar={() => setHoja(null)} titulo="Argumento Toulmin">
        <Campo label="Tema o artículo"><input value={f.tema || ''} onChange={(e) => setF({ ...f, tema: e.target.value })} /></Campo>
        <Campo label="Afirmación" ayuda="Lo que sostienes."><textarea value={f.afirmacion || ''} onChange={(e) => setF({ ...f, afirmacion: e.target.value })} /></Campo>
        <Campo label="Evidencia" ayuda="El dato o hecho que la apoya. Una sola, no mezcles dos."><textarea value={f.evidencia || ''} onChange={(e) => setF({ ...f, evidencia: e.target.value })} /></Campo>
        <Campo label="Garantía" ayuda="La regla que conecta la evidencia con la afirmación: “esto importa porque…”"><textarea value={f.garantia || ''} onChange={(e) => setF({ ...f, garantia: e.target.value })} /></Campo>
        <Campo label="Postura contraria, en su mejor versión (opcional)"><textarea value={f.contraria || ''} onChange={(e) => setF({ ...f, contraria: e.target.value })} /></Campo>
        <button className="btn" onClick={guardarArg}>Guardar</button>
      </Hoja>
    </div>
  )
}
