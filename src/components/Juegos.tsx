import { AnimatePresence, motion } from 'motion/react'
import { ReactNode, useEffect, useMemo, useRef, useState } from 'react'
import { create } from 'zustand'
import { CATEGORIAS_P1, CONECTORES } from '../data/estructura'
import { AFIRMACIONES_TEMA, al, CARTAS, CASOS_GARANTIA, CONECTOR_TIPO, ESCENAS, JuegoId, JUEGOS, PALABRAS_LOCAS, palabrasDe, PARES, PENSAMIENTOS, PERSONAJES, sinTildes, SITUACIONES } from '../data/juegos'
import { hoyISO } from '../lib/fechas'
import { useDatos } from '../store'
import { Anillo, decir, Hoja } from './ui'

export const useJuego = create<{ id: JuegoId | null; k: number; abrir: (id: JuegoId) => void; cerrar: () => void }>((set) => ({ id: null, k: 0, abrir: (id) => set((s) => ({ id, k: s.k + 1 })), cerrar: () => set({ id: null }) }))
export const jugar = (id: JuegoId) => useJuego.getState().abrir(id)

function useCrono(total: number) {
  const [quedan, setQuedan] = useState(total)
  const [activo, setActivo] = useState(false)
  useEffect(() => {
    if (!activo) return
    const t = setInterval(() => setQuedan((x) => { if (x <= 1) { setActivo(false); return 0 } return x - 1 }), 1000)
    return () => clearInterval(t)
  }, [activo])
  return { quedan, activo, iniciar: () => { setQuedan(total); setActivo(true) }, parar: () => setActivo(false) }
}

const Reloj = ({ quedan, total, tam = 120 }: { quedan: number; total: number; tam?: number }) => (
  <Anillo valor={quedan / total} tam={tam} grosor={11} color={quedan <= 10 ? 'var(--ciruela)' : 'var(--tinta)'}><div><div className="num" style={{ fontSize: tam * 0.36 }} aria-live="off">{quedan}</div><div className="eyebrow" style={{ fontSize: 10 }}>seg</div></div></Anillo>
)

