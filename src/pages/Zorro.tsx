import { useState } from 'react'
import { Anillo, Campo, Cuenta, decir, DeDonde, Hoja, Sube, Tilt, Titulo3D, Vacio } from '../components/ui'
import { PILARES_ZORRO, XP_ZORRO } from '../data/estructura'
import { bonita, diaSemana, hoyISO, queToca } from '../lib/fechas'
import { siguientePilar, useDatos, xpZorro } from '../store'

const nom = (p: any) => p.nombre || p.id

export default function Zorro() {
  const s = useDatos()
  const xp = xpZorro(s)
  const sugerido = siguientePilar(s)
  const [sel, setSel] = useState(PILARES_ZORRO.findIndex((p) => p.id === sugerido.id))
  const [tab, setTab] = useState<'bitacora' | 'anecdotas' | 'cosmo'>('bitacora')
  const [hoja, setHoja] = useState<null | 'reg' | 'anec' | 'cosmo'>(null)
  const [f, setF] = useState<any>({})
  const pilar = PILARES_ZORRO[sel]
  const toca = queToca() === 'zorro'
  const hechos = new Set(s.zorro.bitacora.map((b) => b.enfoque))
  const porPilar = PILARES_ZORRO.map((p) => s.zorro.bitacora.filter((b) => b.enfoque === p.id).reduce((a, b) => a + Number(b.xp || 0), 0))
  const max = Math.max(1, ...porPilar)

  const abrir = (k: 'reg' | 'anec' | 'cosmo', base: any = {}) => { setF({ fecha: hoyISO(), ...base }); setHoja(k) }
  const momento = () => { s.agregar('zorro.bitacora', { fecha: hoyISO(), enfoque: 'Otro', hice: 'Momento Zorro: convertí un error pequeño en gracia', xp: 1, nota: '' }); decir(<>🦊 <b>+1</b> · Momento Zorro capturado. Reírte de la situación, nunca de ti.</>, true) }
  const guardarReg = () => {
    if (!f.hice?.trim()) return decir('Cuéntame en una línea qué hiciste 🙂')
    s.agregar('zorro.bitacora', { fecha: f.fecha, enfoque: f.enfoque, hice: f.hice.trim(), xp: Number(f.xp), nota: f.nota || '' })
    if (f.confirmar) s.poner('zorro.porConfirmar', s.zorro.porConfirmar.filter((x) => x !== f.confirmar))
    setHoja(null); decir(<>Registrado <b>+{f.xp} XP</b> 🦊</>, true)
  }
  const guardarAnec = () => {
    if (!f.remate?.trim()) return decir('Le falta el remate (una frase corta y seca) 🎤')
    s.agregar('zorro.anecdotas', { fecha: f.fecha, calma: f.calma || '', tension: f.tension || '', remate: f.remate, callback: f.callback || '', feedback: f.feedback || '' })
    s.agregar('zorro.bitacora', { fecha: f.fecha, enfoque: 'Anecdota', hice: 'Anécdota con remate: ' + f.remate.slice(0, 60), xp: 2, nota: f.callback ? 'con callback' : '' })
    setHoja(null); decir(<>Anécdota guardada <b>+2 XP</b> 📖</>, true)
  }
  const guardarCosmo = () => {
    if (!f.cultura?.trim()) return decir('¿De qué cultura o tema es?')
    s.agregar('zorro.cosmovision', { fecha: f.fecha, cultura: f.cultura, dato: f.dato || '', gusto: f.gusto || '' })
    if (f.sorprendio) s.agregar('zorro.bitacora', { fecha: f.fecha, enfoque: 'Cosmovision', hice: 'Dato cultural: ' + f.cultura, xp: 1, nota: '' })
    setHoja(null); decir(f.sorprendio ? <>Al álbum <b>+1 XP</b> 🌍</> : 'Guardado en tu álbum 🌍', !!f.sorprendio)
  }
  const nombrar = () => { const n = prompt(`¿Cómo se llama tu nivel ${xp.nivel}? (lo inventas tú)`, xp.nombre || ''); if (n?.trim()) s.poner('zorro.niveles', { ...s.zorro.niveles, [xp.nivel]: n.trim() }) }

  return (
    <div className="pagina">
      <header className="cabeza">
        <span className="eyebrow">El Taller del Zorro · {toca ? 'hoy toca ✨' : 'hoy descansa'}</span>
        <Titulo3D texto="ZORRO" />
        <p className="serif" style={{ fontSize: 'clamp(22px, 3vw, 32px)', maxWidth: 720 }}>El humor ya es tuyo: aquí solo se le deja salir. Nunca a costa tuya, siempre sobre la situación.</p>
        <div className="fila"><button className="btn" onClick={momento}>🦊 ¡Momento Zorro! +1</button><button className="btn claro" onClick={() => abrir('reg', { enfoque: pilar.id, xp: pilar.xp })}>+ Registrar</button></div>
      </header>

      <div className="bento">
        <Sube className="c7"><Tilt className="color pila" style={{ height: '100%' }}>
          <div className="entre"><span className="eyebrow">La rueda de los 6 pilares</span><span className="pill" style={{ background: 'rgba(255,255,255,.6)' }}>sugerido: {sugerido.emoji} {nom(sugerido)}</span></div>
          <div className="rueda">
            <div className="aro" />
            <div className="disco" style={{ transform: `rotate(${-sel * 60}deg)` }}>
              {PILARES_ZORRO.map((p, i) => (
                <button key={p.id} className="gajo" aria-pressed={sel === i} aria-label={nom(p)} onClick={() => setSel(i)} style={{ transform: `rotate(${i * 60}deg) translateY(calc(var(--R) * -1))` }}>
                  <span style={{ transform: `rotate(${-(i * 60) + sel * 60}deg)` }} aria-hidden="true">{p.emoji}</span>
                </button>
              ))}
            </div>
            <div className="eje"><div><div style={{ fontSize: 34 }} aria-hidden="true">{pilar.emoji}</div><div className="h3">{nom(pilar)}</div><div className="chico suave">+{pilar.xp} XP</div></div></div>
          </div>
          <p style={{ textAlign: 'center' }}><b>{pilar.accion}.</b> 5–10 minutos.</p>
          <div className="fila" style={{ justifyContent: 'center' }}>
            {pilar.id === 'Anecdota' ? <button className="btn" onClick={() => abrir('anec')}>Escribir anécdota (Rakugo)</button> : pilar.id === 'Cosmovision' ? <button className="btn" onClick={() => abrir('cosmo', { sorprendio: true })}>Guardar dato cultural</button> : <button className="btn" onClick={() => abrir('reg', { enfoque: pilar.id, xp: pilar.xp })}>Lo hice · registrar</button>}
          </div>
          <DeDonde titulo="¿Por qué “sugerido”?">Los pilares van en rueda: el sugerido es el que sigue al último que registraste, caiga en el día que caiga. Si hoy te provoca otro, gira la rueda.</DeDonde>
        </Tilt></Sube>

        <Sube className="c5" d={0.06}><div className="pila" style={{ height: '100%' }}>
          <Tilt className="pila">
            <span className="eyebrow">Nivel Zorro</span>
            <div className="fila" style={{ gap: 16 }}>
              <Anillo valor={xp.progreso} tam={128} color="var(--mandarina)"><div><div className="num" style={{ fontSize: 40 }}><Cuenta n={xp.total} /></div><div className="eyebrow">XP</div></div></Anillo>
              <div className="pila-s crece"><div className="h3">Nivel {xp.nivel}</div>
                <button className="pill" onClick={nombrar}>{xp.nombre ? `🦊 ${xp.nombre}` : '✏️ por nombrar contigo'}</button>
                <p className="chico suave">Faltan <b>{xp.faltan}</b> XP para el nivel {xp.nivel + 1}</p></div>
            </div>
            <DeDonde>Suma de XP de tu bitácora. Cada 15 XP = 1 nivel. {XP_ZORRO.map((x) => `${x.accion} +${x.xp}`).join(' · ')}.</DeDonde>
          </Tilt>
          <div className="card pila-s"><span className="eyebrow">XP por pilar</span>
            {PILARES_ZORRO.map((p, i) => <div key={p.id} className="fila chico" style={{ flexWrap: 'nowrap' }}><span style={{ width: 24 }} aria-hidden="true">{p.emoji}</span><span style={{ width: 96 }}>{nom(p)}</span><div className="barra mundo crece"><i style={{ width: `${(porPilar[i] / max) * 100}%` }} /></div><b className="mono" style={{ width: 20, textAlign: 'right' }}>{porPilar[i]}</b></div>)}
            <p className="chico suave">{hechos.size >= 6 ? 'Vuelta completa registrada 🏁' : `Pilares con registro: ${PILARES_ZORRO.filter((p) => hechos.has(p.id)).length} de 6`}</p>
          </div>
        </div></Sube>

        {s.zorro.porConfirmar.length > 0 && <Sube className="c12"><div className="card pila"><span className="eyebrow">Hitos del chat que no llegaron a tu bitácora</span><p className="chico suave">Pasaron de verdad, pero nunca se anotaron, así que no les puse puntos por mi cuenta. Confirma los que quieras registrar.</p>
          <div className="lista">{s.zorro.porConfirmar.map((h) => <div key={h} className="item entre"><span className="chico">{h}</span><span className="fila"><button className="btn s mundo" onClick={() => abrir('reg', { enfoque: 'Otro', xp: 1, hice: h, confirmar: h, fecha: '2026-09-10' })}>Registrar</button><button className="pill borde" onClick={() => s.poner('zorro.porConfirmar', s.zorro.porConfirmar.filter((x) => x !== h))}>Descartar</button></span></div>)}</div></div></Sube>}
      </div>

      <div className="tabs" style={{ marginTop: 26 }}>
        {([['bitacora', '📒 Bitácora'], ['anecdotas', '🎤 Anécdotas Rakugo'], ['cosmo', '🌍 Cosmovisiones']] as const).map(([k, t]) => <button key={k} className="pill" aria-pressed={tab === k} onClick={() => setTab(k)}>{t}</button>)}
      </div>

      {tab === 'bitacora' && <div className="lista">{s.zorro.bitacora.length ? [...s.zorro.bitacora].sort((a, b) => (a.fecha < b.fecha ? 1 : -1)).map((b) => (
        <div key={b.id} className="card entre" style={{ padding: 16, alignItems: 'start' }}><div className="pila-s"><div className="fila"><span className="pill mundo">{b.enfoque}</span><span className="chico suave" style={{ textTransform: 'capitalize' }}>{diaSemana(b.fecha)} · {bonita(b.fecha)}</span></div><b>{b.hice}</b>{b.nota && <span className="serif" style={{ fontSize: 19 }}>“{b.nota}”</span>}</div>
          <div className="fila" style={{ flexWrap: 'nowrap' }}><span className="num" style={{ fontSize: 30 }}>+{b.xp}</span><button className="pill borde" aria-label="Quitar" onClick={() => confirm('¿Quitar este registro?') && s.quitar('zorro.bitacora', b.id)}>✕</button></div></div>
      )) : <Vacio>Aún no hay registros. El primero puede ser un Momento Zorro.</Vacio>}</div>}

      {tab === 'anecdotas' && <div className="pila">
        <div className="card color pila-s"><span className="eyebrow">Estructura Rakugo</span><p className="h3">Calma → Tensión → [pausa] → Remate</p><p className="chico">El remate corto y seco pega más que el explicado. Nivel avanzado: el <b>callback</b>, retomar al final un detalle sembrado al inicio.</p><div><button className="btn s" onClick={() => abrir('anec')}>+ Nueva anécdota</button></div></div>
        <div className="bento">{s.zorro.anecdotas.map((a) => <Sube key={a.id} className="c6"><div className="card pila-s" style={{ height: '100%' }}><span className="chico suave">{bonita(a.fecha)}</span>
          <p><span className="eyebrow">Calma · </span>{a.calma}</p><p><span className="eyebrow">Tensión · </span>{a.tension}</p>
          <p className="display" style={{ fontSize: 26 }}>“{a.remate}”</p>{a.callback && <p className="chico"><b>Callback:</b> {a.callback}</p>}{a.feedback && <p className="porque">{a.feedback}</p>}</div></Sube>)}</div>
        {!s.zorro.anecdotas.length && <Vacio>Tu banco de anécdotas está esperando la primera.</Vacio>}
      </div>}

      {tab === 'cosmo' && <div className="pila">
        <div><button className="btn s" onClick={() => abrir('cosmo', { sorprendio: true })}>+ Nueva cosmovisión</button></div>
        <div className="bento">{s.zorro.cosmovision.map((c) => <Sube key={c.id} className="c6"><div className="card pila-s" style={{ height: '100%' }}><div className="fila"><span className="pill mundo">🌍 {c.cultura}</span><span className="chico suave">{bonita(c.fecha)}</span></div><p>{c.dato}</p>{c.gusto && <p className="serif" style={{ fontSize: 21 }}>Lo que me gustó: {c.gusto}</p>}</div></Sube>)}</div>
        {!s.zorro.cosmovision.length && <Vacio>Tu álbum de cosmovisiones empieza con el primer dato que te sorprenda.</Vacio>}
      </div>}

      <Hoja abierta={hoja === 'reg'} cerrar={() => setHoja(null)} titulo="Registrar en la bitácora">
        <div className="dos"><Campo label="Fecha"><input type="date" value={f.fecha || ''} onChange={(e) => setF({ ...f, fecha: e.target.value })} /></Campo>
          <Campo label="Pilar"><select value={f.enfoque || ''} onChange={(e) => setF({ ...f, enfoque: e.target.value, xp: PILARES_ZORRO.find((p) => p.id === e.target.value)?.xp ?? 1 })}>{PILARES_ZORRO.map((p) => <option key={p.id} value={p.id}>{nom(p)}</option>)}<option value="Otro">Otro / Momento Zorro</option></select></Campo></div>
        <Campo label="Qué hice (una línea)"><input value={f.hice || ''} onChange={(e) => setF({ ...f, hice: e.target.value })} /></Campo>
        <Campo label="XP" ayuda="Momento Zorro +1 · dato cultural +1 · anécdota con remate +2 · reto social +3 · retomar +3"><select value={f.xp ?? 1} onChange={(e) => setF({ ...f, xp: e.target.value })}>{[1, 2, 3].map((n) => <option key={n} value={n}>+{n}</option>)}</select></Campo>
        <Campo label="Nota o cómo te sentiste (opcional)"><textarea value={f.nota || ''} onChange={(e) => setF({ ...f, nota: e.target.value })} /></Campo>
        <button className="btn" onClick={guardarReg}>Guardar</button>
      </Hoja>
      <Hoja abierta={hoja === 'anec'} cerrar={() => setHoja(null)} titulo="Anécdota Rakugo">
        <Campo label="Fecha"><input type="date" value={f.fecha || ''} onChange={(e) => setF({ ...f, fecha: e.target.value })} /></Campo>
        <Campo label="Calma" ayuda="2–3 frases cotidianas."><textarea value={f.calma || ''} onChange={(e) => setF({ ...f, calma: e.target.value })} /></Campo>
        <Campo label="Tensión" ayuda="1–2 frases con el desvío."><textarea value={f.tension || ''} onChange={(e) => setF({ ...f, tension: e.target.value })} /></Campo>
        <Campo label="Remate" ayuda={`Una frase corta y seca. Llevas ${(f.remate || '').trim().split(/\s+/).filter(Boolean).length} palabras.`}><input value={f.remate || ''} onChange={(e) => setF({ ...f, remate: e.target.value })} /></Campo>
        <Campo label="Callback (opcional)"><input value={f.callback || ''} onChange={(e) => setF({ ...f, callback: e.target.value })} /></Campo>
        <Campo label="Feedback recibido (opcional)"><input value={f.feedback || ''} onChange={(e) => setF({ ...f, feedback: e.target.value })} /></Campo>
        <button className="btn" onClick={guardarAnec}>Guardar · +2 XP</button>
      </Hoja>
      <Hoja abierta={hoja === 'cosmo'} cerrar={() => setHoja(null)} titulo="Cosmovisión">
        <div className="dos"><Campo label="Fecha"><input type="date" value={f.fecha || ''} onChange={(e) => setF({ ...f, fecha: e.target.value })} /></Campo><Campo label="Cultura / tema"><input value={f.cultura || ''} placeholder="Ej. Japón · wabi-sabi" onChange={(e) => setF({ ...f, cultura: e.target.value })} /></Campo></div>
        <Campo label="Dato o idea"><textarea value={f.dato || ''} onChange={(e) => setF({ ...f, dato: e.target.value })} /></Campo>
        <Campo label="Qué me gustó o sorprendió"><textarea value={f.gusto || ''} onChange={(e) => setF({ ...f, gusto: e.target.value })} /></Campo>
        <button className="pill" aria-pressed={!!f.sorprendio} onClick={() => setF({ ...f, sorprendio: !f.sorprendio })}>Me sorprendió de verdad (+1 XP)</button>
        <button className="btn" onClick={guardarCosmo}>Guardar</button>
      </Hoja>
    </div>
  )
}
