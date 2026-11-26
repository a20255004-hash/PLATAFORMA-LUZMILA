import { useState } from 'react'
import { Anillo, Campo, decir, DeDonde, Hoja, Sube, Tilt, Titulo3D, Vacio } from '../components/ui'
import { INSIGNIAS, NIVELES, PILARES_ZORRO } from '../data/estructura'
import { bonita, dif, hoyISO, sumar } from '../lib/fechas'
import { TarjetaAncla, TarjetaCiclo, TarjetaMetas2026 } from '../components/Seguimiento'
import { nivelDe, puntosDia, useDatos, xpCulta, xpLuzmila, xpZorro } from '../store'

const cuadrante = (m: any) => (m.urgente && m.importante ? 'I · Hacer ya' : !m.urgente && m.importante ? 'II · Planificar' : m.urgente ? 'III · Minimizar' : 'IV · ¿Por qué está aquí?')

export default function Logros() {
  const s = useDatos()
  const xp = xpLuzmila(s), niv = nivelDe(xp.total)
  const [hoja, setHoja] = useState<null | 'meta' | 'mision'>(null)
  const [f, setF] = useState<any>({})
  const hoy = hoyISO()

  const ganadas: Record<string, boolean> = {
    volvi: s.retomas.length > 0,
    avion: Object.values(s.checkins).filter((c: any) => c.noche).length >= 5,
    cazadora: s.distorsiones.length >= 10,
    detective: s.expediente.filter((e) => !e.historial).length >= 10,
    culta10: s.culta.sesiones.length >= 10,
    vuelta: PILARES_ZORRO.every((p) => s.zorro.bitacora.some((b) => b.enfoque === p.id)),
    remate: s.zorro.anecdotas.length >= 3,
    garantia: s.voz.argumentos.filter((a) => a.garantia).length >= 5,
    valentia: s.alterEgo.length >= 4,
    puente: (s.fasesReg || []).some((r: any) => r.fase === 8 && r.seccion === 'vinculo' && r.estado && r.estado !== 'Pendiente'),
  }
  const activas = s.metas.filter((m) => m.estado !== 'Cumplida')
  const misiones = s.misiones.filter((m) => !m.hecha)
  // Temporada: bloques de 2 meses desde el inicio.
  const temp = Math.floor(dif(hoy, s.perfil.inicio) / 61) + 1
  const iniT = sumar(s.perfil.inicio, (temp - 1) * 61), finT = sumar(iniT, 60)
  const enT = (f: string) => f >= iniT && f <= finT
  const resumen = { rituales: Object.entries(s.checkins).filter(([k]) => enT(k)).reduce((a, [, c]) => a + puntosDia(c), 0), culta: s.culta.sesiones.filter((x) => enT(x.fecha)).length, zorro: s.zorro.bitacora.filter((x) => enT(x.fecha)).length, evid: s.expediente.filter((x) => !x.historial && enT(x.fecha)).length, retomas: s.retomas.filter(enT).length }

  const guardarMeta = () => {
    if (!f.meta?.trim()) return decir('¿Cuál es la meta?')
    if (activas.length >= 3) return decir('Ya tienes 3 metas activas. Cierra o suelta una primero: así se cuida el foco 🎯')
    s.agregar('metas', { meta: f.meta.trim(), siEntonces: f.siEntonces || '', proxima: f.proxima || '', urgente: !!f.urgente, importante: !!f.importante, limite: f.limite || '', ultimoAvance: hoy, obstaculos: '', estado: 'En curso', resultado: '' })
    setHoja(null); decir('Meta creada 🎯')
  }
  const guardarMision = () => {
    if (!f.texto?.trim()) return
    if (misiones.length >= 2) return decir('Máximo 2 misiones por semana. Con una basta 🌱')
    s.agregar('misiones', { texto: f.texto.trim(), fecha: hoy, hecha: false }); setHoja(null); decir('Misión de la semana lista 🎯')
  }

  return (
    <div className="pagina">
      <header className="cabeza">
        <span className="eyebrow">Gamificación · temporada {temp}</span>
        <Titulo3D texto="LOGROS" />
        <p className="serif" style={{ fontSize: 'clamp(22px, 3vw, 32px)', maxWidth: 720 }}>Aquí se premia volver, no ser perfecta. Nada se resta, nada se pierde.</p>
      </header>

      <div className="bento">
        <Sube className="c12"><div className="card pila"><span className="eyebrow">Luzmila Level Up</span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 12 }}>
            {NIVELES.map((n, i) => { const hecho = xp.total >= n.min, actual = niv.i === i; return (
              <Tilt key={n.nombre} className={`pila-s ${actual ? 'color' : ''}`} style={{ padding: 18, opacity: hecho ? 1 : 0.55, boxShadow: actual ? undefined : 'var(--sombra-s)' }}>
                <div className="entre"><span style={{ fontSize: 38 }} className={actual ? 'flota' : ''} aria-hidden="true">{n.emoji}</span><span className="pill borde mono">{n.min} XP</span></div>
                <b>{n.nombre}</b><span className="chico suave">{n.frase}</span>{actual && <span className="pill tinta">estás aquí · {xp.total} XP</span>}
              </Tilt>) })}
          </div>
          <DeDonde titulo="¿Suman Culta, Zorro y Voz a este nivel?">No: hoy son sistemas separados, igual que en tus Excel. Luzmila {xp.total} XP · Culta {xpCulta(s).total} XP · Zorro {xpZorro(s).total} XP. Si quieres unificarlos, es una decisión tuya y se cambia.</DeDonde></div></Sube>

        <Sube className="c5"><TarjetaAncla /></Sube>
        <Sube className="c7" d={0.05}><TarjetaCiclo /></Sube>
        <Sube className="c12"><TarjetaMetas2026 /></Sube>

        <Sube className="c7"><div className="card pila" style={{ height: '100%' }}><div className="entre"><span className="eyebrow">🎯 Metas activas · {activas.length}/3</span><button className="btn s" onClick={() => { setF({ importante: true }); setHoja('meta') }}>+ Meta</button></div>
          {s.metas.length ? s.metas.map((m) => { const sin = m.ultimoAvance ? dif(hoy, m.ultimoAvance) : null; return (
            <div key={m.id} className="item"><div className="entre"><b>{m.meta}</b><span className="pill" style={{ background: m.estado === 'Cumplida' ? 'var(--menta)' : 'var(--mostaza)' }}>{m.estado}</span></div>
              {m.siEntonces && <span className="chico suave">{m.siEntonces}</span>}{m.proxima && m.estado !== 'Cumplida' && <span className="chico">Próximo paso: <b>{m.proxima}</b></span>}
              <div className="fila chico"><span className="pill borde">{cuadrante(m)}</span>{m.limite && <span className="pill borde">límite {bonita(m.limite)}</span>}{m.estado !== 'Cumplida' && sin !== null && <span className="pill" style={{ background: sin > 14 ? 'var(--mostaza)' : 'var(--crema-2)' }}>{sin > 14 ? `${sin} días sin tocarla: ¿sigue viva?` : `${sin} días sin avance`}</span>}</div>
              {m.estado === 'Cumplida' ? <label className="campo chico" style={{ fontWeight: 500 }}><span>Acción cumplida ✔ · ¿y el resultado?</span><input value={m.resultado || ''} placeholder="Ej. postulé; el resultado fue…" onChange={(e) => s.editar('metas', m.id, { resultado: e.target.value })} /></label>
                : <div className="fila"><button className="btn s mundo" onClick={() => s.editar('metas', m.id, { ultimoAvance: hoy })}>Avancé hoy</button><button className="btn s" onClick={() => { s.editar('metas', m.id, { estado: 'Cumplida' }); decir(<>Meta cumplida <b>+2</b> 🎯</>, true) }}>Cumplida</button><button className="pill borde" onClick={() => confirm('¿Soltar esta meta?') && s.quitar('metas', m.id)}>Soltar</button></div>}
            </div>) }) : <Vacio>Sin metas. Máximo 2–3 activas a la vez.</Vacio>}
          <p className="porque">“Cumplida” mide la acción que dependía de ti, no el resultado. Por eso se anotan por separado.</p></div></Sube>

        <Sube className="c5" d={0.05}><div className="pila" style={{ height: '100%' }}>
          <div className="card color pila"><div className="entre"><span className="eyebrow">Misiones de la semana · {misiones.length}/2</span><button className="btn s" onClick={() => { setF({}); setHoja('mision') }}>+ Misión</button></div>
            {s.misiones.slice(0, 6).map((m) => <label key={m.id} className="item blanco fila" style={{ flexWrap: 'nowrap', cursor: 'pointer' }}><input type="checkbox" checked={m.hecha} onChange={() => { s.editar('misiones', m.id, { hecha: !m.hecha }); if (!m.hecha) decir('Misión cumplida 🎉', true) }} style={{ width: 22, height: 22, accentColor: 'var(--tinta)' }} /><span style={{ textDecoration: m.hecha ? 'line-through' : 'none' }}>{m.texto}</span></label>)}
            {!s.misiones.length && <p className="chico">Se eligen el domingo, al cerrar la semana. Una o dos, no más.</p>}</div>
          <div className="card pila-s"><span className="eyebrow">Temporada {temp} · {bonita(iniT)} → {bonita(finT)}</span>
            <div className="fila"><Anillo valor={Math.min(1, dif(hoy, iniT) / 60)} tam={84} grosor={10}><b className="mono">{Math.max(0, dif(finT, hoy))}d</b></Anillo><div className="pila-s chico crece"><span>🔋 {resumen.rituales} rituales · 🎓 {resumen.culta} sesiones</span><span>🦊 {resumen.zorro} registros · 🕵️ {resumen.evid} evidencias</span><span>🛟 {resumen.retomas} veces que volviste</span></div></div>
            <p className="chico suave">Al cerrar la temporada sale un resumen con humor. No es examen.</p></div>
        </div></Sube>

        <Sube className="c12"><div className="card pila"><span className="eyebrow">Insignias · {Object.values(ganadas).filter(Boolean).length} de {INSIGNIAS.length}</span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12 }}>
            {INSIGNIAS.map((b) => <div key={b.id} className="item" style={{ textAlign: 'center', justifyItems: 'center', opacity: ganadas[b.id] ? 1 : 0.5, background: ganadas[b.id] ? 'var(--mostaza)' : undefined }}><span style={{ fontSize: 40, filter: ganadas[b.id] ? 'none' : 'grayscale(1)' }} className={ganadas[b.id] ? 'flota' : ''} aria-hidden="true">{b.emoji}</span><b>{b.nombre}</b><span className="chico suave">{b.como}</span></div>)}
          </div></div></Sube>
      </div>

      <Hoja abierta={hoja === 'meta'} cerrar={() => setHoja(null)} titulo="Nueva meta">
        <Campo label="Meta"><input value={f.meta || ''} onChange={(e) => setF({ ...f, meta: e.target.value })} /></Campo>
        <Campo label="Plan si-entonces" ayuda="Si es [momento], entonces [acción de 15–20 min]."><input value={f.siEntonces || ''} onChange={(e) => setF({ ...f, siEntonces: e.target.value })} /></Campo>
        <Campo label="Próxima acción concreta"><input value={f.proxima || ''} onChange={(e) => setF({ ...f, proxima: e.target.value })} /></Campo>
        <div className="fila"><button className="pill" aria-pressed={!!f.urgente} onClick={() => setF({ ...f, urgente: !f.urgente })}>Urgente</button><button className="pill" aria-pressed={!!f.importante} onClick={() => setF({ ...f, importante: !f.importante })}>Importante</button><span className="pill borde">{cuadrante(f)}</span></div>
        <Campo label="Fecha límite (opcional)"><input type="date" value={f.limite || ''} onChange={(e) => setF({ ...f, limite: e.target.value })} /></Campo>
        <button className="btn" onClick={guardarMeta}>Guardar</button>
      </Hoja>
      <Hoja abierta={hoja === 'mision'} cerrar={() => setHoja(null)} titulo="Misión de la semana">
        <Campo label="Una cosa pequeña y concreta"><input value={f.texto || ''} onChange={(e) => setF({ ...f, texto: e.target.value })} placeholder="Ej. dejar el cargador fuera del cuarto" /></Campo>
        <button className="btn" onClick={guardarMision}>Guardar</button>
      </Hoja>
    </div>
  )
}