// ───────── 1. Lluvia de palabras ─────────
function Palabras() {
  const s = useDatos()
  const [fase, setFase] = useState<'pre' | 'juego' | 'fin'>('pre')
  const [cat, setCat] = useState(CATEGORIAS_P1[0])
  const [propia, setPropia] = useState('')
  const [lista, setLista] = useState<string[]>([])
  const [txt, setTxt] = useState('')
  const [tiembla, setTiembla] = useState(0)
  const [pista, setPista] = useState(false)
  const c = useCrono(90)
  const inp = useRef<HTMLInputElement>(null)
  const categoria = propia.trim() || cat
  const previas = s.voz.rondas.filter((r) => r.categoria === categoria)
  const mejor = Math.max(0, ...previas.map((r) => r.palabras))
  const anterior = new Set<string>((previas.find((r) => Array.isArray(r.lista))?.lista || []).map(sinTildes))
  const nuevas = lista.filter((w) => !anterior.has(sinTildes(w)))

  useEffect(() => { if (fase === 'juego' && !c.activo && c.quedan === 0) setFase('fin') }, [c.activo, c.quedan, fase])
  const empezar = () => { setLista([]); setTxt(''); setFase('juego'); c.iniciar(); setTimeout(() => inp.current?.focus(), 60) }
  const meter = (valor = txt) => {
    const w = valor.trim().replace(/[,.;]+$/, '')
    if (!w) return
    if (lista.some((x) => sinTildes(x) === sinTildes(w))) { setTiembla(tiembla + 1); setTxt(''); return }
    setLista([...lista, w]); setTxt(''); setPista(false)
  }
  const guardar = () => {
    s.agregar('voz.rondas', { fecha: hoyISO(), categoria, palabras: lista.length, lista })
    s.agregar('juegos', { juego: 'palabras', fecha: hoyISO(), puntaje: lista.length, detalle: categoria })
    decir(<>Ronda guardada: <b>{lista.length} palabras</b>{lista.length > mejor && mejor > 0 ? ' · ¡tu mejor marca!' : ''}</>, lista.length > mejor)
    setFase('pre')
  }

  if (fase === 'pre') return (
    <div className="pila">
      <p>Elige una categoría y escribe todas las palabras que te salgan en <b>90 segundos</b>. Enter (o coma) después de cada una.</p>
      <div className="fila">{CATEGORIAS_P1.map((x) => <button key={x} className="pill" aria-pressed={!propia && cat === x} onClick={() => { setCat(x); setPropia('') }}>{x}</button>)}</div>
      <label className="campo"><span>…o inventa la tuya</span><input value={propia} placeholder="Ej. Cosas que hay en una combi" onChange={(e) => setPropia(e.target.value)} /></label>
      {mejor > 0 && <p className="chico suave">Tu marca en “{categoria}”: <b>{mejor}</b>. Solo compites con ella.</p>}
      <button className="btn" style={{ minHeight: 60, fontSize: 18 }} onClick={empezar}>▶ Empezar</button>
    </div>
  )
  if (fase === 'juego') return (
    <div className="pila">
      <div className="entre"><div><span className="eyebrow">Categoría</span><div className="h3">{categoria}</div></div><Reloj quedan={c.quedan} total={90} /></div>
      <motion.div key={tiembla} animate={tiembla ? { x: [0, -9, 9, -6, 6, 0] } : {}} transition={{ duration: 0.35 }}>
        <input ref={inp} className="entrada" value={txt} autoComplete="off" autoCapitalize="off" spellCheck={false} placeholder="escribe y Enter…" aria-label="Palabra"
          onChange={(e) => { const v = e.target.value; if (v.endsWith(',')) meter(v); else setTxt(v) }} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); meter() } }} />
      </motion.div>
      {tiembla > 0 && !txt && <span className="chico suave">Esa ya la pusiste 😄</span>}
      <div className="nube" aria-live="polite"><AnimatePresence>{lista.map((w, i) => <motion.button key={w} className="chipw" title="Quitar" onClick={() => setLista(lista.filter((x) => x !== w))} initial={{ scale: 0, rotate: -12 }} animate={{ scale: 1, rotate: (i % 5) - 2 }} exit={{ scale: 0 }} transition={{ type: 'spring', stiffness: 420, damping: 18 }}>{w}</motion.button>)}</AnimatePresence></div>
      <div className="entre"><span className="num" style={{ fontSize: 44 }}>{lista.length}</span><div className="fila"><button className="pill borde" onClick={() => setPista(true)}>Me trabé 🫠</button><button className="pill borde" onClick={() => { c.parar(); setFase('fin') }}>Terminar ya</button></div></div>
      {pista && <p className="porque">No pares. Describe la que no te sale: ¿qué forma tiene?, ¿para qué sirve?, ¿con qué letra empieza? Y sigue con otra.</p>}
    </div>
  )
  return (
    <div className="pila">
      <div style={{ textAlign: 'center' }}><div className="num" style={{ fontSize: 96 }}>{lista.length}</div><p className="h3">palabras en “{categoria}”</p>
        {mejor > 0 && <p className="chico suave">{lista.length > mejor ? `Superaste tu marca anterior (${mejor}).` : lista.length === mejor ? `Igualaste tu marca (${mejor}).` : `Tu marca sigue siendo ${mejor}. Hoy fue práctica, y también cuenta.`}</p>}</div>
      <div className="nube">{lista.map((w) => <span key={w} className="chipw" style={{ background: anterior.size && nuevas.includes(w) ? 'var(--lima)' : undefined }}>{w}</span>)}</div>
      {anterior.size > 0 && <p className="chico suave">En verde: las <b>{nuevas.length}</b> que no habías dicho la vez pasada.</p>}
      <p className="porque">La página no puede saber si cada palabra encaja en la categoría: quita tú las que no (tocándolas en la ronda). Para tu “banco ideal”, pásale esta lista a Claude.</p>
      <div className="fila"><button className="btn" disabled={!lista.length} onClick={guardar}>Guardar ronda</button><button className="btn linea" onClick={empezar}>Otra vez</button><button className="pill borde" onClick={() => { navigator.clipboard?.writeText(`${categoria}: ${lista.join(', ')}`); decir('Lista copiada 📋') }}>Copiar lista</button></div>
    </div>
  )
}

