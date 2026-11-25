import { useEffect, useMemo, useState } from 'react'
import FichaTema from '../components/FichaTema'
import { Anillo, Campo, decir, DeDonde, Sube, Tilt, Titulo3D, Vacio } from '../components/ui'
import { BLOQUES_CULTA } from '../data/estructura'
import { evaluarAnecdota, evaluarArgumento, evaluarExplicacion, evaluarTexto, tendencia, type Evaluacion } from '../lib/cerebro'
import { useCoach } from '../lib/coachEstado'
import { bonita, bloqueCulta, hoyISO } from '../lib/fechas'
import { BLOQUES_DATA, enlacesTema, PASOS_ESTUDIO, temaSugerido } from '../lib/recursos'
import { useDatos } from '../store'

type Modo = Evaluacion['modo']
const MODOS: { id: Modo; emoji: string; nombre: string; frase: string; pista: string; min: number }[] = [
  { id: 'explicar', emoji: '🎓', nombre: 'Explicar un tema', frase: 'Culta · explícalo con tus palabras', pista: 'Escribe como si se lo explicaras a alguien, sin mirar tus apuntes.', min: 30 },
  { id: 'argumentar', emoji: '⚖️', nombre: 'Argumentar', frase: 'Voz · afirmación, evidencia, garantía', pista: 'Arma el argumento por piezas. La garantía es la que más cuesta.', min: 1 },
  { id: 'libre', emoji: '✍️', nombre: 'Texto libre', frase: 'Voz · estilo, vocabulario, conectores', pista: 'Escribe lo que quieras (un párrafo, un mensaje, una idea). Mido cómo está escrito.', min: 25 },
  { id: 'anecdota', emoji: '🦊', nombre: 'Anécdota con remate', frase: 'Zorro · calma, tensión, remate', pista: 'Cuenta algo que te pasó, en 40–150 palabras.', min: 25 },
]
const color = (e: string) => (e === 'ok' ? 'ok' : e === 'med' ? 'med' : 'no')
const texto = (e: Evaluacion) => (e.puntaje >= 80 ? 'Muy sólido' : e.puntaje >= 60 ? 'Va bien' : e.puntaje >= 40 ? 'Con base, falta pulir' : 'Primer borrador')

function Resaltado({ t, marcas }: { t: string; marcas: Evaluacion['marcas'] }) {
  if (!marcas.length) return <p className="texto-ev">{t}</p>
  const out: any[] = []; let i = 0
  marcas.forEach((m, k) => { if (m.ini > i) out.push(t.slice(i, m.ini)); out.push(<mark key={k} className={`marca ${m.tipo}`}>{t.slice(m.ini, m.fin)}</mark>); i = m.fin })
  out.push(t.slice(i))
  return <p className="texto-ev">{out}</p>
}

