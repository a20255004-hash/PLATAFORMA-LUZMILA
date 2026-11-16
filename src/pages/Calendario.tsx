import { useState } from 'react'
import { irA } from '../App'
import { decir, Hoja, Sube, Titulo3D } from '../components/ui'
import { BLOQUES_CULTA, FASES } from '../data/estructura'
import { aFecha, bloqueCulta, diaProyecto, esISO, hoyISO, iso, larga, mesNombre, mesProyecto, queToca, semanaCulta, sumar } from '../lib/fechas'
import { puntosDia, useDatos, vivo } from '../store'

export default function Calendario() {
  const s = useDatos()
  const hoy = hoyISO()
  const [ref, setRef] = useState(() => { const d = new Date(); return { y: d.getFullYear(), m: d.getMonth() } })
  const [dia, setDia] = useState<string | null>(null)

  const primero = new Date(ref.y, ref.m, 1)
  const inicio = new Date(ref.y, ref.m, 1 - ((primero.getDay() + 6) % 7)) // lunes primero
  const celdas = Array.from({ length: 42 }, (_, i) => { const d = new Date(inicio); d.setDate(inicio.getDate() + i); return iso(d) })
  const mover = (n: number) => { const d = new Date(ref.y, ref.m + n, 1); setRef({ y: d.getFullYear(), m: d.getMonth() }) }

  const sesCulta = (f: string) => s.culta.sesiones.filter((x) => x.fecha === f)
  const regZorro = (f: string) => s.zorro.bitacora.filter((x) => x.fecha === f)
  const notas = (f: string) => s.bitacora.filter((x) => x.fecha === f)

  // Sesiones por recuperar: últimos 14 días en que tocaba algo y no hay registro (solo fuera de Reingreso).
  const porRecuperar = s.ajustes.reingreso ? [] : Array.from({ length: 14 }, (_, i) => sumar(hoy, -(i + 1))).filter((f) => { const q = queToca(f); return q === 'culta' ? !sesCulta(f).length : q === 'zorro' ? !regZorro(f).length : false }).slice(0, 4)
  const mes = mesProyecto()
  const c = dia ? s.checkins[dia] || {} : {}

  return (
    <div className="pagina">
      <header className="cabeza">
        <span className="eyebrow">Día {diaProyecto()} del proyecto · mes {mes}</span>
        <Titulo3D texto="CALENDARIO" chico />
        <p className="serif" style={{ fontSize: 'clamp(22px, 3vw, 32px)', maxWidth: 720 }}>Para que nunca más tengas que preguntarte “ayy, ¿qué tocaba hoy?”.</p>
      </header>

      <div className="bento">
        <Sube className="c8"><div className="card pila">
          <div className="entre"><button className="btn claro s" onClick={() => mover(-1)} aria-label="Mes anterior">←</button><h2 className="h2" style={{ textTransform: 'capitalize' }}>{mesNombre(ref.m)} {ref.y}</h2><button className="btn claro s" onClick={() => mover(1)} aria-label="Mes siguiente">→</button></div>
          <div className="cal">
            {['lun', 'mar', 'mié', 'jue', 'vie', 'sáb', 'dom'].map((d) => <div key={d} className="dn">{d}</div>)}
            {celdas.map((f) => { const q = queToca(f); const ch = s.checkins[f]; const fuera = aFecha(f).getMonth() !== ref.m; const hecho = sesCulta(f).length || regZorro(f).length
              return <button key={f} className={`dia ${q || ''} ${f === hoy ? 'hoy' : ''} ${fuera ? 'fuera' : ''}`} onClick={() => setDia(f)} aria-label={`${larga(f)}${q ? ', toca ' + q : ''}`}>
                <span className="entre" style={{ width: '100%' }}><span>{aFecha(f).getDate()}</span><span className="em" aria-hidden="true">{ch?.supervivencia ? '🛟' : hecho ? '✔' : q === 'culta' ? '🎓' : q === 'zorro' ? '🦊' : ''}</span></span>
                {ch && <span className="p" aria-hidden="true">{(['manana', 'comida', 'noche'] as const).map((k) => <i key={k} className={ch[k] ? '' : 'no'} />)}</span>}
              </button> })}
          </div>
          <div className="fila chico"><span className="pill" style={{ background: 'color-mix(in srgb, var(--lila) 55%, white)' }}>🎓 Culta</span><span className="pill" style={{ background: 'color-mix(in srgb, var(--mandarina) 50%, white)' }}>🦊 Zorro</span><span className="pill borde">●●● rituales del día</span><span className="pill borde">✔ sesión registrada</span><span className="pill borde">🛟 supervivencia</span></div>
        </div></Sube>

        <div className="c4 pila">
          <Sube><div className="card color pila-s"><span className="eyebrow">Regla de las 48 horas</span><p className="h3">Un día en cero no rompe nada.</p><p className="chico">El patrón se corta recién con <b>dos seguidos</b>. Y si pasa, retomar vale <b>+3</b>: más que no haber fallado nunca. Los puntos ganados jamás se restan.</p></div></Sube>
          <Sube d={0.05}><div className="card pila-s"><span className="eyebrow">Alternancia</span><p className="chico">Culta y Zorro van <b>día por medio</b> desde el sáb 29 ago (Culta) y dom 30 ago (Zorro). No son días fijos de la semana.</p>
            <p className="chico">Dentro de Culta: semana impar = {BLOQUES_CULTA.B1.nombre}, semana par = {BLOQUES_CULTA.B2.nombre}. Vamos en la semana <b>{semanaCulta()}</b> → {BLOQUES_CULTA[bloqueCulta()].nombre}. El Bloque 3 va siempre.</p>
            <p className="chico">Voz es un carril aparte, diario y corto.</p></div></Sube>
          {porRecuperar.length > 0 && <Sube d={0.1}><div className="card pila-s"><span className="eyebrow">Se pueden recuperar (sin apuro)</span>{porRecuperar.map((f) => <button key={f} className="item entre chico" onClick={() => irA(queToca(f) as any)}><span style={{ textTransform: 'capitalize' }}>{larga(f)}</span><span>{queToca(f) === 'culta' ? '🎓' : '🦊'} →</span></button>)}<p className="chico suave">Una sesión perdida se recupera o se suelta. Las dos opciones están bien.</p></div></Sube>}
          <Sube d={0.12}><div className="card pila-s"><span className="eyebrow">Fases que el plan suma en el mes {mes}</span>{FASES.filter((f) => f.mesN === mes).map((f) => <span key={f.id} className="chico">{f.emoji} {f.nombre}</span>)}{!FASES.some((f) => f.mesN === mes) && <span className="chico suave">Ninguna nueva este mes.</span>}<p className="porque">El plan es intención, no condena. Lo real se ve en el Mapa.</p></div></Sube>
        </div>
      </div>

      <Hoja abierta={!!dia} cerrar={() => setDia(null)} titulo={dia && esISO(dia) ? larga(dia) : ''}>
        {dia && <div className="pila">
          <div className="fila">{queToca(dia) ? <span className="pill mundo" style={{ ['--mundo' as any]: queToca(dia) === 'culta' ? 'var(--lila)' : 'var(--mandarina)' }}>Tocaba: {queToca(dia) === 'culta' ? `🎓 Culta · ${BLOQUES_CULTA[bloqueCulta(dia)].nombre}` : '🦊 Zorro'}</span> : <span className="pill">Antes del inicio de Culta/Zorro</span>}<span className="pill borde">Día {diaProyecto(dia)}</span></div>
          <div className="pila-s"><span className="eyebrow">Rituales (Fase 1) · {puntosDia(c)}/3</span>
            <div className="fila">{([['manana', '🌅 Mañana'], ['comida', '🍽️ Comida ancla'], ['noche', '✈️ Modo Avión']] as const).map(([k, t]) => <button key={k} className="pill" aria-pressed={!!c[k]} disabled={dia > hoy} onClick={() => { const r = s.checkin(dia, { [k]: !c[k] }); if (r.retomo) decir(<>Retomaste: <b>+3</b> 🛟</>, true) }}>{t}</button>)}
              <button className="pill" aria-pressed={!!c.supervivencia} disabled={dia > hoy} onClick={() => s.checkin(dia, { supervivencia: !c.supervivencia })}>🛟 Supervivencia</button></div>
            {dia > hoy && <span className="chico suave">Ese día todavía no llega 🙂</span>}{dia <= hoy && !vivo(c) && <span className="chico suave">Sin registro. Puedes completarlo ahora si te acuerdas; si no, se queda así y no pasa nada.</span>}
          </div>
          {sesCulta(dia).map((x) => <div key={x.id} className="item"><b>🎓 {x.tema}</b><span className="chico suave">{x.nota}/20 · {x.estado}</span></div>)}
          {regZorro(dia).map((x) => <div key={x.id} className="item"><b>🦊 {x.hice}</b><span className="chico suave">{x.enfoque} · +{x.xp} XP</span></div>)}
          {notas(dia).map((x) => <div key={x.id} className="item"><b>📓 {x.titulo || 'Nota'}</b><span className="chico suave">{String(x.texto).slice(0, 140)}</span></div>)}
        </div>}
      </Hoja>
    </div>
  )
}