// ───────── 2. Escribir contra reloj (motor común) ─────────
type Chk = { ok: boolean; txt: string }
function Escribe({ consigna, seg, checks, guardar, otra, placeholder, filas = 4 }: { consigna: ReactNode; seg: number; checks: (t: string) => Chk[]; guardar: (t: string) => void; otra: () => void; placeholder?: string; filas?: number }) {
  const [fase, setFase] = useState<'pre' | 'juego'>('pre')
  const [t, setT] = useState('')
  const c = useCrono(seg)
  const ref = useRef<HTMLTextAreaElement>(null)
  const ch = checks(t)
  const listo = t.trim().length > 0 && ch.every((x) => x.ok)
  const empezar = () => { setT(''); setFase('juego'); c.iniciar(); setTimeout(() => ref.current?.focus(), 60) }
  return (
    <div className="pila">
      <div className="card color pila-s" style={{ padding: 18 }}>{consigna}</div>
      {fase === 'pre' ? <div className="fila"><button className="btn" style={{ minHeight: 56, fontSize: 17 }} onClick={empezar}>▶ Empezar · {seg} s</button><button className="btn linea" onClick={otra}>🎲 Otra consigna</button></div> : <>
        <div className="entre" style={{ alignItems: 'start' }}>
          <div className="pila-s crece">{ch.map((x) => <span key={x.txt} className="chico" style={{ opacity: x.ok ? 1 : 0.6 }}>{x.ok ? '✅' : '◻️'} {x.txt}</span>)}<span className="chico suave">{palabrasDe(t)} palabras</span></div>
          <Reloj quedan={c.quedan} total={seg} tam={96} />
        </div>
        <textarea ref={ref} className="entrada" rows={filas} value={t} placeholder={placeholder} onChange={(e) => setT(e.target.value)} aria-label="Tu respuesta" />
        {c.quedan === 0 && <p className="porque">Se acabó el tiempo, pero no te corto: termina la idea con calma. El reloj es para soltar la mano, no para castigar.</p>}
        <div className="fila"><button className="btn" disabled={!t.trim()} onClick={() => { c.parar(); guardar(t.trim()); setFase('pre'); otra() }}>{listo ? 'Guardar ✔' : 'Guardar así'}</button><button className="btn linea" onClick={() => { c.parar(); setFase('pre'); otra() }}>🎲 Otra</button></div>
      </>}
    </div>
  )
}

