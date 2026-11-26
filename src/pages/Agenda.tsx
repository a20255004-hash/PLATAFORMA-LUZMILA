import { useMemo, useState } from 'react'
import { Campo, decir, DeDonde, Hoja, Sube, Tilt, Titulo3D, Vacio } from '../components/ui'
import { mascotaDice } from '../components/Mascota'
import { bajarICS, construirICS, enlaceGoogle, type EventoICS } from '../lib/ics'
import { bonita, hoyISO, larga, queToca, sumar } from '../lib/fechas'
import { proximasFechas, useDatos } from '../store'

const TIPOS = [['universidad', '🎓 Universidad'], ['practica', '💼 Práctica'], ['tesis', '📚 Tesis'], ['tramite', '🧾 Trámite'], ['personal', '🌱 Personal']] as const
const IDEAS = ['Avance de tesis', 'Informe de prácticas', 'Examen', 'Entrega de trabajo', 'Trámite pendiente', 'Cumpleaños de alguien querido']
const cuenta = (n: number) => (n < 0 ? `pasó hace ${-n} día${n === -1 ? '' : 's'} · ¿la cerraste?` : n === 0 ? 'es hoy' : n === 1 ? 'mañana' : `en ${n} días`)

const siguiente = (que: 'culta' | 'zorro') => { let f = hoyISO(); for (let i = 0; i < 4; i++) { if (queToca(f) === que) return f; f = sumar(f, 1) } return hoyISO() }

