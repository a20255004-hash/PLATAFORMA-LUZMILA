import { useState } from 'react'
import { METAS_2026 } from '../data/herramientas'
import { hoyISO, bonita } from '../lib/fechas'
import { anclaSemanas, ciclo, useDatos } from '../store'
import { Anillo, Barra, decir, DeDonde, Tilt } from './ui'
import { mascotaDice } from './Mascota'

const SUGERIDAS = ['Check-in de 10 segundos', 'Celular fuera del cuarto', 'Agua + skincare de la mañana', 'Una sesión de Voz (30 min)', 'Culta o Zorro del día']

/** Tu criterio de éxito n.º 2: UNA práctica pequeña sostenida más de 8 semanas (con la regla de 48 h). */
export function TarjetaAncla({ compacta = false }: { compacta?: boolean }) {
  const s = useDatos()
  const [txt, setTxt] = useState('')
  const hoy = hoyISO()
  const a = anclaSemanas(s)
  const marcar = () => {
    const ya = !!s.checkins[hoy]?.ancla
    s.checkin(hoy, { ancla: !ya })
    if (!ya) { decir(<>⚓ <b>{s.ancla.nombre}</b> · hecha hoy</>, true); mascotaDice(`¡Tu práctica ancla de hoy! Día a día se construyen las 8 semanas ⚓`, 'feliz') }
  }
  const elegir = (n: string) => { if (!n.trim()) return; s.poner('ancla', { nombre: n.trim(), inicio: hoy }); decir('Tu práctica ancla está elegida ⚓'); mascotaDice(`Tu ancla: “${n.trim()}”. Solo esa. Todo lo demás es extra 🦊`, 'curiosa') }
  if (!s.ancla?.nombre) return (
    <Tilt className="color pila" style={{ ['--mundo' as any]: 'var(--celeste)', height: '100%' }}>
      <span className="eyebrow">⚓ Tu práctica ancla</span>
      <h2 className="h2">Elige UNA sola</h2>
      <p className="chico">Tu meta de éxito: sostener una práctica pequeña más de 8 semanas. No cinco: una. Lo demás es bonus.</p>
      <div className="fila">{SUGERIDAS.map((x) => <button key={x} className="pill" onClick={() => elegir(x)}>{x}</button>)}</div>
      {!compacta && <div className="fila"><input value={txt} onChange={(e) => setTxt(e.target.value)} placeholder="O escribe la tuya…" aria-label="Tu práctica ancla" style={{ flex: 1, minWidth: 160 }} /><button className="btn s" onClick={() => elegir(txt)}>Elegir</button></div>}
    </Tilt>
  )
  return (
    <Tilt className="color pila" style={{ ['--mundo' as any]: 'var(--celeste)', height: '100%' }}>
      <span className="eyebrow">⚓ Tu práctica ancla · desde {bonita(s.ancla.inicio)}</span>
      <div className="fila" style={{ gap: 16 }}>
        <Anillo valor={a?.progreso || 0} tam={110} grosor={12}><div><b className="num" style={{ fontSize: 30 }}>{a?.semanas || 0}</b><div className="eyebrow">de 8</div></div></Anillo>
        <div className="pila-s crece"><div className="h3">{s.ancla.nombre}</div><p className="chico">{a?.dias || 0} día{a?.dias === 1 ? '' : 's'} marcado{a?.dias === 1 ? '' : 's'} en esta racha{a && a.semanas >= 8 ? ' · ¡META CUMPLIDA!' : ''}</p></div>
      </div>
      <div className="fila"><button className="btn" aria-pressed={!!a?.hoy} onClick={marcar}>{a?.hoy ? '✔ Hecha hoy' : 'La hice hoy'}</button>
        {!compacta && <button className="pill borde" onClick={() => { if (confirm('El proyecto sugiere cambiar de práctica solo tras 3 semanas de intentos ajustados. ¿La cambias igual?')) s.poner('ancla', { nombre: '', inicio: '' }) }}>Cambiar</button>}</div>
      {!compacta && <DeDonde titulo="¿Cómo cuentan las semanas?">Regla de 48 h: un día sin marcar no corta nada; dos seguidos sí. Las semanas son el tiempo entre tu primer día de la racha actual y el último marcado, dividido entre 7. Meta: 8.</DeDonde>}
    </Tilt>
  )
}