function JuegoEscribe({ id }: { id: JuegoId }) {
  const s = useDatos()
  const [n, setN] = useState(0)
  const temas = s.culta.sesiones.map((x) => String(x.tema).split(' (')[0])
  const dosTemas = () => { const a = al(temas); let b = al(temas); for (let i = 0; i < 8 && b === a; i++) b = al(temas); return [a, b] }
  const d = useMemo(() => ({ par: al(PARES), con: al(CONECTORES), caso: al(CASOS_GARANTIA), pal: al(PALABRAS_LOCAS), sit: al(SITUACIONES), esc: al(ESCENAS), tema: temas.length ? al(temas) : '', temas2: temas.length > 1 ? dosTemas() : [], afi: al(AFIRMACIONES_TEMA) }), [n, id])
  const otra = () => setN(n + 1)
  const reg = (puntaje: number, detalle: string, texto: string) => s.agregar('juegos', { juego: id, fecha: hoyISO(), puntaje, detalle, texto })
  const zorroHoy = () => s.zorro.bitacora.some((b) => b.fecha === hoyISO() && b.origen === 'reto')
  const alZorro = (hice: string, enfoque: string) => { if (zorroHoy()) return false; s.agregar('zorro.bitacora', { fecha: hoyISO(), enfoque, hice, xp: 1, nota: '', origen: 'reto' }); return true }
  const sinTemas = <div className="vacio">Este juego usa los temas de tus sesiones de Culta. Registra al menos {id === 'conexion' ? 'dos' : 'una'} y vuelve.</div>

  if (id === 'conectores') return <Escribe key={n} seg={60} otra={otra} placeholder={`…${d.con}…`}
    consigna={<><span className="eyebrow">Une estas dos ideas usando</span><div className="display" style={{ fontSize: 40 }}>“{d.con}”</div><p>① {d.par[0]}<br />② {d.par[1]}</p><span className="chico">{CONECTOR_TIPO[d.con]}. Puedes cambiar el orden o ajustar palabras para que tenga sentido.</span></>}
    checks={(t) => [{ ok: sinTildes(t).includes(sinTildes(d.con)), txt: `Usa “${d.con}”` }, { ok: palabrasDe(t) >= 6, txt: 'Es una sola oración completa' }]}
    guardar={(t) => { s.agregar('voz.frases', { fecha: hoyISO(), conector: d.con, frase: t }); reg(1, d.con, t); decir('Frase guardada en Voz 🔗', true) }} />

  if (id === 'garantia') return <Escribe key={n} seg={120} otra={otra} placeholder="Esto importa porque…"
    consigna={<><span className="eyebrow">Caso de práctica (inventado)</span><p><b>Afirmación:</b> {d.caso.a}</p><p><b>Evidencia:</b> {d.caso.e}</p><span className="chico">Escribe la <b>garantía</b>: la regla general que explica por qué esa evidencia apoya la afirmación.</span></>}
    checks={(t) => [{ ok: palabrasDe(t) >= 8, txt: 'Al menos 8 palabras' }, { ok: /porque|ya que|dado que|si |cuando|entonces/i.test(t), txt: 'Enuncia una regla (porque / si… entonces)' }]}
    guardar={(t) => { s.agregar('voz.argumentos', { fecha: hoyISO(), tema: 'Práctica', afirmacion: d.caso.a, evidencia: d.caso.e, garantia: t, contraria: '' }); reg(1, 'garantía', t); decir('Argumento completo, con garantía ⚖️', true) }} />

  if (id === 'definicion') return <Escribe key={n} seg={45} otra={otra} filas={2} placeholder="Dícese de…"
    consigna={<><span className="eyebrow">Define de la forma más ridícula</span><div className="display" style={{ fontSize: 54 }}>{d.pal}</div><span className="chico">Regla de oro: corta y sin explicar el chiste.</span></>}
    checks={(t) => [{ ok: palabrasDe(t) > 0 && palabrasDe(t) <= 12, txt: 'Máximo 12 palabras' }]}
    guardar={(t) => { reg(palabrasDe(t), d.pal, t); const x = alZorro(`Definición loca de “${d.pal}”: ${t}`, 'Ingenio verbal'); decir(x ? <>A tu bitácora del Zorro <b>+1 XP</b> 🦊</> : 'Guardada. (El +1 del Zorro por reto es una vez al día.)', x) }} />

  if (id === 'giro') return <Escribe key={n} seg={60} otra={otra} filas={2} placeholder="Iba de…"
    consigna={<><span className="eyebrow">Conviértelo en una frase con giro</span><div className="h2">{d.sit}</div><span className="chico">Como “iba de jamón entre dos personas de pan de molde”. Sobre la situación, nunca sobre ti.</span></>}
    checks={(t) => [{ ok: palabrasDe(t) > 0 && palabrasDe(t) <= 18, txt: 'Máximo 18 palabras' }]}
    guardar={(t) => { reg(palabrasDe(t), d.sit, t); const x = alZorro(`Frase con giro: ${t}`, 'Observacion'); decir(x ? <>A tu bitácora del Zorro <b>+1 XP</b> 🦊</> : 'Guardada. (El +1 del Zorro por reto es una vez al día.)', x) }} />

  if (id === 'remate') return <Escribe key={n} seg={60} otra={otra} filas={2} placeholder="Una frase corta y seca"
    consigna={<><span className="eyebrow">Escena de práctica</span><p><b>Calma:</b> {d.esc.c}</p><p><b>Tensión:</b> {d.esc.t}</p><p className="serif" style={{ fontSize: 22 }}>[pausa]… y el remate lo pones tú.</p></>}
    checks={(t) => [{ ok: palabrasDe(t) > 0 && palabrasDe(t) <= 10, txt: 'Máximo 10 palabras: seco pega más' }]}
    guardar={(t) => { reg(palabrasDe(t), 'remate', t); const x = alZorro(`Remate de práctica: ${t}`, 'Ingenio verbal'); decir(x ? <>A tu bitácora del Zorro <b>+1 XP</b> 🦊</> : 'Guardado. (El +1 del Zorro por reto es una vez al día.)', x) }} />

  if (id === 'conexion') return temas.length < 2 ? sinTemas : <Escribe key={n} seg={90} otra={otra} placeholder="Se conectan porque…"
    consigna={<><span className="eyebrow">¿Qué une estos dos temas tuyos?</span><div className="h2">{d.temas2[0]}</div><div className="serif" style={{ fontSize: 26 }}>y</div><div className="h2">{d.temas2[1]}</div><span className="chico">No hay respuesta única: busca una idea, un autor o un ejemplo que sirva para los dos.</span></>}
    checks={(t) => [{ ok: palabrasDe(t) >= 15, txt: 'Al menos 15 palabras' }, { ok: /porque|ya que|dado que|ambos|los dos|igual que|mientras/i.test(t), txt: 'Dice en qué se parecen o por qué' }]}
    guardar={(t) => { reg(palabrasDe(t), d.temas2.join(' + '), t); decir('Conexión guardada 🧵 Revísala con Claude en tu próxima sesión.', true) }} />

  if (id === 'dosdir') return !temas.length ? sinTemas : <Escribe key={n} seg={120} otra={otra} filas={6} placeholder={'A favor: …\nEn contra: …\nMe quedo con: …'}
    consigna={<><span className="eyebrow">Argumenta en dos direcciones</span><div className="h2">“{d.tema} {d.afi}.”</div><span className="chico">Un argumento a favor, uno en contra y con cuál te quedas.</span></>}
    checks={(t) => [{ ok: /a favor/i.test(t), txt: 'Tiene “A favor”' }, { ok: /en contra/i.test(t), txt: 'Tiene “En contra”' }, { ok: /me quedo|concluyo|en resumen|por eso/i.test(t), txt: 'Cierra con tu postura' }]}
    guardar={(t) => { reg(palabrasDe(t), d.tema, t); decir('Guardado ↔️ Dos direcciones y una postura.', true) }} />

  if (id === 'manzanitas') return !temas.length ? sinTemas : <Escribe key={n} seg={75} otra={otra} placeholder="Imagina que…"
    consigna={<><span className="eyebrow">Explícalo con manzanitas</span><div className="h2">{d.tema}</div><span className="chico">Para alguien de 12 años. Sin términos técnicos, con un ejemplo.</span></>}
    checks={(t) => [{ ok: palabrasDe(t) >= 12 && palabrasDe(t) <= 40, txt: 'Entre 12 y 40 palabras' }, { ok: /como|por ejemplo|imagina|es cuando/i.test(t), txt: 'Usa un ejemplo o comparación' }]}
    guardar={(t) => { reg(palabrasDe(t), d.tema, t); decir('Guardado 🍎 Si se entiende simple, lo entiendes de verdad.', true) }} />
  return null
}

