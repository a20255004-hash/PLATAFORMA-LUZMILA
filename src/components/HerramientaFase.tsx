import { useState } from 'react'
import { irA } from '../App'
import { HERRAMIENTAS, type Campo, type Seccion } from '../data/herramientas'
import { hoyISO } from '../lib/fechas'
import { useDatos } from '../store'
import { Campo as Field, decir } from './ui'
import { mascotaDice } from './Mascota'

const entradas = (s: any, fase: number, sec: Seccion) => (sec.destino === 'alterEgo' ? s.alterEgo : sec.destino === 'disfrute' ? s.disfrute : (s.fasesReg || []).filter((r: any) => r.fase === fase && r.seccion === sec.id))
const ruta = (sec: Seccion) => (sec.destino === 'alterEgo' ? 'alterEgo' : sec.destino === 'disfrute' ? 'disfrute' : 'fasesReg')
const vacio = (campos: Campo[]) => Object.fromEntries(campos.map((c) => [c.k, c.tipo === 'fecha' ? hoyISO() : '']))

function Entrada({ c, v, set }: { c: Campo; v: any; set: (x: any) => void }) {
  if (c.tipo === 'largo') return <Field label={c.label} ayuda={c.ayuda}><textarea rows={3} value={v || ''} onChange={(e) => set(e.target.value)} /></Field>
  if (c.tipo === 'select') return <Field label={c.label}><select value={v || ''} onChange={(e) => set(e.target.value)}><option value="">—</option>{c.opciones!.map((o) => <option key={o}>{o}</option>)}</select></Field>
  if (c.tipo === 'fecha') return <Field label={c.label}><input type="date" value={v || ''} onChange={(e) => set(e.target.value)} /></Field>
  if (c.tipo === 'numero') return <Field label={c.label}><input type="number" min="0" inputMode="decimal" value={v ?? ''} onChange={(e) => set(e.target.value)} /></Field>
  return <Field label={c.label} ayuda={c.ayuda}><input value={v || ''} onChange={(e) => set(e.target.value)} /></Field>
}