/** Tu criterio de éxito n.º 1: que el ciclo de caída y regreso se acorte. */
export function TarjetaCiclo() {
  const s = useDatos()
  const c = ciclo(s)
  const ult = c.caidas.slice(-4)
  return (
    <div className="card pila" style={{ height: '100%' }}>
      <span className="eyebrow">🔄 Tu ciclo de caída y regreso</span>
      {c.caidas.length ? (
        <>
          <p className="chico">Cada vez que paraste 2 o más días y volviste, cuenta como un ciclo. Lo que importa: que sea cada vez más corto.</p>
          <div className="pila-s">{ult.map((x) => <div key={x.desde} className="entre chico"><span>{bonita(x.desde)} → volviste el {bonita(sumarUno(x.hasta))}</span><b className="mono">{x.vacios} días</b></div>)}</div>
          <Barra v={c.ult !== null ? Math.max(0, 1 - Math.min(1, (c.ult as number) / 30)) : 0} mundo />
          <p className="chico">{c.tendencia === 'baja' ? <b>Tus pausas se están acortando. Eso es lo que buscabas. 🎉</b> : c.tendencia === 'sube' ? 'Tus últimas pausas fueron algo más largas. Es información, no fracaso: volver hoy cuenta +3.' : 'Con 2 ciclos más puedo decirte si se acortan.'}</p>
        </>
      ) : <p className="chico suave">Todavía no hay una caída seguida de regreso en tus registros. Cuando pase, aquí se verá cuánto tardaste en volver.</p>}
      {c.actual !== null && c.actual >= 2 && <p className="porque">Hoy llevas {c.actual} días sin registrar. Volver hoy suma <b>+3</b>, sin explicaciones ni ponerse al día.</p>}
    </div>
  )
}
const sumarUno = (f: string) => { const d = new Date(f + 'T12:00'); d.setDate(d.getDate() + 1); return d.toISOString().slice(0, 10) }

/** Tus 22 metas de 2026 (tu tablero de Notion), enlazadas con las fases. */
export function TarjetaMetas2026() {
  const s = useDatos()
  const marcada = (n: number) => (s.fasesChecks[`m${n}`] === undefined ? n === 6 : !!s.fasesChecks[`m${n}`]) // la 6 (prácticas) ya la lograste: ROQASEG
  const hechas = METAS_2026.filter((m) => marcada(m.n)).length
  return (
    <div className="card pila">
      <div className="entre"><span className="eyebrow">🎯 Tus 22 metas de 2026 · {hechas}/22</span><span className="chico suave">tú decides cuándo marcar cada una</span></div>
      <Barra v={hechas / 22} mundo />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 8 }}>
        {METAS_2026.map((m) => { const v = marcada(m.n); return (
          <button key={m.n} className="item chico" aria-pressed={v} style={{ textAlign: 'left', background: v ? 'var(--menta)' : undefined }} onClick={() => { s.poner('fasesChecks', { ...s.fasesChecks, [`m${m.n}`]: !v }); if (!v) { decir(<>Meta {m.n} lograda ✔</>, true); mascotaDice(`¡Meta ${m.n} de tu tablero 2026 lograda! “${m.texto}” 🏆`, 'fiesta') } }}>
            <span className="entre"><span>{v ? '✔' : '○'} {m.texto}</span></span><span className="eyebrow">{m.fase}</span>
          </button>) })}
      </div>
      <p className="porque">Salen de tu tablero “Objetivos 2026”. La 6 (prácticas pre-profesionales) ya está lograda: ROQASEG. Las que dicen “Sin fase aún” (licencia, idiomas) no tienen herramienta propia: se pueden trabajar como metas de la Fase 4.</p>
    </div>
  )
}