// ───────── 3. ¿Quién habla? ─────────
function Cazadora() {
  const s = useDatos()
  const [k, setK] = useState(0)
  const ronda = useMemo(() => [...PENSAMIENTOS].sort(() => Math.random() - 0.5).slice(0, 8), [k])
  const [i, setI] = useState(0)
  const [resp, setResp] = useState<string | null>(null)
  const [ok, setOk] = useState(0)
  const q = ronda[i]
  if (i >= ronda.length) return (
    <div className="pila" style={{ textAlign: 'center' }}><div className="num" style={{ fontSize: 96 }}>{ok}<span style={{ fontSize: 36 }}>/8</span></div><p className="h3">{ok >= 7 ? 'Cazadora afinada 🎯' : ok >= 4 ? 'Vas reconociéndolas' : 'Todavía se camuflan, y es normal'}</p>
      <p className="chico suave">Es práctica: no da XP. El punto real llega cuando caces una tuya en el Expediente.</p>
      <button className="btn" onClick={() => { s.agregar('juegos', { juego: 'cazadora', fecha: hoyISO(), puntaje: ok, detalle: 'de 8' }); setI(0); setOk(0); setResp(null); setK(k + 1) }}>Guardar y jugar otra</button></div>
  )
  return (
    <div className="pila">
      <div className="entre"><span className="eyebrow">Pensamiento {i + 1} de 8</span><span className="pill">{ok} ✔</span></div>
      <AnimatePresence mode="wait"><motion.p key={i} className="serif" style={{ fontSize: 'clamp(26px, 5vw, 38px)', minHeight: 96 }} initial={{ opacity: 0, y: 20, rotateX: -30 }} animate={{ opacity: 1, y: 0, rotateX: 0 }} exit={{ opacity: 0, y: -20 }}>“{q.p}”</motion.p></AnimatePresence>
      <div className="dos">{PERSONAJES.map((p) => <button key={p} className="btn claro" disabled={!!resp} style={{ minHeight: 58, background: resp ? (p === q.r ? 'var(--menta)' : p === resp ? 'var(--mostaza)' : undefined) : undefined }} onClick={() => { setResp(p); if (p === q.r) setOk(ok + 1) }}>{p}</button>)}</div>
      {resp && <motion.div className="pila-s" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}><p><b>{resp === q.r ? '¡Esa!' : `Era ${q.r}.`}</b> {q.w}</p><button className="btn" onClick={() => { setResp(null); setI(i + 1) }}>Siguiente →</button></motion.div>}
    </div>
  )
}

