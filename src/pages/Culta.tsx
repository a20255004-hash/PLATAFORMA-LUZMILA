import { useMemo, useState } from 'react'
import { Anillo, Barra, Campo, Cuenta, decir, DeDonde, Hoja, Sube, Tilt, Titulo3D, Vacio } from '../components/ui'
import temario from '../data/culta.json'
import { BLOQUES_CULTA, NIVELES_CULTA, RUBRICA } from '../data/estructura'
import { bloqueCulta, bonita, hoyISO, queToca, semanaCulta } from '../lib/fechas'
import { promedio, repasosPendientes, useDatos, xpCulta } from '../store'

type B = 'B1' | 'B2' | 'B3'
const nuevo = () => ({ fecha: hoyISO(), bloque: bloqueCulta() as B, tema: '', items: Array(10).fill(''), notaDirecta: '', feedback: '', mejorada: '', fuente: '', estado: '' })

export default function Culta() {
  const s = useDatos()
  const [tab, setTab] = useState<'sesiones' | 'temario' | 'fuentes'>('sesiones')
  const [form, setForm] = useState<any>(null)
  const [bloque, setBloque] = useState<B>('B1')
  const xp = xpCulta(s)
  const ses = useMemo(() => [...s.culta.sesiones].sort((a, b) => (a.fecha < b.fecha ? 1 : -1)), [s.culta.sesiones])
  const orden = [...ses].reverse()
  const prom = (b: B) => promedio(ses.filter((x) => x.bloque === b).map((x) => Number(x.nota)))
  const pend = repasosPendientes(s.culta.sesiones)
  const toca = queToca() === 'culta'

  const conItems = ses.filter((x) => Array.isArray(x.items) && x.items.length === 10)
  const porItem = RUBRICA.map((_, i) => promedio(conItems.map((x) => Number(x.items[i]) || 0)))

  const notaForm = form ? (form.items.some((v: string) => v !== '') ? form.items.reduce((a: number, v: string) => a + (Number(v) || 0), 0) : Number(form.notaDirecta) || 0) : 0
  const enBlanco = form ? form.items.filter((v: string) => v === '0').length : 0
  const sugerido = notaForm >= 15 && enBlanco < 2 ? 'Consolidado' : 'En progreso'

  const guardar = () => {
    if (!form.tema.trim()) return decir('Ponle el tema a la sesión 🙂')
    const usaItems = form.items.some((v: string) => v !== '')
    s.agregar('culta.sesiones', { fecha: form.fecha, bloque: form.bloque, tema: form.tema.trim(), nota: notaForm, items: usaItems ? form.items.map((v: string) => Number(v) || 0) : undefined, feedback: form.feedback, mejorada: form.mejorada, estado: form.estado || sugerido, repasos: { d2: false, d7: false, d21: false }, origen: 'plataforma' })
    if (form.fuente.trim()) s.agregar('culta.fuentes', { bloque: BLOQUES_CULTA[form.bloque as B].nombre, tema: form.tema.trim(), autor: '', ref: form.fuente.trim() })
    setForm(null)
    decir(<>Sesión guardada: <b>{notaForm}/20</b> · {form.estado || sugerido}</>, true)
  }

  const W = 640, H = 170
  const pt = (i: number, n: number) => `${orden.length > 1 ? 24 + (i / (orden.length - 1)) * (W - 48) : W / 2},${H - 22 - (n / 20) * (H - 44)}`
  const usado = (tema: string) => ses.find((x) => x.tema.toLowerCase().includes(tema.toLowerCase().slice(0, 18)) || tema.toLowerCase().includes(x.tema.toLowerCase().split(' (')[0]))

  return (
    <div className="pagina">
      <header className="cabeza">
        <span className="eyebrow">Proyecto Culta · {toca ? 'hoy toca ✨' : 'hoy descansa'} · semana {semanaCulta()}</span>
        <Titulo3D texto="CULTA" />
        <p className="serif" style={{ fontSize: 'clamp(22px, 3vw, 32px)', maxWidth: 720 }}>Culta y alturada. No memorizar: entender, explicar con tus palabras, relacionar y aplicar.</p>
        <div className="fila"><button className="btn" onClick={() => setForm(nuevo())}>+ Registrar sesión</button><span className="pill mundo">{BLOQUES_CULTA[bloqueCulta()].emoji} Esta semana: {BLOQUES_CULTA[bloqueCulta()].nombre}</span></div>
      </header>

      <div className="bento">
        <Sube className="c5"><Tilt className="color pila" style={{ height: '100%' }}>
          <span className="eyebrow">Nivel Culta</span>
          <div className="fila" style={{ gap: 18 }}>
            <Anillo valor={xp.progreso} tam={140}><div><div className="num" style={{ fontSize: 44 }}><Cuenta n={xp.total} /></div><div className="eyebrow">XP</div></div></Anillo>
            <div className="pila-s crece"><div className="h3">{xp.actual.nombre}</div>{xp.siguiente && <p className="chico">Faltan <b>{xp.faltan}</b> para “{xp.siguiente.nombre}”</p>}</div>
          </div>
          <DeDonde>XP = temas “En progreso” × 1 + “Consolidado” × 3. Hoy: {xp.prog} × 1 + {xp.cons} × 3 = {xp.total}. Niveles: {NIVELES_CULTA.map((n) => `${n.min} ${n.nombre}`).join(' · ')}.</DeDonde>
        </Tilt></Sube>

        <Sube className="c7" d={0.06}><Tilt className="pila" style={{ height: '100%' }}>
          <div className="entre"><span className="eyebrow">Evolución de notas /20</span><span className="chico suave">promedio {promedio(ses.map((x) => Number(x.nota)))?.toFixed(1) ?? '—'}</span></div>
          {orden.length ? (
            <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Gráfico de notas por sesión">
              <line x1="24" x2={W - 24} y1={H - 22 - (15 / 20) * (H - 44)} y2={H - 22 - (15 / 20) * (H - 44)} stroke="var(--tinta)" strokeOpacity=".25" strokeDasharray="4 6" />
              <text x={W - 24} y={H - 28 - (15 / 20) * (H - 44)} textAnchor="end" fontSize="11" fill="var(--tinta-2)">15 = Consolidado</text>
              <polyline points={orden.map((x, i) => pt(i, Number(x.nota))).join(' ')} fill="none" stroke="var(--tinta)" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
              {orden.map((x, i) => { const [cx, cy] = pt(i, Number(x.nota)).split(','); return <g key={x.id}><circle cx={cx} cy={cy} r="8" fill={BLOQUES_CULTA[x.bloque as B].color} stroke="var(--tinta)" strokeWidth="2.5"><title>{x.tema}: {x.nota}</title></circle><text x={cx} y={Number(cy) - 14} textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--tinta)">{x.nota}</text></g> })}
            </svg>
          ) : <Vacio>Todavía no hay sesiones registradas.</Vacio>}
          <div className="fila">{(['B1', 'B2', 'B3'] as B[]).map((b) => <span key={b} className="pill" style={{ background: BLOQUES_CULTA[b].color }}>{BLOQUES_CULTA[b].nombre}: {prom(b)?.toFixed(1) ?? '—'}</span>)}</div>
        </Tilt></Sube>

        {pend.length > 0 && <Sube className="c12"><div className="card pila"><span className="eyebrow">🔁 Repasos espaciados listos</span><div className="lista">{pend.map(({ item, clave, dias }) => (
          <div key={item.id + clave} className="item entre"><span><b>{item.tema}</b> <span className="suave chico">· repaso del día {dias}</span></span><button className="btn s mundo" onClick={() => { s.editar('culta.sesiones', item.id, { repasos: { ...item.repasos, [clave]: true } }); decir('Repaso hecho ✔') }}>Ya lo repasé</button></div>
        ))}</div><p className="porque">Repasar a los 2, 7 y 21 días aplana la curva del olvido (Ebbinghaus). Sin fecha límite: aparecen cuando ya toca y esperan sin culpa.</p></div></Sube>}
      </div>

      <div className="tabs" style={{ marginTop: 26 }} role="tablist">
        {([['sesiones', '📓 Sesiones'], ['temario', '🗂️ Temario'], ['fuentes', '📚 Fuentes']] as const).map(([k, t]) => <button key={k} role="tab" aria-selected={tab === k} aria-pressed={tab === k} className="pill" onClick={() => setTab(k)}>{t}</button>)}
      </div>

      {tab === 'sesiones' && (
        <div className="bento">
          <div className="c7 lista">
            {ses.length ? ses.map((x) => (
              <Sube key={x.id}><div className="card pila-s" style={{ padding: 18 }}>
                <div className="entre"><span className="fila"><span className="pill" style={{ background: BLOQUES_CULTA[x.bloque as B].color }}>{x.bloque}</span><span className="chico suave">{x.fechaAprox ? '≈ ' : ''}{bonita(x.fecha)}</span></span><span className="num" style={{ fontSize: 34 }}>{x.nota}<span className="chico suave" style={{ fontFamily: 'var(--texto)', fontWeight: 500 }}>/20</span></span></div>
                <div className="h3">{x.tema}</div>
                {x.feedback && <p className="chico suave">{x.feedback}</p>}
                {x.mejorada && <p className="porque"><b>Versión mejorada:</b> {x.mejorada}</p>}
                <div className="fila">
                  {['En progreso', 'Consolidado'].map((e) => <button key={e} className="pill" aria-pressed={x.estado === e} onClick={() => s.editar('culta.sesiones', x.id, { estado: e })}>{e}</button>)}
                  {(['d2', 'd7', 'd21'] as const).map((k) => <button key={k} className="pill borde" aria-pressed={!!x.repasos?.[k]} onClick={() => s.editar('culta.sesiones', x.id, { repasos: { ...x.repasos, [k]: !x.repasos?.[k] } })}>{k.toUpperCase()}</button>)}
                  <button className="pill borde" onClick={() => confirm('¿Quitar esta sesión?') && s.quitar('culta.sesiones', x.id)} aria-label="Quitar sesión">✕</button>
                </div>
              </div></Sube>
            )) : <Vacio>Cuando termines una sesión con Claude, regístrala aquí con su nota.</Vacio>}
          </div>
          <div className="c5 pila">
            <div className="card pila"><span className="eyebrow">Promedio por tipo de ítem (sobre 2)</span>
              {conItems.length ? RUBRICA.map((r, i) => <div key={i} className="pila-s"><div className="entre chico"><span>{i + 1}. {r}</span><b className="mono">{porItem[i]?.toFixed(1)}</b></div><Barra v={(porItem[i] || 0) / 2} mundo /></div>)
                : <Vacio>Este gráfico usa solo sesiones registradas ítem por ítem. Las anteriores tienen la nota total, no el detalle, así que no invento el desglose.</Vacio>}
              <DeDonde titulo="¿Qué muestra?">Promedio de cada ítem en las {conItems.length} sesiones con detalle. Sirve para ver qué tipo de pregunta te cuesta más.</DeDonde>
            </div>
            <div className="card pila-s"><span className="eyebrow">Formato de cada sesión</span>
              {['🍎 Con manzanitas', '🔬 A fondo', '📝 Evaluación de 10 ítems', '📊 Nota /20 + versión mejorada', '📚 Referencias APA', '🎤 Micro-ejercicio de Bloque 3'].map((t) => <div key={t} className="chico">{t}</div>)}
              <p className="porque">La sesión la haces con Claude en el chat; aquí queda el registro, la evolución y los repasos.</p>
            </div>
          </div>
        </div>
      )}

      {tab === 'temario' && (
        <div className="pila">
          <div className="fila">{(['B1', 'B2', 'B3'] as B[]).map((b) => <button key={b} className="pill" aria-pressed={bloque === b} onClick={() => setBloque(b)}>{BLOQUES_CULTA[b].emoji} {BLOQUES_CULTA[b].nombre}</button>)}</div>
          <div className="bento">
            {(temario as any[]).find((b) => b.id === bloque).categorias.map((c: any, i: number) => (
              <Sube key={c.nombre} className="c6" d={(i % 2) * 0.05}><div className="card pila-s" style={{ height: '100%' }}>
                <div className="entre"><span className="h3">{c.nombre}</span><span className="pill borde">{c.temas.filter((t: string) => usado(t)).length}/{c.temas.length}</span></div>
                {c.temas.map((t: string) => { const u = usado(t); return (
                  <button key={t} className="item chico" style={{ textAlign: 'left', background: u ? BLOQUES_CULTA[bloque].color : undefined }} onClick={() => setForm({ ...nuevo(), bloque, tema: t })}>
                    <span className="entre"><span>{t}</span>{u ? <b>{u.nota}</b> : <span className="suave">+</span>}</span>
                  </button>) })}
              </div></Sube>
            ))}
          </div>
        </div>
      )}

      {tab === 'fuentes' && (
        <div className="lista">
          {s.culta.fuentes.length ? s.culta.fuentes.map((f: any) => <div key={f.id} className="card pila-s" style={{ padding: 16 }}><div className="fila"><span className="pill mundo">{f.bloque}</span><b>{f.tema}</b></div><p className="chico" style={{ whiteSpace: 'pre-line' }}>{f.ref}</p></div>) : <Vacio>Las referencias APA que registres aparecerán aquí.</Vacio>}
        </div>
      )}

      <Hoja abierta={!!form} cerrar={() => setForm(null)} titulo="Registrar sesión">
        {form && <div className="pila">
          <div className="dos">
            <Campo label="Fecha"><input type="date" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} /></Campo>
            <Campo label="Bloque"><select value={form.bloque} onChange={(e) => setForm({ ...form, bloque: e.target.value })}>{(['B1', 'B2', 'B3'] as B[]).map((b) => <option key={b} value={b}>{b} · {BLOQUES_CULTA[b].nombre}</option>)}</select></Campo>
          </div>
          <Campo label="Tema"><input value={form.tema} placeholder="Ej. Cadena de valor de Porter" onChange={(e) => setForm({ ...form, tema: e.target.value })} /></Campo>
          <div className="pila-s"><span className="eyebrow">Puntaje por ítem (0 a 2, con medios)</span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 8 }}>
              {RUBRICA.map((r, i) => <label key={i} className="campo" style={{ fontWeight: 500, fontSize: 12.5 }}><span>{i + 1}. {r}</span><select value={form.items[i]} onChange={(e) => { const items = [...form.items]; items[i] = e.target.value; setForm({ ...form, items }) }}><option value="">—</option>{[0, 0.5, 1, 1.5, 2].map((v) => <option key={v} value={v}>{v}{v === 0 ? ' (en blanco / no sé)' : ''}</option>)}</select></label>)}
            </div>
            <Campo label="…o solo la nota total" ayuda="Si no tienes el detalle por ítem."><input type="number" min="0" max="20" step="0.5" value={form.notaDirecta} onChange={(e) => setForm({ ...form, notaDirecta: e.target.value })} /></Campo>
          </div>
          <Campo label="Qué falló y por qué (feedback honesto)"><textarea value={form.feedback} onChange={(e) => setForm({ ...form, feedback: e.target.value })} /></Campo>
          <Campo label="Versión mejorada"><textarea value={form.mejorada} onChange={(e) => setForm({ ...form, mejorada: e.target.value })} /></Campo>
          <Campo label="Referencia APA (opcional)"><input value={form.fuente} onChange={(e) => setForm({ ...form, fuente: e.target.value })} /></Campo>
          <div className="card color entre" style={{ padding: 16 }}><div><div className="num" style={{ fontSize: 44 }}>{notaForm}<span className="chico">/20</span></div><span className="chico">Estado sugerido: <b>{sugerido}</b></span></div>
            <div className="fila">{['En progreso', 'Consolidado'].map((e) => <button key={e} className="pill" aria-pressed={(form.estado || sugerido) === e} onClick={() => setForm({ ...form, estado: e })}>{e}</button>)}</div></div>
          <p className="porque">Regla: Consolidado con 15 o más y menos de 2 ítems en blanco. Decir “no sé” es honestidad, no fracaso: solo indica qué repasar.</p>
          <button className="btn" onClick={guardar}>Guardar sesión</button>
        </div>}
      </Hoja>
    </div>
  )
}
