import { irA } from '../App'
import { Barra, DeDonde, Sube, Tilt, Titulo3D, Vacio } from '../components/ui'
import { BLOQUES_CULTA, DIMENSIONES, PILARES_ZORRO, RUBRICA } from '../data/estructura'
import { tendencia } from '../lib/cerebro'
import { promedio, useDatos } from '../store'

export default function Patrones() {
  const s = useDatos()
  const dias = Object.values(s.checkins)
  const n = dias.length
  const rit = ([['manana', '🌅 Mañana'], ['comida', '🍽️ Comida ancla'], ['noche', '✈️ Modo Avión (noche)']] as const).map(([k, t]) => ({ k, t, si: dias.filter((d: any) => d[k]).length }))
  const fuerte = [...rit].sort((a, b) => b.si - a.si)[0], flojo = [...rit].sort((a, b) => a.si - b.si)[0]

  const ses = s.culta.sesiones
  const mejor = [...ses].sort((a, b) => b.nota - a.nota)[0], baja = [...ses].sort((a, b) => a.nota - b.nota)[0]
  const enProg = ses.filter((x) => x.estado === 'En progreso')
  const conItems = ses.filter((x) => Array.isArray(x.items))
  const porItem = RUBRICA.map((r, i) => ({ r, i, v: promedio(conItems.map((x) => Number(x.items[i]) || 0)) }))
  const itemFlojo = conItems.length >= 2 ? [...porItem].sort((a, b) => (a.v ?? 9) - (b.v ?? 9))[0] : null

  const sinPilar = PILARES_ZORRO.filter((p) => !s.zorro.bitacora.some((b) => b.enfoque === p.id))
  const args = s.voz.argumentos, sinGar = args.filter((a) => !a.garantia).length
  const causales = s.voz.frases.filter((x) => ['porque', 'ya que', 'dado que', 'de modo que'].includes(x.conector)).length
  const dimMenos = DIMENSIONES.slice(0, 5).map((d) => ({ d, n: s.expediente.filter((e) => e.dimension === d).length })).sort((a, b) => a.n - b.n)[0]
  const tiposDist = [...new Set(s.distorsiones.map((d) => d.tipo))].map((t) => ({ t, n: s.distorsiones.filter((d) => d.tipo === t).length })).sort((a, b) => b.n - a.n)

  const evs = s.evaluaciones || []
  const tend = tendencia(evs)
  const porCrit = new Map<string, number[]>()
  evs.forEach((e: any) => (e.criterios || []).forEach((c: any) => porCrit.set(c.titulo, [...(porCrit.get(c.titulo) || []), c.max ? c.pts / c.max : 0])))
  const critProm = [...porCrit.entries()].map(([t, v]) => ({ t, v: v.reduce((a, b) => a + b, 0) / v.length, n: v.length })).sort((a, b) => a.v - b.v)

  // Una sola sugerencia a la vez (dispersión histórica: máximo foco).
  const sug = s.ajustes.reingreso
    ? { t: 'Solo Fase 1, versión simple', p: 'Estás en Reingreso. Una semana con el check-in de 10 segundos pesa más que retomar cinco cosas a la vez.', ir: 'hoy' as const, por: 'Protocolo de Reingreso de tu propio proyecto.' }
    : n >= 5 && flojo.si / n < 0.34
      ? { t: `Hacer más fácil: ${flojo.t}`, p: `Lo marcaste ${flojo.si} de ${n} días. No es flojera: probablemente el ritual pide demasiado para esa hora. Redúcelo a un solo gesto.`, ir: 'hoy' as const, por: 'Menos fricción funciona mejor que más voluntad (Fogg; Wood).' }
      : enProg.length
        ? { t: `Repasar: ${enProg[enProg.length - 1].tema}`, p: `Tienes ${enProg.length} tema(s) en “En progreso”. Un repaso corto y pasa a Consolidado (+2 XP de diferencia).`, ir: 'culta' as const, por: 'Repaso espaciado.' }
        : sinGar > 0
          ? { t: 'Completar la garantía de un argumento', p: `${sinGar} de ${args.length} argumentos tienen afirmación y evidencia, pero no la regla que las une.`, ir: 'voz' as const, por: 'Modelo de Toulmin.' }
          : sinPilar.length
            ? { t: `Probar el pilar ${sinPilar[0].emoji} ${(sinPilar[0] as any).nombre || sinPilar[0].id}`, p: 'Es un pilar del Zorro que aún no tiene registro.', ir: 'zorro' as const, por: 'La rueda completa entrena distintos músculos del humor.' }
            : { t: 'Sigue como vas', p: 'No veo un hueco claro en tus datos. Eso también es información.', ir: 'hoy' as const, por: '' }

  return (
    <div className="pagina">
      <header className="cabeza">
        <span className="eyebrow">Fortalezas y puntos débiles · con su fuente</span>
        <Titulo3D texto="PATRONES" chico />
        <p className="serif" style={{ fontSize: 'clamp(22px, 3vw, 32px)', maxWidth: 720 }}>Honesto y sin suavizar, como te gusta. Y sin sermones: un patrón es información, no un veredicto.</p>
      </header>

      <Sube><Tilt className="tinta pila">
        <span className="eyebrow">Qué trabajar ahora · una sola cosa</span>
        <h2 className="display" style={{ fontSize: 'clamp(32px, 5.4vw, 62px)' }}>{sug.t}</h2>
        <p style={{ maxWidth: 700 }}>{sug.p}</p>
        {sug.por && <p className="porque" style={{ borderColor: 'var(--lima)', color: 'rgba(251,247,240,.75)' }}>Por qué: {sug.por}</p>}
        <div><button className="btn claro" onClick={() => irA(sug.ir)}>Vamos →</button></div>
      </Tilt></Sube>

      <div className="bento" style={{ marginTop: 18 }}>
        <Sube className="c12"><div className="card pila"><div className="entre"><span className="eyebrow">🧠 Lo que dicen tus evaluaciones de escritura ({evs.length})</span><button className="pill" onClick={() => irA('coach')}>Evaluar algo →</button></div>
          {evs.length ? <><p>{tend.texto}</p>
            <div className="bento">{critProm.slice(0, 6).map((c) => <div key={c.t} className="c4 pila-s"><div className="entre chico"><span>{c.t}</span><b className="mono">{Math.round(c.v * 100)}%</b></div><Barra v={c.v} mundo /></div>)}</div>
            <p className="porque">Cada barra es tu promedio en ese criterio, de todas las evaluaciones guardadas. La más baja es lo que más te conviene practicar.</p></>
            : <Vacio>Todavía no hay evaluaciones guardadas. En Coach pegas lo que escribes, te digo qué está sólido y qué falta, y aquí queda tu progreso.</Vacio>}</div></Sube>
        <Sube className="c6"><div className="card pila" style={{ height: '100%' }}><span className="eyebrow">🔋 Rituales · {n} días con registro</span>
          {n ? <>{rit.map((r) => <div key={r.k} className="pila-s"><div className="entre chico"><span>{r.t}</span><b className="mono">{r.si}/{n}</b></div><Barra v={r.si / n} mundo /></div>)}
            <p className="chico">El que más pega: <b>{fuerte.t}</b>. El que más cuesta: <b>{flojo.t}</b>.</p></> : <Vacio>Sin check-ins todavía.</Vacio>}
          <DeDonde titulo="¿Cómo se calcula?">Días en que marcaste “sí” en cada ritual, sobre los días que tienen algún registro. Los días sin registro no se cuentan como “no”.</DeDonde></div></Sube>

        <Sube className="c6" d={0.05}><div className="card pila" style={{ height: '100%' }}><span className="eyebrow">🎓 Culta · {ses.length} sesiones</span>
          {ses.length ? <>
            <div className="dos"><div className="item"><span className="eyebrow">Tu nota más alta</span><b>{mejor.nota} · {mejor.tema}</b></div><div className="item"><span className="eyebrow">La más baja</span><b>{baja.nota} · {baja.tema}</b></div></div>
            {(['B1', 'B2', 'B3'] as const).map((b) => { const p = promedio(ses.filter((x) => x.bloque === b).map((x) => Number(x.nota))); return <div key={b} className="pila-s"><div className="entre chico"><span>{BLOQUES_CULTA[b].nombre}</span><b className="mono">{p?.toFixed(1) ?? '—'}</b></div><div style={{ ['--mundo' as any]: BLOQUES_CULTA[b].color }}><Barra v={(p || 0) / 20} mundo /></div></div> })}
            {itemFlojo ? <p className="chico">Ítem que más te cuesta: <b>{itemFlojo.i + 1}. {itemFlojo.r}</b> (promedio {itemFlojo.v?.toFixed(1)}/2).</p> : <p className="chico suave">El detalle por ítem aparecerá cuando registres 2 o más sesiones ítem por ítem.</p>}
          </> : <Vacio>Sin sesiones todavía.</Vacio>}</div></Sube>

        <Sube className="c4"><div className="card pila-s" style={{ height: '100%' }}><span className="eyebrow">🧑‍⚖️ Distorsiones</span>{tiposDist.length ? tiposDist.map((t) => <div key={t.t} className="entre chico"><span>{t.t}</span><b className="mono">{t.n}</b></div>) : <Vacio>Sin capturas.</Vacio>}{tiposDist[0] && <p className="chico suave">La que más aparece: {tiposDist[0].t}. Conocerla ya es media cacería.</p>}</div></Sube>
        <Sube className="c4" d={0.05}><div className="card pila-s" style={{ height: '100%' }}><span className="eyebrow">🦊 Zorro</span><p className="chico">{sinPilar.length ? <>Pilares sin registro: <b>{sinPilar.map((p) => (p as any).nombre || p.id).join(', ')}</b>.</> : 'Los 6 pilares tienen al menos un registro.'}</p><p className="chico suave">{s.zorro.anecdotas.length} anécdotas · {s.zorro.cosmovision.length} cosmovisiones</p></div></Sube>
        <Sube className="c4" d={0.1}><div className="card pila-s" style={{ height: '100%' }}><span className="eyebrow">🗣️ Voz</span><p className="chico">{args.length ? <>{args.length - sinGar} de {args.length} argumentos con garantía.</> : 'Aún sin argumentos registrados.'}</p><p className="chico">{s.voz.frases.length ? <>{causales} de {s.voz.frases.length} frases usan conector causal.</> : 'Aún sin frases de conectores.'}</p>{dimMenos && <p className="chico suave">En el Expediente, la dimensión con menos evidencia es {dimMenos.d} ({dimMenos.n}).</p>}</div></Sube>
      </div>

      <div className="bento" style={{ marginTop: 18 }}>
        <Sube className="c6"><div className="card color pila" style={{ height: '100%', ['--mundo' as any]: 'var(--lima)' }}><h2 className="h2">💪 Fortalezas documentadas</h2>
          {s.patrones.fortalezas.length ? s.patrones.fortalezas.map((p: any) => <div key={p.t} className="item blanco"><b>{p.t}</b><span className="chico suave">{p.e}</span></div>) : <Vacio>Se cargan con tu archivo personal.</Vacio>}</div></Sube>
        <Sube className="c6" d={0.05}><div className="card pila" style={{ height: '100%' }}><h2 className="h2">🧭 Lo que más cuesta</h2>
          {s.patrones.debiles.length ? s.patrones.debiles.map((p: any) => <div key={p.t} className="item"><b>{p.t}</b><span className="chico suave">Dónde se vio: {p.e}</span>{p.s && <span className="porque">Qué probar: {p.s}</span>}</div>) : <Vacio>Se cargan con tu archivo personal.</Vacio>}
          <p className="chico suave">Estos vienen de tus chats de agosto–septiembre 2026, no de datos nuevos. Si alguno ya no te representa, se actualiza.</p></div></Sube>
      </div>
    </div>
  )
}