// ───────── 4. Cartas de cosmovisión ─────────
function Cartas() {
  const s = useDatos()
  const [vista, setVista] = useState<number[]>([])
  const mazo = useMemo(() => [...CARTAS].sort(() => Math.random() - 0.5).slice(0, 6), [])
  return (
    <div className="pila">
      <p className="chico suave">Toca una carta para voltearla. Son saberes culturales y filosóficos, no ciencia: tómalos como otra forma de mirar.</p>
      <div className="mazo">{mazo.map((c, i) => { const v = vista.includes(i); return (
        <button key={c.n} className={`carta ${v ? 'vuelta' : ''}`} onClick={() => !v && setVista([...vista, i])} aria-label={v ? c.n : 'Carta boca abajo'}>
          <span className="cara dorso"><span style={{ fontSize: 40 }}>🌍</span><span className="eyebrow">toca</span></span>
          <span className="cara frente"><span style={{ fontSize: 30 }}>{c.e}</span><b>{c.n}</b><span className="eyebrow">{c.de}</span><span className="chico">{c.t}</span></span>
        </button>) })}</div>
      {vista.length > 0 && (() => { const c = mazo[vista[vista.length - 1]]; return <div className="card color pila-s" style={{ padding: 18 }}><b>{c.e} {c.n}</b><span>Pruébalo hoy: {c.h}</span><div><button className="btn s" onClick={() => { s.agregar('zorro.cosmovision', { fecha: hoyISO(), cultura: `${c.de} · ${c.n}`, dato: c.t, gusto: '' }); s.agregar('juegos', { juego: 'cartas', fecha: hoyISO(), puntaje: 1, detalle: c.n }); decir('Guardada en tu álbum de cosmovisiones 🌍') }}>Guardar en mi álbum</button></div></div> })()}
    </div>
  )
}

/** Ventana de juego: se monta una vez en la app y cualquier página la abre con jugar(id). */
export function Arcade() {
  const { id, k, cerrar } = useJuego()
  const j = JUEGOS.find((x) => x.id === id)
  return (
    <Hoja abierta={!!id} cerrar={cerrar} titulo={j ? `${j.emoji} ${j.nombre}` : ''}>
      {j && <div key={k} style={{ ['--mundo' as any]: j.color }}>
        {id === 'palabras' ? <Palabras /> : id === 'cazadora' ? <Cazadora /> : id === 'cartas' ? <Cartas /> : <JuegoEscribe id={id!} />}
      </div>}
    </Hoja>
  )
}