export default function Agenda() {
  const s = useDatos()
  const [hoja, setHoja] = useState(false)
  const [f, setF] = useState<any>({ tipo: 'universidad' })
  const ag = s.agenda
  const url = typeof location !== 'undefined' ? location.origin + location.pathname : ''
  const prox = proximasFechas(s)
  const hechas = (s.fechas || []).filter((x) => x.hecha)
  const hoy = hoyISO()

  const eventos = useMemo<(EventoICS & { k: string })[]>(() => {
    const ini = hoyISO()
    const E: (EventoICS & { k: string })[] = []
    const bonito = `\n\n${url}`
    if (ag.activos.manana) E.push({ k: 'manana', uid: 'manana', resumen: '🌅 Modo Poderosa · check-in de la mañana', descripcion: 'Agua, skincare y tender la cama. Son 10 segundos, nada más. Tú puedes.' + bonito, fecha: ini, hora: ag.manana, rrule: 'FREQ=DAILY' })
    if (ag.activos.comida) E.push({ k: 'comida', uid: 'comida', resumen: '🍽️ Comida ancla', descripcion: 'Almuerzo sentada. Comida ancla hecha = +1.' + bonito, fecha: ini, hora: ag.comida, rrule: 'FREQ=DAILY' })
    if (ag.activos.noche) E.push({ k: 'noche', uid: 'noche', resumen: '✈️ Modo Avión · celular fuera del cuarto', descripcion: 'Una sola cosa: celular fuera. Último capítulo si quieres, y a descansar. Zombie no decide, decide Luzmila.' + bonito, fecha: ini, hora: ag.noche, rrule: 'FREQ=DAILY' })
    if (ag.activos.hoyToca) {
      E.push({ k: 'hoyToca', uid: 'culta', resumen: '🎓 Hoy toca Culta', descripcion: 'Abre la plataforma: te espera un tema con resumen, enlaces y quiz. 20–30 minutos y listo.' + bonito, fecha: siguiente('culta'), hora: ag.hoyToca, durMin: 30, rrule: 'FREQ=DAILY;INTERVAL=2' })
      E.push({ k: 'hoyToca', uid: 'zorro', resumen: '🦊 Hoy toca Zorro', descripcion: '5–10 minutos de humor: un momento Zorro, una definición loca o un remate seco. Nunca a costa de ti.' + bonito, fecha: siguiente('zorro'), hora: ag.hoyToca, durMin: 15, rrule: 'FREQ=DAILY;INTERVAL=2' })
    }
    if (ag.activos.domingo) E.push({ k: 'domingo', uid: 'domingo', resumen: '🗓️ Domingo de cierre', descripcion: 'Repasos pendientes, una evidencia al Expediente y una misión para la semana. Baja un respaldo de tus datos.' + bonito, fecha: (() => { let d = ini; while (new Date(d + 'T12:00').getDay() !== 0) d = sumar(d, 1); return d })(), hora: ag.domingo, durMin: 20, rrule: 'FREQ=WEEKLY;BYDAY=SU' })
    if (ag.activos.voz) E.push({ k: 'voz', uid: 'voz', resumen: '🗣️ Voz · 30 minutos', descripcion: 'Ronda de 90 segundos, conectores o un argumento. Lo que toque hoy.' + bonito, fecha: ini, hora: ag.voz, durMin: 30, rrule: 'FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR' })
    return E
  }, [ag, url])

  const deFechas = (): EventoICS[] => prox.map((x) => ({ uid: 'fecha-' + x.id, resumen: `📌 ${x.titulo}`, descripcion: (x.nota ? x.nota + '\n\n' : '') + 'Un paso pequeño hoy y llegas tranquila.', fecha: x.fecha, hora: x.hora || undefined, durMin: 30, alarmas: x.hora ? ['-P1D', '-PT2H', 'PT0S'] : ['-P6DT15H', '-PT15H', 'PT9H'] }))
  const bajarTodo = () => { if (!eventos.length && !prox.length) return decir('Activa al menos un recordatorio 🙂'); bajarICS(construirICS([...eventos, ...deFechas()]), 'proyecto-luzmila.ics'); decir('Listo: abre el archivo y el calendario de tu celular lo agrega con sus alarmas 🔔'); mascotaDice('Yo no puedo sonar con la página cerrada, pero tu calendario sí. Ahora ellos te cuidan el horario 🔔', 'feliz') }

  const guardar = () => {
    if (!f.titulo?.trim() || !f.fecha) return decir('Ponle nombre y fecha 🙂')
    s.agregar('fechas', { titulo: f.titulo.trim(), fecha: f.fecha, hora: f.hora || '', tipo: f.tipo, nota: f.nota || '', hecha: false })
    setHoja(false); setF({ tipo: 'universidad' }); decir('Fecha guardada 📌')
    mascotaDice(`Anotado: “${f.titulo.trim()}” para el ${bonita(f.fecha)}. Te la recuerdo antes 🦊`, 'curiosa')
  }
  const cerrar = (x: any) => { s.editar('fechas', x.id, { hecha: true }); decir(<>Cerrada: <b>{x.titulo}</b> ✔</>, true); mascotaDice(`¡Cerraste “${x.titulo}”! Cumplir cuando hay fecha es tu superpoder 🏆`, 'fiesta') }

  return (
    <div className="pagina">
      <header className="cabeza">
        <span className="eyebrow">Tu estructura externa · lo que te sostiene</span>
        <Titulo3D texto="AGENDA" />
        <p className="serif" style={{ fontSize: 'clamp(22px, 3vw, 32px)', maxWidth: 720 }}>Tú cumples cuando hay fecha y alguien te lo recuerda. Aquí armamos eso: alarmas en tu celular y fechas límite que se ven.</p>
      </header>

      <div className="bento">
        <Sube className="c7"><Tilt className="color pila" style={{ height: '100%', ['--mundo' as any]: 'var(--mostaza)' }}>
          <span className="eyebrow">🔔 Recordatorios que suenan en tu celular</span>
          <p className="chico">Elige la hora de cada uno, descarga el archivo y ábrelo: tu calendario los agrega con alarma, <b>aunque esta página esté cerrada</b>.</p>
          <div className="pila-s">{([['manana', '🌅 Mañana · check-in'], ['comida', '🍽️ Comida ancla'], ['noche', '✈️ Modo Avión (celular fuera)'], ['hoyToca', '🎓/🦊 Hoy toca (Culta o Zorro)'], ['domingo', '🗓️ Domingo de cierre (semanal)'], ['voz', '🗣️ Voz 30 min (L–V)']] as const).map(([k, t]) => (
            <div key={k} className="item blanco entre" style={{ gridTemplateColumns: 'none', flexWrap: 'wrap' }}>
              <button className="pill" aria-pressed={!!ag.activos[k]} onClick={() => s.poner('agenda.activos', { ...ag.activos, [k]: !ag.activos[k] })}>{ag.activos[k] ? '✔' : '○'} {t}</button>
              <span className="fila" style={{ gap: 6 }}>
                <input type="time" aria-label={`Hora de ${t}`} value={(ag as any)[k]} onChange={(e) => s.poner('agenda.' + k, e.target.value)} style={{ width: 140, padding: "6px 8px" }} />
                {eventos.filter((e) => e.k === k).slice(0, 1).map((e) => <a key={e.uid} className="enlace" style={{ padding: '6px 10px' }} href={enlaceGoogle(e)} target="_blank" rel="noreferrer noopener" title="Añadir a Google Calendar">+ Google</a>)}
              </span>
            </div>
          ))}</div>
          <div className="fila"><button className="btn" onClick={bajarTodo}>⬇ Descargar mi calendario (.ics)</button></div>
          <DeDonde titulo="¿Y si el celular no abre el archivo?">En Android: abre el .ics desde Descargas y elige tu app de Calendario. En iPhone: ábrelo desde Archivos y toca “Añadir todo”. También puedes usar el botón “+ Google” de cada recordatorio. Hay que hacerlo una sola vez.</DeDonde>
        </Tilt></Sube>

        <Sube className="c5" d={0.06}><div className="card pila" style={{ height: '100%' }}>
          <span className="eyebrow">Qué hace la página y qué no</span>
          <p className="chico"><b>Sí:</b> te recuerda con la mascota y con el plan de hoy cuando la abres, y celebra lo que logras.</p>
          <p className="chico"><b>No puede:</b> sonar sola si está cerrada: las páginas web no tienen permiso para eso sin un servidor. Por eso la alarma la pone tu calendario.</p>
          <p className="porque">Suaves y de día: ninguna alarma es de reproche, y la de la noche es una sola cosa (celular fuera).</p>
        </div></Sube>

        <Sube className="c12"><div className="card pila">
          <div className="entre"><span className="eyebrow">📌 Fechas límite · tu mejor talento es cumplirlas</span><button className="btn s" onClick={() => setHoja(true)}>+ Nueva fecha</button></div>
          {prox.length ? <div className="lista">{prox.map((x) => (
            <div key={x.id} className="item entre" style={{ gridTemplateColumns: 'none', flexWrap: 'wrap', background: x.faltan <= 1 ? 'var(--mostaza)' : undefined }}>
              <span><b>{TIPOS.find((t) => t[0] === x.tipo)?.[1].split(' ')[0]} {x.titulo}</b><br /><span className="chico suave">{larga(x.fecha)}{x.hora ? ` · ${x.hora}` : ''} · {cuenta(x.faltan)}{x.nota ? ` · ${x.nota}` : ''}</span></span>
              <span className="fila" style={{ gap: 6 }}><button className="btn s" onClick={() => cerrar(x)}>Hecha ✔</button><button className="pill borde" aria-label="Quitar fecha" onClick={() => confirm('¿Quitar esta fecha?') && s.quitar('fechas', x.id)}>✕</button></span>
            </div>))}</div> : <Vacio>Sin fechas por ahora. Agrega la próxima entrega, examen, informe de prácticas o avance de tesis: lo que tenga fecha, tú lo cumples.</Vacio>}
          {prox.length > 0 && <div className="fila"><button className="pill" onClick={() => { bajarICS(construirICS(deFechas()), 'fechas-limite-luzmila.ics'); decir('Fechas con alarma descargadas 🔔') }}>⬇ Solo mis fechas (con alarma 1 semana, 1 día y el mismo día)</button></div>}
          {hechas.length > 0 && <p className="chico suave">Cerradas: <b>{hechas.length}</b> ✔ {hechas.slice(0, 3).map((x) => x.titulo).join(' · ')}</p>}
          <p className="porque">Una fecha que pasó no se pinta de rojo ni de culpa: solo te pregunta si la cerraste. Si no, se mueve o se suelta con calma.</p>
        </div></Sube>
      </div>

      <Hoja abierta={hoja} cerrar={() => setHoja(false)} titulo="Nueva fecha límite">
        <div className="pila">
          <Campo label="¿Qué es?"><input value={f.titulo || ''} placeholder="Ej. Avance de tesis" onChange={(e) => setF({ ...f, titulo: e.target.value })} /></Campo>
          <div className="fila">{IDEAS.map((i) => <button key={i} className="pill borde" onClick={() => setF({ ...f, titulo: i })}>{i}</button>)}</div>
          <div className="dos"><Campo label="Fecha"><input type="date" value={f.fecha || ''} onChange={(e) => setF({ ...f, fecha: e.target.value })} /></Campo><Campo label="Hora (opcional)"><input type="time" value={f.hora || ''} onChange={(e) => setF({ ...f, hora: e.target.value })} /></Campo></div>
          <Campo label="Tipo"><select value={f.tipo} onChange={(e) => setF({ ...f, tipo: e.target.value })}>{TIPOS.map(([k, t]) => <option key={k} value={k}>{t}</option>)}</select></Campo>
          <Campo label="Primer paso pequeño (opcional)" ayuda="Lo que harías hoy aunque sea 10 minutos."><input value={f.nota || ''} onChange={(e) => setF({ ...f, nota: e.target.value })} /></Campo>
          <button className="btn" onClick={guardar}>Guardar</button>
        </div>
      </Hoja>
    </div>
  )
}