function Bloque({ fase, sec }: { fase: number; sec: Seccion }) {
  const s = useDatos()
  const lista = entradas(s, fase, sec)
  const [abierto, setAbierto] = useState(false)
  const [f, setF] = useState<any>(() => (sec.unico && lista[0] ? lista[0] : vacio(sec.campos)))
  const guardar = () => {
    const lleno = sec.campos.some((c) => c.tipo !== 'fecha' && String(f[c.k] ?? '').trim())
    if (!lleno) return decir('Escribe algo primero 🙂')
    if (sec.unico && lista[0]) { s.editar(ruta(sec), lista[0].id, f); decir('Guardado ✔'); return }
    if (sec.max && lista.length >= sec.max) return decir(`Máximo ${sec.max}: mejor pocos y que sean tuyos.`)
    const { id: _id, ...datos } = f
    s.agregar(ruta(sec), { ...datos, fase, seccion: sec.id, xp: sec.xp || 0, fecha: datos.fecha || hoyISO() })
    setF(vacio(sec.campos)); setAbierto(false)
    decir(sec.xp || sec.destino === 'alterEgo' ? <><b>+{sec.xp || 2}</b> · anotado ✔</> : 'Guardado ✔', !!(sec.xp || sec.destino === 'alterEgo'))
    if (sec.destino === 'alterEgo') mascotaDice('¡Activaste tu alter ego! Con el nervio presente y todo. Eso es valentía 🎭', 'fiesta')
    else if (sec.xp) mascotaDice('¡Sesión anotada! Una más hacia tu cinturón 🥋', 'fiesta')
  }
  return (
    <div className="card pila-s" style={{ padding: 16 }}>
      <div className="entre"><span className="h3" style={{ fontSize: 17 }}>{sec.titulo}</span>{!sec.unico && <button className="pill" onClick={() => setAbierto(!abierto)}>{abierto ? 'Cerrar' : `+ ${sec.boton || 'Añadir'}`}</button>}</div>
      {sec.desc && <p className="chico suave">{sec.desc}</p>}
      {(sec.unico || abierto) && <div className="pila-s">{sec.campos.map((c) => <Entrada key={c.k} c={c} v={f[c.k]} set={(x) => setF({ ...f, [c.k]: x })} />)}<div><button className="btn s" onClick={guardar}>{sec.unico ? 'Guardar' : 'Guardar registro'}</button></div></div>}
      {!sec.unico && (lista.length ? <div className="lista">{lista.map((r: any) => (
        <div key={r.id} className="item chico entre" style={{ gridTemplateColumns: 'none' }}>
          <span className="crece">{sec.resumen(r)}</span>
          <span className="fila" style={{ gap: 6 }}>
            {sec.estado && <select aria-label="Estado" value={r[sec.estado.k] || sec.estado.opciones[0]} onChange={(e) => { s.editar(ruta(sec), r.id, { [sec.estado!.k]: e.target.value }); if (sec.estado!.opciones[0] !== e.target.value) mascotaDice('Cuenta el intento. Un paso pequeño ya es movimiento 🌱', 'feliz') }} style={{ width: 'auto', padding: '4px 8px', fontSize: 13 }}>{sec.estado.opciones.map((o) => <option key={o}>{o}</option>)}</select>}
            <button className="pill borde" aria-label="Quitar" onClick={() => confirm('¿Quitar este registro?') && s.quitar(ruta(sec), r.id)}>✕</button>
          </span>
        </div>))}</div> : <p className="chico suave">Todavía no hay registros. Cuando quieras.</p>)}
      {sec.id === 'gasto' && (() => { const mes = hoyISO().slice(0, 7); const g = lista.filter((r: any) => String(r.fecha).startsWith(mes)); const tot = g.reduce((a: number, r: any) => a + (Number(r.monto) || 0), 0); const por: Record<string, number> = {}; g.forEach((r: any) => { por[r.cat || 'Otro'] = (por[r.cat || 'Otro'] || 0) + (Number(r.monto) || 0) }); return g.length ? <p className="porque">Este mes: S/ {tot.toFixed(2)} · {Object.entries(por).map(([k, v]) => `${k} ${v.toFixed(0)}`).join(' · ')}</p> : null })()}
      {sec.id === 'sesion' && <p className="porque">Cinturón: {(() => { const n = lista.length; const c = ['sin cinturón aún', 'blanco', 'amarillo', 'naranja', 'verde', 'azul', 'negro'][Math.min(6, Math.floor(n / 4))]; return `${c} (${n} sesión${n === 1 ? '' : 'es'})` })()}</p>}
    </div>
  )
}

export default function HerramientaFase({ fase }: { fase: number }) {
  const s = useDatos()
  const h = HERRAMIENTAS[fase]
  if (!h) return null
  const ch = h.checklist
  return (
    <div className="pila">
      <p className="chico">{h.intro}</p>
      {h.aviso && <p className="porque">{h.aviso}</p>}
      {h.profesional && <p className="porque">Esta fase se trabaja mejor con acompañamiento profesional en paralelo. La plataforma te guarda el espacio, nunca lo reemplaza.</p>}
      {h.linea && <div><button className="btn" onClick={() => irA(h.linea!.ruta as any)}>{h.linea.texto} →</button></div>}
      {h.secciones.map((sec) => <Bloque key={sec.id} fase={fase} sec={sec} />)}
      {ch && <div className="card pila-s" style={{ padding: 16 }}><span className="h3" style={{ fontSize: 17 }}>{ch.titulo}</span>
        {ch.items.map((i) => { const k = `${fase}:${i.id}`; const v = !!s.fasesChecks[k]; return <button key={i.id} className="item chico" style={{ textAlign: 'left', background: v ? 'var(--menta)' : undefined }} aria-pressed={v} onClick={() => { s.poner('fasesChecks', { ...s.fasesChecks, [k]: !v }); if (!v) { decir('Un escalón más ✔', true); mascotaDice('¡Un escalón más! Despacio y con el nervio presente, así se hace 🪜', 'fiesta') } }}>{v ? '✔ ' : '○ '}{i.texto}</button> })}</div>}
      {h.fijos && <div className="card pila-s" style={{ padding: 16 }}><span className="h3" style={{ fontSize: 17 }}>{h.fijos.titulo}</span>{h.fijos.items.map((x) => <div key={x} className="item chico blanco">{x}</div>)}</div>}
    </div>
  )
}