export default function Coach() {
  const s = useDatos()
  const { modo, tema: temaPre, abrir } = useCoach()
  const [tema, setTema] = useState(temaPre)
  const [t, setT] = useState('')
  const [arg, setArg] = useState({ afirmacion: '', evidencia: '', garantia: '', contraria: '' })
  const [res, setRes] = useState<{ ev: Evaluacion; texto: string; guardada?: boolean } | null>(null)
  const m = MODOS.find((x) => x.id === modo)!
  const sesiones = s.culta.sesiones
  const sug = useMemo(() => temaSugerido(sesiones, bloqueCulta(), Number(hoyISO().replaceAll('-', ''))), [sesiones])
  const todos = useMemo(() => BLOQUES_DATA.map((b) => ({ b, cats: b.categorias })), [])
  const propios = useMemo(() => sesiones.map((x: any) => String(x.tema || '')).filter(Boolean), [sesiones])
  const historial = useMemo(() => [...(s.evaluaciones || [])].sort((a: any, b: any) => (a.fecha < b.fecha ? 1 : -1)), [s.evaluaciones])
  const tend = tendencia(historial)

  useEffect(() => { if (temaPre) setTema(temaPre) }, [temaPre])
  useEffect(() => { setRes(null) }, [modo])
  useEffect(() => { if (modo === 'explicar' && !tema) setTema(sug.tema) }, [modo])

  const bloqueTema = (BLOQUES_DATA.find((b) => b.categorias.some((c) => c.temas.includes(tema)))?.id || bloqueCulta()) as 'B1' | 'B2' | 'B3'
  const enlaces = tema ? enlacesTema(tema, bloqueTema) : []
  const listo = modo === 'argumentar' ? arg.afirmacion.trim().length > 5 : t.trim().split(/\s+/).filter(Boolean).length >= 8 && (modo !== 'explicar' || !!tema)

  const evaluar = () => {
    if (!listo) return decir(modo === 'argumentar' ? 'Escribe al menos la afirmación 🙂' : modo === 'explicar' && !tema ? 'Elige primero el tema.' : 'Escribe un poco más (8 palabras o más) para poder evaluar.')
    const original = modo === 'argumentar' ? `${arg.afirmacion}\n${arg.evidencia}\n${arg.garantia}\n${arg.contraria}` : t
    const ev = modo === 'explicar' ? evaluarExplicacion(tema, t, propios.filter((x) => x !== tema))
      : modo === 'argumentar' ? evaluarArgumento(arg)
        : modo === 'anecdota' ? evaluarAnecdota(t) : evaluarTexto(t)
    setRes({ ev, texto: original })
    setTimeout(() => document.getElementById('resultado')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80)
  }

  const anterior = res ? historial.find((h: any) => h.modo === res.ev.modo && (h.tema || '') === (res.ev.modo === 'explicar' ? tema : '')) : null
  const guardar = () => {
    if (!res) return
    const e = res.ev
    s.agregar('evaluaciones', { fecha: hoyISO(), modo: e.modo, tema: e.modo === 'explicar' ? tema : '', puntaje: e.puntaje, nota20: e.nota20, palabras: e.palabras, criterios: e.criterios.map((c) => ({ id: c.id, titulo: c.titulo, estado: c.estado, pts: c.pts, max: c.max })), texto: res.texto.slice(0, 1500) })
    setRes({ ...res, guardada: true })
    decir(<>Evaluación guardada: <b>{e.puntaje}/100</b>{anterior ? ` (${e.puntaje - anterior.puntaje >= 0 ? '+' : ''}${e.puntaje - anterior.puntaje} vs tu intento anterior)` : ''}</>, e.puntaje >= 75)
  }
  const copiar = () => {
    if (!res) return
    const e = res.ev
    const p = `Revisa a fondo mi texto como un profesor exigente pero amable (modo: ${m.nombre}${e.modo === 'explicar' ? `, tema: ${tema}` : ''}). Mi plataforma lo midió con reglas automáticas: ${e.puntaje}/100. Quiero: 1) qué está bien, 2) errores conceptuales o imprecisiones, 3) una versión mejorada, 4) tres preguntas para profundizar.\n\nMi texto:\n${res.texto}`
    navigator.clipboard?.writeText(p); decir('Copiado: pégalo en tu chat con Claude 📋')
  }
  const limpiar = () => { setT(''); setArg({ afirmacion: '', evidencia: '', garantia: '', contraria: '' }); setRes(null) }
  const W = 320, H = 70
  const pts = tend.puntos.slice(-12)

  return (
    <div className="pagina">
      <header className="cabeza">
        <span className="eyebrow">Escribe, evalúo, mejoras · todo en tu dispositivo</span>
        <Titulo3D texto="COACH" />
        <p className="serif" style={{ fontSize: 'clamp(22px, 3vw, 32px)', maxWidth: 720 }}>No solo guardo lo que escribes: lo reviso, te digo qué está sólido, qué falta y qué te preguntaría una profesora exigente.</p>
      </header>

      <div className="tabs" role="tablist" style={{ marginBottom: 18 }}>
        {MODOS.map((x) => <button key={x.id} role="tab" aria-selected={modo === x.id} aria-pressed={modo === x.id} className="pill" onClick={() => abrir(x.id, modo === 'explicar' ? tema : '')}>{x.emoji} {x.nombre}</button>)}
      </div>

      <div className="bento">
        <Sube className="c7"><div className="card pila" style={{ height: '100%' }}>
          <div className="entre"><span className="eyebrow">{m.frase}</span><span className="chico suave">mínimo {m.min} palabras</span></div>
          <p className="chico suave">{m.pista}</p>

          {modo === 'explicar' && (
            <div className="pila-s">
              <Campo label="Tema">
                <select value={tema} onChange={(e) => setTema(e.target.value)}>
                  <option value="">— elige un tema —</option>
                  {todos.map(({ b, cats }) => cats.map((c) => <optgroup key={b.id + c.nombre} label={`${BLOQUES_CULTA[b.id as 'B1'].emoji} ${c.nombre}`}>{c.temas.map((x) => <option key={x} value={x}>{x.length > 90 ? x.slice(0, 88) + '…' : x}</option>)}</optgroup>))}
                </select>
              </Campo>
              <div className="fila"><button className="pill mundo" onClick={() => setTema(sug.tema)}>✨ Sugerido hoy: {sug.tema.replace(/\(.*?\)/g, '').trim().slice(0, 40)}</button></div>
            </div>
          )}

          {modo === 'argumentar' ? (
            <div className="pila-s">
              <Campo label="Afirmación" ayuda="Lo que sostienes, en una idea."><textarea rows={2} value={arg.afirmacion} onChange={(e) => setArg({ ...arg, afirmacion: e.target.value })} /></Campo>
              <Campo label="Evidencia" ayuda="Dato, caso o fuente que lo respalda."><textarea rows={2} value={arg.evidencia} onChange={(e) => setArg({ ...arg, evidencia: e.target.value })} /></Campo>
              <Campo label="Garantía" ayuda="“Esta evidencia prueba mi afirmación porque…”"><textarea rows={2} value={arg.garantia} onChange={(e) => setArg({ ...arg, garantia: e.target.value })} /></Campo>
              <Campo label="Mejor versión del otro lado" ayuda="Lo más razonable que diría quien piensa distinto."><textarea rows={2} value={arg.contraria} onChange={(e) => setArg({ ...arg, contraria: e.target.value })} /></Campo>
            </div>
          ) : (
            <textarea className="entrada" style={{ fontSize: 17, fontWeight: 500, minHeight: 190 }} value={t} onChange={(e) => setT(e.target.value)} placeholder={modo === 'explicar' ? 'Con mis palabras, esto es…' : modo === 'anecdota' ? 'Ayer estaba en…' : 'Escribe aquí…'} aria-label="Tu texto" />
          )}
          <div className="entre"><span className="chico suave">{modo === 'argumentar' ? '' : `${t.trim() ? t.trim().split(/\s+/).length : 0} palabras`}</span>
            <div className="fila"><button className="pill borde" onClick={limpiar}>Limpiar</button><button className="btn" onClick={evaluar}>🧠 Evaluar</button></div></div>
        </div></Sube>

        <Sube className="c5" d={0.05}><Tilt className="color pila" style={{ height: '100%', ['--mundo' as any]: modo === 'explicar' ? 'var(--lila)' : modo === 'anecdota' ? 'var(--mandarina)' : 'var(--celeste)' }}>
          {modo === 'explicar' ? (
            <>
              <span className="eyebrow">Para estudiar este tema</span>
              {tema ? <FichaTema tema={tema} bloque={bloqueTema} titulo={false} /> : <p className="chico">Elige un tema y te muestro el resumen y dónde leerlo.</p>}
                          </>
          ) : (
            <>
              <span className="eyebrow">Qué mido aquí</span>
              {modo === 'argumentar' && ['Afirmación clara', 'Evidencia concreta', 'Garantía (el puente)', 'Precisión (sin absolutos)', 'Mejor versión del otro lado'].map((x) => <div key={x} className="chico">• {x}</div>)}
              {modo === 'libre' && ['Conectores variados', 'Riqueza de vocabulario', 'Repeticiones', 'Largo de oraciones', 'Palabras comodín y muletillas'].map((x) => <div key={x} className="chico">• {x}</div>)}
              {modo === 'anecdota' && ['Calma: abres situándonos', 'Tensión: hay un giro', 'Remate corto', 'Sin explicar el chiste', 'Tamaño'].map((x) => <div key={x} className="chico">• {x}</div>)}
              <DeDonde titulo="¿Cómo evalúa?">Reglas que corren en tu dispositivo: cuentan conectores, repeticiones, estructura y largo. Detecta forma, no verdad. Para revisar el contenido a fondo, usa “Copiar para Claude”.</DeDonde>
            </>
          )}
        </Tilt></Sube>
      </div>

      <div id="resultado" style={{ scrollMarginTop: 90, marginTop: 18 }}>
        {res && <Sube><div className="card res-grande">
          <div className="fila" style={{ gap: 22, alignItems: 'center' }}>
            <Anillo valor={res.ev.puntaje / 100} tam={150} color="var(--lima)"><div><div className="num" style={{ fontSize: 46 }}>{res.ev.puntaje}</div><div className="eyebrow">de 100</div></div></Anillo>
            <div className="pila-s crece">
              <span className="eyebrow">Resultado · {m.nombre}</span>
              <h2 className="h2">{texto(res.ev)}</h2>
              <p className="chico">Equivale a unos <b>{res.ev.nota20}/20</b>.{res.ev.extra?.estadoSugerido && <> Estado sugerido para Culta: <b>{res.ev.extra.estadoSugerido}</b>.</>}{anterior && <> Frente a tu intento anterior: <b>{res.ev.puntaje - anterior.puntaje >= 0 ? '+' : ''}{res.ev.puntaje - anterior.puntaje}</b>.</>}</p>
            </div>
          </div>

          <div className="pila-s">{res.ev.criterios.map((c) => (
            <div key={c.id} className="mini"><span className={`pto ${color(c.estado)}`} aria-label={c.estado === 'ok' ? 'bien' : c.estado === 'med' ? 'regular' : 'por mejorar'} /><span><b>{c.titulo}</b> <span className="suave">· {c.texto}</span></span><b className="mono">{c.pts}/{c.max}</b></div>
          ))}</div>

          <div className="bento">
            <div className="c6 item blanco"><span className="eyebrow">💪 Lo que ya está</span>{res.ev.fortalezas.length ? res.ev.fortalezas.map((x) => <span key={x} className="chico">{x}</span>) : <span className="chico suave">Todavía no hay un punto fuerte claro: el primer borrador siempre sale así.</span>}</div>
            <div className="c6 item blanco"><span className="eyebrow">🎯 Lo que más sube tu nota</span>{res.ev.mejoras.length ? res.ev.mejoras.map((x) => <span key={x} className="chico">{x}</span>) : <span className="chico suave">Nada urgente.</span>}</div>
          </div>

          <div className="item" style={{ background: 'var(--crema)' }}><span className="eyebrow">❓ Para pensar antes de reescribir</span>{res.ev.preguntas.map((x) => <span key={x} className="chico">• {x}</span>)}</div>

          {res.ev.marcas.length > 0 && <div className="pila-s"><span className="eyebrow">Tu texto, con lo que detecté</span><Resaltado t={res.texto} marcas={res.ev.marcas} />
            <div className="fila chico"><mark className="marca con">conectores</mark><mark className="marca">repetidas</mark><mark className="marca mule">muletillas</mark></div></div>}

          <div className="fila">
            <button className="btn" disabled={res.guardada} onClick={guardar}>{res.guardada ? 'Guardada ✔' : '💾 Guardar evaluación'}</button>
            <button className="btn linea" onClick={() => document.querySelector('textarea')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}>✏️ Reescribir y volver a evaluar</button>
            <button className="pill borde" onClick={copiar}>📋 Copiar para Claude</button>
          </div>
          <p className="porque">Esto mide la forma, no si lo que dices es verdad. Úsalo para pulir y practicar; la revisión de contenido la hace Claude con el botón de copiar.</p>
        </div></Sube>}
      </div>

      <div className="bento" style={{ marginTop: 18 }}>
        <Sube className="c5"><div className="card pila" style={{ height: '100%' }}>
          <span className="eyebrow">📈 Tu tendencia</span>
          {pts.length >= 2 ? (
            <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Evolución de tus evaluaciones">
              <polyline fill="none" stroke="var(--tinta)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" points={pts.map((p, i) => `${10 + (i / (pts.length - 1)) * (W - 20)},${H - 8 - (p / 100) * (H - 16)}`).join(' ')} />
              {pts.map((p, i) => <circle key={i} cx={10 + (i / (pts.length - 1)) * (W - 20)} cy={H - 8 - (p / 100) * (H - 16)} r="4.5" fill="var(--lima)" stroke="var(--tinta)" strokeWidth="2" />)}
            </svg>
          ) : <Vacio>Guarda 2 evaluaciones y dibujo tu curva.</Vacio>}
          <p className="chico">{tend.texto}</p>
        </div></Sube>
        <Sube className="c7" d={0.05}><div className="card pila" style={{ height: '100%' }}>
          <span className="eyebrow">🗂️ Evaluaciones guardadas ({historial.length})</span>
          {historial.length ? <div className="lista">{historial.slice(0, 6).map((h: any) => (
            <div key={h.id} className="item entre"><span><b>{MODOS.find((x) => x.id === h.modo)?.emoji} {h.tema ? h.tema.replace(/\(.*?\)/g, '').trim().slice(0, 50) : MODOS.find((x) => x.id === h.modo)?.nombre}</b><br /><span className="chico suave">{bonita(h.fecha)} · {h.palabras} palabras</span></span><span className="fila"><b className="num" style={{ fontSize: 28 }}>{h.puntaje}</b><button className="pill borde" aria-label="Quitar" onClick={() => s.quitar('evaluaciones', h.id)}>✕</button></span></div>
          ))}</div> : <Vacio>Cuando guardes una evaluación aparecerá aquí, con su puntaje, para que veas cómo mejoras.</Vacio>}
        </div></Sube>
      </div>
    </div>
  )
}
